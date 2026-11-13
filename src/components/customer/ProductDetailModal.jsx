import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Star,
  ShoppingCart,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Minus,
  Plus
} from 'lucide-react';

export default function ProductDetailModal() {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    setIsCheckoutOpen,
    isCustomerLoggedIn,
    setIsAuthModalOpen,
    addToast
  } = useStore();

  const [quantity, setQuantity] = useState(1);

  if (!selectedProduct) return null;

  const product = selectedProduct;
  const isOutOfStock = product.stock <= 0 || !product.inStock;
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;
  const savings = product.originalPrice ? product.originalPrice - product.price : 0;

  const handleBuyNow = () => {
    addToCart(product, quantity);
    setSelectedProduct(null);
    if (!isCustomerLoggedIn) {
      setIsAuthModalOpen(true);
      if (addToast) addToast('Please sign in or create an account to proceed with checkout!', 'warning');
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#101317]/95 text-[var(--ink)] rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-white/10 relative my-6 backdrop-blur-2xl">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center border border-white/10 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Image Preview with Liquid Pedestal */}
          <div className="bg-black/40 p-6 sm:p-8 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-white/10">
            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-radial from-white/10 to-black/60 border border-white/10 flex items-center justify-center p-4">
              <img
                src={product.image}
                alt={product.name}
                className="max-w-[85%] max-h-[85%] object-contain filter drop-shadow(0 15px 30px rgba(0,0,0,0.8)) transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Badges */}
            <div className="absolute top-6 left-6 flex flex-col gap-1.5">
              {discountPercent > 0 && (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Save {discountPercent}%
                </span>
              )}
              {product.sellerBadge && (
                <span className="bg-amber-500/20 text-[var(--amber)] border border-amber-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {product.sellerBadge}
                </span>
              )}
            </div>

            {/* SKU and Category Info */}
            <div className="mt-4 flex items-center justify-between w-full text-xs text-[var(--ink2)] px-2 font-mono">
              <span>SKU: <strong className="text-gray-300">{product.sku || 'N/A'}</strong></span>
              <span className="capitalize">Category: <strong className="text-gray-300">{product.category}</strong></span>
            </div>
          </div>

          {/* Right Column: Info & Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg text-amber-300 text-xs font-bold font-mono">
                  <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                  <span>{product.rating || '4.8'}</span>
                </div>
                <span className="text-xs text-[var(--ink2)] font-medium">
                  {product.reviewsCount || 120} verified customer reviews
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug mb-3 font-['Syne']">
                {product.name}
              </h2>

              {/* Price & Savings */}
              <div className="flex items-baseline gap-3 mb-4 bg-white/[0.03] p-3.5 rounded-2xl border border-white/10">
                <span className="text-2xl sm:text-3xl font-extrabold text-[var(--amber)] font-['Syne']">
                  ₹{product.price?.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-gray-500 line-through">
                    ₹{product.originalPrice?.toLocaleString('en-IN')}
                  </span>
                )}
                {savings > 0 && (
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Save ₹{savings.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                {isOutOfStock ? (
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Currently Out of Stock. Seller will restock soon.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                    <CheckCircle className="w-4 h-4" />
                    <span>In Stock — {product.stock} units available for instant dispatch</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[var(--ink2)] leading-relaxed mb-4">
                {product.description}
              </p>

              {/* Highlights & Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 font-mono">
                    Key Highlights
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-300">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-[var(--amber)] flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Value propositions */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300 mb-6 bg-black/30 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant Razorpay & UPI</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span className={product.codAvailable === false ? 'text-amber-400 font-bold' : ''}>
                    {product.codAvailable !== false ? 'Cash on Delivery' : 'Prepaid Only'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% Quality Checked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1 Year Brand Warranty</span>
                </div>
              </div>
            </div>

            {/* Actions: Quantity + Add To Cart + Buy Now - Pinned to bottom on desktop & sticky on mobile */}
            <div className="space-y-3 pt-3 border-t border-white/10 mt-auto sticky bottom-0 bg-[#101317]/95 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none -mx-6 px-6 sm:mx-0 sm:px-0 py-3 sm:py-0 z-10">
              {!isOutOfStock && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--ink2)]">Select Quantity:</span>
                  <div className="flex items-center border border-white/10 rounded-xl bg-black/40 overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-white font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                      className="p-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-white/5 hover:bg-white/10 text-white border border-white/10 disabled:opacity-40 transition-all cursor-pointer active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4 text-amber-400" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[var(--amber)] hover:bg-[#d67e2a] text-black disabled:opacity-40 transition-all shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
                >
                  <Zap className="w-4 h-4 stroke-[2.5]" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
