import React from 'react';
import { useStore } from '../../context/StoreContext';
import ZoriqOpeningHero from './ZoriqOpeningHero';
import CategoryBar from './CategoryBar';
import ProductCard from './ProductCard';
import ZoriqLogo from '../ZoriqLogo';
import { ShoppingBag, Search, Sparkles, Lock, Star } from 'lucide-react';

export default function CustomerStorefront() {
  const {
    products,
    selectedCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    sellerSettings,
    setIsAdminLoginModalOpen
  } = useStore();

  // 1. Filter by category
  let filtered = products.filter((prod) => {
    if (selectedCategory === 'all') return true;
    return prod.category === selectedCategory;
  });

  // 2. Filter by search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (prod) =>
        prod.name.toLowerCase().includes(q) ||
        prod.description.toLowerCase().includes(q) ||
        (prod.sku && prod.sku.toLowerCase().includes(q)) ||
        prod.category.toLowerCase().includes(q)
    );
  }

  // 3. Sort
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0; // 'featured' retains natural catalog order
  });

  // Real featured products (only from real database items that have a badge)
  const featuredProducts = (selectedCategory === 'all' && !searchQuery)
    ? products.filter((p) => Boolean(p.seller_badge || p.sellerBadge)).slice(0, 4)
    : [];

  return (
    <div className="pb-16 animate-in fade-in">
      
      {/* Cinematic ZORIQ Opening Hero with Split Word & Parting Curtains */}
      <ZoriqOpeningHero />

      {/* Featured Products Spotlight (Only if real products with badges exist in database) */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-base sm:text-lg font-bold text-gray-900 font-syne tracking-tight">
                Featured Highlights
              </h2>
            </div>
            <span className="text-xs text-gray-400 font-medium">Curated directly from store catalog</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={`featured-${product.id}`} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Category Pills & Sort Bar */}
      <CategoryBar />

      {/* Products Grid Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Results Info Bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
              {searchQuery ? `Search results for "${searchQuery}"` : 'Handpicked Products'}
            </h2>
            <span className="text-xs bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full">
              {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-indigo-600 hover:underline font-semibold"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Empty State */}
        {products.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-md mx-auto my-8 shadow-xs">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Store Catalog Coming Soon
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              New products will be added by the store owner soon. Please check back shortly!
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-md mx-auto my-8 shadow-xs">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              No matching products found
            </h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              We couldn't find any products matching your search or filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              Show All Products
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </main>

      {/* Trust Badges Footer Bar */}
      <footer className="mt-16 border-t border-gray-200 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  ₹
                </span>
                <span className="font-bold text-gray-900 text-sm">Razorpay Online</span>
              </div>
              <p className="text-xs text-gray-500">
                Verified instant bank payment via UPI, Cards, NetBanking, and Wallets.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  🚚
                </span>
                <span className="font-bold text-gray-900 text-sm">Cash on Delivery</span>
              </div>
              <p className="text-xs text-gray-500">
                Pay on arrival at your doorstep in cash or with delivery agent's scanner.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <span className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                  ⚡
                </span>
                <span className="font-bold text-gray-900 text-sm">Fast Dispatch</span>
              </div>
              <p className="text-xs text-gray-500">
                Orders dispatched within 24 hours with live tracking ID and updates.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <span className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                  🛡️
                </span>
                <span className="font-bold text-gray-900 text-sm">Quality Guaranteed</span>
              </div>
              <p className="text-xs text-gray-500">
                100% brand authentic products with direct merchant customer support.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
            <div className="flex items-center gap-3">
              <ZoriqLogo size="sm" />
              <span>© {new Date().getFullYear()} ZORIQ. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-500">Shop More. Live Better.</span>
              <button
                onClick={() => setIsAdminLoginModalOpen(true)}
                className="text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1 font-medium"
                title="Store Owner Portal"
              >
                <Lock className="w-3 h-3" />
                <span>Owner Login</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
