import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Star, ShoppingCart, Eye, Check, AlertTriangle } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCart, setSelectedProduct, cart } = useStore();

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const inCart = cart.some((item) => item.id === product.id);
  const cartItem = cart.find((item) => item.id === product.id);

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock <= 0 || !product.inStock;

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
        {discountPercent > 0 && (
          <span className="bg-rose-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
        {product.sellerBadge && (
          <span className="bg-indigo-900/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            {product.sellerBadge}
          </span>
        )}
        {product.codAvailable === false && (
          <span className="bg-amber-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            Prepaid Only (No COD)
          </span>
        )}
      </div>

      {/* Stock Tag on Top Right */}
      <div className="absolute top-3 right-3 z-10">
        {isOutOfStock ? (
          <span className="bg-gray-900/80 backdrop-blur-sm text-gray-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Sold Out
          </span>
        ) : isLowStock ? (
          <span className="bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
            <AlertTriangle className="w-2.5 h-2.5" />
            Only {product.stock} left
          </span>
        ) : null}
      </div>

      {/* Product Image Area */}
      <div
        onClick={() => setSelectedProduct(product)}
        className="relative pt-[80%] w-full bg-gray-100 overflow-hidden cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            isOutOfStock ? 'grayscale opacity-60' : ''
          }`}
          loading="lazy"
        />

        {/* Quick View Overlay Button */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </span>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span className="uppercase tracking-wider font-semibold text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-medium">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
              <span>{product.rating || '4.8'}</span>
              <span className="text-gray-400 text-[11px]">({product.reviewsCount || 120})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => setSelectedProduct(product)}
            className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer mb-2"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
            {product.description}
          </p>
        </div>

        {/* Pricing & Add To Cart Button */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-gray-900">
              ₹{product.price?.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.originalPrice?.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => addToCart(product, 1)}
              disabled={isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-medium text-xs transition-all ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : inCart
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-95'
              }`}
            >
              {isOutOfStock ? (
                <span>Out of Stock</span>
              ) : inCart ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>In Cart ({cartItem?.quantity})</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            <button
              onClick={() => setSelectedProduct(product)}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200 rounded-xl transition-colors"
              title="View Specifications"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
