import { setCorsHeaders, requireAdminAuth, parseJsonBody } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';

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
    in_stock: prod.inStock !== false && Number(prod.stock || 0) > 0,
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
    return res.status(200).end();
  }

  if (!requireAdminAuth(req, res)) return;

  const supabase = getSupabaseAdmin();

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
        return res.status(200).json({ success: true, count: data?.length || rows.length });
      }

      // Single Product Add
      const prod = body;
      if (!prod.name || !prod.price) {
        return res.status(400).json({ error: 'Product name and price are required.' });
      }

      const id = prod.id || `product-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const row = formatDbProduct({ ...prod, id });

      const { data, error } = await supabase
        .from('products')
        .insert([row])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, product: data });
    } catch (err) {
      console.error('Error inserting product:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // PUT: Update product
  if (req.method === 'PUT') {
    try {
      const body = await parseJsonBody(req);
      const productId = body.id || req.query.id;

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required for update.' });
      }

      const row = formatDbProduct({ ...body, id: productId });
      const { data, error } = await supabase
        .from('products')
        .update(row)
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, product: data });
    } catch (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // DELETE: Delete product
  if (req.method === 'DELETE') {
    try {
      const body = await parseJsonBody(req);
      const productId = req.query.id || body.id;

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required for deletion.' });
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      return res.status(200).json({ success: true, deletedId: productId });
    } catch (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
