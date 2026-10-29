import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[ZORIQ Supabase] Notice: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY are not set. Please add them to your environment variables.'
  );
}

// Browser Supabase Client (Anon Key with Read-Only RLS)
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

// --- DB Row to Frontend Model Mappers ---

export function mapProductFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    category: row.category || 'electronics',
    price: Number(row.price || 0),
    originalPrice: row.original_price != null ? Number(row.original_price) : Number(row.price || 0),
    stock: Number(row.stock || 0),
    sku: row.sku || '',
    image: row.image || '',
    sellerBadge: row.seller_badge || '',
    codAvailable: row.cod_available !== false,
    inStock: row.in_stock !== false && Number(row.stock || 0) > 0,
    rating: Number(row.rating || 5.0),
    reviewsCount: Number(row.reviews_count || 1),
    description: row.description || '',
    features: Array.isArray(row.features)
      ? row.features
      : typeof row.features === 'string'
      ? row.features.split('\n').filter(Boolean)
      : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSettingsFromDb(row) {
  if (!row) return null;
  return {
    id: row.id || 'default',
    version: Number(row.version) || 1,
    updatedAt: row.updatedAt || row.updated_at || new Date().toISOString(),

    // Storefront Identity
    storeName: row.storeName ?? row.store_name ?? 'ZORIQ',
    tagline: row.tagline ?? 'Premium Direct-to-Consumer Electronics & Lifestyle',
    logoUrl: row.logoUrl ?? row.logo_url ?? '/zoriq-logo.jpg',
    contactPhone: row.contactPhone ?? row.contact_phone ?? '+91 98765 43210',
    contactEmail: row.contactEmail ?? row.contact_email ?? 'help@zoriq.in',
    address: row.address ?? '12th Floor, Orion Tech Park, MG Road, Bengaluru, Karnataka 560001',
    socialLinks: row.socialLinks ?? row.social_links ?? {
      instagram: 'https://instagram.com/zoriq.official',
      twitter: '',
      facebook: '',
    },
    footerText: row.footerText ?? row.footer_text ?? '© 2026 ZORIQ Official Store. All rights reserved.',
    announcement: row.announcement ?? '⚡ FLASH SALE: Free Delivery on orders over ₹999 + Instant Bank Discounts!',

    // Shipping Rules
    freeShippingThreshold: Number(row.freeShippingThreshold ?? row.free_shipping_threshold ?? 999),
    standardShippingFee: Number(row.standardShippingFee ?? row.standard_shipping_fee ?? 49),
    deliveryTimeEstimate: row.deliveryTimeEstimate ?? row.delivery_time_estimate ?? '2 - 4 Business Days',
    serviceablePincodes: row.serviceablePincodes ?? row.serviceable_pincodes ?? 'All India',

    // Cash on Delivery
    codEnabled: Boolean(row.codEnabled ?? row.cod_enabled ?? true),
    codFee: Number(row.codFee ?? row.cod_fee ?? 0),
    minOrderCod: Number(row.minOrderCod ?? row.min_order_cod ?? 0),
    maxOrderCod: Number(row.maxOrderCod ?? row.max_order_cod ?? 25000),

    // Online Payments (Razorpay)
    razorpayEnabled: Boolean(row.razorpayEnabled ?? row.razorpay_enabled ?? true),
    razorpayKeyId: row.razorpayKeyId ?? row.razorpay_key_id ?? 'rzp_live_TstUZQzK6D5kHP',

    // Payment Methods Enabled
    upiEnabled: Boolean(row.upiEnabled ?? row.upi_enabled ?? true),
    cardsEnabled: Boolean(row.cardsEnabled ?? row.cards_enabled ?? true),
    netBankingEnabled: Boolean(row.netBankingEnabled ?? row.netbanking_enabled ?? true),

    // Tax, GST & Invoice Details
    merchantName: row.merchantName ?? row.merchant_name ?? 'ZORIQ Official Retails Pvt Ltd',
    gstNumber: row.gstNumber ?? row.gst_number ?? '29ABCDE1234F1Z5',
    taxRate: Number(row.taxRate ?? row.tax_rate ?? 0),
    invoicePrefix: row.invoicePrefix ?? row.invoice_prefix ?? 'ZRQ-',
    sellerUpiId: row.sellerUpiId ?? row.seller_upi_id ?? 'zoriq@upi',
    bankName: row.bankName ?? row.bank_name ?? 'State Bank of India',
    bankAccountNumber: row.bankAccountNumber ?? row.bank_account_number ?? '',
    bankIfsc: row.bankIfsc ?? row.bank_ifsc ?? '',
    accountHolderName: row.accountHolderName ?? row.account_holder_name ?? 'ZORIQ Official Store',
    currency: row.currency ?? '₹',
  };
}

export function mapOrderFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    date: row.created_at,
    customer: row.customer || {},
    items: row.items || [],
    subtotal: Number(row.subtotal || 0),
    discount: Number(row.discount || 0),
    couponApplied: row.coupon_applied || null,
    shippingFee: Number(row.shipping_fee || 0),
    total: Number(row.total || 0),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    upiTxnId: row.upi_txn_id || null,
    razorpayPaymentId: row.razorpay_payment_id || null,
    razorpayOrderId: row.razorpay_order_id || null,
    razorpaySignature: row.razorpay_signature || null,
    orderStatus: row.order_status || 'Placed',
    trackingNumber: row.tracking_number || null,
  };
}

// --- Admin API Client Calls (Protected by Server Token) ---

async function fetchWithAdminAuth(url, options = {}, token) {
  const adminToken = token || localStorage.getItem('zoriq_admin_session_token') || '';
  const headers = {
    'Content-Type': 'application/json',
    ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || `Server responded with status ${res.status}`);
    error.status = res.status;
    error.conflict = data.conflict;
    error.latestSettings = data.latestSettings;
    throw error;
  }
  return data;
}

export async function adminLogin(password) {
  const res = await fetch('/api/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Login failed. Incorrect password.');
  }
  return {
    token: data.token,
    isFirstTime: Boolean(data.isFirstTime),
    message: data.message
  };
}

export async function adminChangePassword(currentPassword, newPassword, confirmPassword, token) {
  return await fetchWithAdminAuth(
    '/api/admin/change-password',
    {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    },
    token
  );
}

export async function adminVerifyToken(token) {
  try {
    const res = await fetch('/api/admin/verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function adminAddProduct(productData, token) {
  const data = await fetchWithAdminAuth(
    '/api/admin/products',
    {
      method: 'POST',
      body: JSON.stringify(productData),
    },
    token
  );
  return mapProductFromDb(data.product);
}

export async function adminUpdateProduct(productId, productData, token) {
  const data = await fetchWithAdminAuth(
    '/api/admin/products',
    {
      method: 'PUT',
      body: JSON.stringify({ ...productData, id: productId }),
    },
    token
  );
  return mapProductFromDb(data.product);
}

export async function adminDeleteProduct(productId, token) {
  return await fetchWithAdminAuth(
    `/api/admin/products?id=${encodeURIComponent(productId)}`,
    {
      method: 'DELETE',
    },
    token
  );
}

export async function adminImportProducts(productsList, token) {
  return await fetchWithAdminAuth(
    '/api/admin/products',
    {
      method: 'POST',
      body: JSON.stringify({ products: productsList }),
    },
    token
  );
}

/**
 * Save settings section by section with optimistic locking (expectedVersion)
 */
export async function adminUpdateSettingsSection(section, sectionData, expectedVersion, token) {
  const data = await fetchWithAdminAuth(
    '/api/settings',
    {
      method: 'PUT',
      body: JSON.stringify({ section, data: sectionData, expectedVersion }),
    },
    token
  );
  return {
    settings: mapSettingsFromDb(data.settings),
    version: data.version,
    section: data.section
  };
}

export async function adminUpdateSettings(settingsData, token) {
  const result = await adminUpdateSettingsSection('all', settingsData, null, token);
  return result.settings;
}

export async function adminGetOrders(token) {
  const data = await fetchWithAdminAuth('/api/admin/orders', { method: 'GET' }, token);
  return Array.isArray(data) ? data.map(mapOrderFromDb) : [];
}

export async function adminUpdateOrderStatus(orderId, orderStatus, paymentStatus, token) {
  const data = await fetchWithAdminAuth(
    '/api/admin/orders',
    {
      method: 'POST',
      body: JSON.stringify({ orderId, orderStatus, paymentStatus }),
    },
    token
  );
  return mapOrderFromDb(data.order);
}

export async function adminUploadImage(file, token) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result;
        const res = await fetchWithAdminAuth(
          '/api/admin/upload',
          {
            method: 'POST',
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type,
              base64Data,
            }),
          },
          token
        );
        resolve(res.url);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// --- Customer Order API ---

export async function createRazorpayServerOrder(items, customer, discount) {
  const res = await fetch('/api/orders?action=create-razorpay-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, customer, discount }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to prepare Razorpay payment order.');
  }
  return data;
}

export async function createCustomerOrder(orderPayload) {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Failed to place order.');
    error.status = res.status;
    error.updatedTotal = data.updatedTotal;
    throw error;
  }
  return mapOrderFromDb(data.order);
}

export async function getCustomerOrders(orderIds = []) {
  if (!orderIds || orderIds.length === 0) return [];
  const res = await fetch(`/api/orders?ids=${encodeURIComponent(orderIds.join(','))}`);
  const data = await res.json().catch(() => ([]));
  if (!res.ok) return [];
  return Array.isArray(data) ? data.map(mapOrderFromDb) : [];
}

export async function lookupCustomerOrders(query = '') {
  if (!query || !query.trim()) return [];
  const res = await fetch(`/api/orders?lookup=${encodeURIComponent(query.trim())}`);
  const data = await res.json().catch(() => ([]));
  if (!res.ok) return [];
  return Array.isArray(data) ? data.map(mapOrderFromDb) : [];
}
