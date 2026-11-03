import React from 'react';
import { useStore } from '../../context/StoreContext';
import SellerDashboard from './SellerDashboard';
import ProductList from './ProductList';
import OrdersManager from './OrdersManager';
import StoreSettings from './StoreSettings';
import ZoriqLogo from '../ZoriqLogo';
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  Settings,
  Store,
  PlusCircle,
  Eye,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function SellerPortal() {
  const {
    sellerActiveTab,
    setSellerActiveTab,
    setIsProductEditorOpen,
    setProductToEdit,
    setRole,
    sellerSettings,
    orders
  } = useStore();

  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsProductEditorOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 text-[var(--ink)]">
      
      {/* Top Banner with Merchant Info in Liquid Glass */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101317]/85 backdrop-blur-2xl p-4 sm:p-5 rounded-3xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <ZoriqLogo size="compact" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-white font-['Syne']">
                ZORIQ Owner Portal
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Live Cloud Sync
              </span>
            </div>
            <p className="text-xs text-[var(--ink2)] mt-0.5">
              UPI Payee: <strong className="font-mono text-gray-200">{sellerSettings.sellerUpiId || 'store@upi'}</strong> • COD: {sellerSettings.codEnabled ? 'Active' : 'Disabled'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--amber)] hover:bg-[#d67e2a] text-black font-bold text-xs transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Product</span>
          </button>
          <button
            onClick={() => setRole('customer')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-gray-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Preview Storefront</span>
          </button>
        </div>
      </div>

      {/* Seller Tab Navigation in Liquid Glass Capsules */}
      <div className="flex border-b border-white/10 mb-6 gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSellerActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl transition-all whitespace-nowrap cursor-pointer ${
            sellerActiveTab === 'dashboard'
              ? 'bg-amber-500/20 text-[var(--amber)] border border-amber-500/40 font-bold shadow-md shadow-amber-500/10'
              : 'text-[var(--ink2)] hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setSellerActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl transition-all whitespace-nowrap cursor-pointer ${
            sellerActiveTab === 'products'
              ? 'bg-amber-500/20 text-[var(--amber)] border border-amber-500/40 font-bold shadow-md shadow-amber-500/10'
              : 'text-[var(--ink2)] hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Product Inventory & Editor</span>
        </button>

        <button
          onClick={() => setSellerActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl transition-all whitespace-nowrap cursor-pointer ${
            sellerActiveTab === 'orders'
              ? 'bg-amber-500/20 text-[var(--amber)] border border-amber-500/40 font-bold shadow-md shadow-amber-500/10'
              : 'text-[var(--ink2)] hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Orders Management</span>
          {orders.length > 0 && (
            <span className="bg-amber-500 text-black text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
              {orders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSellerActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl transition-all whitespace-nowrap cursor-pointer ${
            sellerActiveTab === 'settings'
              ? 'bg-amber-500/20 text-[var(--amber)] border border-amber-500/40 font-bold shadow-md shadow-amber-500/10'
              : 'text-[var(--ink2)] hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Payment Gateway & Settings</span>
        </button>
      </div>

      {/* Tab Content Display */}
      <div>
        {sellerActiveTab === 'dashboard' && <SellerDashboard />}
        {sellerActiveTab === 'products' && <ProductList />}
        {sellerActiveTab === 'orders' && <OrdersManager />}
        {sellerActiveTab === 'settings' && <StoreSettings />}
      </div>

    </div>
  );
}
