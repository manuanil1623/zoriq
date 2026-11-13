import React from 'react';
import { useStore } from '../../context/StoreContext';
import ImageManager from './ImageManager';
import CollectionsManager from './CollectionsManager';
import ProductList from './ProductList';
import OrdersManager from './OrdersManager';
import StoreSettings from './StoreSettings';
import SellerDashboard from './SellerDashboard';
import {
  Layers,
  ClipboardList,
  Image as ImageIcon,
  Settings,
  Boxes,
  LayoutDashboard
} from 'lucide-react';

export default function SellerPortal() {
  const {
    sellerActiveTab,
    setSellerActiveTab,
    orders
  } = useStore();

  return (
    <div className="adm">
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        
        {/* Tab Pills with Products upfront */}
        <div className="atabs mb-4">
          <button
            type="button"
            onClick={() => setSellerActiveTab('products')}
            className={sellerActiveTab === 'products' ? 'on' : ''}
          >
            Products
          </button>

          <button
            type="button"
            onClick={() => setSellerActiveTab('collections')}
            className={sellerActiveTab === 'collections' ? 'on' : ''}
          >
            Collections
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
            onClick={() => setSellerActiveTab('images')}
            className={sellerActiveTab === 'images' ? 'on' : ''}
          >
            Images
          </button>

          <button
            type="button"
            onClick={() => setSellerActiveTab('settings')}
            className={sellerActiveTab === 'settings' ? 'on' : ''}
          >
            Settings
          </button>

          <button
            type="button"
            onClick={() => setSellerActiveTab('dashboard')}
            className={sellerActiveTab === 'dashboard' ? 'on' : ''}
          >
            Dashboard
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="abody">
          {sellerActiveTab === 'images' && <ImageManager />}
          {sellerActiveTab === 'collections' && <CollectionsManager />}
          {sellerActiveTab === 'orders' && <OrdersManager />}
          {sellerActiveTab === 'settings' && <StoreSettings />}
          {sellerActiveTab === 'products' && <ProductList />}
          {sellerActiveTab === 'dashboard' && <SellerDashboard />}
        </div>

      </div>
    </div>
  );
}
