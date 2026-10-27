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
    setIsCheckoutOpen
  } = useStore();

  const [quantity, setQuantity] = useState(1);

  if (!selectedProduct) return null;

  const product = selectedProduct;
  const isOutOfStock = product.stock <= 0 || !product.inStock;
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const savings = product.originalPrice ? product.originalPrice - product.price : 0;

  const handleBuyNow = () => {
    addToCart(product, quantity);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-gray-100 relative my-8">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-500 hover:text-gray-900 flex items-center justify-center shadow-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Image Preview */}
          <div className="bg-gray-100 p-6 flex flex-col items-center justify-center relative">
            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-inner flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Badges */}
            <div className="absolute top-8 left-8 flex flex-col gap-1.5">
              {discountPercent > 0 && (
                <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                  Save {discountPercent}%
                </span>
              )}
              {product.sellerBadge && (
                <span className="bg-indigo-950 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                  {product.sellerBadge}
                </span>
              )}
            </div>

            {/* SKU and Category Info */}
            <div className="mt-4 flex items-center justify-between w-full text-xs text-gray-500 px-2">
              <span>SKU: <strong className="text-gray-700">{product.sku || 'N/A'}</strong></span>
              <span className="capitalize">Category: <strong className="text-gray-700">{product.category}</strong></span>
            </div>
          </div>

          {/* Right Column: Info & Actions */}
          <div className="p-6 md:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-amber-700 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                  <span>{product.rating || '4.8'}</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {product.reviewsCount || 120} verified customer reviews
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-3">
                {product.name}
              </h2>

              {/* Price & Savings */}
              <div className="flex items-baseline gap-3 mb-4 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  ₹{product.price?.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{product.originalPrice?.toLocaleString('en-IN')}
                  </span>
                )}
                {savings > 0 && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Save ₹{savings.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                {isOutOfStock ? (
                  <div className="flex items-center gap-2 text-rose-600 text-xs font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Currently Out of Stock. Seller will restock soon.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <CheckCircle className="w-4 h-4" />
                    <span>In Stock — {product.stock} units available for instant dispatch</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                {product.description}
              </p>

              {/* Highlights & Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Key Highlights
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-700">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Value propositions */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Instant UPI & QR Code</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-indigo-500" />
                  <span className={product.codAvailable === false ? 'text-amber-700 font-bold' : ''}>
                    {product.codAvailable !== false ? 'Cash on Delivery' : 'Prepaid Only (No COD)'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                  <span>100% Quality Checked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>1 Year Brand Warranty</span>
                </div>
              </div>
            </div>

            {/* Actions: Quantity + Add To Cart + Buy Now */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              {!isOutOfStock && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">Select Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-xl bg-white shadow-sm overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-2 text-gray-500 hover:text-gray-900 disabled:opacity-40 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-gray-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                      className="p-2 text-gray-500 hover:text-gray-900 disabled:opacity-40 transition-colors"
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
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-gray-900 hover:bg-black text-white disabled:opacity-40 transition-all shadow-md active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white disabled:opacity-40 transition-all shadow-lg shadow-indigo-600/30 active:scale-95"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
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
