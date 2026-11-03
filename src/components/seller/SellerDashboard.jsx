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
    return order.orderStatus !== 'Cancelled' ? sum + order.total : sum;
  }, 0);

  const upiOrders = orders.filter(
    (o) => (o.paymentMethod === 'RAZORPAY' || o.paymentMethod === 'UPI') && o.orderStatus !== 'Cancelled'
  );
  const codOrders = orders.filter(
    (o) => o.paymentMethod === 'COD' && o.orderStatus !== 'Cancelled'
  );

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
      
      {/* Welcome & Quick Action Header in Liquid Glass */}
      <div className="bg-[#101317]/85 backdrop-blur-2xl text-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-[var(--amber)] text-xs font-bold mb-2 border border-amber-500/30 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              Owner Business Overview
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-['Syne']">
              Welcome back, Store Manager
            </h1>
            <p className="text-xs sm:text-sm text-[var(--ink2)] mt-1 max-w-xl">
              Track live revenue, fulfill customer orders with Razorpay & COD, and manage product inventory seamlessly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-[var(--amber)] hover:bg-[#d67e2a] text-black rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Product</span>
            </button>
            <button
              onClick={() => setSellerActiveTab('orders')}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold text-xs sm:text-sm border border-white/10 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Key Business Metrics in Liquid Glass Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Revenue */}
        <div className="bg-[#101317]/80 backdrop-blur-2xl p-5 rounded-2xl border border-white/10 shadow-xl hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--ink2)] uppercase tracking-wider font-mono">
              Total Gross Sales
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white font-['Syne']">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{orders.length} orders recorded</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Online vs COD */}
        <div className="bg-[#101317]/80 backdrop-blur-2xl p-5 rounded-2xl border border-white/10 shadow-xl hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--ink2)] uppercase tracking-wider font-mono">
              Online vs COD
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-[var(--amber)] border border-amber-500/30 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-white font-['Syne'] flex items-center gap-2">
              <span className="text-emerald-400">{upiOrders.length} Online</span>
              <span className="text-gray-600">/</span>
              <span className="text-amber-400">{codOrders.length} COD</span>
            </div>
            <span className="text-[11px] text-[var(--ink2)] mt-1 block">
              ₹{upiRevenue.toLocaleString('en-IN')} online prepaid
            </span>
          </div>
        </div>

        {/* Metric 3: Active Products */}
        <div className="bg-[#101317]/80 backdrop-blur-2xl p-5 rounded-2xl border border-white/10 shadow-xl hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--ink2)] uppercase tracking-wider font-mono">
              Catalog Products
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white font-['Syne']">
              {products.length} Items
            </span>
            <div className="flex items-center gap-1 text-[11px] text-[var(--ink2)] font-medium mt-1">
              <span>Synced across all devices</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Inventory Alerts */}
        <div className="bg-[#101317]/80 backdrop-blur-2xl p-5 rounded-2xl border border-white/10 shadow-xl hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--ink2)] uppercase tracking-wider font-mono">
              Stock Warnings
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white font-['Syne']">
              {lowStockProducts.length + outOfStockProducts.length}
            </span>
            <span className="text-[11px] text-amber-400 font-medium mt-1 block">
              {outOfStockProducts.length} sold out, {lowStockProducts.length} low stock
            </span>
          </div>
        </div>

      </div>

      {/* Middle Grid: Payment Methods Breakdown & Inventory Warning List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Payment Gateway Snapshot */}
        <div className="lg:col-span-5 bg-[#101317]/80 backdrop-blur-2xl p-5 sm:p-6 rounded-2xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-['Syne']">
              Payment Gateway Performance
            </h3>
            <span
              className="text-xs text-[var(--amber)] font-medium hover:underline cursor-pointer"
              onClick={() => setSellerActiveTab('settings')}
            >
              Settings →
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Online Prepaid (Razorpay/UPI)</span>
                  <span className="text-[11px] text-[var(--ink2)] font-mono">{sellerSettings.sellerUpiId || 'Instant Settled'}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-xs text-white font-['Syne'] block">
                  ₹{upiRevenue.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  {upiOrders.length} Paid
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Cash on Delivery</span>
                  <span className="text-[11px] text-[var(--ink2)]">Doorstep Collection</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-xs text-white font-['Syne'] block">
                  ₹{codRevenue.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/30">
                  {sellerSettings.codEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="lg:col-span-7 bg-[#101317]/80 backdrop-blur-2xl p-5 sm:p-6 rounded-2xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-['Syne'] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Inventory Stock Alerts</span>
            </h3>
            <button
              onClick={() => setSellerActiveTab('products')}
              className="text-xs text-[var(--amber)] font-semibold hover:underline cursor-pointer"
            >
              Manage Inventory →
            </button>
          </div>

          {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--ink2)] bg-black/30 rounded-xl border border-white/5">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-1.5" />
              <span>All product stocks are healthy and ready for dispatch!</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1 text-xs">
              {[...outOfStockProducts, ...lowStockProducts].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover bg-black/40" />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-white truncate max-w-xs">{item.name}</h4>
                      <span className="text-[10px] text-gray-500 font-mono">{item.sku}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        item.stock <= 0
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {item.stock <= 0 ? 'Out of Stock' : `${item.stock} left`}
                    </span>
                    <button
                      onClick={() => {
                        setProductToEdit(item);
                        setIsProductEditorOpen(true);
                      }}
                      className="text-xs text-[var(--amber)] font-bold hover:underline cursor-pointer"
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
      <div className="bg-[#101317]/80 backdrop-blur-2xl p-5 sm:p-6 rounded-2xl border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-['Syne']">Recent Customer Orders</h3>
            <p className="text-xs text-[var(--ink2)]">Live order flow with instantaneous status updates</p>
          </div>
          <button
            onClick={() => setSellerActiveTab('orders')}
            className="text-xs text-[var(--amber)] font-bold hover:underline cursor-pointer"
          >
            View All ({orders.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/10 text-[var(--ink2)] uppercase tracking-wider text-[10px] font-mono">
                <th className="py-2.5">Order</th>
                <th className="py-2.5">Customer</th>
                <th className="py-2.5">Payment</th>
                <th className="py-2.5">Items</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 font-mono font-bold text-white">
                    {ord.id}
                  </td>
                  <td className="py-3">
                    <span className="font-semibold text-white block">{ord.customer.name}</span>
                    <span className="text-[11px] text-[var(--ink2)]">{ord.customer.city}</span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        ord.paymentMethod === 'RAZORPAY' || ord.paymentMethod === 'UPI'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {ord.paymentMethod === 'RAZORPAY' ? 'Razorpay' : ord.paymentMethod === 'UPI' ? 'UPI (Paid)' : 'COD'}
                    </span>
                  </td>
                  <td className="py-3 text-gray-300">
                    {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
                  </td>
                  <td className="py-3">
                    <span className="font-semibold text-gray-200 capitalize">
                      {ord.orderStatus}
                    </span>
                  </td>
                  <td className="py-3 text-right font-black text-white font-['Syne']">
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
