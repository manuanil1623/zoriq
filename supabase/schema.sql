-- ====================================================================
-- ZORIQ E-Commerce: Supabase Postgres Schema & Row Level Security (RLS)
-- ====================================================================

-- 0. AUTOMATIC MIGRATION: Rename legacy settings table if present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'settings')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'public_settings') THEN
    ALTER TABLE public.settings RENAME TO public_settings;
  END IF;
END $$;

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'electronics',
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT,
  image TEXT NOT NULL,
  seller_badge TEXT,
  cod_available BOOLEAN NOT NULL DEFAULT true,
  description TEXT NOT NULL DEFAULT '',
  features JSONB DEFAULT '[]'::jsonb,
  rating NUMERIC DEFAULT 4.8,
  reviews_count INTEGER DEFAULT 12,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- 2. PUBLIC SETTINGS TABLE (Storefront & Customer-facing settings)
-- Every customer device, laptop, and phone reads from this table.
CREATE TABLE IF NOT EXISTS public.public_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  version INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- Store Identity & Branding
  store_name TEXT NOT NULL DEFAULT 'ZORIQ',
  tagline TEXT DEFAULT 'Direct-to-Consumer Online Store',
  logo_url TEXT DEFAULT '/zoriq-logo.jpg',
  contact_phone TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  social_links JSONB DEFAULT '{"instagram":"","twitter":"","facebook":""}'::jsonb,
  footer_text TEXT DEFAULT '© 2026 ZORIQ Store. All rights reserved.',
  announcement TEXT DEFAULT '⚡ Welcome to ZORIQ! Enjoy Free Delivery on eligible orders.',

  -- Shipping Rules
  free_shipping_threshold NUMERIC NOT NULL DEFAULT 999,
  standard_shipping_fee NUMERIC NOT NULL DEFAULT 49,
  delivery_time_estimate TEXT DEFAULT '2 - 4 Business Days',
  serviceable_pincodes TEXT DEFAULT 'All India',

  -- Cash on Delivery Options
  cod_enabled BOOLEAN NOT NULL DEFAULT true,
  cod_fee NUMERIC NOT NULL DEFAULT 0,
  min_order_cod NUMERIC NOT NULL DEFAULT 0,
  max_order_cod NUMERIC NOT NULL DEFAULT 25000,

  -- Online Payment Gateway (Razorpay Public Key)
  razorpay_enabled BOOLEAN NOT NULL DEFAULT false,
  razorpay_key_id TEXT DEFAULT '',

  -- Enabled Payment Modes
  upi_enabled BOOLEAN NOT NULL DEFAULT true,
  cards_enabled BOOLEAN NOT NULL DEFAULT true,
  netbanking_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Tax, GST & Invoice Details
  merchant_name TEXT DEFAULT 'ZORIQ',
  gst_number TEXT DEFAULT '',
  tax_rate NUMERIC NOT NULL DEFAULT 0,
  invoice_prefix TEXT DEFAULT 'ZRQ-',
  seller_upi_id TEXT DEFAULT '',
  bank_name TEXT DEFAULT '',
  bank_account_number TEXT DEFAULT '',
  bank_ifsc TEXT DEFAULT '',
  account_holder_name TEXT DEFAULT '',
  currency TEXT DEFAULT '₹'
);

-- Seed initial row in public_settings if not present
INSERT INTO public.public_settings (
  id,
  version,
  store_name,
  tagline,
  logo_url,
  contact_phone,
  contact_email,
  address,
  free_shipping_threshold,
  standard_shipping_fee,
  cod_enabled,
  cod_fee,
  razorpay_enabled,
  razorpay_key_id,
  merchant_name,
  currency
)
VALUES (
  'default',
  1,
  'ZORIQ',
  'Direct-to-Consumer Online Store',
  '/zoriq-logo.jpg',
  '',
  '',
  '',
  999,
  49,
  true,
  0,
  false,
  '',
  'ZORIQ',
  '₹'
)
ON CONFLICT (id) DO NOTHING;

-- 3. PRIVATE SETTINGS TABLE (Secret admin credentials)
-- Stores ONLY scrypt password hash and salt. NEVER readable or writable by the public.
CREATE TABLE IF NOT EXISTS public.private_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  password_hash TEXT,
  password_salt TEXT,
  token_version INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.private_settings (id, token_version)
VALUES ('default', 1)
ON CONFLICT (id) DO NOTHING;

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC NOT NULL DEFAULT 0,
  coupon_applied TEXT,
  shipping_fee NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'Pending (COD)',
  order_status TEXT NOT NULL DEFAULT 'Placed',
  tracking_number TEXT,
  upi_txn_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  razorpay_signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);

-- ====================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Clean existing policies to allow clean reruns
DROP POLICY IF EXISTS "Allow public read on products" ON public.products;
DROP POLICY IF EXISTS "Allow public read on public_settings" ON public.public_settings;
DROP POLICY IF EXISTS "Deny all public on private_settings" ON public.private_settings;
DROP POLICY IF EXISTS "Allow public read on orders" ON public.orders;

-- PRODUCTS: Anyone (public anon + authenticated) can READ
CREATE POLICY "Allow public read on products"
ON public.products FOR SELECT
USING (true);

-- PUBLIC SETTINGS: Anyone (public anon + authenticated) can READ
CREATE POLICY "Allow public read on public_settings"
ON public.public_settings FOR SELECT
USING (true);

-- PRIVATE SETTINGS: No public policies exist.
-- Direct queries from client anon key are DENIED by PostgreSQL RLS.
-- Only the backend server using the service_role key can read or write to private_settings.

-- ORDERS: Strictly server-only. No public policies exist.
-- Customers and admins interact with orders strictly through serverless API routes.

-- ====================================================================
-- 6. REALTIME REPLICATION (Instant Multi-Device Sync)
-- ====================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'public_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.public_settings;
  END IF;
END $$;

-- ====================================================================
-- 7. STORAGE BUCKET FOR PRODUCT IMAGES
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public view for product images" ON storage.objects;
CREATE POLICY "Allow public view for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');
