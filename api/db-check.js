import { getSupabaseAdmin, isSupabaseConfigured } from './_lib/supabaseAdmin.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabase = getSupabaseAdmin();
    
    // Check products table
    const prodRes = await supabase.from('products').select('id, name, price').limit(5);
    
    // Check public_settings table
    const settingsRes = await supabase.from('public_settings').select('*').limit(1);

    return res.status(200).json({
      success: true,
      configured: true,
      activeHost: 'rggapjrbjasqtdiaubvx.supabase.co',
      tables: {
        products: prodRes.error ? { error: prodRes.error.message } : { ok: true, count: prodRes.data?.length, items: prodRes.data },
        public_settings: settingsRes.error ? { error: settingsRes.error.message } : { ok: true, settings: settingsRes.data?.[0] }
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
