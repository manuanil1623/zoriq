import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Heart,
  ShoppingBag,
  Sparkles,
  Truck,
  ShieldCheck,
  Check,
  ArrowRight
} from 'lucide-react';

export default function ProductDetailModal() {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    setIsCheckoutOpen,
    isCustomerLoggedIn,
    setIsAuthModalOpen,
    toggleWishlist,
    isInWishlist,
    addToast
  } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null); // { valid: bool, message: string }
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiQuestion, setAiQuestion] = useState('');

  if (!selectedProduct) return null;

  const product = selectedProduct;
  const inWish = isInWishlist(product.id);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

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

  const checkPincode = (e) => {
    e.preventDefault();
    const clean = pincode.trim();
    if (!/^\d{6}$/.test(clean)) {
      setPincodeStatus({ valid: false, message: 'Please enter a valid 6-digit Indian pincode.' });
    } else {
      setPincodeStatus({
        valid: true,
        message: `Delivery available to ${clean}! Expected in 4–6 business days. Free shipping eligible.`,
      });
    }
  };

  const handleAskAi = (presetQuestion) => {
    const q = presetQuestion || aiQuestion;
    if (!q) return;

    let ans = '';
    const lq = q.toLowerCase();
    if (lq.includes('dishwasher') || lq.includes('wash')) {
      ans = 'Yes! Made from premium 100% food-grade borosilicate glass / high-grade stainless steel. Completely dishwasher and microwave safe.';
    } else if (lq.includes('dimension') || lq.includes('size') || lq.includes('capacity')) {
      ans = `Standard ergonomic size for daily home use. Crafted to comfortably fit kitchen racks, pantry shelves, and car cup holders.`;
    } else if (lq.includes('hot') || lq.includes('temperature') || lq.includes('liquid')) {
      ans = 'Thermal-shock resistant from -20°C up to +150°C. You can pour boiling water or iced coffee directly without cracking.';
    } else if (lq.includes('lead') || lq.includes('safe') || lq.includes('toxin')) {
      ans = '100% lead-free, BPA-free, and non-toxic. Pure inert material that preserves the original taste without flavor absorption.';
    } else {
      ans = `Designed specifically for everyday ease, durability, and minimal aesthetic appeal in modern Indian kitchens.`;
    }

    setAiAnswer({ q, a: ans });
    setAiQuestion('');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="scrim on"
        style={{ zIndex: 95 }}
        onClick={() => setSelectedProduct(null)}
      ></div>

      {/* Sheet Dialog */}
      <div className="sheet qvs on" role="dialog" aria-label={product.name}>
        <div className="grab"></div>

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
          <span className="eyebrow" style={{ margin: 0 }}>
            {product.category || 'Product'}
          </span>
          <button
            type="button"
            className="close"
            aria-label="Close"
            onClick={() => setSelectedProduct(null)}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Main 2-Column Content */}
        <div className="qv">
          {/* Left Column: Image */}
          <div>
            <div className="big">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} />
              ) : (
                <div className="w-full h-full bg-[#f4f0e9] flex items-center justify-center text-gray-400 font-tenor text-2xl">
                  zoriq
                </div>
              )}
            </div>

            {/* Features below image */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[var(--ink2)]">
              <div className="flex items-center gap-1.5 p-2 bg-[#f4f0e9] rounded">
                <Truck className="w-4 h-4 text-[var(--gold)]" />
                <span>Fast India delivery</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-[#f4f0e9] rounded">
                <ShieldCheck className="w-4 h-4 text-[var(--gold)]" />
                <span>100% Food-safe</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Price, Pincode, Actions */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-tenor text-2xl text-[var(--ink)] leading-snug">
                {product.name}
              </h3>
              <button
                type="button"
                className={`heart ${inWish ? 'on' : ''}`}
                title={inWish ? 'Remove from wishlist' : 'Save to wishlist'}
                onClick={() => toggleWishlist(product)}
              >
                <Heart className={`i ${inWish ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Price */}
            <div className="pr mt-2">
              <b>₹{Number(product.price).toLocaleString('en-IN')}</b>
              {hasDiscount && (
                <>
                  <s>₹{Number(product.originalPrice).toLocaleString('en-IN')}</s>
                  <span className="ml-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="mt-3 text-sm text-[var(--ink2)] leading-relaxed">
              {product.description ||
                'Thoughtfully designed everyday essential made from durable, premium materials. Engineered for durability, ease of cleaning, and timeless elegance.'}
            </p>

            {/* Quantity Selector */}
            <div className="mt-5">
              <label className="block text-xs uppercase tracking-wider font-semibold text-[var(--ink2)] mb-2">
                Quantity
              </label>
              <div className="qt">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Pincode Check */}
            <div className="mt-5">
              <label className="block text-xs uppercase tracking-wider font-semibold text-[var(--ink2)] mb-2">
                Check Delivery Estimate
              </label>
              <form onSubmit={checkPincode} className="pin">
                <input
                  type="text"
                  placeholder="Enter 6-digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  maxLength={6}
                />
                <button type="submit">Check</button>
              </form>
              {pincodeStatus && (
                <div
                  className={`mt-2 text-xs ${
                    pincodeStatus.valid ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {pincodeStatus.message}
                </div>
              )}
            </div>

            {/* Ask zoriq AI Widget */}
            <div className="ai">
              <div className="aih">
                <Sparkles className="i" />
                <span className="text-sm font-semibold">Ask zoriq AI</span>
              </div>
              <small>Instant answers regarding materials, care, and usage.</small>

              <div className="chp">
                <button
                  type="button"
                  onClick={() => handleAskAi('Is it dishwasher safe?')}
                >
                  Dishwasher safe?
                </button>
                <button
                  type="button"
                  onClick={() => handleAskAi('Is it good for hot liquids?')}
                >
                  Hot liquids safe?
                </button>
                <button
                  type="button"
                  onClick={() => handleAskAi('What are the dimensions?')}
                >
                  Dimensions?
                </button>
              </div>

              {aiAnswer && (
                <div className="aia on">
                  <i>Question: {aiAnswer.q}</i>
                  <p>{aiAnswer.a}</p>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="row2 mt-6">
              <button
                type="button"
                className="btn dark"
                onClick={() => {
                  addToCart(product, quantity);
                  setSelectedProduct(null);
                }}
              >
                <ShoppingBag className="w-4 h-4 mr-1" />
                Add to Bag
              </button>
              <button
                type="button"
                className="btn line"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
