import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  Tag,
  Check,
  Truck,
  Sparkles
} from 'lucide-react';

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    discountAmount,
    shippingFee,
    cartTotal,
    coupon,
    applyCouponCode,
    removeCoupon,
    setIsCheckoutOpen,
    sellerSettings
  } = useStore();

  const [inputCode, setInputCode] = useState('');

  if (!isCartOpen) return null;

  const handleApply = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const ok = applyCouponCode(inputCode);
    if (ok) setInputCode('');
  };

  const freeShippingThreshold = sellerSettings.freeShippingThreshold || 999;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Your Shopping Cart
              </h2>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-5 py-3 bg-indigo-50/60 border-b border-indigo-100">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-indigo-600" />
                {amountNeededForFreeShipping === 0 ? (
                  <span className="text-emerald-700 font-bold">🎉 You unlocked FREE Delivery!</span>
                ) : (
                  <span>
                    Add <strong>₹{amountNeededForFreeShipping}</strong> more for Free Delivery
                  </span>
                )}
              </span>
              <span>{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-indigo-200/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Your cart is empty
                </h3>
                <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto">
                  Looks like you haven't added anything to your cart yet. Explore our top products and exclusive deals.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-md transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl bg-white border border-gray-100 flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-rose-500 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-bold text-gray-900">
                          ₹{item.price?.toLocaleString('en-IN')}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-[11px] text-gray-400 line-through">
                            ₹{item.originalPrice?.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-xs">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Area: Coupon + Summary + Checkout */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 bg-white p-4 sm:p-5 space-y-4">
              
              {/* Promo Code Section */}
              <div>
                {coupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{coupon.code} applied ({coupon.description})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-rose-600 hover:underline font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder="Coupon: WELCOME10 or UPI50"
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {/* Quick Coupon Suggestions */}
                {!coupon && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-gray-400 font-medium">Quick Apply:</span>
                    <button
                      type="button"
                      onClick={() => applyCouponCode('WELCOME10')}
                      className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200 transition-colors"
                    >
                      WELCOME10 (-10%)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCouponCode('UPI50')}
                      className="text-[10px] font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 transition-colors"
                    >
                      UPI50 (-₹50)
                    </button>
                  </div>
                )}
              </div>

              {/* Bill Details */}
              <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="font-semibold text-gray-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount Coupon ({coupon?.code})</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    <span className="font-semibold text-gray-900">₹{shippingFee}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm sm:text-base font-extrabold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Grand Total</span>
                  <span className="text-indigo-600">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <span className="text-[11px] text-gray-400">
                  🔒 Safe & Encrypted Checkout with UPI & Cash on Delivery
                </span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
