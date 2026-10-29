import React from 'react';
import { useStore } from '../context/StoreContext';
import ZoriqLogo from './ZoriqLogo';
import {
  ShoppingBag,
  ShoppingCart,
  Store,
  User,
  Package,
  Search,
  PlusCircle,
  LayoutDashboard,
  Boxes,
  ClipboardList,
  Settings,
  Sparkles,
  ArrowRight,
  Lock,
  LogOut,
  ShieldCheck
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
    searchQuery,
    setSearchQuery,
    sellerSettings,
    sellerActiveTab,
    setSellerActiveTab,
    setIsProductEditorOpen,
    setProductToEdit,
  } = useStore();

  const handleOpenAddProduct = () => {
    setProductToEdit(null);
    setIsProductEditorOpen(true);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 transition-colors">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <span className="inline-flex items-center gap-1 font-medium bg-indigo-500/30 px-2 py-0.5 rounded-full border border-indigo-400/30">
            <Sparkles className="w-3 h-3 text-amber-300" />
            UPI & COD Enabled Storefront
          </span>
          <span className="hidden md:inline text-indigo-200">
            • {sellerSettings.announcement || `Free Delivery on orders over ₹${sellerSettings.freeShippingThreshold || 999}`}
          </span>
        </div>

        {/* Right Corner: Admin Controls (Hidden from ordinary customers, requires PIN) */}
        <div className="flex items-center gap-2">
          {isAdminLoggedIn ? (
            <div className="flex items-center gap-2 bg-black/40 px-2.5 py-1 rounded-lg border border-amber-400/30 text-xs">
              <span className="text-amber-300 font-bold hidden sm:inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Owner Logged In
              </span>
              <button
                onClick={() => setRole(role === 'seller' ? 'customer' : 'seller')}
                className="bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded text-[11px] font-semibold transition-all"
              >
                {role === 'seller' ? 'Preview Store' : 'Open Admin'}
              </button>
              <button
                onClick={logoutAdmin}
                className="bg-rose-500/80 hover:bg-rose-600 text-white px-2 py-0.5 rounded text-[11px] font-semibold transition-all flex items-center gap-1"
                title="Log out of Admin"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAdminLoginModalOpen(true)}
              className="text-indigo-300 hover:text-white flex items-center gap-1 text-[11px] opacity-75 hover:opacity-100 transition-opacity px-2 py-0.5 rounded hover:bg-white/10"
              title="Restricted Store Owner Login"
            >
              <Lock className="w-3 h-3" />
              <span>Owner Access</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => {
                if (role === 'seller') setRole('customer');
              }}
              className="flex items-center gap-2 cursor-pointer group"
              title="ZORIQ — Shop More. Live Better."
            >
              <ZoriqLogo size="compact" />
              {role === 'seller' && (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  <Store className="w-3 h-3" />
                  Merchant Portal
                </span>
              )}
            </div>
          </div>

          {/* Center: Search (Customer Mode) or Tabs (Seller Mode) */}
          {role === 'customer' ? (
            <div className="flex-1 max-w-lg hidden sm:block">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search headphones, smartwatches, chargers, shoes..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100/80 hover:bg-gray-100 focus:bg-white text-sm rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 bg-gray-200 rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setSellerActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sellerActiveTab === 'dashboard'
                    ? 'bg-white text-indigo-600 shadow-sm font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </button>
              <button
                onClick={() => setSellerActiveTab('products')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sellerActiveTab === 'products'
                    ? 'bg-white text-indigo-600 shadow-sm font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Boxes className="w-3.5 h-3.5" />
                Products & Inventory
              </button>
              <button
                onClick={() => setSellerActiveTab('orders')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                  sellerActiveTab === 'orders'
                    ? 'bg-white text-indigo-600 shadow-sm font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                Orders
                {orders.length > 0 && (
                  <span className="w-4 h-4 bg-indigo-600 text-white rounded-full text-[10px] flex items-center justify-center">
                    {orders.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setSellerActiveTab('settings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sellerActiveTab === 'settings'
                    ? 'bg-white text-indigo-600 shadow-sm font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                Store & UPI
              </button>
            </div>
          )}

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {role === 'customer' ? (
              <>
                {/* Customer My Orders */}
                <button
                  onClick={() => setIsMyOrdersOpen(true)}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors relative"
                >
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="hidden sm:inline">My Orders</span>
                  {orders.length > 0 && (
                    <span className="bg-gray-200 text-gray-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {orders.length}
                    </span>
                  )}
                </button>

                {/* Customer Cart Button */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-3.5 py-2 rounded-xl font-medium text-sm shadow-md shadow-indigo-600/20 transition-all relative"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Cart</span>
                  {cartCount > 0 && (
                    <span className="bg-amber-400 text-gray-950 font-bold text-xs px-2 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </button>
              </>
            ) : (
              <>
                {/* Seller Quick Action: Add Product */}
                <button
                  onClick={handleOpenAddProduct}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Product</span>
                </button>

                {/* Switch to customer view to test */}
                <button
                  onClick={() => setRole('customer')}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-indigo-600 px-2 sm:px-3 py-2 border border-gray-200 hover:border-indigo-300 rounded-xl transition-all"
                >
                  <span>Preview Store</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Search input when in Customer Mode */}
        {role === 'customer' && (
          <div className="pb-3 pt-1 sm:hidden">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-1.5 bg-gray-100 text-sm rounded-lg border border-transparent focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
