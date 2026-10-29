import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import Navbar from './components/Navbar';
import CustomerStorefront from './components/customer/CustomerStorefront';
import ProductDetailModal from './components/customer/ProductDetailModal';
import CartDrawer from './components/customer/CartDrawer';
import CheckoutModal from './components/checkout/CheckoutModal';
import MyOrdersModal from './components/customer/MyOrdersModal';
import InvoiceModal from './components/customer/InvoiceModal';
import SellerPortal from './components/seller/SellerPortal';
import ProductEditorModal from './components/seller/ProductEditorModal';
import AdminLoginModal from './components/seller/AdminLoginModal';
import Toast from './components/Toast';

function StoreApp() {
  const { role } = useStore();

  return (
    <div className="min-h-screen bg-[#0A0C0E] flex flex-col text-[var(--ink)] selection:bg-[#E8913C] selection:text-black">
      {/* Universal Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-1">
        {role === 'customer' ? <CustomerStorefront /> : <SellerPortal />}
      </div>

      {/* Modals & Drawers */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
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
