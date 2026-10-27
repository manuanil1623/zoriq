import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShieldCheck, Zap, Truck, CreditCard, Sparkles, ArrowRight } from 'lucide-react';

export default function HeroBanner() {
  const { setSelectedCategory, sellerSettings } = useStore();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-6 p-6 sm:p-10 shadow-2xl border border-indigo-900/50">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headline and Call to Actions */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            ZORIQ Official • Shop More. Live Better.
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Curated Tech & Lifestyle Essentials. <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent">
              Pay via UPI or Cash on Delivery.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed">
            Experience lightning-fast payments with zero transaction fees via Google Pay, PhonePe, Paytm, or choose stress-free Cash on Delivery directly to your doorstep.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setSelectedCategory('electronics')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 group active:scale-95"
            >
              <span>Explore Electronics</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition-all active:scale-95"
            >
              Browse All Products
            </button>
          </div>
        </div>

        {/* Right Column: Key Trust Badges & Offers */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:border-indigo-400/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-white">Instant UPI</h2>
            <p className="text-xs text-gray-300 mt-1">
              GPay, PhonePe, Paytm QR code with ₹50 extra discount.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:border-indigo-400/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-white">Cash on Delivery</h2>
            <p className="text-xs text-gray-300 mt-1">
              Pay upon doorstep inspection with zero advance stress.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:border-indigo-400/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-blue-400/20 text-blue-300 flex items-center justify-center mb-3">
              <Truck className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-white">Free Delivery</h2>
            <p className="text-xs text-gray-300 mt-1">
              On all orders above ₹{sellerSettings.freeShippingThreshold} with live tracking.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:border-indigo-400/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-purple-400/20 text-purple-300 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-white">Brand Warranty</h2>
            <p className="text-xs text-gray-300 mt-1">
              100% genuine products with authentic manufacturer warranty.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
