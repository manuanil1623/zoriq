import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import {
  setCorsHeaders,
  parseJsonBody,
  sendJson,
  signCustomerToken,
  decodeAndVerifyCustomerToken
} from '../_lib/auth.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true });
  }

  const supabase = getSupabaseAdmin();

  // GET: Verify and return current authenticated customer profile
  if (req.method === 'GET') {
    try {
      const authHeader = req.headers.authorization || req.headers.Authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();

      const decoded = decodeAndVerifyCustomerToken(token);
      if (!decoded || !decoded.id) {
        return sendJson(res, 401, { error: 'Customer session expired or invalid. Please sign in.' });
      }

      const { data: userData, error: userErr } = await supabase.auth.admin.getUserById(decoded.id);
      if (userErr || !userData?.user) {
        return sendJson(res, 404, { error: 'Customer account not found.' });
      }

      const u = userData.user;
      const meta = u.user_metadata || {};

      return sendJson(res, 200, {
        success: true,
        user: {
          id: u.id,
          email: u.email,
          name: meta.name || decoded.name || 'Valued Customer',
          phone: meta.phone || decoded.phone || '',
          address: meta.address || '',
          city: meta.city || '',
          state: meta.state || 'Kerala',
          pincode: meta.pincode || '',
        },
      });
    } catch (err) {
      console.error('[Customer Auth GET error]:', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  // POST: Sign Up, Log In, or Update Profile
  if (req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const action = body.action || 'login';

      // 1. SIGN UP
      if (action === 'signup') {
        const email = (body.email || '').toLowerCase().trim();
        const password = String(body.password || '');
        const name = (body.name || '').trim();
        const phone = (body.phone || '').trim();
        const address = (body.address || '').trim();
        const city = (body.city || '').trim();
        const state = (body.state || '').trim();
        const pincode = (body.pincode || '').trim();

        if (!email || !email.includes('@')) {
          return sendJson(res, 400, { error: 'Please enter a valid email address.' });
        }
        if (!password || password.length < 6) {
          return sendJson(res, 400, { error: 'Password must be at least 6 characters long.' });
        }
        if (!name) {
          return sendJson(res, 400, { error: 'Full name is required.' });
        }
        if (!phone || phone.length < 10) {
          return sendJson(res, 400, { error: 'Valid 10-digit mobile number is required.' });
        }

        const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            name,
            phone,
            address,
            city,
            state,
            pincode,
          },
        });

        if (createErr) {
          if (createErr.message?.toLowerCase().includes('already registered')) {
            return sendJson(res, 409, {
              error: 'An account with this email already exists. Please sign in instead.',
            });
          }
          throw createErr;
        }

        const user = newUser.user;
        const token = signCustomerToken({
          id: user.id,
          email: user.email,
          phone,
          name,
        });

        return sendJson(res, 201, {
          success: true,
          message: 'Account created successfully! Welcome to ZORIQ.',
          token,
          user: {
            id: user.id,
            email: user.email,
            name,
            phone,
            address,
            city,
            state,
            pincode,
          },
        });
      }

      // 2. LOG IN
      if (action === 'login') {
        let identifier = (body.identifier || body.email || '').toLowerCase().trim();
        const password = String(body.password || '');

        if (!identifier) {
          return sendJson(res, 400, { error: 'Email or Mobile number is required.' });
        }
        if (!password) {
          return sendJson(res, 400, { error: 'Password is required.' });
        }

        // If user entered phone number without @, look up user by phone in metadata
        let emailToAuth = identifier;
        if (!identifier.includes('@')) {
          const { data: listData } = await supabase.auth.admin.listUsers();
          const match = listData?.users?.find(
            (u) => u.user_metadata?.phone?.replace(/\D/g, '') === identifier.replace(/\D/g, '')
          );
          if (match?.email) {
            emailToAuth = match.email;
          } else {
            return sendJson(res, 401, { error: 'No account found with this phone number. Please sign up.' });
          }
        }

        // Attempt authentication
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: emailToAuth,
          password,
        });

        if (authErr || !authData?.user) {
          return sendJson(res, 401, { error: 'Invalid email or password. Please try again.' });
        }

        const user = authData.user;
        const meta = user.user_metadata || {};
        const name = meta.name || 'Valued Customer';
        const phone = meta.phone || '';

        const token = signCustomerToken({
          id: user.id,
          email: user.email,
          phone,
          name,
        });

        return sendJson(res, 200, {
          success: true,
          message: `Welcome back, ${name}!`,
          token,
          user: {
            id: user.id,
            email: user.email,
            name,
            phone,
            address: meta.address || '',
            city: meta.city || '',
            state: meta.state || '',
            pincode: meta.pincode || '',
          },
        });
      }

      // 3. UPDATE PROFILE
      if (action === 'update_profile') {
        const authHeader = req.headers.authorization || req.headers.Authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();

        const decoded = decodeAndVerifyCustomerToken(token);
        if (!decoded || !decoded.id) {
          return sendJson(res, 401, { error: 'Unauthorized: Please sign in.' });
        }

        const { data: currUserData } = await supabase.auth.admin.getUserById(decoded.id);
        const existingMeta = currUserData?.user?.user_metadata || {};

        const updatedMeta = {
          ...existingMeta,
          name: body.name !== undefined ? body.name.trim() : existingMeta.name,
          phone: body.phone !== undefined ? body.phone.trim() : existingMeta.phone,
          address: body.address !== undefined ? body.address.trim() : existingMeta.address,
          city: body.city !== undefined ? body.city.trim() : existingMeta.city,
          state: body.state !== undefined ? body.state.trim() : existingMeta.state,
          pincode: body.pincode !== undefined ? body.pincode.trim() : existingMeta.pincode,
        };

        const { data: updatedUser, error: updateErr } = await supabase.auth.admin.updateUserById(
          decoded.id,
          { user_metadata: updatedMeta }
        );

        if (updateErr) throw updateErr;

        return sendJson(res, 200, {
          success: true,
          message: 'Profile updated successfully!',
          user: {
            id: decoded.id,
            email: updatedUser.user.email,
            ...updatedMeta,
          },
        });
      }

      return sendJson(res, 400, { error: `Unsupported action: ${action}` });
    } catch (err) {
      console.error('[Customer Auth error]:', err);
      return sendJson(res, 500, { error: err.message || 'Authentication error.' });
    }
  }

  return sendJson(res, 405, { error: 'Method Not Allowed' });
}
