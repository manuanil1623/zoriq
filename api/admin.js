import {
  setCorsHeaders,
  parseJsonBody,
  sendJson,
  requireAdminAuth,
  hashPassword,
  verifyPassword,
  signAdminToken
} from './_lib/auth.js';
import { getSupabaseAdmin, isSupabaseConfigured } from './_lib/supabaseAdmin.js';

function formatDbProduct(prod) {
  return {
    id: prod.id,
    name: prod.name,
    category: prod.category || 'electronics',
    price: Number(prod.price),
    original_price: prod.originalPrice != null ? Number(prod.originalPrice) : null,
    stock: Number(prod.stock || 0),
    sku: prod.sku || null,
    image: prod.image,
    seller_badge: prod.sellerBadge || null,
    cod_available: prod.codAvailable !== false,
    rating: Number(prod.rating || 5.0),
    reviews_count: Number(prod.reviewsCount || 1),
    description: prod.description || '',
    features: Array.isArray(prod.features)
      ? prod.features
      : typeof prod.features === 'string'
      ? prod.features.split('\n').filter(Boolean)
      : [],
    updated_at: new Date().toISOString()
  };
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true });
  }

  // Determine subroute
  const parsedUrl = new URL(req.url, 'http://localhost');
  const routeParam = req.query?.route || parsedUrl.searchParams.get('route');
  const pathClean = parsedUrl.pathname.replace(/^\/api\/admin\/?/, '').split('/')[0];
  const route = (routeParam || pathClean || '').toLowerCase();

  const supabase = getSupabaseAdmin();

  // ==========================================
  // 1. LOGIN: /api/admin/login or /api/admin-login
  // ==========================================
  if (route === 'login') {
    if (req.method !== 'POST') {
      return sendJson(res, 405, { error: 'Method Not Allowed' });
    }

    try {
      const body = await parseJsonBody(req);
      const inputPassword = (body.password || body.pin || '').toString().trim();

      if (!inputPassword) {
        return sendJson(res, 400, { error: 'Admin Password / PIN is required.' });
      }

      const initialPin = (process.env.ADMIN_PIN || '7784').trim();

      try {
        const { data: creds, error: fetchErr } = await supabase
          .from('admin_credentials')
          .select('*')
          .order('id', { ascending: true })
          .limit(1);

        if (fetchErr) {
          console.warn('admin_credentials check error, using env PIN fallback:', fetchErr.message);
          if (inputPassword !== initialPin) {
            return sendJson(res, 401, { error: 'Incorrect Admin PIN. Please verify your PIN.' });
          }
          const token = signAdminToken(1);
          return sendJson(res, 200, {
            success: true,
            token,
            isFirstTime: true,
            message: 'Logged in using master PIN.'
          });
        }

        // First-time setup: table empty
        if (!creds || creds.length === 0) {
          if (inputPassword !== initialPin) {
            return sendJson(res, 401, {
              error: `Incorrect initial PIN. Use default '${initialPin}' or set ADMIN_PIN in environment variables.`
            });
          }

          try {
            const hashed = await hashPassword(inputPassword);
            await supabase.from('admin_credentials').insert([{
              id: 1,
              password_hash: hashed,
              updated_at: new Date().toISOString()
            }]);
          } catch (insertErr) {
            console.warn('Could not auto-seed admin_credentials:', insertErr.message);
          }

          const token = signAdminToken(1);
          return sendJson(res, 200, {
            success: true,
            token,
            isFirstTime: true,
            message: 'Initial login successful! You can change this password anytime in settings.'
          });
        }

        // Stored password hash check
        const storedRow = creds[0];
        const isValid = await verifyPassword(inputPassword, storedRow.password_hash);
        const matchesEnvPin = inputPassword === initialPin;

        if (!isValid && !matchesEnvPin) {
          return sendJson(res, 401, { error: 'Incorrect Admin Password. Please try again.' });
        }

        const token = signAdminToken(storedRow.id);
        return sendJson(res, 200, {
          success: true,
          token,
          isFirstTime: false,
          message: 'Welcome back to ZORIQ Owner Portal!'
        });
      } catch (dbErr) {
        console.error('Supabase auth catch, trying fallback:', dbErr.message);
        if (inputPassword !== initialPin) {
          return sendJson(res, 401, { error: 'Incorrect Admin PIN.' });
        }
        const token = signAdminToken(1);
        return sendJson(res, 200, { success: true, token, isFirstTime: true });
      }
    } catch (err) {
      console.error('Admin login error:', err);
      return sendJson(res, 500, { error: err.message || 'Login failed.' });
    }
  }

  // ==========================================
  // 2. VERIFY: /api/admin/verify
  // ==========================================
  if (route === 'verify') {
    if (req.method !== 'GET') {
      return sendJson(res, 405, { error: 'Method Not Allowed' });
    }

    const isAuth = await requireAdminAuth(req, res);
    if (!isAuth) return;

    return sendJson(res, 200, { valid: true });
  }

  // ==========================================
  // 3. CHANGE PASSWORD: /api/admin/change-password
  // ==========================================
  if (route === 'change-password') {
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

      const initialPin = (process.env.ADMIN_PIN || '7784').trim();
      const { data: creds, error: fetchErr } = await supabase
        .from('admin_credentials')
        .select('*')
        .order('id', { ascending: true })
        .limit(1);

      if (fetchErr) {
        if (currentPassword !== initialPin) {
          return sendJson(res, 400, { error: 'Current password does not match.' });
        }
      } else if (!creds || creds.length === 0) {
        if (currentPassword !== initialPin) {
          return sendJson(res, 400, { error: 'Current password does not match default PIN.' });
        }
      } else {
        const storedRow = creds[0];
        const isValid = await verifyPassword(currentPassword, storedRow.password_hash);
        const matchesEnvPin = currentPassword === initialPin;
        if (!isValid && !matchesEnvPin) {
          return sendJson(res, 400, { error: 'Current password is not correct.' });
        }
      }

      const newHash = await hashPassword(newPassword);
      let targetId = creds?.[0]?.id || 1;

      const { error: upsertErr } = await supabase
        .from('admin_credentials')
        .upsert([{
          id: targetId,
          password_hash: newHash,
          updated_at: new Date().toISOString()
        }]);

      if (upsertErr) throw upsertErr;

      const newToken = signAdminToken(targetId);
      return sendJson(res, 200, {
        success: true,
        token: newToken,
        message: 'Admin password changed successfully and synced securely across all devices.'
      });
    } catch (err) {
      console.error('Change password error:', err);
      return sendJson(res, 500, { error: err.message || 'Failed to update password.' });
    }
  }

  // ==========================================
  // 4. PRODUCTS: /api/admin/products
  // ==========================================
  if (route === 'products') {
    const isAuth = await requireAdminAuth(req, res);
    if (!isAuth) return;

    // POST: Add new product or bulk import
    if (req.method === 'POST') {
      try {
        const body = await parseJsonBody(req);

        // Bulk Import
        if (Array.isArray(body.products)) {
          const rows = body.products.map(formatDbProduct);
          const { data, error } = await supabase
            .from('products')
            .upsert(rows, { onConflict: 'id' })
            .select();

          if (error) throw error;
          return sendJson(res, 200, { success: true, count: data?.length || rows.length });
        }

        // Single Product Add
        const prod = body;
        if (!prod.name || !prod.price) {
          return sendJson(res, 400, { error: 'Product name and price are required.' });
        }

        const id = prod.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const row = formatDbProduct({ ...prod, id });

        const { data, error } = await supabase
          .from('products')
          .insert([row])
          .select()
          .single();

        if (error) throw error;
        return sendJson(res, 201, { success: true, product: data });
      } catch (err) {
        console.error('Error adding product:', err);
        return sendJson(res, 500, { error: err.message });
      }
    }

    // PUT: Update existing product
    if (req.method === 'PUT') {
      try {
        const body = await parseJsonBody(req);
        if (!body.id) {
          return sendJson(res, 400, { error: 'Product ID is required for update' });
        }

        const row = formatDbProduct(body);
        const { data, error } = await supabase
          .from('products')
          .update(row)
          .eq('id', body.id)
          .select()
          .single();

        if (error) throw error;
        return sendJson(res, 200, { success: true, product: data });
      } catch (err) {
        console.error('Error updating product:', err);
        return sendJson(res, 500, { error: err.message });
      }
    }

    // DELETE: Remove product
    if (req.method === 'DELETE') {
      try {
        const prodId = req.query?.id || parsedUrl.searchParams.get('id');
        if (!prodId) {
          return sendJson(res, 400, { error: 'Product ID is required' });
        }

        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', prodId);

        if (error) throw error;
        return sendJson(res, 200, { success: true, deletedId: prodId });
      } catch (err) {
        console.error('Error deleting product:', err);
        return sendJson(res, 500, { error: err.message });
      }
    }

    // GET: Admin fetch all products
    if (req.method === 'GET') {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return sendJson(res, 200, { success: true, products: data || [] });
      } catch (err) {
        console.error('Error listing admin products:', err);
        return sendJson(res, 500, { error: err.message });
      }
    }

    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }

  // ==========================================
  // 5. ORDERS: /api/admin/orders
  // ==========================================
  if (route === 'orders') {
    const isAuth = await requireAdminAuth(req, res);
    if (!isAuth) return;

    // GET: Fetch all orders
    if (req.method === 'GET') {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return sendJson(res, 200, data || []);
      } catch (err) {
        console.error('Error fetching admin orders:', err);
        return sendJson(res, 500, { error: err.message });
      }
    }

    // POST: Update order status
    if (req.method === 'POST') {
      try {
        const body = await parseJsonBody(req);
        const { orderId, orderStatus, paymentStatus } = body;

        if (!orderId) {
          return sendJson(res, 400, { error: 'orderId is required' });
        }

        const updates = {};
        if (orderStatus) updates.order_status = orderStatus;
        if (paymentStatus) updates.payment_status = paymentStatus;
        if (body.trackingNumber != null || body.tracking_number != null) {
          updates.tracking_number = body.trackingNumber || body.tracking_number;
        }

        const { data, error } = await supabase
          .from('orders')
          .update(updates)
          .eq('id', orderId)
          .select()
          .single();

        if (error) throw error;
        return sendJson(res, 200, { success: true, order: data });
      } catch (err) {
        console.error('Error updating order:', err);
        return sendJson(res, 500, { error: err.message });
      }
    }

    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }

  // ==========================================
  // 6. UPLOAD: /api/admin/upload
  // ==========================================
  if (route === 'upload') {
    if (req.method !== 'POST') {
      return sendJson(res, 405, { error: 'Method Not Allowed' });
    }

    const isAuth = await requireAdminAuth(req, res);
    if (!isAuth) return;

    try {
      const body = await parseJsonBody(req);
      const { filename, contentType, base64Data } = body;

      if (!base64Data) {
        return sendJson(res, 400, { error: 'base64Data is required' });
      }

      const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');

      const extMatch = (filename || '').split('.').pop();
      const ext = extMatch && extMatch.length <= 4 ? extMatch : 'jpg';
      const filePath = `product-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, buffer, {
          contentType: contentType || 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        console.error('Supabase storage upload error:', uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return sendJson(res, 200, {
        success: true,
        url: publicUrlData.publicUrl
      });
    } catch (err) {
      console.error('Image upload error:', err);
      return sendJson(res, 500, { error: err.message || 'Image upload failed' });
    }
  }

  return sendJson(res, 404, { error: `Admin route not found: ${route}` });
}
