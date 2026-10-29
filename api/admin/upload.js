import { setCorsHeaders, requireAdminAuth, parseJsonBody } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requireAdminAuth(req, res)) return;

  try {
    const body = await parseJsonBody(req);
    const { filename, contentType, base64Data } = body;

    if (!base64Data) {
      return res.status(400).json({ error: 'base64Data is required' });
    }

    const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const extMatch = (filename || '').split('.').pop();
    const ext = extMatch && extMatch.length <= 4 ? extMatch : 'jpg';
    const filePath = `product-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;

    const supabase = getSupabaseAdmin();

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

    return res.status(200).json({
      success: true,
      url: publicUrlData.publicUrl
    });
  } catch (err) {
    console.error('Image upload error:', err);
    return res.status(500).json({ error: err.message || 'Image upload failed' });
  }
}
