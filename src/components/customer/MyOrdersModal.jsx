import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { lookupCustomerOrders } from '../../services/supabase';
import {
  X,
  Package,
  Calendar,
  Clock,
  CheckCircle,
  Truck,
  FileText,
  CreditCard,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Search,
  Loader2,
  Lock,
  User,
  LogOut,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const STATUS_STEPS = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function MyOrdersModal() {
  const {
    isMyOrdersOpen,
    setIsMyOrdersOpen,
    orders,
    customerOrders,
    loadCustomerOrdersList,
    setSelectedInvoice,
    sellerSettings,
    addToast,
    isCustomerLoggedIn,
    customerUser,
    setIsAuthModalOpen,
    setAuthModalMode,
    logoutCustomer
  } = useStore();

  const [filter, setFilter] = useState('all');
  const [lookupQuery, setLookupQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  if (!isMyOrdersOpen) return null;

  const displayOrders = customerOrders || [];

  const handleLookupOrder = async () => {
    if (!lookupQuery.trim()) return;
    setIsSearching(true);
    try {
      const found = await lookupCustomerOrders(lookupQuery.trim());
      if (found && found.length > 0) {
        if (loadCustomerOrdersList) {
          await loadCustomerOrdersList();
        }
        if (addToast) {
          addToast(`Found ${found.length} order(s) and synced for live tracking!`, 'success');
        }
        setLookupQuery('');
      } else {
        if (addToast) {
          addToast('No order found matching that Order ID or Phone number.', 'warning');
        }
      }
    } catch (err) {
      console.error('Track order lookup error:', err);
      if (addToast) {
        addToast('Could not look up order. Please verify your details.', 'error');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const filteredOrders = displayOrders.filter((order) => {
    if (filter === 'all') return true;
    if (filter === 'delivered') return order.orderStatus === 'Delivered';
    if (filter === 'active') return order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled';
    return true;
  });

  const getStepIndex = (status) => {
    const idx = STATUS_STEPS.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#101317]/95 text-[var(--ink)] rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-white/10 relative my-6 max-h-[92vh] flex flex-col backdrop-blur-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[var(--amber)]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10.5px] font-mono tracking-widest text-[var(--amber)] uppercase block font-bold">
                Private Order Tracking
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Syne'] flex items-center gap-2">
                <span>My Orders & Live Tracking</span>
                {isCustomerLoggedIn && (
                  <span className="bg-amber-500/20 text-[var(--amber)] border border-amber-500/30 text-xs font-bold px-2 py-0.5 rounded-full">
                    {displayOrders.length}
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCustomerLoggedIn && (
              <button
                type="button"
                onClick={logoutCustomer}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-rose-500/40 text-[var(--ink2)] hover:text-rose-400 text-xs transition-colors cursor-pointer"
                title="Sign out of customer account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}

            <button
              onClick={() => setIsMyOrdersOpen(false)}
              className="p-2 text-[var(--ink2)] hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Locked state if customer is not signed in */}
        {!isCustomerLoggedIn ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 flex-1">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[var(--amber)] shadow-lg shadow-amber-500/10">
              <Lock className="w-8 h-8" />
            </div>

            <div className="max-w-md space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-white font-['Syne']">
                Order Tracking & History is Protected
              </h3>
              <p className="text-xs text-[var(--ink2)] leading-relaxed">
                To guarantee full privacy, order history and live dispatch updates are only accessible to the person who placed the order. Please sign in with your email or mobile number to track your shipments.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-3 bg-[var(--amber)] hover:bg-[#d67e2a] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Sign In to Track Orders</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('signup');
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Create New Account</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Authenticated Customer Profile Strip */}
            <div className="px-4 sm:px-6 py-2.5 bg-white/5 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[var(--ink2)]">Logged in as:</span>
                <strong className="text-white font-medium">{customerUser?.name || 'Valued Customer'}</strong>
                <span className="text-gray-500">({customerUser?.phone || customerUser?.email})</span>
              </div>

              <button
                type="button"
                onClick={logoutCustomer}
                className="sm:hidden text-xs text-rose-400 hover:underline"
              >
                Sign Out
              </button>
            </div>

            {/* Quick Track Lookup Bar for multiple devices */}
            <div className="px-4 sm:px-6 py-3 bg-black/30 border-b border-white/10 flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookupOrder()}
                  placeholder="Sync another order: Enter Order ID (e.g. ZQ-...) or 10-digit Phone..."
                  className="w-full pl-10 pr-3 py-2 text-xs bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)]"
                />
              </div>
              <button
                type="button"
                onClick={handleLookupOrder}
                disabled={isSearching || !lookupQuery.trim()}
                className="w-full sm:w-auto px-4 py-2 bg-[var(--amber)] hover:bg-[#d67e2a] disabled:opacity-50 text-black text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-sm"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />}
                <span>Find & Sync Order</span>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 sm:px-6 py-2.5 bg-black/20 border-b border-white/10 flex gap-2 text-xs overflow-x-auto">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                  filter === 'all'
                    ? 'bg-[var(--amber)] text-black font-bold'
                    : 'text-[var(--ink2)] hover:text-white hover:bg-white/5'
                }`}
              >
                All Orders ({displayOrders.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                  filter === 'active'
                    ? 'bg-[var(--amber)] text-black font-bold'
                    : 'text-[var(--ink2)] hover:text-white hover:bg-white/5'
                }`}
              >
                In-Transit
              </button>
              <button
                onClick={() => setFilter('delivered')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                  filter === 'delivered'
                    ? 'bg-[var(--amber)] text-black font-bold'
                    : 'text-[var(--ink2)] hover:text-white hover:bg-white/5'
                }`}
              >
                Delivered
              </button>
            </div>

            {/* Orders List in Liquid Glass */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-14 border border-dashed border-white/10 rounded-2xl bg-white/2">
                  <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-300">No orders found in your account</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                    When you order from the ZORIQ store, your real-time tracking milestones and invoices will appear right here.
                  </p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const currentStepIdx = getStepIndex(order.orderStatus);

                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl hover:border-amber-500/40 transition-all overflow-hidden shadow-lg shadow-black/40"
                    >
                      {/* Top order summary row */}
                      <div className="p-4 bg-black/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm sm:text-base text-white font-mono tracking-wide">
                              {order.id}
                            </span>
                            <span
                              className={`font-semibold px-2.5 py-0.5 rounded-full text-[10px] ${
                                order.paymentMethod === 'RAZORPAY' || order.razorpayPaymentId || order.paymentMethod === 'UPI'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {order.paymentMethod === 'RAZORPAY' || order.razorpayPaymentId
                                ? '✓ Razorpay Paid'
                                : order.paymentMethod === 'UPI'
                                ? '✓ UPI Paid'
                                : 'Cash on Delivery'}
                            </span>
                          </div>
                          <span className="text-[var(--ink2)] text-[11px] mt-0.5 block">
                            Placed on {new Date(order.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => setSelectedInvoice(order)}
                            className="px-3 py-1.5 text-xs font-semibold text-[var(--amber)] bg-amber-500/10 hover:bg-amber-500/20 rounded-xl border border-amber-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Tax Invoice</span>
                          </button>
                          <span className="font-extrabold text-base text-white font-['Syne']">
                            ₹{order.total?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Live Tracking Step Progress Timeline */}
                      <div className="p-4 sm:p-5 bg-black/20 border-b border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-semibold text-[var(--ink2)] uppercase tracking-wider block">
                            Status: <strong className="text-[var(--amber)] uppercase tracking-wider">{order.orderStatus}</strong>
                          </span>
                          {order.trackingNumber && (
                            <span className="font-mono text-[11px] text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                              AWB: {order.trackingNumber}
                            </span>
                          )}
                        </div>

                        <div className="relative flex items-center justify-between mt-2">
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 z-0 rounded-full" />
                          <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-amber-500 to-emerald-400 z-0 transition-all duration-500 rounded-full"
                            style={{
                              width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%`
                            }}
                          />

                          {STATUS_STEPS.map((stepName, sIdx) => {
                            const isDone = sIdx <= currentStepIdx;
                            const isCurrent = sIdx === currentStepIdx;

                            return (
                              <div key={stepName} className="relative z-10 flex flex-col items-center">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                    isDone
                                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30 ring-4 ring-amber-500/20'
                                      : 'bg-[#1C2026] text-gray-500 border border-white/10'
                                  } ${isCurrent ? 'scale-110 ring-4 ring-amber-500/30' : ''}`}
                                >
                                  {isDone && !isCurrent ? '✓' : sIdx + 1}
                                </div>
                                <span
                                  className={`text-[10px] mt-1.5 hidden sm:block whitespace-nowrap font-medium ${
                                    isCurrent ? 'text-[var(--amber)] font-bold' : isDone ? 'text-gray-200' : 'text-gray-500'
                                  }`}
                                >
                                  {stepName}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Items purchased */}
                      <div className="p-4 divide-y divide-white/5 space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 pt-2 first:pt-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-xl bg-black/40 border border-white/10 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-white truncate" title={item.name}>
                                {item.name}
                              </h4>
                              <span className="text-[11px] text-[var(--ink2)]">
                                Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-white">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Shipping Destination Footer */}
                      <div className="px-4 py-2.5 bg-black/40 text-[11px] text-[var(--ink2)] flex flex-wrap items-center justify-between gap-2 border-t border-white/10">
                        <span>
                          Delivery Address: <strong className="text-gray-200">{order.customer.name}</strong> ({order.customer.city}, {order.customer.pincode})
                        </span>
                        {order.customer.phone && (
                          <span className="text-gray-400">
                            Ph: +91 {order.customer.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
