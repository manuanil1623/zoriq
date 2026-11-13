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
  Search,
  Loader2,
  Lock,
  User,
  LogOut,
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
    <>
      {/* Scrim */}
      <div
        className="scrim on"
        style={{ zIndex: 96 }}
        onClick={() => setIsMyOrdersOpen(false)}
      ></div>

      <div className="fixed inset-0 z-[97] overflow-y-auto flex items-center justify-center p-3 sm:p-4">
        <div className="bg-[#fcfbf8] text-[#1c1a17] max-w-3xl w-full overflow-hidden shadow-2xl border border-[var(--line)] relative my-6 max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-[var(--line)] flex items-center justify-between bg-[#f4f0e9]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[var(--ink)] text-white flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10.5px] uppercase tracking-widest text-[var(--gold)] font-semibold block">
                  Private Order Tracking
                </span>
                <h2 className="text-lg font-tenor text-[var(--ink)] flex items-center gap-2">
                  <span>My Orders & Shipments</span>
                  {isCustomerLoggedIn && (
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">
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
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#cfc6b6] text-[var(--ink2)] hover:text-rose-600 text-xs transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMyOrdersOpen(false)}
                className="close"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Locked state if customer is not signed in */}
          {!isCustomerLoggedIn ? (
            <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 flex-1">
              <div className="w-14 h-14 bg-[#f4f0e9] border border-[var(--line)] flex items-center justify-center text-[var(--gold)]">
                <Lock className="w-7 h-7" />
              </div>

              <div className="max-w-md space-y-2">
                <h3 className="text-xl font-tenor text-[var(--ink)]">
                  Order Tracking is Private
                </h3>
                <p className="text-xs text-[var(--ink2)] leading-relaxed">
                  To protect your privacy, shipment updates and tax invoices are only accessible to
                  the customer who placed the order. Sign in to view and track your orders.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="btn dark w-full text-xs"
                >
                  <User className="w-4 h-4 mr-1.5" />
                  <span>Sign In to Track</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('signup');
                    setIsAuthModalOpen(true);
                  }}
                  className="btn line w-full text-xs"
                >
                  <span>Create Account</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Profile Strip */}
              <div className="px-5 py-2.5 bg-white border-b border-[var(--line)] flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="text-[var(--ink2)]">Customer:</span>
                  <strong className="text-[var(--ink)]">{customerUser?.name || 'Valued Customer'}</strong>
                  <span className="text-[var(--muted)]">({customerUser?.phone || customerUser?.email})</span>
                </div>
                <button
                  type="button"
                  onClick={logoutCustomer}
                  className="sm:hidden text-xs text-rose-600 underline"
                >
                  Sign Out
                </button>
              </div>

              {/* Sync Order search bar */}
              <div className="px-5 py-3 bg-[#f4f0e9] border-b border-[var(--line)] flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLookupOrder()}
                    placeholder="Sync by Order ID (e.g. ZQ-...) or 10-digit Phone..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#cfc6b6] outline-0 focus:border-[var(--ink)]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleLookupOrder}
                  disabled={isSearching || !lookupQuery.trim()}
                  className="px-4 py-2 bg-[var(--ink)] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[var(--gold)] transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  {isSearching ? 'Searching...' : 'Find Order'}
                </button>
              </div>

              {/* Orders List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="py-16 text-center text-[var(--ink2)]">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300 stroke-1" />
                    <p className="text-base font-medium text-[var(--ink)]">No orders found</p>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      Orders you place will automatically show up here for live tracking.
                    </p>
                  </div>
                ) : (
                  filteredOrders.map((order) => {
                    const stepIdx = getStepIndex(order.orderStatus);

                    return (
                      <div
                        key={order.id}
                        className="p-5 bg-white border border-[var(--line)] shadow-sm space-y-4"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--line)]">
                          <div>
                            <span className="text-[11px] font-mono text-[var(--gold)] font-bold block">
                              {order.orderNumber || order.id}
                            </span>
                            <span className="text-xs text-[var(--muted)]">
                              Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'Recently'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded ${
                              order.orderStatus === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.orderStatus === 'Shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {order.orderStatus || 'Placed'}
                            </span>

                            {setSelectedInvoice && (
                              <button
                                type="button"
                                onClick={() => setSelectedInvoice(order)}
                                className="inline-flex items-center gap-1 text-xs text-[var(--ink)] border border-[var(--line)] px-2.5 py-1 hover:bg-[#f4f0e9] transition-colors"
                                title="Download Invoice"
                              >
                                <FileText className="w-3.5 h-3.5 text-[var(--gold)]" />
                                <span>Invoice</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Shipment Progress Bar */}
                        <div className="py-2">
                          <div className="grid grid-cols-5 gap-1 text-center">
                            {STATUS_STEPS.map((st, i) => (
                              <div key={st} className="flex flex-col items-center">
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    i <= stepIdx
                                      ? 'bg-[var(--gold)] text-white'
                                      : 'bg-gray-200 text-gray-500'
                                  }`}
                                >
                                  {i <= stepIdx ? '✓' : i + 1}
                                </div>
                                <span className="text-[10px] mt-1 text-[var(--ink2)] leading-tight hidden sm:block">
                                  {st}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--gold)] transition-all duration-500"
                              style={{ width: `${((stepIdx + 1) / STATUS_STEPS.length) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Items list */}
                        <div className="divide-y divide-[var(--line)] pt-2">
                          {order.items &&
                            order.items.map((item, idx) => (
                              <div key={idx} className="py-2 flex items-center justify-between text-xs">
                                <div className="flex-1 min-w-0 pr-2">
                                  <p className="font-medium text-[var(--ink)] truncate">{item.name}</p>
                                  <p className="text-[var(--muted)]">Qty: {item.quantity}</p>
                                </div>
                                <span className="font-semibold text-[var(--ink)]">
                                  ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
                                </span>
                              </div>
                            ))}
                        </div>

                        {/* Order Total & Delivery Details */}
                        <div className="pt-3 border-t border-[var(--line)] flex flex-wrap items-center justify-between text-xs text-[var(--ink2)]">
                          <div>
                            <span>Deliver to: </span>
                            <strong className="text-[var(--ink)]">
                              {order.shippingAddress?.city || 'Your address'}, {order.shippingAddress?.pincode}
                            </strong>
                          </div>
                          <div>
                            <span>Total Paid: </span>
                            <strong className="text-sm font-semibold text-[var(--ink)]">
                              ₹{Number(order.totalAmount || order.total || 0).toLocaleString('en-IN')}
                            </strong>
                            <span className="ml-1 text-[11px] text-[var(--muted)]">
                              ({order.paymentMethod || 'COD'})
                            </span>
                          </div>
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
    </>
  );
}
