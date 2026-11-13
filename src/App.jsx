import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import Navbar from './components/Navbar';
import CustomerStorefront from './components/customer/CustomerStorefront';
import ProductDetailModal from './components/customer/ProductDetailModal';
import CartDrawer from './components/customer/CartDrawer';
import WishlistDrawer from './components/customer/WishlistDrawer';
import SearchOverlay from './components/customer/SearchOverlay';
import InfoPageModal from './components/customer/InfoPageModal';
import CheckoutModal from './components/checkout/CheckoutModal';
import MyOrdersModal from './components/customer/MyOrdersModal';
import InvoiceModal from './components/customer/InvoiceModal';
import CustomerAuthModal from './components/customer/CustomerAuthModal';
import SellerPortal from './components/seller/SellerPortal';
import ProductEditorModal from './components/seller/ProductEditorModal';
import AdminLoginModal from './components/seller/AdminLoginModal';
import Toast from './components/Toast';

function StoreApp() {
  const { role } = useStore();

  return (
    <div className="min-h-screen bg-[#fcfbf8] flex flex-col text-[#1c1a17]">
      {/* Universal Minimalist Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {role === 'customer' ? <CustomerStorefront /> : <SellerPortal />}
      </main>

      {/* Modals, Overlays & Drawers */}
      <ProductDetailModal />
      <CartDrawer />
      <WishlistDrawer />
      <SearchOverlay />
      <InfoPageModal />
      <CheckoutModal />
      <CustomerAuthModal />
      <MyOrdersModal />
      <InvoiceModal />
      <ProductEditorModal />
      <AdminLoginModal />

      {/* Floating Notifications */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <StoreApp />
    </StoreProvider>
  );
}
