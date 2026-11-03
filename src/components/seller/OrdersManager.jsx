import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Package,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Truck,
  FileText,
  CreditCard,
  Banknote,
  Search,
  Filter,
  ArrowRight,
  ChevronDown,
  Clock,
  X,
  AlertTriangle
} from 'lucide-react';

export default function OrdersManager() {
  const { orders, updateOrderStatus, updatePaymentStatus, setSelectedInvoice } = useStore();

  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    const matchesPayment =
      paymentFilter === 'all' ||
      (paymentFilter === 'pending-verification'
        ? order.paymentStatus === 'Verification Pending'
        : order.paymentMethod === paymentFilter);
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.phone.includes(search) ||
      (order.upiTxnId && order.upiTxnId.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesPayment && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Placed':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Confirmed':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'Shipped':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Delivered':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Cancelled':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-white/10 text-gray-300 border-white/10';
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      
      {/* Top Header in Liquid Glass */}
      <div className="bg-[#101317]/80 backdrop-blur-2xl p-4 sm:p-5 rounded-2xl border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[var(--amber)] uppercase font-bold">
              Dispatch & Fulfillment
            </span>
            <span className="text-xs bg-amber-500/15 text-[var(--amber)] border border-amber-500/30 font-bold px-2.5 py-0.5 rounded-full">
              {orders.length} Total
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white font-['Syne'] mt-0.5">
            Store Orders Management
          </h2>
          <p className="text-xs text-[var(--ink2)] mt-0.5">
            Monitor incoming customer orders, verify payments, and update live tracking milestones
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#101317]/80 backdrop-blur-2xl p-3 sm:p-3.5 rounded-2xl border border-white/10 shadow-lg flex flex-col sm:flex-row items-center gap-3">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, Customer name, Phone, UPI Ref..."
            className="w-full pl-10 pr-3 py-2 text-xs bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-gray-200 focus:outline-none focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)] cursor-pointer"
          >
            <option value="all">All Order Statuses</option>
            <option value="Placed">Placed</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Payment Filter */}
        <div className="w-full sm:w-auto">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full sm:w-auto bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-gray-200 focus:outline-none focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)] cursor-pointer"
          >
            <option value="all">All Payment Methods</option>
            <option value="RAZORPAY">Razorpay (Cards/UPI/NetBanking)</option>
            <option value="COD">Cash on Delivery</option>
            <option value="pending-verification">⏳ Pending Verification</option>
          </select>
        </div>

      </div>

      {/* Orders Cards Grid in Liquid Glass */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-[#101317]/80 backdrop-blur-2xl rounded-2xl border border-white/10 p-12 text-center text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 text-gray-600" />
            <p className="text-xs font-semibold text-gray-300">No orders match the filter criteria</p>
            <p className="text-[11px] text-gray-500 mt-1">Orders placed by customers will appear here in real-time</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-[#101317]/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl hover:border-amber-500/30 transition-all p-4 sm:p-5 text-white"
            >
              {/* Top Row: Order ID, Date, Amount, Current Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-[var(--amber)] border border-amber-500/30 flex items-center justify-center font-bold">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-white font-mono tracking-wide">
                        {order.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--ink2)]">
                      {new Date(order.date).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {/* Payment Badge & Total */}
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        order.paymentStatus === 'Verification Pending'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse'
                          : order.paymentStatus === 'Paid'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : order.paymentStatus === 'Failed'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : 'bg-white/10 text-gray-300 border-white/10'
                      }`}
                    >
                      {order.paymentStatus === 'Verification Pending' ? (
                        <>
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Pending Verification</span>
                        </>
                      ) : order.paymentStatus === 'Paid' ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>
                            {order.paymentMethod === 'RAZORPAY'
                              ? 'Paid via Razorpay'
                              : order.paymentMethod === 'UPI'
                              ? 'Paid via UPI'
                              : 'COD Paid'}
                          </span>
                        </>
                      ) : order.paymentStatus === 'Failed' ? (
                        <>
                          <X className="w-3 h-3 text-rose-400" />
                          <span>Payment Rejected</span>
                        </>
                      ) : (
                        <>
                          <Banknote className="w-3 h-3" />
                          <span>COD (Pending)</span>
                        </>
                      )}
                    </span>
                    <span className="block font-black text-base text-white font-['Syne'] mt-0.5">
                      ₹{order.total?.toLocaleString('en-IN')}
                    </span>
                    {order.razorpayPaymentId && (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                        {order.razorpayPaymentId}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedInvoice(order)}
                    className="p-2.5 text-[var(--amber)] hover:bg-amber-500/10 border border-amber-500/30 rounded-xl transition-colors cursor-pointer"
                    title="View & Print Tax Invoice"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Box if UPI Verification is Pending */}
              {order.paymentStatus === 'Verification Pending' && (
                <div className="my-3 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>Action Required: Verify UPI Payment Before Dispatching</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] bg-black/40 px-2.5 py-1 rounded-lg border border-amber-500/30 font-bold text-amber-300">
                      <span>Customer UTR:</span>
                      <span className="text-white select-all font-extrabold">{order.upiTxnId || 'None'}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    Customer <strong>{order.customer.name}</strong> placed this order for <strong>₹{order.total?.toLocaleString('en-IN')}</strong> using UPI. Please check your bank statement or scanner for UTR <strong>{order.upiTxnId}</strong>.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => updatePaymentStatus(order.id, 'Paid')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Payment Received (Approve & Confirm Order)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePaymentStatus(order.id, 'Failed')}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Payment Not Received (Reject Order)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Middle Grid: Customer Details & Ordered Line Items */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3.5 text-xs">
                
                {/* Customer Address Info */}
                <div className="md:col-span-5 bg-black/30 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-gray-500 block mb-1 font-mono">
                    Customer & Delivery Address
                  </span>
                  <p className="font-bold text-white text-sm">{order.customer.name}</p>
                  <p className="text-gray-300 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-gray-500" />
                    <span>+91 {order.customer.phone}</span>
                  </p>
                  <p className="text-gray-300 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-gray-500" />
                    <span>{order.customer.email}</span>
                  </p>
                  <p className="text-gray-300 flex items-start gap-1.5 pt-1 border-t border-white/5">
                    <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span>{order.customer.address}, {order.customer.city}, {order.customer.state} - {order.customer.pincode}</span>
                  </p>

                  {/* Dedicated Admin Payment Method Specification */}
                  <div className="mt-2.5 pt-2 border-t border-white/10">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-gray-500 block mb-1 font-mono">
                      Payment Method Specification
                    </span>
                    {order.paymentMethod === 'RAZORPAY' || order.razorpayPaymentId ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Razorpay Online Gateway (Prepaid)</span>
                        </div>
                        <p className="text-[11px] text-emerald-200/90 mt-0.5 font-medium">
                          ✓ Payment verified & settled. Deliver package directly with NO cash collection.
                        </p>
                        {order.razorpayPaymentId && (
                          <p className="text-[10.5px] font-mono text-emerald-300 font-bold mt-1 bg-black/40 px-2 py-0.5 rounded border border-emerald-500/20 select-all inline-block">
                            Razorpay ID: {order.razorpayPaymentId}
                          </p>
                        )}
                      </div>
                    ) : order.paymentMethod === 'COD' ? (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-amber-300">
                          <Banknote className="w-3.5 h-3.5 text-amber-400" />
                          <span>Cash on Delivery (COD)</span>
                        </div>
                        <p className="text-[11px] text-amber-200 font-bold mt-0.5">
                          ⚠️ Unpaid Order — Instruct delivery agent to collect ₹{order.total?.toLocaleString('en-IN')} in cash or UPI scanner upon delivery.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-2.5 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-blue-300">
                          <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                          <span>Direct UPI Transfer</span>
                        </div>
                        {order.upiTxnId && (
                          <p className="text-[10.5px] font-mono text-blue-300 font-bold mt-1 bg-black/40 px-2 py-0.5 rounded border border-blue-500/20 select-all inline-block">
                            Customer UTR: {order.upiTxnId}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Items in Order */}
                <div className="md:col-span-7 space-y-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-gray-500 block font-mono">
                    Order Items ({order.items.length})
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover bg-black/40 border border-white/10 flex-shrink-0"
                          />
                          <span className="text-xs font-semibold text-white truncate" title={item.name}>
                            {item.name}
                          </span>
                        </div>
                        <div className="text-right whitespace-nowrap ml-2">
                          <span className="text-[11px] text-[var(--ink2)] mr-2">
                            {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                          </span>
                          <span className="font-bold text-white font-['Syne']">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Bottom Row: Quick Status Advancement Controls */}
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--ink2)] font-medium">Update Status:</span>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="bg-black/50 border border-white/15 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[var(--amber)] cursor-pointer"
                  >
                    <option value="Placed">Placed</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Fast action shortcut buttons */}
                <div className="flex items-center gap-2">
                  {order.orderStatus === 'Placed' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Confirmed')}
                      className="px-3.5 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Confirm Order
                    </button>
                  )}
                  {order.orderStatus === 'Confirmed' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Shipped')}
                      className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/35 text-[var(--amber)] border border-amber-500/40 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Mark Shipped
                    </button>
                  )}
                  {order.orderStatus === 'Shipped' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Delivered')}
                      className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/40 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Mark Delivered
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
