export const INITIAL_CATEGORIES = [
  { id: 'all', name: 'All Products', icon: 'Sparkles' },
  { id: 'electronics', name: 'Electronics & Audio', icon: 'Headphones' },
  { id: 'wearables', name: 'Smart Wearables', icon: 'Watch' },
  { id: 'fashion', name: 'Fashion & Apparel', icon: 'Shirt' },
  { id: 'home', name: 'Home & Living', icon: 'Home' },
  { id: 'accessories', name: 'Accessories', icon: 'Briefcase' },
];

export const INITIAL_PRODUCTS = [];

export const STARTER_PRODUCTS = [
  {
    id: 'starter-headphone-1',
    name: 'AcousticPro Wireless ANC Headphones',
    category: 'electronics',
    price: 3499,
    originalPrice: 5999,
    stock: 25,
    sku: 'SKU-APRO-01',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    sellerBadge: 'Best Seller',
    codAvailable: true,
    rating: 4.8,
    reviewsCount: 38,
    inStock: true,
    description: 'Active Noise Cancelling over-ear headphones with 40-hour playtime, ultra-deep bass, and Bluetooth 5.3 connectivity.',
    features: [
      'Hybrid Active Noise Cancellation (up to 35dB)',
      '40-hour extended battery with fast charge (10 min = 5 hrs)',
      'Custom 40mm titanium diaphragm drivers',
      'Plush memory foam ear cushions for all-day comfort'
    ]
  },
  {
    id: 'starter-smartwatch-1',
    name: 'PulseFit Pro Ultra Smartwatch',
    category: 'wearables',
    price: 2499,
    originalPrice: 4999,
    stock: 18,
    sku: 'SKU-PULSE-02',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    sellerBadge: 'Trending',
    codAvailable: true,
    rating: 4.7,
    reviewsCount: 24,
    inStock: true,
    description: '1.96-inch HD AMOLED display smartwatch with Bluetooth calling, 24/7 heart rate monitoring, and 100+ sport modes.',
    features: [
      '1.96" High-Res AMOLED curved screen (600 nits brightness)',
      'Bluetooth HD phone calls with built-in mic & speaker',
      'SpO2, continuous heart-rate & sleep quality tracker',
      'IP68 water resistant up to 1.5m depth'
    ]
  },
  {
    id: 'starter-charger-1',
    name: 'HyperCharge 65W GaN Dual-Port Fast Charger',
    category: 'electronics',
    price: 1299,
    originalPrice: 2499,
    stock: 40,
    sku: 'SKU-GAN-03',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80',
    sellerBadge: 'Essential',
    codAvailable: true,
    rating: 4.9,
    reviewsCount: 52,
    inStock: true,
    description: 'Next-gen Gallium Nitride (GaN) fast charger with dual Type-C and USB-A outputs for laptops, MacBooks, iPhones, and Android.',
    features: [
      '65W Power Delivery 3.0 ultra-compact GaN technology',
      'Charges MacBook Air 0% to 50% in just 30 minutes',
      'Intelligent temperature control & surge protection',
      'Foldable plug pins for effortless travel portability'
    ]
  },
  {
    id: 'starter-wallet-1',
    name: 'Heritage Full-Grain Leather RFID Bifold Wallet',
    category: 'accessories',
    price: 899,
    originalPrice: 1599,
    stock: 30,
    sku: 'SKU-WALL-04',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
    sellerBadge: 'Handcrafted',
    codAvailable: true,
    rating: 4.6,
    reviewsCount: 19,
    inStock: true,
    description: 'Handcrafted genuine top-grain vintage leather bifold wallet with RFID blocking layer and 8 card slots.',
    features: [
      '100% Genuine vegetable-tanned handcrafted leather',
      'Certified RFID-blocking lining protects against digital theft',
      '8 quick-access card slots + dual currency compartments',
      'Slim ergonomic profile fits comfortably in front or back pockets'
    ]
  },
  {
    id: 'starter-sneakers-1',
    name: 'AeroStride Cloudfoam Running Sneakers',
    category: 'fashion',
    price: 2199,
    originalPrice: 3999,
    stock: 14,
    sku: 'SKU-SNKR-05',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    sellerBadge: 'Popular',
    codAvailable: true,
    rating: 4.7,
    reviewsCount: 31,
    inStock: true,
    description: 'Lightweight breathable mesh athletic runners with responsive high-rebound cushioning and anti-slip rubber traction.',
    features: [
      'Breathable engineered knit upper keeps feet cool and dry',
      'Shock-absorbing Cloudfoam responsive midsole',
      'High-traction rubber outsole designed for road & gym running',
      'Ultra-lightweight design weighing only 240g'
    ]
  },
  {
    id: 'starter-coffee-1',
    name: 'Artisan Glass Pour-Over Coffee Brewer & Dripper',
    category: 'home',
    price: 1149,
    originalPrice: 1999,
    stock: 20,
    sku: 'SKU-BREW-06',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    sellerBadge: 'Staff Pick',
    codAvailable: true,
    rating: 4.8,
    reviewsCount: 15,
    inStock: true,
    description: 'Heat-resistant borosilicate glass manual pour-over coffee carafe with reusable stainless steel dual-mesh filter.',
    features: [
      'High heat-resistant borosilicate glass carafe (600ml / 4 cups)',
      'Dual-layer food-grade stainless steel micro-mesh filter',
      'No paper filters required — preserves natural aromatic coffee oils',
      'Ergonomic heat-insulated collar grip with wooden collar tie'
    ]
  }
];

export const DEFAULT_SELLER_SETTINGS = {
  storeName: 'ZORIQ',
  sellerUpiId: '',
  merchantName: 'ZORIQ Official',
  bankName: 'State Bank of India',
  bankAccountNumber: '',
  bankIfsc: '',
  accountHolderName: '',
  codEnabled: true,
  codFee: 0,
  freeShippingThreshold: 999,
  standardShippingFee: 60,
  currency: '₹',
  contactEmail: '',
  contactPhone: '',
  adminPin: '7784'
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
