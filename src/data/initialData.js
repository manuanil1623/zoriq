export const INITIAL_CATEGORIES = [
  { id: 'all', name: 'All Products', icon: 'Sparkles' },
  { id: 'electronics', name: 'Electronics & Audio', icon: 'Headphones' },
  { id: 'wearables', name: 'Smart Wearables', icon: 'Watch' },
  { id: 'fashion', name: 'Fashion & Apparel', icon: 'Shirt' },
  { id: 'home', name: 'Home & Living', icon: 'Home' },
  { id: 'accessories', name: 'Accessories', icon: 'Briefcase' },
];

export const STARTER_PRODUCTS = [];

export const INITIAL_PRODUCTS = [];

export const DEFAULT_SELLER_SETTINGS = {
  // Store Identity
  storeName: 'ZORIQ',
  tagline: 'Premium Direct-to-Consumer Electronics & Lifestyle',
  logoUrl: '/zoriq-logo.jpg',
  contactPhone: '+91 98765 43210',
  contactEmail: 'help@zoriq.in',
  address: '12th Floor, Orion Tech Park, MG Road, Bengaluru, Karnataka 560001',
  socialLinks: {
    instagram: 'https://instagram.com/zoriq.official',
    twitter: 'https://twitter.com/zoriq_official',
    facebook: 'https://facebook.com/zoriq.official',
  },
  footerText: '© 2026 ZORIQ Official Store. All rights reserved.',
  announcement: '⚡ FLASH SALE: Free Delivery on orders over ₹999 + Instant Bank Discounts!',

  // Shipping Rules
  freeShippingThreshold: 999,
  standardShippingFee: 49,
  deliveryTimeEstimate: '2 - 4 Business Days',
  serviceablePincodes: 'All India',

  // COD Settings
  codEnabled: true,
  codFee: 0,
  minOrderCod: 0,
  maxOrderCod: 25000,

  // Online Payment Settings (Razorpay)
  razorpayEnabled: true,
  razorpayKeyId: 'rzp_live_TstUZQzK6D5kHP', // Public Key ID

  // Payment Methods Enabled
  upiEnabled: true,
  cardsEnabled: true,
  netBankingEnabled: true,

  // Tax, GST & Invoice Details
  merchantName: 'ZORIQ Official Retails Pvt Ltd',
  gstNumber: '29ABCDE1234F1Z5',
  taxRate: 0, // In percentage (e.g. 0 for included/none)
  invoicePrefix: 'ZRQ-',
  sellerUpiId: 'zoriq@upi',
  bankName: 'State Bank of India',
  bankAccountNumber: '98765432100012',
  bankIfsc: 'SBIN0001234',
  accountHolderName: 'ZORIQ Official Store',
  currency: '₹',

  // Version Control & Timestamp
  version: 1,
  updatedAt: new Date().toISOString(),
};

export const SAMPLE_ORDERS = [];

export const PRESET_IMAGES = [
  { name: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' },
  { name: 'Smartwatch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' },
  { name: 'GaN Charger', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80' },
  { name: 'Leather Wallet', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80' },
  { name: 'Sneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80' },
  { name: 'Coffee Dripper', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80' },
  { name: 'Portable Speaker', url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80' },
  { name: 'Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80' },
  { name: 'Desk Lamp', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80' },
  { name: 'Keyboard', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80' },
  { name: 'Sunglasses', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80' },
  { name: 'Stainless Bottle', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80' }
];
