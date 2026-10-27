import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
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
  ChevronRight
} from 'lucide-react';

const STATUS_STEPS = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function MyOrdersModal() {
  const {
    isMyOrdersOpen,
    setIsMyOrdersOpen,
    orders,
    setSelectedInvoice,
    sellerSettings
  } = useStore();

  const [filter, setFilter] = useState('all');

  if (!isMyOrdersOpen) return null;

  const filteredOrders = orders.filter((order) => {
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-gray-100 relative my-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              My Orders & Live Tracking
            </h2>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {orders.length} Total
            </span>
          </div>

          <button
            onClick={() => setIsMyOrdersOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-200/80 flex gap-2 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              filter === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200/60'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              filter === 'active' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200/60'
            }`}
          >
            In-Transit
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              filter === 'delivered' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200/60'
            }`}
          >
            Delivered
          </button>
        </div>

        {/* Orders List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-14">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">No orders found</p>
              <p className="text-xs text-gray-400 mt-1">Start shopping to track orders here in real-time.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const currentStepIdx = getStepIndex(order.orderStatus);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-indigo-300 transition-all overflow-hidden"
                >
                  {/* Top order summary row */}
                  <div className="p-4 bg-slate-50/80 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-gray-900 font-mono">
                          {order.id}
                        </span>
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                            order.paymentMethod === 'UPI'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.paymentMethod === 'UPI' ? 'UPI Paid' : 'Cash on Delivery'}
                        </span>
                      </div>
                      <span className="text-gray-400 text-[11px] mt-0.5 block">
                        Placed on {new Date(order.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedInvoice(order)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Tax Invoice</span>
                      </button>
                      <span className="font-extrabold text-sm text-gray-900">
                        ₹{order.total?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Tracking Step Progress Timeline */}
                  <div className="p-4 bg-white border-b border-gray-100">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-3">
                      Order Tracking: <strong className="text-indigo-600 capitalize">{order.orderStatus}</strong>
                    </span>

                    <div className="relative flex items-center justify-between">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0" />
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 z-0 transition-all duration-500"
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
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                                isDone
                                  ? 'bg-indigo-600 text-white shadow-sm ring-4 ring-indigo-100'
                                  : 'bg-gray-200 text-gray-500'
                              } ${isCurrent ? 'animate-bounce' : ''}`}
                            >
                              {sIdx + 1}
                            </div>
                            <span
                              className={`text-[10px] mt-1 hidden sm:block whitespace-nowrap font-medium ${
                                isCurrent ? 'text-indigo-600 font-bold' : isDone ? 'text-gray-800' : 'text-gray-400'
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
                  <div className="p-4 divide-y divide-gray-100">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-xl bg-gray-100 border border-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-gray-900 truncate">
                            {item.name}
                          </h4>
                          <span className="text-[11px] text-gray-500">
                            Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-gray-900">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Destination Footer */}
                  <div className="px-4 py-2.5 bg-gray-50 text-[11px] text-gray-500 flex items-center justify-between border-t border-gray-100">
                    <span>
                      Delivery to: <strong className="text-gray-700">{order.customer.name}</strong> ({order.customer.city}, {order.customer.pincode})
                    </span>
                    {order.trackingNumber && (
                      <span className="font-mono text-gray-600">
                        AWB: {order.trackingNumber}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
