import {
  setCorsHeaders,
  parseJsonBody,
  sendJson,
  requireAdminAuth,
  hashPassword,
  verifyPassword,
  signAdminToken
} from '../_lib/auth.js';
import { getSupabaseAdmin, isSupabaseConfigured } from '../_lib/supabaseAdmin.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }

  const isAuthorized = await requireAdminAuth(req, res);
  if (!isAuthorized) return;

  try {
    const body = await parseJsonBody(req);
    const currentPassword = (body.currentPassword || '').toString().trim();
    const newPassword = (body.newPassword || '').toString().trim();
    const confirmPassword = (body.confirmPassword || '').toString().trim();

    if (!currentPassword) {
      return sendJson(res, 400, { error: 'Current password is required to change password.' });
    }

    if (!newPassword || newPassword.length < 6) {
      return sendJson(res, 400, { error: 'New password must be at least 6 characters long.' });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return sendJson(res, 400, { error: 'New password and confirmation do not match.' });
    }

    // Fallback if Supabase is not configured yet
    if (!isSupabaseConfigured()) {
      const isCurrentValid = currentPassword === (process.env.ADMIN_PIN || '7784').trim();
      if (!isCurrentValid) {
        return sendJson(res, 400, { error: 'Current password does not match.' });
      }
      return sendJson(res, 200, {
        success: true,
        token: signAdminToken(2),
        message: 'Password accepted in local session! Note: Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to environment variables to permanently store the hashed password in the cloud database.'
      });
    }

    const supabase = getSupabaseAdmin();

    const { data: privateRow } = await supabase
      .from('private_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    // Verify current password
    let isCurrentValid = false;
    if (privateRow && privateRow.password_hash) {
      isCurrentValid = verifyPassword(
        currentPassword,
        privateRow.password_hash,
        privateRow.password_salt
      );
    } else {
      isCurrentValid = currentPassword === (process.env.ADMIN_PIN || '7784').trim();
    }

    if (!isCurrentValid) {
      return sendJson(res, 400, { error: 'Current password is incorrect. Please try again.' });
    }

    // Hash new password using scrypt
    const { hash, salt } = hashPassword(newPassword);

    // Increment token_version to invalidate all existing sessions on other devices
    const currentTokenVersion = privateRow?.token_version || 1;
    const nextTokenVersion = currentTokenVersion + 1;

    const { error: updateErr } = await supabase.from('private_settings').upsert({
      id: 'default',
      password_hash: hash,
      password_salt: salt,
      token_version: nextTokenVersion,
      updated_at: new Date().toISOString()
    });

    if (updateErr) {
      throw new Error(`Database error saving new password: ${updateErr.message}`);
    }

    // Issue new session token for the current device
    const newToken = signAdminToken(nextTokenVersion);

    return sendJson(res, 200, {
      success: true,
      token: newToken,
      message: 'Admin password updated successfully! All other sessions on other devices have been logged out.'
    });
  } catch (err) {
    console.error('Change password error:', err);
    return sendJson(res, 500, { error: err.message || 'Failed to update admin password' });
  }
}
