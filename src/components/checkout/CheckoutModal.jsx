import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { createRazorpayServerOrder } from '../../services/supabase';
import confetti from 'canvas-confetti';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Banknote,
  ArrowRight,
  ArrowLeft,
  Check,
  RefreshCw,
  ExternalLink,
  CreditCard,
  Lock,
  Sparkles,
  Truck
} from 'lucide-react';

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    products,
    cartTotal,
    sellerSettings,
    placeOrder,
    setSelectedInvoice,
    addToast
  } = useStore();

  // Multi-step checkout: 1: Shipping, 2: Payment, 3: Confirmation
  const [step, setStep] = useState(1);

  // Check if COD is available
  const itemsWithoutCod = cart.filter((item) => {
    const prod = products.find((p) => p.id === item.id);
    return prod && prod.codAvailable === false;
  });
  const hasCodDisabledItems = itemsWithoutCod.length > 0;
  const isCodAvailableForOrder = sellerSettings.codEnabled && !hasCodDisabledItems;

  // Customer Shipping Details
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Payment Selection: 'RAZORPAY' | 'COD'
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');

  // Loading state during Razorpay checkout modal
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // COD Anti-bot Captcha
  const [captchaCode, setCaptchaCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  // Placed order reference for success confirmation screen
  const [placedOrder, setPlacedOrder] = useState(null);

  // Reset state when checkout opens
  useEffect(() => {
    if (isCheckoutOpen) {
      setStep(1);
      setPlacedOrder(null);
      setPaymentMethod('RAZORPAY');
      setIsProcessingPayment(false);
      setCaptchaCode(Math.floor(1000 + Math.random() * 9000).toString());
      setCaptchaInput('');
      setCaptchaError('');
      setFormErrors({});
    }
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  // Validate Step 1 Form
  const validateShippingForm = () => {
    const errors = {};
    if (!customer.name.trim()) errors.name = 'Full name is required';
    if (!customer.phone.trim() || customer.phone.length < 10) errors.phone = 'Valid 10-digit mobile number required';
    if (!customer.email.trim() || !customer.email.includes('@')) errors.email = 'Valid email is required';
    if (!customer.address.trim()) errors.address = 'Street address is required';
    if (!customer.city.trim()) errors.city = 'City is required';
    if (!customer.state.trim()) errors.state = 'State is required';
    if (!customer.pincode.trim() || customer.pincode.length < 6) errors.pincode = '6-digit pincode required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (validateShippingForm()) {
      setStep(2);
    }
  };

  // Razorpay Checkout Handler (Server Order Created with Current Key and Amount)
  const handleRazorpayPayment = async () => {
    setIsProcessingPayment(true);

    try {
      // 1. Create server-side order with recalculated totals and current key from DB
      const serverOrderData = await createRazorpayServerOrder(cart, customer, 0);
      const razorpayKeyId = serverOrderData.keyId || sellerSettings.razorpayKeyId || 'rzp_live_TstUZQzK6D5kHP';
      const amountPaise = serverOrderData.amount || Math.round(cartTotal * 100);
      const razorpayOrderId = serverOrderData.razorpayOrderId;

      const proceedWithRazorpay = () => {
        const options = {
          key: razorpayKeyId,
          amount: amountPaise,
          currency: 'INR',
          name: sellerSettings.storeName || 'ZORIQ',
          description: `Order (${cart.length} item${cart.length > 1 ? 's' : ''})`,
          image: sellerSettings.logoUrl || '/zoriq-logo.jpg',
          ...(razorpayOrderId ? { order_id: razorpayOrderId } : {}),
          prefill: {
            name: customer.name,
            email: customer.email,
            contact: customer.phone,
          },
          notes: {
            address: `${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}`,
          },
          theme: {
            color: '#4F46E5', // Indigo
          },
          handler: async function (response) {
            setIsProcessingPayment(true);
            try {
              const order = await placeOrder({
                customer,
                paymentMethod: 'RAZORPAY',
                paymentDetails: {
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id || razorpayOrderId || null,
                  razorpaySignature: response.razorpay_signature || null,
                  upiTxnId: response.razorpay_payment_id,
                },
              });

              setPlacedOrder(order);
              setStep(3);

              try {
                confetti({
                  particleCount: 120,
                  spread: 80,
                  origin: { y: 0.6 },
                });
              } catch {
                // ignore
              }
            } catch (err) {
              console.error('Order placement failed:', err);
              alert(`Payment was captured, but saving order to store database failed: ${err.message}. Please contact support with Payment ID: ${response.razorpay_payment_id}`);
            } finally {
              setIsProcessingPayment(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false);
              if (addToast) {
                addToast('Payment was cancelled. You can try again anytime.', 'info');
              }
            },
          },
        };

        try {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response) {
            setIsProcessingPayment(false);
            alert(
              `Razorpay Payment Failed: ${
                response.error?.description || 'Transaction was declined.'
              }`
            );
          });
          rzp.open();
        } catch (err) {
          setIsProcessingPayment(false);
          console.error('Razorpay execution error:', err);
          alert(
            'Could not launch Razorpay. Please check your internet connection or verify your Razorpay Key ID: ' +
              err.message
          );
        }
      };

      if (window.Razorpay) {
        proceedWithRazorpay();
      } else {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => proceedWithRazorpay();
        script.onerror = () => {
          setIsProcessingPayment(false);
          alert('Could not load Razorpay SDK. Please check your internet connection.');
        };
        document.body.appendChild(script);
      }
    } catch (err) {
      setIsProcessingPayment(false);
      console.error('Razorpay initialization error:', err);
      alert(err.message || 'Could not initiate Razorpay checkout.');
    }
  };

  // COD Order Confirmation Handler
  const handleCodPayment = async (e) => {
    e.preventDefault();
    if (captchaInput.trim() !== captchaCode) {
      setCaptchaError('Incorrect anti-bot security code. Please try again.');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const order = await placeOrder({
        customer,
        paymentMethod: 'COD',
        paymentDetails: {}
      });

      setPlacedOrder(order);
      setStep(3);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('COD order creation error:', err);
      setCaptchaError('Failed to place order: ' + err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base leading-tight">
                {step === 1 && 'Secure Checkout — Shipping Details'}
                {step === 2 && 'Complete Payment (Razorpay & COD)'}
                {step === 3 && 'Order Placed Successfully!'}
              </h2>
              <p className="text-[11px] text-gray-300">
                {step === 1 && 'Step 1 of 2: Enter your delivery address'}
                {step === 2 && 'Step 2 of 2: Instant bank verification'}
                {step === 3 && 'Tax Invoice generated & receipt emailed'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: Shipping Address Form */}
        {step === 1 && (
          <form onSubmit={handleProceedToPayment} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            
            {/* Cart Quick Summary Banner */}
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-indigo-950">
                  {cart.length} item{cart.length > 1 ? 's' : ''} in cart
                </span>
              </div>
              <span className="font-bold text-sm text-indigo-900">
                Total: ₹{cartTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className={`w-full px-3 py-2.5 rounded-xl border ${
                    formErrors.name ? 'border-rose-400 bg-rose-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                />
                {formErrors.name && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Mobile Number (10 digits) *
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="e.g. 9876543210"
                  className={`w-full px-3 py-2.5 rounded-xl border ${
                    formErrors.phone ? 'border-rose-400 bg-rose-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                />
                {formErrors.phone && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.phone}</p>}
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  placeholder="e.g. rahul@example.com"
                  className={`w-full px-3 py-2.5 rounded-xl border ${
                    formErrors.email ? 'border-rose-400 bg-rose-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                />
                {formErrors.email && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.email}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">
                  Delivery Address (Flat / House No / Street) *
                </label>
                <textarea
                  rows={2}
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  placeholder="e.g. Flat 402, Royal Palms, Green Glen Layout"
                  className={`w-full px-3 py-2 rounded-xl border ${
                    formErrors.address ? 'border-rose-400 bg-rose-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none`}
                />
                {formErrors.address && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.address}</p>}
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={customer.city}
                  onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                  placeholder="e.g. Bengaluru"
                  className={`w-full px-3 py-2.5 rounded-xl border ${
                    formErrors.city ? 'border-rose-400 bg-rose-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                />
                {formErrors.city && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.city}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={customer.state}
                    onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                    placeholder="Karnataka"
                    className={`w-full px-3 py-2.5 rounded-xl border ${
                      formErrors.state ? 'border-rose-400 bg-rose-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  />
                  {formErrors.state && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.state}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={customer.pincode}
                    onChange={(e) => setCustomer({ ...customer, pincode: e.target.value.replace(/\D/g, '') })}
                    placeholder="560103"
                    className={`w-full px-3 py-2.5 rounded-xl border ${
                      formErrors.pincode ? 'border-rose-400 bg-rose-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono`}
                  />
                  {formErrors.pincode && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.pincode}</p>}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                256-bit SSL encrypted
              </span>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all active:scale-95"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

        {/* STEP 2: Payment Selection (Razorpay & COD only) */}
        {step === 2 && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            
            {/* Amount Banner */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs text-indigo-200 block">Deliver to: {customer.name}</span>
                <span className="text-xs text-gray-300 font-mono">{customer.phone} • {customer.city}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-indigo-300 block">Amount Payable:</span>
                <span className="text-lg font-bold text-amber-300">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Select Payment Method:
              </label>

              {/* Option 1: Razorpay (Primary) */}
              <div
                onClick={() => setPaymentMethod('RAZORPAY')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-gray-900">
                          Razorpay Online Payment
                        </h3>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Auto Verified
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        Google Pay, PhonePe, Paytm, Any UPI, Credit/Debit Cards, NetBanking & Wallets
                      </p>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                    paymentMethod === 'RAZORPAY' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'RAZORPAY' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                {/* Badges for supported modes */}
                <div className="mt-3 pt-3 border-t border-indigo-100 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-gray-600">
                  <span className="px-2 py-0.5 bg-white border border-gray-200 rounded-md font-semibold text-blue-600">Google Pay</span>
                  <span className="px-2 py-0.5 bg-white border border-gray-200 rounded-md font-semibold text-purple-600">PhonePe</span>
                  <span className="px-2 py-0.5 bg-white border border-gray-200 rounded-md font-semibold text-sky-600">Paytm</span>
                  <span className="px-2 py-0.5 bg-white border border-gray-200 rounded-md font-semibold text-slate-800">Cards</span>
                  <span className="px-2 py-0.5 bg-white border border-gray-200 rounded-md font-semibold text-emerald-700">NetBanking</span>
                </div>
              </div>

              {/* Option 2: Cash on Delivery */}
              {isCodAvailableForOrder && (
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    paymentMethod === 'COD'
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-gray-900">
                            Cash on Delivery (COD)
                          </h3>
                          {sellerSettings.codFee > 0 && (
                            <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full">
                              +₹{sellerSettings.codFee} handling
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          Pay cash or UPI to delivery agent when package arrives at your doorstep
                        </p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                      paymentMethod === 'COD' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'COD' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Razorpay Action Screen */}
            {paymentMethod === 'RAZORPAY' && (
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs text-indigo-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    <strong>100% Bank Protected:</strong> Your order is automatically verified and confirmed the instant your bank authorizes the payment.
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleRazorpayPayment}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Opening Razorpay Secure Checkout...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Pay ₹{cartTotal.toLocaleString('en-IN')} with Razorpay</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* COD Action Screen with Captcha */}
            {paymentMethod === 'COD' && isCodAvailableForOrder && (
              <form onSubmit={handleCodPayment} className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Anti-Bot Security Code Verification *
                  </label>
                  <p className="text-[11px] text-gray-500 mb-2">
                    Enter the 4 digits below to confirm you are human and place your cash on delivery order:
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-slate-900 text-amber-300 font-mono text-base font-bold tracking-widest rounded-xl select-none">
                      {captchaCode}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCaptchaCode(Math.floor(1000 + Math.random() * 9000).toString())}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="New code"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      maxLength={4}
                      value={captchaInput}
                      onChange={(e) => {
                        setCaptchaInput(e.target.value);
                        setCaptchaError('');
                      }}
                      placeholder="Enter 4 digits"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono text-sm font-bold text-center tracking-widest"
                      required
                    />
                  </div>
                  {captchaError && <p className="text-[11px] text-rose-500 mt-1">{captchaError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Confirming Cash on Delivery Order...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirm Cash on Delivery Order</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Navigation Buttons */}
            <div className="pt-2 flex items-center justify-between border-t border-gray-100 text-xs">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 font-semibold py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Address</span>
              </button>

              <span className="text-[11px] text-gray-400">
                Payment processed by Razorpay PCI-DSS certified gateway
              </span>
            </div>

          </div>
        )}

        {/* STEP 3: Order Confirmation */}
        {step === 3 && placedOrder && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-center animate-in zoom-in-95 duration-200">
            
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Thank You for Your Order!
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Order ID: <span className="font-mono font-bold text-indigo-900">{placedOrder.id}</span>
              </p>
            </div>

            {/* Status Card */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-500">Payment Status:</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-full ${
                  placedOrder.paymentStatus === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900'
                }`}>
                  {placedOrder.paymentStatus === 'Paid' ? '✓ Paid via Razorpay' : 'Cash on Delivery (Pending)'}
                </span>
              </div>

              {placedOrder.razorpayPaymentId && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Razorpay Payment ID:</span>
                  <span className="font-mono font-bold text-blue-900">{placedOrder.razorpayPaymentId}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Deliver To:</span>
                <span className="font-semibold text-gray-800">{placedOrder.customer.name}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Address:</span>
                <span className="text-gray-700 truncate max-w-xs">{placedOrder.customer.address}, {placedOrder.customer.city}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-200 font-bold text-sm">
                <span>Total Amount:</span>
                <span className="text-indigo-600">₹{placedOrder.total?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedInvoice(placedOrder);
                  setIsCheckoutOpen(false);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View / Print Tax Invoice</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-colors"
              >
                Continue Shopping
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}