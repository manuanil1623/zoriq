import crypto from 'crypto';
import { getSupabaseAdmin, isSupabaseConfigured } from './supabaseAdmin.js';

const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function getSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_JWT_SECRET ||
    process.env.SESSION_SECRET ||
    process.env.ADMIN_PIN ||
    'zoriq_secure_admin_session_key_production_2026'
  );
}

export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
}

/**
 * Cryptographically hashes a password using scrypt (CPU/memory-hard)
 */
export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return { hash, salt };
}

/**
 * Verifies password against stored scrypt hash using timingSafeEqual
 */
export function verifyPassword(password, storedHash, salt) {
  if (!password || !storedHash || !salt) return false;
  try {
    const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
    const hashBuffer = Buffer.from(hash, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');
    if (hashBuffer.length !== storedBuffer.length) return false;
    return crypto.timingSafeEqual(hashBuffer, storedBuffer);
  } catch {
    return false;
  }
}

/**
 * Signs an admin session token containing tokenVersion
 */
export function signAdminToken(tokenVersion = 1) {
  const secret = getSessionSecret();
  const payload = {
    role: 'admin',
    tokenVersion: Number(tokenVersion) || 1,
    iat: Date.now(),
    exp: Date.now() + TOKEN_EXPIRY_MS,
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadStr)
    .digest('base64url');
  return `${payloadStr}.${signature}`;
}

/**
 * Decodes and verifies token signature & expiration
 */
export function decodeAndVerifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadStr, signature] = parts;
    const secret = getSessionSecret();
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadStr)
      .digest('base64url');

    if (signature.length !== expectedSignature.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
    if (payload.role !== 'admin') return null;
    if (payload.exp && payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

export function verifyAdminToken(token) {
  return decodeAndVerifyToken(token) !== null;
}

/**
 * Middleware ensuring valid admin token AND verifying that tokenVersion
 * matches the latest token_version in private_settings (invalidates other sessions on password change)
 */
export async function requireAdminAuth(req, res) {
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();

  const payload = decodeAndVerifyToken(token);
  if (!payload) {
    sendJson(res, 401, { error: 'Unauthorized: Missing, invalid, or expired admin session token.' });
    return false;
  }

  // Check if tokenVersion matches current token_version in private_settings if database is configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data: privateSettings, error } = await supabase
        .from('private_settings')
        .select('token_version')
        .eq('id', 'default')
        .maybeSingle();

      if (!error && privateSettings && privateSettings.token_version) {
        if (Number(payload.tokenVersion) < Number(privateSettings.token_version)) {
          sendJson(res, 401, {
            error: 'Session expired: Admin password was changed from another device. Please log in again with the new password.',
            sessionInvalidated: true,
          });
          return false;
        }
      }
    } catch (err) {
      // If DB check fails transiently, HMAC signature check above already passed
    }
  }

  return true;
}

export async function parseJsonBody(req) {
  if (req.body) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  }

  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => {
      resolve({});
    });
  });
}

export function sendJson(res, statusCode, data) {
  if (typeof res.status === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}
