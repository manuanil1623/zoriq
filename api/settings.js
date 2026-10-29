import {
  setCorsHeaders,
  parseJsonBody,
  sendJson,
  requireAdminAuth
} from './_lib/auth.js';
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js';

function mapDbToPublicSettings(row) {
  if (!row) return null;
  return {
    id: row.id || 'default',
    version: Number(row.version) || 1,
    updatedAt: row.updated_at || new Date().toISOString(),

    // Store Identity
    storeName: row.store_name ?? 'ZORIQ',
    tagline: row.tagline ?? '',
    logoUrl: row.logo_url ?? '/zoriq-logo.jpg',
    contactPhone: row.contact_phone ?? '',
    contactEmail: row.contact_email ?? '',
    address: row.address ?? '',
    socialLinks: row.social_links ?? { instagram: '', twitter: '', facebook: '' },
    footerText: row.footer_text ?? '',
    announcement: row.announcement ?? '',

    // Shipping Rules
    freeShippingThreshold: Number(row.free_shipping_threshold ?? 999),
    standardShippingFee: Number(row.standard_shipping_fee ?? 49),
    deliveryTimeEstimate: row.delivery_time_estimate ?? '2 - 4 Business Days',
    serviceablePincodes: row.serviceable_pincodes ?? 'All India',

    // Cash on Delivery
    codEnabled: Boolean(row.cod_enabled ?? true),
    codFee: Number(row.cod_fee ?? 0),
    minOrderCod: Number(row.min_order_cod ?? 0),
    maxOrderCod: Number(row.max_order_cod ?? 25000),

    // Online Payments (Razorpay)
    razorpayEnabled: Boolean(row.razorpay_enabled ?? true),
    razorpayKeyId: row.razorpay_key_id ?? 'rzp_live_TstUZQzK6D5kHP',

    // Payment Methods
    upiEnabled: Boolean(row.upi_enabled ?? true),
    cardsEnabled: Boolean(row.cards_enabled ?? true),
    netBankingEnabled: Boolean(row.netbanking_enabled ?? true),

    // Tax & Invoice
    merchantName: row.merchant_name ?? 'ZORIQ Official',
    gstNumber: row.gst_number ?? '',
    taxRate: Number(row.tax_rate ?? 0),
    invoicePrefix: row.invoice_prefix ?? 'ZRQ-',
    sellerUpiId: row.seller_upi_id ?? '',
    bankName: row.bank_name ?? '',
    bankAccountNumber: row.bank_account_number ?? '',
    bankIfsc: row.bank_ifsc ?? '',
    accountHolderName: row.account_holder_name ?? '',
    currency: row.currency ?? '₹',
  };
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true });
  }

  const supabase = getSupabaseAdmin();

  // GET: Publicly accessible or admin accessible
  if (req.method === 'GET') {
    try {
      let data = null;
      const { data: pubData, error: pubErr } = await supabase
        .from('public_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (!pubErr && pubData) {
        data = pubData;
      } else {
        // Fallback to settings table
        const { data: altData } = await supabase
          .from('settings')
          .select('*')
          .or('id.eq.default,id.eq.store_config')
          .maybeSingle();
        if (altData) data = altData;
      }

      if (!data) {
        return sendJson(res, 200, { settings: null, version: 1 });
      }

      return sendJson(res, 200, {
        settings: mapDbToPublicSettings(data),
        version: data.version || 1,
        updatedAt: data.updated_at
      });
    } catch (err) {
      console.error('Fetch settings error:', err);
      return sendJson(res, 500, { error: err.message || 'Failed to fetch settings' });
    }
  }

  // POST / PUT: Requires Admin Authentication & Concurrency Check
  if (req.method === 'POST' || req.method === 'PUT') {
    const isAuthorized = await requireAdminAuth(req, res);
    if (!isAuthorized) return;

    try {
      const body = await parseJsonBody(req);
      const section = body.section; // 'identity' | 'shipping' | 'cod' | 'payments' | 'all'
      const payload = body.data || body;
      const expectedVersion = body.expectedVersion !== undefined ? Number(body.expectedVersion) : null;

      // 1. Fetch current settings row to check optimistic lock / version conflict
      let currentData = null;
      let targetTable = 'public_settings';

      const { data: pubCurrent, error: pubErr } = await supabase
        .from('public_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (!pubErr && pubCurrent) {
        currentData = pubCurrent;
        targetTable = 'public_settings';
      } else {
        const { data: altCurrent } = await supabase
          .from('settings')
          .select('*')
          .or('id.eq.default,id.eq.store_config')
          .maybeSingle();
        if (altCurrent) {
          currentData = altCurrent;
          targetTable = 'settings';
        }
      }

      const currentVersion = Number(currentData?.version) || 1;

      if (expectedVersion !== null && expectedVersion < currentVersion) {
        return sendJson(res, 409, {
          error: `Settings conflict: Settings were updated on another device (Version ${currentVersion}). Please reload the latest settings.`,
          currentVersion,
          latestSettings: mapDbToPublicSettings(currentData),
          conflict: true
        });
      }

      // 2. Validate fields
      if (payload.freeShippingThreshold !== undefined) {
        const val = Number(payload.freeShippingThreshold);
        if (isNaN(val) || val < 0) {
          return sendJson(res, 400, { error: 'Free shipping threshold must be a non-negative number.' });
        }
      }

      if (payload.standardShippingFee !== undefined) {
        const val = Number(payload.standardShippingFee);
        if (isNaN(val) || val < 0) {
          return sendJson(res, 400, { error: 'Standard shipping fee must be a non-negative number.' });
        }
      }

      if (payload.codFee !== undefined) {
        const val = Number(payload.codFee);
        if (isNaN(val) || val < 0) {
          return sendJson(res, 400, { error: 'COD handling fee must be a non-negative number.' });
        }
      }

      if (payload.minOrderCod !== undefined) {
        const val = Number(payload.minOrderCod);
        if (isNaN(val) || val < 0) {
          return sendJson(res, 400, { error: 'Minimum COD order must be a non-negative number.' });
        }
      }

      if (payload.maxOrderCod !== undefined) {
        const val = Number(payload.maxOrderCod);
        if (isNaN(val) || val <= 0) {
          return sendJson(res, 400, { error: 'Maximum COD order must be greater than 0.' });
        }
      }

      if (payload.taxRate !== undefined) {
        const val = Number(payload.taxRate);
        if (isNaN(val) || val < 0 || val > 100) {
          return sendJson(res, 400, { error: 'Tax/GST rate must be between 0% and 100%.' });
        }
      }

      if (payload.contactEmail && payload.contactEmail.trim()) {
        const email = payload.contactEmail.trim();
        if (!email.includes('@') || !email.includes('.')) {
          return sendJson(res, 400, { error: 'Please provide a valid support email address.' });
        }
      }

      // 3. Prepare DB updates
      const nextVersion = currentVersion + 1;
      const updateData = {
        id: 'default',
        version: nextVersion,
        updated_at: new Date().toISOString()
      };

      // Map incoming fields to database columns
      if (payload.storeName !== undefined) updateData.store_name = String(payload.storeName).trim();
      if (payload.tagline !== undefined) updateData.tagline = String(payload.tagline).trim();
      if (payload.logoUrl !== undefined) updateData.logo_url = String(payload.logoUrl).trim();
      if (payload.contactPhone !== undefined) updateData.contact_phone = String(payload.contactPhone).trim();
      if (payload.contactEmail !== undefined) updateData.contact_email = String(payload.contactEmail).trim();
      if (payload.address !== undefined) updateData.address = String(payload.address).trim();
      if (payload.socialLinks !== undefined) updateData.social_links = payload.socialLinks;
      if (payload.footerText !== undefined) updateData.footer_text = String(payload.footerText).trim();
      if (payload.announcement !== undefined) updateData.announcement = String(payload.announcement).trim();

      if (payload.freeShippingThreshold !== undefined) updateData.free_shipping_threshold = Number(payload.freeShippingThreshold);
      if (payload.standardShippingFee !== undefined) updateData.standard_shipping_fee = Number(payload.standardShippingFee);
      if (payload.deliveryTimeEstimate !== undefined) updateData.delivery_time_estimate = String(payload.deliveryTimeEstimate).trim();
      if (payload.serviceablePincodes !== undefined) updateData.serviceable_pincodes = String(payload.serviceablePincodes).trim();

      if (payload.codEnabled !== undefined) updateData.cod_enabled = Boolean(payload.codEnabled);
      if (payload.codFee !== undefined) updateData.cod_fee = Number(payload.codFee);
      if (payload.minOrderCod !== undefined) updateData.min_order_cod = Number(payload.minOrderCod);
      if (payload.maxOrderCod !== undefined) updateData.max_order_cod = Number(payload.maxOrderCod);

      if (payload.razorpayEnabled !== undefined) updateData.razorpay_enabled = Boolean(payload.razorpayEnabled);
      if (payload.razorpayKeyId !== undefined) updateData.razorpay_key_id = String(payload.razorpayKeyId).trim();

      if (payload.upiEnabled !== undefined) updateData.upi_enabled = Boolean(payload.upiEnabled);
      if (payload.cardsEnabled !== undefined) updateData.cards_enabled = Boolean(payload.cardsEnabled);
      if (payload.netBankingEnabled !== undefined) updateData.netbanking_enabled = Boolean(payload.netBankingEnabled);

      if (payload.merchantName !== undefined) updateData.merchant_name = String(payload.merchantName).trim();
      if (payload.gstNumber !== undefined) updateData.gst_number = String(payload.gstNumber).trim();
      if (payload.taxRate !== undefined) updateData.tax_rate = Number(payload.taxRate);
      if (payload.invoicePrefix !== undefined) updateData.invoice_prefix = String(payload.invoicePrefix).trim();
      if (payload.sellerUpiId !== undefined) updateData.seller_upi_id = String(payload.sellerUpiId).trim();
      if (payload.bankName !== undefined) updateData.bank_name = String(payload.bankName).trim();
      if (payload.bankAccountNumber !== undefined) updateData.bank_account_number = String(payload.bankAccountNumber).trim();
      if (payload.bankIfsc !== undefined) updateData.bank_ifsc = String(payload.bankIfsc).trim();
      if (payload.accountHolderName !== undefined) updateData.account_holder_name = String(payload.accountHolderName).trim();
      if (payload.currency !== undefined) updateData.currency = String(payload.currency).trim();

      // 4. Save to Supabase (trying public_settings, falling back to settings if table doesn't exist)
      let savedData = null;
      let saveErr = null;

      const primaryRes = await supabase
        .from('public_settings')
        .upsert(updateData)
        .select('*')
        .single();

      if (!primaryRes.error) {
        savedData = primaryRes.data;
      } else {
        // Fallback to settings table
        updateData.id = targetTable === 'settings' && currentData?.id === 'store_config' ? 'store_config' : 'default';
        const fallbackRes = await supabase
          .from('settings')
          .upsert(updateData)
          .select('*')
          .single();

        if (!fallbackRes.error) {
          savedData = fallbackRes.data;
        } else {
          saveErr = primaryRes.error || fallbackRes.error;
        }
      }

      if (saveErr) {
        console.error('Supabase settings upsert error:', saveErr);
        throw new Error(`Database error saving settings: ${saveErr.message}`);
      }

      return sendJson(res, 200, {
        success: true,
        section: section || 'all',
        settings: mapDbToPublicSettings(savedData),
        version: nextVersion,
        message: 'Settings updated successfully and replicated to all connected devices!'
      });
    } catch (err) {
      console.error('Settings update error:', err);
      return sendJson(res, 500, { error: err.message || 'Failed to update store settings' });
    }
  }

  return sendJson(res, 405, { error: 'Method Not Allowed' });
}
