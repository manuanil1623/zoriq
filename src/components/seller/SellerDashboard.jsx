import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Boxes,
  PlusCircle,
  CreditCard,
  Banknote,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function SellerDashboard() {
  const {
    products,
    orders,
    setSellerActiveTab,
    setIsProductEditorOpen,
    setProductToEdit,
    setSelectedInvoice,
    sellerSettings
  } = useStore();

  // Metrics
  const totalRevenue = orders.reduce((sum, order) => {
    // Only count if paid or placed
    return order.orderStatus !== 'Cancelled' ? sum + order.total : sum;
  }, 0);

  const upiOrders = orders.filter((o) => o.paymentMethod === 'UPI' && o.orderStatus !== 'Cancelled');
  const codOrders = orders.filter((o) => o.paymentMethod === 'COD' && o.orderStatus !== 'Cancelled');

  const upiRevenue = upiOrders.reduce((sum, o) => sum + o.total, 0);
  const codRevenue = codOrders.reduce((sum, o) => sum + o.total, 0);

  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const outOfStockProducts = products.filter((p) => p.stock <= 0 || !p.inStock);

  const recentOrders = orders.slice(0, 5);

  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsProductEditorOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Welcome & Quick Action Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-2 border border-amber-300/30">
              <Sparkles className="w-3.5 h-3.5" />
              Owner Business Overview
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Welcome back, Store Manager
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
              Track your daily revenue, dispatch customer orders with UPI & COD, and expand your catalog with the Product Editor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
            <button
              onClick={() => setSellerActiveTab('orders')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Key Business Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Total Gross Sales</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-gray-900">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{orders.length} orders recorded</span>
            </div>
          </div>
        </div>

        {/* Metric 2: UPI vs COD Ratio */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">UPI Online vs COD</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="text-indigo-600">{upiOrders.length} UPI</span>
              <span className="text-gray-300">/</span>
              <span className="text-amber-600">{codOrders.length} COD</span>
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              ₹{upiRevenue.toLocaleString('en-IN')} direct UPI inflow
            </span>
          </div>
        </div>

        {/* Metric 3: Active Products */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Total Catalog Items</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-gray-900">
              {products.length} Items
            </span>
            <div className="flex items-center gap-1 text-[11px] text-indigo-600 font-medium mt-1">
              <span>Across 5 categories</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Inventory Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Stock Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-gray-900">
              {lowStockProducts.length + outOfStockProducts.length}
            </span>
            <span className="text-[11px] text-amber-600 font-medium mt-1 block">
              {outOfStockProducts.length} sold out, {lowStockProducts.length} low stock
            </span>
          </div>
        </div>

      </div>

      {/* Middle Grid: Payment Methods Breakdown & Inventory Warning List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Payment Gateway Snapshot */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center justify-between">
            <span>Payment Gateway Performance</span>
            <span className="text-xs text-indigo-600 font-medium cursor-pointer" onClick={() => setSellerActiveTab('settings')}>
              Edit Settings →
            </span>
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 block">UPI Instant QR & Apps</span>
                  <span className="text-[11px] text-indigo-700 font-mono">{sellerSettings.sellerUpiId}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-xs text-gray-900 block">₹{upiRevenue.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">100% Paid</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Cash on Delivery</span>
                  <span className="text-[11px] text-amber-700">Doorstep Collection</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-xs text-gray-900 block">₹{codRevenue.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-amber-700 font-bold">
                  {sellerSettings.codEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Inventory Stock Alerts</span>
            </h3>
            <button
              onClick={() => setSellerActiveTab('products')}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Manage Inventory →
            </button>
          </div>

          {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500 bg-gray-50 rounded-xl">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
              <span>All product stocks are healthy and above minimum thresholds!</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1 text-xs">
              {[...outOfStockProducts, ...lowStockProducts].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover bg-white" />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate max-w-xs">{item.name}</h4>
                      <span className="text-[10px] text-gray-400 font-mono">{item.sku}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        item.stock <= 0
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.stock <= 0 ? 'Out of Stock' : `${item.stock} left`}
                    </span>
                    <button
                      onClick={() => {
                        setProductToEdit(item);
                        setIsProductEditorOpen(true);
                      }}
                      className="text-xs text-indigo-600 font-bold hover:underline"
                    >
                      Restock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Recent Customer Orders</h3>
            <p className="text-xs text-gray-500">Live order flow with instantaneous status updates</p>
          </div>
          <button
            onClick={() => setSellerActiveTab('orders')}
            className="text-xs text-indigo-600 font-bold hover:underline"
          >
            View All ({orders.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                <th className="py-2.5">Order</th>
                <th className="py-2.5">Customer</th>
                <th className="py-2.5">Payment</th>
                <th className="py-2.5">Items</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 font-mono font-bold text-gray-900">
                    {ord.id}
                  </td>
                  <td className="py-3">
                    <span className="font-semibold text-gray-900 block">{ord.customer.name}</span>
                    <span className="text-[11px] text-gray-400">{ord.customer.city}</span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ord.paymentMethod === 'UPI'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.paymentMethod === 'UPI' ? 'UPI (Paid)' : 'COD'}
                    </span>
                  </td>
                  <td className="py-3 text-gray-600">
                    {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
                  </td>
                  <td className="py-3">
                    <span className="font-semibold text-gray-700 capitalize">
                      {ord.orderStatus}
                    </span>
                  </td>
                  <td className="py-3 text-right font-black text-gray-900">
                    ₹{ord.total?.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
