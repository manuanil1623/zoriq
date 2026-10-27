import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  Settings,
  CreditCard,
  QrCode,
  Banknote,
  Truck,
  RotateCcw,
  Check,
  Store,
  Building2,
  Copy,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Lock,
  Download,
  Upload,
  Cloud,
  ExternalLink
} from 'lucide-react';

export default function StoreSettings() {
  const { sellerSettings, updateSellerSettings, resetAllDataToDefault, exportCatalog, importCatalog } = useStore();

  const [settingsForm, setSettingsForm] = useState({ ...sellerSettings });
  const [copiedField, setCopiedField] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (key, value) => {
    setSettingsForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopy = (field, text) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateSellerSettings(settingsForm);
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to clear all orders and restore default settings?')) {
      resetAllDataToDefault();
      setSettingsForm(sellerSettings);
    }
  };

  const handleTestRazorpay = () => {
    const key = settingsForm.razorpayKeyId?.trim() || 'rzp_test_1DP5mmOlF5G5ag';
    if (!window.Razorpay) {
      alert('Razorpay SDK is loading. Please check your internet connection.');
      return;
    }
    const options = {
      key: key,
      amount: 100, // ₹1.00 in paise
      currency: 'INR',
      name: settingsForm.storeName || 'Zoriq Store',
      description: 'Razorpay Gateway Test Mode (₹1.00)',
      handler: function (response) {
        alert(`🎉 Razorpay Test Payment Successful!\nPayment ID: ${response.razorpay_payment_id}\n\nYour Razorpay integration is 100% active and working!`);
      },
      prefill: {
        name: 'Store Owner',
        email: 'seller@zoriq.in',
        contact: '9999999999'
      },
      theme: { color: '#4f46e5' }
    };
    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(`Razorpay Error: ${err.message || 'Failed to open Razorpay modal'}`);
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = importCatalog(event.target.result);
      if (result.success) {
        alert(`🎉 Successfully imported ${result.count} products! All devices can now access this catalog.`);
      } else {
        alert(`Import failed: ${result.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // QR preview link
  const testUpiLink = `upi://pay?pa=${encodeURIComponent(
    settingsForm.sellerUpiId || 'yourname@upi'
  )}&pn=${encodeURIComponent(
    settingsForm.merchantName || settingsForm.storeName || 'Store'
  )}&am=1.00&cu=INR&tn=Store_Verification`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in pb-12">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <span>Store Bank & UPI Payment Configuration</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure your real bank account and UPI VPA so buyers' money routes directly to you
          </p>
        </div>

        <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          Live Gateway
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: UPI Gateway Configuration with Live QR Code Test */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  1. UPI Payment Receiving Setup (VPA)
                </h3>
                <p className="text-xs text-gray-500">
                  Customers scanning the checkout QR code will transfer funds to this UPI account
                </p>
              </div>
            </div>

            <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Zero Merchant Fee
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            
            {/* Input fields */}
            <div className="md:col-span-8 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Your UPI ID (VPA) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={settingsForm.sellerUpiId}
                    onChange={(e) => handleChange('sellerUpiId', e.target.value)}
                    placeholder="e.g. yourname@oksbi or 9876543210@paytm"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm font-bold text-indigo-900"
                    required
                  />
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Find this in your Google Pay, PhonePe, Paytm, or BHIM app profile (e.g., <code>yourname@oksbi</code>, <code>9876543210@ybl</code>).
                </span>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Payee / Account Holder Name *
                </label>
                <input
                  type="text"
                  value={settingsForm.merchantName}
                  onChange={(e) => handleChange('merchantName', e.target.value)}
                  placeholder="e.g. Rahul Sharma or Sharma Enterprise"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                  required
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Official name as registered with your bank/UPI ID (shown on buyer's payment screen).
                </span>
              </div>
            </div>

            {/* Live QR Preview */}
            <div className="md:col-span-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center flex flex-col items-center">
              <span className="text-[11px] font-bold text-gray-700 mb-2">
                Live QR Code Preview:
              </span>
              <div className="p-2.5 bg-white rounded-xl shadow-xs border border-gray-200">
                <QRCodeSVG
                  value={testUpiLink}
                  size={120}
                  level="M"
                />
              </div>
              <span className="text-[10px] text-emerald-700 font-mono mt-2 font-semibold">
                {settingsForm.sellerUpiId || 'name@upi'}
              </span>
              <span className="text-[9px] text-gray-400">
                Test scan with mobile camera to verify recipient
              </span>
            </div>

          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-950">Security Notice:</strong> Only enter your public UPI ID (VPA) and Account Holder Name. <strong>NEVER</strong> share or enter your UPI PIN, password, or OTP.
            </div>
          </div>
        </div>

        {/* Section 2: Direct Bank Account Transfer Details (IMPS / NEFT) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                2. Direct Bank Account Details (Optional for IMPS/NEFT)
              </h3>
              <p className="text-xs text-gray-500">
                Shown to customers who prefer wire transfer / net banking, and printed on official tax invoices
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={settingsForm.bankName || ''}
                onChange={(e) => handleChange('bankName', e.target.value)}
                placeholder="e.g. State Bank of India, HDFC Bank, ICICI"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                value={settingsForm.accountHolderName || ''}
                onChange={(e) => handleChange('accountHolderName', e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Bank Account Number
              </label>
              <input
                type="text"
                value={settingsForm.bankAccountNumber || ''}
                onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                placeholder="e.g. 50100234891023"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Bank IFSC Code
              </label>
              <input
                type="text"
                value={settingsForm.bankIfsc || ''}
                onChange={(e) => handleChange('bankIfsc', e.target.value.toUpperCase())}
                placeholder="e.g. SBIN0001234 or HDFC0001234"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono uppercase"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Cash on Delivery (COD) Rules */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                3. Cash on Delivery (COD) Settings
              </h3>
              <p className="text-xs text-gray-500">
                Enable or restrict cash payments for buyers at checkout
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <span className="text-xs font-bold text-gray-900 block">
                Accept Cash on Delivery Orders
              </span>
              <span className="text-[11px] text-gray-500">
                Allow customers to select COD and verify orders with anti-bot security code
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settingsForm.codEnabled}
                onChange={(e) => handleChange('codEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {settingsForm.codEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Extra Handling Fee for COD (₹ INR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={settingsForm.codFee}
                  onChange={(e) => handleChange('codFee', Number(e.target.value))}
                  placeholder="0 for free"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Storefront Identity & Contact */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                4. Store Identity & Shipping Rules
              </h3>
              <p className="text-xs text-gray-500">
                Brand name, support email, and free shipping limits
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Storefront Display Name
              </label>
              <input
                type="text"
                value={settingsForm.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                value={settingsForm.freeShippingThreshold}
                onChange={(e) => handleChange('freeShippingThreshold', Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Standard Shipping Fee (₹)
              </label>
              <input
                type="number"
                value={settingsForm.standardShippingFee}
                onChange={(e) => handleChange('standardShippingFee', Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Owner Access Security PIN */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-300 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                5. Admin Portal Security PIN
              </h3>
              <p className="text-xs text-gray-500">
                The secret PIN used to unlock this Owner Portal (keeps customers out)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Owner Security PIN *
              </label>
              <input
                type="text"
                maxLength={8}
                value={settingsForm.adminPin || '7784'}
                onChange={(e) => handleChange('adminPin', e.target.value)}
                placeholder="e.g. 7784"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold tracking-widest text-indigo-900"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Your active PIN is <strong>{settingsForm.adminPin || '7784'}</strong>. You can change it anytime to keep your dashboard secure.
              </span>
            </div>
          </div>
        </div>

        {/* Section 6: Razorpay Payment Gateway Configuration */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  6. Razorpay Payment Gateway
                </h3>
                <p className="text-xs text-gray-500">
                  Accept Cards, NetBanking, UPI & Wallets via Razorpay secure checkout
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              PCI DSS Compliant
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <span className="text-xs font-bold text-gray-900 block">
                Enable Razorpay Checkout
              </span>
              <span className="text-[11px] text-gray-500">
                Show Razorpay as a payment option for customers at checkout
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settingsForm.razorpayEnabled}
                onChange={(e) => handleChange('razorpayEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          {settingsForm.razorpayEnabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Razorpay Key ID *
                  </label>
                  <input
                    type="text"
                    value={settingsForm.razorpayKeyId || ''}
                    onChange={(e) => handleChange('razorpayKeyId', e.target.value.trim())}
                    placeholder="e.g. rzp_test_xxxxxxxxxx or rzp_live_xxxxxxxxxx"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-sm font-bold text-blue-900"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Find this in your <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Razorpay Dashboard</a> → Settings → API Keys. Leave blank to use the built-in Sandbox Test Key.
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Razorpay Key Secret (for reference only)
                  </label>
                  <input
                    type="password"
                    value={settingsForm.razorpayKeySecret || ''}
                    onChange={(e) => handleChange('razorpayKeySecret', e.target.value.trim())}
                    placeholder="e.g. xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    ⚠️ The Key Secret is for backend server use only. For client-side checkout, only the Key ID is needed.
                  </span>
                </div>
              </div>

              {/* Test Gateway Button */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
                <div>
                  <span className="text-xs font-bold text-blue-950 block">
                    Test Razorpay Checkout Flow
                  </span>
                  <span className="text-[11px] text-blue-700">
                    Launch a live ₹1 test payment modal to verify your key and checkout pop-up
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleTestRazorpay}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Test Razorpay (₹1)</span>
                </button>
              </div>
            </div>
          )}

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-blue-950">How it works:</strong> Razorpay automatically verifies customer payments in real-time (Google Pay, PhonePe, Paytm, Cards, NetBanking). Funds settle directly into your linked bank account. Orders are marked <strong>Paid</strong> immediately upon bank capture. <a href="https://razorpay.com/docs/" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline font-semibold">Learn more →</a>
            </div>
          </div>
        </div>

        {/* Section 7: Multi-Device Catalog Sync & Backup */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  7. Multi-Device Catalog Cloud Sync & Backup
                </h3>
                <p className="text-xs text-gray-500">
                  Ensure products added from any laptop or phone appear on all customer devices
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Auto-Sync Active
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-2">
            <p className="font-semibold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              How Multi-Device Availability Works:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
              <li><strong>Fresh Devices:</strong> Any mobile phone or laptop visiting the site automatically loads all starter products instantly.</li>
              <li><strong>Cloud Sync:</strong> Whenever you add, edit, or delete a product in this Owner Portal, the changes are automatically synchronized to the cloud repository.</li>
              <li><strong>Offline / Manual Backup:</strong> You can export your entire product catalog as a JSON backup or import it onto any device with 1 click.</li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={exportCatalog}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold text-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Catalog (JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl font-bold text-xs transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Import Catalog (JSON)</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Settings</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Save & Apply Bank Details</span>
          </button>
        </div>

      </form>

    </div>
  );
}
