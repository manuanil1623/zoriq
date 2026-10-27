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
  ArrowRight
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Banner with Merchant Info */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3">
          <ZoriqLogo size="compact" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">Merchant Portal</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Live Store
              </span>
            </div>
            <p className="text-xs text-gray-500">
              UPI Payee: <strong className="font-mono text-gray-700">{sellerSettings.sellerUpiId || 'store@upi'}</strong> • COD: {sellerSettings.codEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
          <button
            onClick={() => setRole('customer')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold text-xs transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-gray-500" />
            <span>Switch to Customer Storefront</span>
          </button>
        </div>
      </div>

      {/* Seller Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSellerActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            sellerActiveTab === 'dashboard'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setSellerActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            sellerActiveTab === 'products'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Product Inventory & Editor</span>
        </button>

        <button
          onClick={() => setSellerActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            sellerActiveTab === 'orders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Orders Management</span>
          {orders.length > 0 && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {orders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSellerActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            sellerActiveTab === 'settings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
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
