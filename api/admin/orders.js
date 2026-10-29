import { setCorsHeaders, requireAdminAuth, parseJsonBody } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!requireAdminAuth(req, res)) return;

  const supabase = getSupabaseAdmin();

  // GET: Fetch all orders
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // POST: Update order status or payment status
  if (req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { orderId, orderStatus, paymentStatus } = body;

      if (!orderId) {
        return res.status(400).json({ error: 'orderId is required' });
      }

      const updates = {
        updated_at: new Date().toISOString()
      };
      if (orderStatus) updates.order_status = orderStatus;
      if (paymentStatus) updates.payment_status = paymentStatus;

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, order: data });
    } catch (err) {
      console.error('Error updating order:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
