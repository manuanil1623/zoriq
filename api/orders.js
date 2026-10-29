import crypto from 'crypto';
import { setCorsHeaders, parseJsonBody, sendJson } from './_lib/auth.js';
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js';

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true });
  }

  const supabase = getSupabaseAdmin();

  // GET: Customer tracking / viewing specific orders by IDs or phone lookup
  if (req.method === 'GET') {
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      const idsParam = urlObj.searchParams.get('ids') || req.query?.ids;
      const lookup = urlObj.searchParams.get('lookup') || req.query?.lookup;

      // Track by specific Order ID or Phone number
      if (lookup) {
        const clean = lookup.trim();
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .or(`id.ilike.%${clean}%,customer->>phone.ilike.%${clean}%`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        return sendJson(res, 200, data || []);
      }

      if (!idsParam) {
        return sendJson(res, 200, []);
      }

      const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
      if (ids.length === 0) {
        return sendJson(res, 200, []);
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('id', ids)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return sendJson(res, 200, data || []);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  // POST: Create Razorpay Order OR Create Final Store Order
  if (req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const urlObj = new URL(req.url, 'http://localhost');
      const action = urlObj.searchParams.get('action') || body.action;

      // 1. Fetch current live store settings from Supabase (NEVER trust browser values)
      const { data: dbSettings } = await supabase
        .from('public_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      const freeShippingThreshold = Number(dbSettings?.free_shipping_threshold ?? 999);
      const standardShippingFee = Number(dbSettings?.standard_shipping_fee ?? 49);
      const isCodEnabled = Boolean(dbSettings?.cod_enabled ?? true);
      const codHandlingFee = Number(dbSettings?.cod_fee ?? 0);
      const minCodOrder = Number(dbSettings?.min_order_cod ?? 0);
      const maxCodOrder = Number(dbSettings?.max_order_cod ?? 25000);
      const taxRate = Number(dbSettings?.tax_rate ?? 0);
      const isRazorpayEnabled = Boolean(dbSettings?.razorpay_enabled ?? true);
      const razorpayKeyId = (dbSettings?.razorpay_key_id || 'rzp_live_TstUZQzK6D5kHP').trim();

      // --- SUB-ACTION: Create Razorpay Order on Razorpay Server ---
      if (action === 'create-razorpay-order') {
        const { items = [], discount = 0 } = body;

        if (!isRazorpayEnabled) {
          return sendJson(res, 400, { error: 'Online payments via Razorpay are currently disabled by the store.' });
        }

        // Calculate verified subtotal
        let computedSubtotal = 0;
        for (const item of items) {
          computedSubtotal += (Number(item.price) || 0) * (Number(item.quantity) || 1);
        }

        const computedShipping = (computedSubtotal >= freeShippingThreshold || computedSubtotal === 0) ? 0 : standardShippingFee;
        const computedTax = taxRate > 0 ? Math.round((computedSubtotal * taxRate) / 100) : 0;
        const verifiedTotal = Math.max(1, computedSubtotal - Number(discount || 0) + computedShipping + computedTax);
        const amountPaise = Math.round(verifiedTotal * 100);

        const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

        // If RAZORPAY_KEY_SECRET is configured, create the official order with Razorpay REST API
        if (razorpaySecret && razorpayKeyId) {
          try {
            const authHeader = 'Basic ' + Buffer.from(`${razorpayKeyId}:${razorpaySecret}`).toString('base64');
            const receiptId = `RCP-${Date.now().toString().slice(-8)}`;

            const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
              method: 'POST',
              headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                amount: amountPaise,
                currency: 'INR',
                receipt: receiptId,
                payment_capture: 1
              })
            });

            if (rzpRes.ok) {
              const rzpData = await rzpRes.json();
              return sendJson(res, 200, {
                success: true,
                razorpayOrderId: rzpData.id,
                amount: rzpData.amount,
                currency: rzpData.currency || 'INR',
                keyId: razorpayKeyId,
                verifiedTotal,
                shippingFee: computedShipping,
                tax: computedTax
              });
            } else {
              const errData = await rzpRes.json();
              console.warn('Razorpay API order creation warning:', errData);
            }
          } catch (rzpErr) {
            console.warn('Razorpay order creation network issue:', rzpErr.message);
          }
        }

        // Fallback for direct checkout integration
        return sendJson(res, 200, {
          success: true,
          razorpayOrderId: null,
          amount: amountPaise,
          currency: 'INR',
          keyId: razorpayKeyId,
          verifiedTotal,
          shippingFee: computedShipping,
          tax: computedTax
        });
      }

      // --- MAIN ACTION: Place / Record Customer Order ---
      const {
        customer,
        items,
        discount = 0,
        couponApplied = null,
        total: clientReportedTotal,
        paymentMethod = 'COD',
        paymentDetails = {}
      } = body;

      if (!customer || !items || !Array.isArray(items) || items.length === 0) {
        return sendJson(res, 400, { error: 'Customer information and cart items are required.' });
      }

      // Recalculate verified subtotal from items
      let computedSubtotal = 0;
      for (const item of items) {
        computedSubtotal += (Number(item.price) || 0) * (Number(item.quantity) || 1);
      }

      // Recalculate server shipping fee
      const serverShippingFee = (computedSubtotal >= freeShippingThreshold || computedSubtotal === 0) ? 0 : standardShippingFee;

      // Recalculate COD availability and handling fee
      let serverCodFee = 0;
      if (paymentMethod === 'COD') {
        if (!isCodEnabled) {
          return sendJson(res, 400, { error: 'Cash on Delivery (COD) is currently disabled by the store owner.' });
        }
        if (computedSubtotal < minCodOrder) {
          return sendJson(res, 400, { error: `Minimum order subtotal for Cash on Delivery is ₹${minCodOrder}.` });
        }
        if (computedSubtotal > maxCodOrder) {
          return sendJson(res, 400, { error: `Maximum order subtotal for Cash on Delivery is ₹${maxCodOrder}.` });
        }
        serverCodFee = codHandlingFee;
      }

      // Recalculate Tax
      const serverTax = taxRate > 0 ? Math.round((computedSubtotal * taxRate) / 100) : 0;

      // Compute final server total
      const serverTotal = Math.max(0, computedSubtotal - Number(discount || 0) + serverShippingFee + serverCodFee + serverTax);

      // Verify client-reported total against recalculated server total
      if (clientReportedTotal !== undefined && Math.abs(Number(clientReportedTotal) - serverTotal) > 5) {
        if (paymentMethod === 'COD') {
          return sendJson(res, 409, {
            error: `Store shipping or price settings were updated. Your total is now ₹${serverTotal.toLocaleString('en-IN')}. Please confirm your order.`,
            updatedTotal: serverTotal,
            shippingFee: serverShippingFee,
            codFee: serverCodFee
          });
        }
      }

      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const trackingNumber = `ZOR-${Math.floor(10000000 + Math.random() * 90000000)}`;

      let paymentStatus = 'Pending (COD)';
      let orderStatus = 'Placed';

      // Verify Razorpay Payment if applicable
      if (paymentMethod === 'RAZORPAY') {
        const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
        const razorpayPaymentId = paymentDetails.razorpayPaymentId;
        const razorpayOrderId = paymentDetails.razorpayOrderId;
        const razorpaySignature = paymentDetails.razorpaySignature;

        if (!razorpayPaymentId) {
          return sendJson(res, 400, { error: 'Missing Razorpay Payment ID from bank transaction.' });
        }

        // Cryptographically verify signature if secret and signature exist
        if (razorpaySecret && razorpayOrderId && razorpaySignature) {
          const expectedSig = crypto
            .createHmac('sha256', razorpaySecret)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex');

          if (expectedSig !== razorpaySignature) {
            console.error('Razorpay signature mismatch.');
            return sendJson(res, 400, { error: 'Razorpay payment verification failed: Invalid transaction signature.' });
          }
        }

        paymentStatus = 'Paid';
        orderStatus = 'Confirmed';
      }

      const orderRow = {
        id: orderId,
        customer,
        items,
        subtotal: computedSubtotal,
        discount: Number(discount || 0),
        coupon_applied: couponApplied,
        shipping_fee: serverShippingFee,
        total: serverTotal,
        payment_method: paymentMethod || 'COD',
        payment_status: paymentStatus,
        upi_txn_id: paymentMethod === 'UPI' ? (paymentDetails.upiTxnId || null) : null,
        razorpay_payment_id: paymentDetails.razorpayPaymentId || null,
        razorpay_order_id: paymentDetails.razorpayOrderId || null,
        razorpay_signature: paymentDetails.razorpaySignature || null,
        order_status: orderStatus,
        tracking_number: trackingNumber,
        created_at: new Date().toISOString()
      };

      // 1. Insert order into orders table
      const { data: createdOrder, error: orderError } = await supabase
        .from('orders')
        .insert([orderRow])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Decrement stock from products table
      for (const item of items) {
        if (item.id && item.quantity) {
          try {
            const { data: prod } = await supabase
              .from('products')
              .select('stock')
              .eq('id', item.id)
              .maybeSingle();

            if (prod && prod.stock !== undefined) {
              const newStock = Math.max(0, prod.stock - item.quantity);
              await supabase
                .from('products')
                .update({
                  stock: newStock,
                  in_stock: newStock > 0,
                  updated_at: new Date().toISOString()
                })
                .eq('id', item.id);
            }
          } catch (stockErr) {
            console.warn(`Could not update stock for product ${item.id}:`, stockErr.message);
          }
        }
      }

      return sendJson(res, 201, { success: true, order: createdOrder });
    } catch (err) {
      console.error('Error creating order:', err);
      return sendJson(res, 500, { error: err.message || 'Order creation failed' });
    }
  }

  return sendJson(res, 405, { error: 'Method not allowed' });
}
