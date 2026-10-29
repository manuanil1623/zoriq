import { getSupabaseAdmin, isSupabaseConfigured } from './_lib/supabaseAdmin.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  let host = 'NOT_SET';
  try {
    if (supabaseUrl) host = new URL(supabaseUrl).hostname;
  } catch (e) {
    host = 'INVALID_URL';
  }

  if (!isSupabaseConfigured()) {
    return res.status(200).json({
      configured: false,
      supabaseHost: host,
      hasServiceKey: Boolean(serviceRoleKey),
      message: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in Vercel environment variables.'
    });
  }

  try {
    const supabase = getSupabaseAdmin();
    
    // Check products table
    const prodRes = await supabase.from('products').select('id').limit(1);
    
    // Check public_settings table
    const settingsRes = await supabase.from('public_settings').select('id').limit(1);

    return res.status(200).json({
      configured: true,
      supabaseHost: host,
      hasServiceKey: Boolean(serviceRoleKey),
      tables: {
        products: prodRes.error ? { error: prodRes.error.message } : { ok: true, count: prodRes.data?.length },
        public_settings: settingsRes.error ? { error: settingsRes.error.message } : { ok: true, count: settingsRes.data?.length }
      }
    });
  } catch (err) {
    return res.status(200).json({
      configured: true,
      supabaseHost: host,
      serverError: err.message
    });
  }
}
