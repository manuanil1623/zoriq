import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import Navbar from './components/Navbar';
import CustomerStorefront from './components/customer/CustomerStorefront';
import ProductDetailModal from './components/customer/ProductDetailModal';
import CartDrawer from './components/customer/CartDrawer';
import CheckoutModal from './components/checkout/CheckoutModal';
import MyOrdersModal from './components/customer/MyOrdersModal';
import InvoiceModal from './components/customer/InvoiceModal';
import CustomerAuthModal from './components/customer/CustomerAuthModal';
import SellerPortal from './components/seller/SellerPortal';
import ProductEditorModal from './components/seller/ProductEditorModal';
import AdminLoginModal from './components/seller/AdminLoginModal';
import GlassDock from './components/layout/GlassDock';
import Toast from './components/Toast';

function StoreApp() {
  const { role } = useStore();

  // Specular sheen & touch glow effect on buttons, cards, chips, dock
  useEffect(() => {
    const SEL = '.pc,.zq-chip,.pill,.pill-track,.btn,.zq-dock,nav.zoriq-nav,.foot,#info>.rv';
    let cur = null;
    let t = null;

    function onPointer(e) {
      const el = e.target && e.target.closest ? e.target.closest(SEL) : null;
      if (cur && cur !== el) {
        cur.removeAttribute('data-lit');
      }
      if (!el) {
        cur = null;
        return;
      }
      const r = el.getBoundingClientRect();
      el.style.setProperty('--lx', `${e.clientX - r.left}px`);
      el.style.setProperty('--ly', `${e.clientY - r.top}px`);
      el.setAttribute('data-lit', '');
      cur = el;
      clearTimeout(t);
      if (e.pointerType !== 'mouse') {
        t = setTimeout(off, 600);
      }
    }

    function off() {
      if (cur) {
        cur.removeAttribute('data-lit');
        cur = null;
      }
    }

    document.addEventListener('pointerdown', onPointer, { passive: true });
    const onMove = (e) => {
      if (e.pointerType === 'mouse') onPointer(e);
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', off);

    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', off);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--ground)] flex flex-col text-[var(--ink)] selection:bg-[var(--teal)] selection:text-white">
      {/* Universal Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-1">
        {role === 'customer' ? <CustomerStorefront /> : <SellerPortal />}
      </div>

      {/* Floating Glass Dock (Customer View) */}
      <GlassDock />

      {/* Modals & Drawers */}
      <ProductDetailModal />
      <CartDrawer />
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
