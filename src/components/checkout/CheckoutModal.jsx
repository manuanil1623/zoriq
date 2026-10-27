import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  Smartphone,
  Banknote,
  ArrowRight,
  ArrowLeft,
  Clock,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    products,
    cartSubtotal,
    discountAmount,
    shippingFee,
    cartTotal,
    sellerSettings,
    placeOrder,
    setSelectedInvoice,
    setRole,
    setSellerActiveTab,
    coupon
  } = useStore();

  // Multi-step checkout: 1: Shipping, 2: Payment Gateway, 3: Success Confirmation
  const [step, setStep] = useState(1);

  // Check if any item in cart has COD disabled by the owner
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

  // Payment Selection: 'UPI' | 'COD'
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // UPI sub-mode: 'qr' | 'intent' | 'vpa'
  const [upiSubMode, setUpiSubMode] = useState('qr');
  const [upiVpaInput, setUpiVpaInput] = useState('');
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // COD Anti-bot Captcha
  const [captchaCode, setCaptchaCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  // UPI Expiry Countdown Timer (5 minutes = 300 seconds)
  const [timeLeft, setTimeLeft] = useState(300);

  // Placed order reference for success screen
  const [placedOrder, setPlacedOrder] = useState(null);

  // Reset state when checkout opens
  useEffect(() => {
    if (isCheckoutOpen) {
      setStep(1);
      setPlacedOrder(null);
      setTimeLeft(300);
      setCaptchaCode(Math.floor(1000 + Math.random() * 9000).toString());
      setCaptchaInput('');
    }
  }, [isCheckoutOpen]);

  // Countdown timer for UPI session
  useEffect(() => {
    if (step === 2 && paymentMethod === 'UPI' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, paymentMethod, timeLeft]);

  if (!isCheckoutOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Standard UPI deep link specification
  const upiDeepLink = `upi://pay?pa=${sellerSettings.sellerUpiId}&pn=${encodeURIComponent(
    sellerSettings.merchantName || 'ZORIQ Store'
  )}&am=${cartTotal}&cu=INR&tn=ZORIQ_Order_${Date.now()}`;

  // Validate Step 1 Form
  const validateShippingForm = () => {
    const errors = {};
    if (!customer.name.trim()) errors.name = 'Full name is required';
    if (!customer.phone.trim() || customer.phone.length < 10) errors.phone = 'Valid 10-digit mobile number required';
    if (!customer.email.trim() || !customer.email.includes('@')) errors.email = 'Valid email is required';
    if (!customer.address.trim()) errors.address = 'Street address is required';
    if (!customer.city.trim()) errors.city = 'City is required';
    if (!customer.state.trim()) errors.state = 'State is required';
    if (!customer.pincode.trim() || customer.pincode.length < 6) errors.pincode = 'Valid 6-digit PIN code required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (validateShippingForm()) {
      setStep(2);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(sellerSettings.sellerUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // Complete Payment Action
  const handleCompleteOrder = (forcedMethod) => {
    const activeMethod = forcedMethod || paymentMethod;

    if (activeMethod === 'COD') {
      if (captchaInput !== captchaCode) {
        setCaptchaError('Security code does not match. Please re-enter.');
        return;
      }
    }

    const upiTxnId = `UPI/${new Date().getFullYear()}/${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    const order = placeOrder({
      customer,
      paymentMethod: activeMethod,
      paymentDetails: {
        upiTxnId: activeMethod === 'UPI' ? upiTxnId : null,
        upiVpa: activeMethod === 'UPI' ? (upiVpaInput || 'customer@upi') : null,
      }
    });

    setPlacedOrder(order);
    setStep(3);

    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore in environments without canvas
    }
  };

  // Launching or Simulating UPI App
  const handleLaunchUpiApp = (appName, scheme) => {
    setIsVerifyingUpi(true);

    const note = `ZORIQ_Order_${Date.now()}`;
    const encodedMerchant = encodeURIComponent(sellerSettings.merchantName || 'ZORIQ Store');
    const upiId = sellerSettings.sellerUpiId || 'store@upi';

    // Construct app-specific deep link URI schemes
    let deepLink = `upi://pay?pa=${upiId}&pn=${encodedMerchant}&am=${cartTotal}&cu=INR&tn=${note}`;
    if (scheme === 'gpay') {
      deepLink = `tez://upi/pay?pa=${upiId}&pn=${encodedMerchant}&am=${cartTotal}&cu=INR&tn=${note}`;
    } else if (scheme === 'phonepe') {
      deepLink = `phonepe://pay?pa=${upiId}&pn=${encodedMerchant}&am=${cartTotal}&cu=INR&tn=${note}`;
    } else if (scheme === 'paytm') {
      deepLink = `paytmmp://pay?pa=${upiId}&pn=${encodedMerchant}&am=${cartTotal}&cu=INR&tn=${note}`;
    }

    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    if (isMobile) {
      // On mobile devices, redirect directly into the installed UPI app!
      window.location.href = deepLink;

      // Fallback to universal upi:// if specific app is not installed
      setTimeout(() => {
        window.location.href = `upi://pay?pa=${upiId}&pn=${encodedMerchant}&am=${cartTotal}&cu=INR&tn=${note}`;
      }, 1500);
    }

    // Auto-advance after verification
    setTimeout(() => {
      setIsVerifyingUpi(false);
      handleCompleteOrder('UPI');
    }, isMobile ? 3500 : 2200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 relative my-6">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/30 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {step === 1 && 'Step 1 of 2: Shipping Address'}
                {step === 2 && 'Step 2 of 2: Secure Payment Gateway'}
                {step === 3 && 'Order Placed Successfully!'}
              </h2>
              <p className="text-xs text-indigo-200">
                {step === 1 && 'Where should we deliver your order?'}
                {step === 2 && 'Choose between UPI Instant Payment or Cash on Delivery'}
                {step === 3 && 'Thank you for shopping with ZORIQ'}
              </p>
            </div>
          </div>

          {step !== 3 && (
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="p-1.5 text-gray-400 hover:text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* --- STEP 1: SHIPPING ADDRESS FORM --- */}
        {step === 1 && (
          <form onSubmit={handleProceedToPayment} className="p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className={`w-full px-3 py-2 text-xs bg-gray-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    formErrors.name ? 'border-rose-400' : 'border-gray-200'
                  }`}
                  placeholder="e.g. Rohit Sharma"
                />
                {formErrors.name && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mobile Number (10 Digits) *
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, '') })}
                  className={`w-full px-3 py-2 text-xs bg-gray-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    formErrors.phone ? 'border-rose-400' : 'border-gray-200'
                  }`}
                  placeholder="e.g. 9876543210"
                />
                {formErrors.phone && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.phone}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address (for invoice & tracking updates) *
                </label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className={`w-full px-3 py-2 text-xs bg-gray-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    formErrors.email ? 'border-rose-400' : 'border-gray-200'
                  }`}
                  placeholder="e.g. rohit.sharma@example.com"
                />
                {formErrors.email && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.email}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Delivery Street Address / Flat / Floor *
                </label>
                <input
                  type="text"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  className={`w-full px-3 py-2 text-xs bg-gray-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    formErrors.address ? 'border-rose-400' : 'border-gray-200'
                  }`}
                  placeholder="House/Flat number, Building name, Street"
                />
                {formErrors.address && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.address}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={customer.city}
                  onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                  className={`w-full px-3 py-2 text-xs bg-gray-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    formErrors.city ? 'border-rose-400' : 'border-gray-200'
                  }`}
                  placeholder="e.g. Mumbai"
                />
                {formErrors.city && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.city}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={customer.state}
                    onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                    className={`w-full px-3 py-2 text-xs bg-gray-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      formErrors.state ? 'border-rose-400' : 'border-gray-200'
                    }`}
                    placeholder="e.g. Maharashtra"
                  />
                  {formErrors.state && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.state}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={customer.pincode}
                    onChange={(e) => setCustomer({ ...customer, pincode: e.target.value.replace(/\D/g, '') })}
                    className={`w-full px-3 py-2 text-xs bg-gray-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      formErrors.pincode ? 'border-rose-400' : 'border-gray-200'
                    }`}
                    placeholder="e.g. 400001"
                  />
                  {formErrors.pincode && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.pincode}</p>}
                </div>
              </div>

            </div>

            {/* Cart Mini Summary */}
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-500">Order Total ({cart.length} items):</span>
                <span className="font-extrabold text-gray-900 text-sm ml-2">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                {shippingFee === 0 ? 'FREE Shipping' : `Shipping: ₹${shippingFee}`}
              </span>
            </div>

            {/* Next Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Continue to Payment Method</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* --- STEP 2: PAYMENT GATEWAY (UPI & COD) --- */}
        {step === 2 && (
          <div className="p-5 sm:p-6 space-y-5">
            
            {/* Amount & Timer Banner */}
            <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total Payable Amount</span>
                <span className="text-xl font-extrabold text-amber-300">
                  ₹{cartTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {paymentMethod === 'UPI' && (
                <div className="flex items-center gap-1.5 text-xs bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>Session: <strong className="text-amber-300 font-mono">{formattedTime}</strong></span>
                </div>
              )}
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* Option A: UPI */}
              <div
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-gray-900">UPI Instant</span>
                  </div>
                  <span className="bg-emerald-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                    FASTEST
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  Scan QR or Pay with Google Pay, PhonePe, Paytm, BHIM. Zero extra fee.
                </p>
              </div>

              {/* Option B: COD */}
              <div
                onClick={() => {
                  if (isCodAvailableForOrder) {
                    setPaymentMethod('COD');
                  }
                }}
                className={`p-3.5 rounded-2xl border-2 transition-all ${
                  !isCodAvailableForOrder
                    ? 'opacity-60 cursor-not-allowed bg-gray-100 border-gray-200'
                    : paymentMethod === 'COD'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20 cursor-pointer'
                    : 'border-gray-200 hover:border-gray-300 bg-white cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg text-white flex items-center justify-center ${
                      isCodAvailableForOrder ? 'bg-emerald-600' : 'bg-gray-400'
                    }`}>
                      <Banknote className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-gray-900">Cash on Delivery</span>
                  </div>
                  {sellerSettings.codFee > 0 && isCodAvailableForOrder && (
                    <span className="text-[10px] text-gray-500">+₹{sellerSettings.codFee}</span>
                  )}
                  {hasCodDisabledItems && (
                    <span className="text-[9px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">
                      Prepaid Only
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  {!sellerSettings.codEnabled
                    ? 'COD is currently disabled in store settings.'
                    : hasCodDisabledItems
                    ? `Not available: "${itemsWithoutCod[0].name.slice(0, 22)}..." requires online UPI payment.`
                    : 'Pay with cash or UPI to delivery person upon arrival.'}
                </p>
              </div>

            </div>

            {/* --- DETAILED VIEW FOR UPI --- */}
            {paymentMethod === 'UPI' && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 space-y-4 animate-in fade-in">
                
                {/* UPI Submode Toggles: QR Code vs Apps Intent vs UPI ID vs Bank Account */}
                <div className="flex rounded-xl bg-gray-200/70 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setUpiSubMode('qr')}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                      upiSubMode === 'qr' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Scan QR Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiSubMode('intent')}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                      upiSubMode === 'intent' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    UPI Apps
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiSubMode('vpa')}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                      upiSubMode === 'vpa' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    UPI ID (VPA)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiSubMode('bank')}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                      upiSubMode === 'bank' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Bank Transfer
                  </button>
                </div>

                {/* Submode 1: Real Dynamic QR Code */}
                {upiSubMode === 'qr' && (
                  <div className="flex flex-col sm:flex-row items-center gap-6 justify-center bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="p-3 bg-white border border-gray-200 rounded-2xl shadow-inner flex flex-col items-center">
                      <QRCodeSVG
                        value={upiDeepLink}
                        size={160}
                        level="H"
                        includeMargin={false}
                        imageSettings={{
                          src: "https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg",
                          x: undefined,
                          y: undefined,
                          height: 24,
                          width: 24,
                          excavate: true,
                        }}
                      />
                      <span className="text-[10px] text-gray-400 font-semibold mt-2">
                        Scan with any UPI Scanner
                      </span>
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg w-fit">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Accepted by all UPI Apps</span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-800">
                        Scan & Pay ₹{cartTotal.toLocaleString('en-IN')}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Open Google Pay, PhonePe, Paytm, BHIM, or any banking app on your mobile to scan.
                      </p>

                      {/* Merchant UPI ID display with Copy button */}
                      <div className="pt-1">
                        <span className="text-[10px] text-gray-400 block mb-0.5">Payee UPI VPA:</span>
                        <div className="inline-flex items-center gap-2 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-mono">
                          <span className="font-semibold text-gray-700">{sellerSettings.sellerUpiId}</span>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="text-indigo-600 hover:text-indigo-800"
                            title="Copy UPI ID"
                          >
                            {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submode 2: Direct UPI App Deep-Links */}
                {upiSubMode === 'intent' && (
                  <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-700 font-bold">
                        Tap an icon to pay via installed mobile UPI app:
                      </p>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                        1-Click Redirection
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        {
                          id: 'gpay',
                          name: 'Google Pay',
                          scheme: 'gpay',
                          bg: 'bg-white hover:bg-blue-50/60 border-blue-200 text-blue-900',
                          badge: 'Tez Intent',
                          icon: (
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-xs">
                              <span className="font-bold text-xs bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
                                GPay
                              </span>
                            </div>
                          )
                        },
                        {
                          id: 'phonepe',
                          name: 'PhonePe',
                          scheme: 'phonepe',
                          bg: 'bg-purple-50/60 hover:bg-purple-100/70 border-purple-200 text-purple-900',
                          badge: 'Direct Launch',
                          icon: (
                            <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                              पे
                            </div>
                          )
                        },
                        {
                          id: 'paytm',
                          name: 'Paytm UPI',
                          scheme: 'paytm',
                          bg: 'bg-sky-50/60 hover:bg-sky-100/70 border-sky-200 text-sky-900',
                          badge: 'Instant Pay',
                          icon: (
                            <div className="w-8 h-8 rounded-full bg-[#002e6e] text-sky-300 flex items-center justify-center font-bold text-xs shadow-xs">
                              Paytm
                            </div>
                          )
                        },
                        {
                          id: 'bhim',
                          name: 'BHIM / Any UPI',
                          scheme: 'universal',
                          bg: 'bg-emerald-50/60 hover:bg-emerald-100/70 border-emerald-200 text-emerald-900',
                          badge: 'Universal',
                          icon: (
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                              UPI
                            </div>
                          )
                        },
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          disabled={isVerifyingUpi}
                          onClick={() => handleLaunchUpiApp(app.name, app.scheme)}
                          className={`p-3 rounded-xl border text-center transition-all shadow-xs active:scale-95 flex flex-col items-center justify-center gap-1.5 ${app.bg}`}
                        >
                          {app.icon}
                          <span className="text-xs font-bold leading-tight">{app.name}</span>
                          <span className="text-[10px] text-gray-500 font-semibold">Pay ₹{cartTotal}</span>
                          <span className="text-[9px] text-gray-400 font-medium">{app.badge}</span>
                        </button>
                      ))}
                    </div>

                    <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Mobile redirection:</strong> On smartphones, tapping an icon triggers the native deep-link (<code>phonepe://</code> or <code>tez://</code>) to open the app with payment amount prefilled. On desktop computers, scanning the QR code tab is recommended.
                      </div>
                    </div>

                    {isVerifyingUpi && (
                      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-center gap-2 text-indigo-700 text-xs font-semibold animate-pulse">
                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                        <span>Awaiting UPI authorization response from bank app...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Submode 3: Enter UPI ID manually */}
                {upiSubMode === 'vpa' && (
                  <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                    <label className="block text-xs font-semibold text-gray-700">
                      Enter your Virtual Payment Address (UPI ID)
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={upiVpaInput}
                          onChange={(e) => setUpiVpaInput(e.target.value)}
                          placeholder="e.g. mobile@okhdfcbank or name@paytm"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!upiVpaInput) {
                            setUpiVpaInput('user@oksbi');
                          }
                          handleLaunchUpiApp('UPI VPA', 'universal');
                        }}
                        disabled={isVerifyingUpi}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        {isVerifyingUpi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                        <span>Verify & Pay</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                      <span>Supported handles: @okhdfcbank, @oksbi, @okicici, @paytm, @ybl</span>
                    </div>
                  </div>
                )}

                {/* Submode 4: Direct Bank Account Transfer (IMPS/NEFT) */}
                {upiSubMode === 'bank' && (
                  <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">
                        Direct Bank Transfer (IMPS / NEFT / RTGS)
                      </span>
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 font-bold px-2 py-0.5 rounded">
                        Pay ₹{cartTotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-gray-500">Bank Name:</span>
                        <span className="font-bold text-gray-800">{sellerSettings.bankName || 'State Bank of India'}</span>
                      </div>
                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-gray-500">Account Holder:</span>
                        <span className="font-bold text-gray-800">{sellerSettings.accountHolderName || sellerSettings.merchantName}</span>
                      </div>
                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-gray-500">Account Number:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-indigo-900">
                            {sellerSettings.bankAccountNumber || '389201928301'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(sellerSettings.bankAccountNumber || '389201928301');
                              setCopiedUpi(true);
                              setTimeout(() => setCopiedUpi(false), 2000);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 p-0.5"
                            title="Copy Account Number"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">IFSC Code:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-indigo-900">
                            {sellerSettings.bankIfsc || 'SBIN0001234'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(sellerSettings.bankIfsc || 'SBIN0001234');
                              setCopiedUpi(true);
                              setTimeout(() => setCopiedUpi(false), 2000);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 p-0.5"
                            title="Copy IFSC Code"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500">
                      Transfer exact amount using your mobile banking app. Click below once transferred.
                    </p>
                  </div>
                )}

                {/* Confirm Button for QR or Bank mode */}
                {(upiSubMode === 'qr' || upiSubMode === 'bank') && (
                  <button
                    type="button"
                    onClick={() => handleCompleteOrder('UPI')}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>I have completed the payment (Confirm Order)</span>
                  </button>
                )}

              </div>
            )}

            {/* --- DETAILED VIEW FOR CASH ON DELIVERY --- */}
            {paymentMethod === 'COD' && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 space-y-4 animate-in fade-in">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-amber-700" />
                    <span>Cash on Delivery Verification</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Pay <strong>₹{cartTotal.toLocaleString('en-IN')}</strong> in cash or scan the delivery agent's UPI code when package arrives at your address.
                  </p>
                </div>

                {/* Security Anti-Bot Captcha */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                  <label className="block text-xs font-semibold text-gray-700">
                    Enter Anti-Bot Security Code to confirm this COD order:
                  </label>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-900 text-amber-300 font-mono tracking-widest text-lg font-extrabold px-4 py-2 rounded-xl select-none shadow-inner border border-slate-700">
                      {captchaCode}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCaptchaCode(Math.floor(1000 + Math.random() * 9000).toString());
                        setCaptchaError('');
                      }}
                      className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Refresh code"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                      <input
                        type="text"
                        maxLength={4}
                        value={captchaInput}
                        onChange={(e) => {
                          setCaptchaInput(e.target.value);
                          setCaptchaError('');
                        }}
                        placeholder="Enter 4-digits"
                        className="w-full px-3 py-2 text-xs font-mono bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {captchaError && (
                    <p className="text-xs text-rose-500 font-semibold">{captchaError}</p>
                  )}
                </div>

                {/* Confirm COD Order Button */}
                <button
                  type="button"
                  onClick={() => handleCompleteOrder('COD')}
                  className="w-full py-3 px-4 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Confirm Cash on Delivery Order (₹{cartTotal.toLocaleString('en-IN')})</span>
                </button>
              </div>
            )}

            {/* Back to Shipping button */}
            <div className="pt-2 flex justify-start">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 font-medium py-1 px-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Shipping Address</span>
              </button>
            </div>

          </div>
        )}

        {/* --- STEP 3: ORDER CONFIRMED SUCCESS SCREEN --- */}
        {step === 3 && placedOrder && (
          <div className="p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95">
            
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 mb-2">
                Order Confirmed & Placed
              </span>
              <h3 className="text-2xl font-extrabold text-gray-900">
                Thank You, {placedOrder.customer.name}!
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Your order <strong className="text-gray-800">{placedOrder.id}</strong> has been received by {sellerSettings.storeName}.
              </p>
            </div>

            {/* Order Details Summary Box */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-500">Payment Status:</span>
                <span className={`font-bold px-2 py-0.5 rounded-full ${
                  placedOrder.paymentMethod === 'UPI'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {placedOrder.paymentMethod === 'UPI' ? 'Paid via UPI' : 'Cash on Delivery (Pending)'}
                </span>
              </div>

              {placedOrder.upiTxnId && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">UPI Ref / UTR:</span>
                  <span className="font-mono text-gray-700">{placedOrder.upiTxnId}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Estimated Delivery:</span>
                <span className="font-semibold text-gray-800">Within 3-4 Business Days</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Delivery Address:</span>
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
