import {
  setCorsHeaders,
  parseJsonBody,
  sendJson,
  hashPassword,
  verifyPassword,
  signAdminToken
} from './_lib/auth.js';
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }

  try {
    const body = await parseJsonBody(req);
    const inputPassword = (body.password || body.pin || '').toString().trim();

    if (!inputPassword) {
      return sendJson(res, 400, { error: 'Admin Password / PIN is required.' });
    }

    const supabase = getSupabaseAdmin();

    // Query private_settings table for password hash
    let { data: privateRow, error: fetchErr } = await supabase
      .from('private_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (fetchErr) {
      console.warn('Error querying private_settings, checking table existence:', fetchErr.message);
    }

    // 1. FIRST-TIME SETUP: No password hash exists in private_settings yet
    if (!privateRow || !privateRow.password_hash) {
      const initialPin = (process.env.ADMIN_PIN || '7784').trim();

      if (inputPassword !== initialPin) {
        return sendJson(res, 401, {
          error: 'Incorrect Admin PIN. (First-time setup: Enter the initial PIN configured in your Vercel ADMIN_PIN environment variable).'
        });
      }

      // Hash the initial PIN using scrypt and seed private_settings
      const { hash, salt } = hashPassword(inputPassword);
      const tokenVersion = 1;

      try {
        await supabase.from('private_settings').upsert({
          id: 'default',
          password_hash: hash,
          password_salt: salt,
          token_version: tokenVersion,
          updated_at: new Date().toISOString()
        });
      } catch (insertErr) {
        console.error('Failed to seed private_settings:', insertErr);
      }

      const token = signAdminToken(tokenVersion);
      return sendJson(res, 200, {
        success: true,
        token,
        isFirstTime: true,
        message: 'First-time setup detected. You are using the initial PIN from environment variables. Please update your custom password in Store Settings.'
      });
    }

    // 2. STANDARD VERIFICATION: Compare against scrypt hash
    const isValid = verifyPassword(
      inputPassword,
      privateRow.password_hash,
      privateRow.password_salt
    );

    if (!isValid) {
      return sendJson(res, 401, {
        error: 'Incorrect Admin Password / PIN. Access denied.'
      });
    }

    const currentTokenVersion = privateRow.token_version || 1;
    const token = signAdminToken(currentTokenVersion);

    return sendJson(res, 200, {
      success: true,
      token,
      isFirstTime: false
    });
  } catch (err) {
    console.error('Admin Login Error:', err);
    return sendJson(res, 500, { error: err.message || 'Server authentication failure' });
  }
}
