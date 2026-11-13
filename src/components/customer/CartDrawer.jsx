import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  Check,
  Truck
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
    isCustomerLoggedIn,
    setIsAuthModalOpen,
    addToast,
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

  const freeShippingThreshold = sellerSettings?.freeShippingThreshold || 599;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    if (!isCustomerLoggedIn) {
      setIsAuthModalOpen(true);
      if (addToast) addToast('Please sign in or create an account to proceed with checkout!', 'warning');
    } else {
      setIsCheckoutOpen(true);
    }
  };

  return (
    <>
      {/* Scrim */}
      <div
        className="scrim on"
        style={{ zIndex: 94 }}
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Cart Panel */}
      <aside className="panel on" id="cartP" aria-label="Cart">
        {/* Header */}
        <div className="ph2">
          <b>Your cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})</b>
          <button
            type="button"
            className="close"
            aria-label="Close cart"
            onClick={() => setIsCartOpen(false)}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="bd2" id="cartB">
          {/* Free Shipping Progress */}
          <div className="mt-3 mb-2">
            <div className="ship flex items-center justify-between text-xs text-[var(--ink2)]">
              <span>
                {amountNeededForFreeShipping === 0
                  ? '🎉 Free delivery unlocked!'
                  : `Add ₹${amountNeededForFreeShipping} more for Free Delivery`}
              </span>
              <span>{freeShippingProgress}%</span>
            </div>
            <div className="pb">
              <i style={{ width: `${freeShippingProgress}%` }}></i>
            </div>
          </div>

          {/* Empty Cart Message */}
          {cart.length === 0 ? (
            <div className="py-20 text-center text-[var(--ink2)]">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300 stroke-1" />
              <p className="text-base font-medium text-[var(--ink)]">Your bag is empty</p>
              <p className="text-xs text-[var(--muted)] mt-1">
                Explore our catalog for useful kitchen & home finds.
              </p>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="btn dark mt-6 text-xs"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="line-it">
                <div className="t">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <div className="w-full h-full bg-[#f4f0e9] flex items-center justify-center text-xs text-gray-400">
                      zoriq
                    </div>
                  )}
                </div>

                <div className="m">
                  <b>{item.name}</b>
                  <small>
                    ₹{Number(item.price).toLocaleString('en-IN')}
                    {item.quantity > 1 && (
                      <span className="ml-1 text-gray-400">
                        (₹{(item.price * item.quantity).toLocaleString('en-IN')})
                      </span>
                    )}
                  </small>

                  <div className="flex items-center justify-between mt-2">
                    <div className="qty">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="rm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Coupon Code Section */}
          {cart.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[var(--line)]">
              <form onSubmit={handleApply} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 text-xs border border-[var(--line)] uppercase tracking-wider outline-0 bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--ink)] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[var(--gold)] transition-colors"
                >
                  Apply
                </button>
              </form>

              {coupon && (
                <div className="flex items-center justify-between mt-2 p-2 bg-[#f4f0e9] text-xs">
                  <span className="font-semibold text-emerald-800">
                    Coupon "{coupon.code}" applied (-₹{discountAmount})
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs text-rose-600 underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with totals */}
        {cart.length > 0 && (
          <div className="ft2" id="cartF">
            <div className="sub">
              <span>Subtotal</span>
              <b>₹{Number(cartSubtotal).toLocaleString('en-IN')}</b>
            </div>

            {discountAmount > 0 && (
              <div className="sub text-emerald-700 text-sm">
                <span>Discount</span>
                <b>-₹{Number(discountAmount).toLocaleString('en-IN')}</b>
              </div>
            )}

            <div className="sub text-sm text-[var(--ink2)]">
              <span>Shipping</span>
              <b>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</b>
            </div>

            <div className="sub text-base font-semibold pt-2 border-t border-[var(--line)] mt-2">
              <span>Total</span>
              <b>₹{Number(cartTotal).toLocaleString('en-IN')}</b>
            </div>

            <button
              type="button"
              onClick={handleProceedCheckout}
              className="btn dark w-full mt-4 flex items-center justify-center gap-2"
            >
              <span>Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
