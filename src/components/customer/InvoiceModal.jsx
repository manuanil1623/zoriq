import React from 'react';
import { useStore } from '../../context/StoreContext';
import ZoriqLogo from '../ZoriqLogo';
import { X, Printer, Download, ShoppingBag, CheckCircle, ShieldCheck } from 'lucide-react';

export default function InvoiceModal() {
  const { selectedInvoice, setSelectedInvoice, sellerSettings } = useStore();

  if (!selectedInvoice) return null;

  const order = selectedInvoice;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 relative my-6 print:m-0 print:shadow-none print:border-none print:rounded-none">
        
        {/* Action Header (hidden in print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-bold">Tax Invoice & Order Receipt</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={() => setSelectedInvoice(null)}
              className="p-1 text-gray-400 hover:text-white rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-6 sm:p-8 space-y-6 text-gray-900" id="printable-invoice">
          
          {/* Header & Seller Brand */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-5">
            <div>
              <ZoriqLogo size="sm" className="mb-2" />
              <p className="text-xs text-gray-500 mt-1">
                {sellerSettings.merchantName || 'ZORIQ Official'}<br />
                {sellerSettings.gstNumber ? `GSTIN: ${sellerSettings.gstNumber} • ` : ''}Support: {sellerSettings.contactEmail || 'help@zoriq.in'}<br />
                {sellerSettings.sellerUpiId ? <>UPI ID: <span className="font-mono font-medium">{sellerSettings.sellerUpiId}</span></> : null}
                {sellerSettings.bankAccountNumber ? (
                  <span> • Bank: {sellerSettings.bankName} (A/C: {sellerSettings.bankAccountNumber}, IFSC: {sellerSettings.bankIfsc})</span>
                ) : null}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 uppercase tracking-wider mb-1">
                TAX INVOICE
              </span>
              <p className="text-xs font-mono font-bold text-gray-800">
                Invoice #{order.id}
              </p>
              <p className="text-[11px] text-gray-500">
                Date: {new Date(order.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-200/80">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                Billed & Shipped To:
              </span>
              <p className="font-bold text-gray-900">{order.customer.name}</p>
              <p className="text-gray-600 mt-0.5">{order.customer.address}</p>
              <p className="text-gray-600">{order.customer.city}, {order.customer.state} - {order.customer.pincode}</p>
              <p className="text-gray-600 mt-1">Phone: +91 {order.customer.phone}</p>
              <p className="text-gray-600">Email: {order.customer.email}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                Payment & Order Info:
              </span>
              <div className="space-y-1">
                <p>
                  Payment Mode:{' '}
                  <strong className={`px-1.5 py-0.5 rounded text-[11px] ${
                    order.paymentMethod === 'RAZORPAY' || order.paymentMethod === 'UPI' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {order.paymentMethod === 'RAZORPAY' ? 'Razorpay (Cards/UPI/NetBanking)' : order.paymentMethod === 'UPI' ? 'UPI Online' : 'Cash on Delivery (COD)'}
                  </strong>
                </p>
                <p>
                  Payment Status:{' '}
                  <strong className={order.paymentStatus === 'Paid' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                    {order.paymentStatus}
                  </strong>
                </p>
                {order.razorpayPaymentId && (
                  <p className="font-mono text-[11px] text-gray-700">
                    Payment ID: {order.razorpayPaymentId}
                  </p>
                )}
                {order.upiTxnId && !order.razorpayPaymentId && (
                  <p className="font-mono text-[11px] text-gray-700">
                    UPI Ref: {order.upiTxnId}
                  </p>
                )}
                <p>
                  Tracking Number:{' '}
                  <span className="font-mono font-semibold text-indigo-700">{order.trackingNumber || 'NEX-839210'}</span>
                </p>
                <p>
                  Order Status:{' '}
                  <span className="font-bold text-gray-800 capitalize">{order.orderStatus}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-300 text-gray-500 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5">Item Description</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Unit Price</th>
                  <th className="py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-medium text-gray-900 pr-2">
                      {item.name}
                    </td>
                    <td className="py-3 text-center text-gray-600 font-semibold">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-right text-gray-600">
                      ₹{item.price?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right font-bold text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="border-t border-gray-200 pt-3 flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₹{order.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount ({order.couponApplied || 'PROMO'}):</span>
                  <span>-₹{order.discount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping & Handling:</span>
                <span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Integrated GST (18% included):</span>
                <span>₹{Math.round((order.total * 0.18) / 1.18).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm sm:text-base text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Amount:</span>
                <span className="text-indigo-600">₹{order.total?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="pt-4 border-t border-gray-200 text-[10px] text-gray-400 text-center space-y-1">
            <p>This is a computer-generated tax invoice and requires no physical signature.</p>
            <p>All items are quality inspected and dispatched directly by {sellerSettings.storeName}. For support, contact {sellerSettings.contactEmail}.</p>
          </div>

        </div>

      </div>
    </div>
  );
}
