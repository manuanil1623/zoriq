import React from 'react';
import { useStore } from '../../context/StoreContext';
import SellerDashboard from './SellerDashboard';
import ProductList from './ProductList';
import OrdersManager from './OrdersManager';
import StoreSettings from './StoreSettings';
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  Settings,
  PlusCircle,
  Eye,
  ShieldCheck
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
    <div className="adm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Top Hero Banner */}
        <div className="ahero mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="chip2 font-mono uppercase tracking-wider font-bold">
                ● Live Supabase Synchronized
              </span>
              <h2>zoriq Merchant Portal</h2>
              <p>
                UPI Payee: <strong>{sellerSettings?.sellerUpiId || 'store@upi'}</strong> · COD:{' '}
                {sellerSettings?.codEnabled ? 'Active' : 'Disabled'} · Free Shipping Threshold: ₹
                {sellerSettings?.freeShippingThreshold || 599}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="ab"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" />
                <span>Add Product</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('customer')}
                className="ab gh"
              >
                <Eye className="w-4 h-4 mr-1.5" />
                <span>Storefront</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="atabs mb-6">
          <button
            type="button"
            onClick={() => setSellerActiveTab('dashboard')}
            className={sellerActiveTab === 'dashboard' ? 'on' : ''}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setSellerActiveTab('products')}
            className={sellerActiveTab === 'products' ? 'on' : ''}
          >
            Products
          </button>
          <button
            type="button"
            onClick={() => setSellerActiveTab('orders')}
            className={sellerActiveTab === 'orders' ? 'on' : ''}
          >
            Orders
            {orders.length > 0 && <span className="nb">{orders.length}</span>}
          </button>
          <button
            type="button"
            onClick={() => setSellerActiveTab('settings')}
            className={sellerActiveTab === 'settings' ? 'on' : ''}
          >
            Settings
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#cfe8dd] shadow-sm">
          {sellerActiveTab === 'dashboard' && <SellerDashboard />}
          {sellerActiveTab === 'products' && <ProductList />}
          {sellerActiveTab === 'orders' && <OrdersManager />}
          {sellerActiveTab === 'settings' && <StoreSettings />}
        </div>

      </div>
    </div>
  );
}
