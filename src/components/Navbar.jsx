import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  Settings,
  PlusCircle,
  LogOut,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export default function Navbar() {
  const {
    role,
    setRole,
    isAdminLoggedIn,
    setIsAdminLoginModalOpen,
    logoutAdmin,
    cartCount,
    setIsCartOpen,
    orders,
    setIsMyOrdersOpen,
    sellerActiveTab,
    setSellerActiveTab,
    setIsProductEditorOpen,
    setProductToEdit,
  } = useStore();

  const handleOpenAddProduct = () => {
    setProductToEdit(null);
    setIsProductEditorOpen(true);
  };

  // Secret Owner Access: ?admin, #admin, or Ctrl+Shift+A
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkUrlSecret = () => {
      const search = window.location.search;
      const hash = window.location.hash;
      if (search.includes('admin') || search.includes('owner') || hash === '#admin' || hash === '#owner') {
        setIsAdminLoginModalOpen(true);
      }
    };

    checkUrlSecret();
    window.addEventListener('hashchange', checkUrlSecret);

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminLoginModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkUrlSecret);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setIsAdminLoginModalOpen]);

  // 1. CUSTOMER MODE: Public Navigation Bar (Owner tab is hidden from customers)
  if (role === 'customer') {
    return (
      <nav className="zoriq-nav">
        <span
          className="brand cursor-pointer select-none"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="ZORIQ"
        >
          ZORIQ
          {/* Secret Discrete Trigger: Clicking the amber dot opens Owner PIN Login */}
          <i
            onClick={(e) => {
              e.stopPropagation();
              setIsAdminLoginModalOpen(true);
            }}
            title="ZORIQ"
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            .
          </i>
        </span>

        <div className="nav-r">
          <a href="#shop" className="hide-s">Shop</a>
          <a href="#info" className="hide-s">Delivery</a>
          
          {orders.length > 0 && (
            <a
              onClick={() => setIsMyOrdersOpen(true)}
              className="hide-s cursor-pointer"
            >
              Orders ({orders.length})
            </a>
          )}

          {/* Only visible when the Owner has already successfully authenticated */}
          {isAdminLoggedIn && (
            <a
              onClick={() => setRole('seller')}
              style={{ color: 'var(--amber)', fontWeight: 600 }}
              title="Open Merchant Portal"
              className="cursor-pointer"
            >
              Admin
            </a>
          )}

          <button
            className="pill"
            id="cartBtn"
            type="button"
            onClick={() => setIsCartOpen(true)}
          >
            Cart (<span id="cartN">{cartCount}</span>)
          </button>
        </div>
      </nav>
    );
  }

  // 2. SELLER MODE: Merchant Management Bar
  return (
    <header className="sticky top-0 z-50 bg-[#101317] border-b border-[var(--line)] text-[var(--ink)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Mode Indicator */}
          <div className="flex items-center gap-3">
            <span
              onClick={() => setRole('customer')}
              className="brand cursor-pointer text-lg"
              title="Preview Store"
            >
              ZORIQ<i>.</i>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-[var(--amber)] border border-amber-500/30">
              <ShieldCheck className="w-3 h-3" />
              Owner Portal
            </span>
          </div>

          {/* Admin Tabs */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setSellerActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sellerActiveTab === 'dashboard'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[var(--ink2)] hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </button>
            <button
              onClick={() => setSellerActiveTab('products')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sellerActiveTab === 'products'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[var(--ink2)] hover:text-white'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              Products
            </button>
            <button
              onClick={() => setSellerActiveTab('orders')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                sellerActiveTab === 'orders'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[var(--ink2)] hover:text-white'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Orders
              {orders.length > 0 && (
                <span className="w-4 h-4 bg-amber-500 text-black font-bold rounded-full text-[10px] flex items-center justify-center">
                  {orders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setSellerActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sellerActiveTab === 'settings'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[var(--ink2)] hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddProduct}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold px-3 py-1.5 rounded-xl text-xs transition-all active:scale-95 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>
            <button
              onClick={() => setRole('customer')}
              className="flex items-center gap-1 text-xs text-[var(--ink2)] hover:text-white px-2.5 py-1.5 border border-white/10 rounded-xl transition-all"
            >
              <span>Preview</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={logoutAdmin}
              className="p-1.5 text-rose-400 hover:text-rose-300 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
