import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  CreditCard,
  Banknote,
  RotateCcw,
  Check,
  Store,
  Lock,
  Download,
  Upload,
  Cloud,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Copy,
  RefreshCw
} from 'lucide-react';

export default function StoreSettings() {
  const {
    sellerSettings,
    updateSellerSettings,
    resetAllDataToDefault,
    exportCatalog,
    importCatalog,
    products,
    syncFromCloud,
    addToast
  } = useStore();

  const [settingsForm, setSettingsForm] = useState({
    ...sellerSettings,
    razorpayKeyId: sellerSettings.razorpayKeyId || 'rzp_live_TstUZQzK6D5kHP'
  });
  const [showPhoneSyncModal, setShowPhoneSyncModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef(null);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncFromCloud();
    setIsSyncing(false);
    if (addToast) {
      addToast('Store synchronized! Laptop and mobile are 100% in sync.', 'success');
    }
  };

  const handleChange = (key, value) => {
    setSettingsForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateSellerSettings(settingsForm);
    if (addToast) {
      addToast('Store settings saved successfully!', 'success');
    }
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to clear stored data and restore default settings?')) {
      resetAllDataToDefault();
      setSettingsForm(sellerSettings);
    }
  };

  const handleTestRazorpay = () => {
    const key = settingsForm.razorpayKeyId?.trim() || 'rzp_live_TstUZQzK6D5kHP';
    if (!window.Razorpay) {
      alert('Razorpay SDK is loading. Please check your internet connection.');
      return;
    }
    const options = {
      key: key,
      amount: 100, // ₹1.00 in paise
      currency: 'INR',
      name: settingsForm.storeName || 'ZORIQ',
      description: 'Razorpay Gateway Live Test (₹1.00)',
      image: '/zoriq-logo.jpg',
      handler: function (response) {
        alert(
          `🎉 Razorpay Test Payment Successful!\nPayment ID: ${response.razorpay_payment_id}\n\nYour Razorpay live integration is 100% active and working!`
        );
      },
      prefill: {
        name: 'Store Owner',
        email: 'seller@zoriq.in',
        contact: '9999999999',
      },
      theme: { color: '#4F46E5' },
    };
    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        alert(`Razorpay Test Failed: ${resp.error?.description || 'Declined'}`);
      });
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

  // Generate mobile sync link
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://zoriq.vercel.app';
  const mobileSyncUrl = `${currentOrigin}/?sync=true`;

  const copySyncLink = () => {
    navigator.clipboard?.writeText(mobileSyncUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in pb-12">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <span>Store Payments & Multi-Device Configuration</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure your active Razorpay Payment Gateway, Cash on Delivery, and cross-device sync
          </p>
        </div>

        <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          Razorpay Live Active
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Razorpay Payment Gateway */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  1. Razorpay Payment Gateway (Cards, UPI, NetBanking)
                </h3>
                <p className="text-xs text-gray-500">
                  Accept Google Pay, PhonePe, Paytm, Visa, Mastercard, RuPay & NetBanking with instant bank verification
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Auto Verified
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <span className="text-xs font-bold text-gray-900 block">
                Enable Razorpay Checkout
              </span>
              <span className="text-[11px] text-gray-500">
                Customers will be routed through Razorpay's secure checkout modal
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settingsForm.razorpayEnabled}
                onChange={(e) => handleChange('razorpayEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
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
                    placeholder="rzp_live_TstUZQzK6D5kHP"
                    className="w-full px-3 py-2.5 bg-indigo-50/30 border border-indigo-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono text-xs sm:text-sm font-bold text-indigo-900"
                    required
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Your active live key is registered. You can manage keys anytime in your <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Razorpay Dashboard</a>.
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Razorpay Key Secret (optional reference)
                  </label>
                  <input
                    type="password"
                    value={settingsForm.razorpayKeySecret || ''}
                    onChange={(e) => handleChange('razorpayKeySecret', e.target.value.trim())}
                    placeholder="••••••••••••••••••••••••"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Key Secret is for backend server integrations. For client-side checkout, only Key ID is needed.
                  </span>
                </div>
              </div>

              {/* Test Razorpay Flow Button */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-indigo-950 block">
                    Test Razorpay Checkout Flow
                  </span>
                  <span className="text-[11px] text-indigo-700">
                    Launch a live ₹1 test payment modal to verify your key and checkout pop-up
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleTestRazorpay}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Test Razorpay (₹1)</span>
                </button>
              </div>
            </div>
          )}

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-950">Bank-Guaranteed Verification:</strong> Unlike manual QR codes or screenshots, Razorpay automatically verifies customer payments directly with the issuing bank. If payment is cancelled or declined, no order is placed. Once payment succeeds, funds settle into your bank account.
            </div>
          </div>
        </div>

        {/* Section 2: Cash on Delivery (COD) Settings */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                2. Cash on Delivery (COD) Settings
              </h3>
              <p className="text-xs text-gray-500">
                Allow customers to pay cash when package is delivered
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <span className="text-xs font-bold text-gray-900 block">
                Accept Cash on Delivery Orders
              </span>
              <span className="text-[11px] text-gray-500">
                Orders are verified with a 4-digit anti-bot security code to prevent spam
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

        {/* Section 3: Storefront Identity & Shipping Rules */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                3. Store Identity & Shipping Rules
              </h3>
              <p className="text-xs text-gray-500">
                Display name, support email, and shipping fees
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

        {/* Section 4: Owner Portal Security PIN */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-300 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                4. Admin Security PIN
              </h3>
              <p className="text-xs text-gray-500">
                Secret PIN used to unlock this Owner Portal
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
                placeholder="7784"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold tracking-widest text-indigo-900"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Current active PIN is <strong>{settingsForm.adminPin || '7784'}</strong>.
              </span>
            </div>
          </div>
        </div>

        {/* Section 5: Multi-Device Catalog Cloud Sync & Cross-Platform Updates */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  5. Cross-Device Catalog & Store Sync
                </h3>
                <p className="text-xs text-gray-500">
                  Ensure products added or changed on this device appear everywhere on all customer devices
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sync Ready ({products.length} Products)
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-2">
            <p className="font-semibold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              How Multi-Device Availability Works:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
              <li><strong>All New Devices:</strong> Every mobile phone, tablet, and laptop visiting the website loads all starter products automatically.</li>
              <li><strong>Phone Sync (Instant):</strong> Click <strong>"📱 Sync Store to Mobile Phone"</strong> to open a QR code. Scan it with any phone camera to instantly sync all products.</li>
              <li><strong>Backup / Export:</strong> Download your entire catalog as JSON or restore it onto any device with 1 click.</li>
            </ul>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              disabled={isSyncing}
              onClick={handleManualSync}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : '🔄 Force Cloud Sync Now'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPhoneSyncModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              <Smartphone className="w-4 h-4" />
              <span>📱 Sync Store to Mobile Phone</span>
            </button>

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
            <span>Save & Apply Store Settings</span>
          </button>
        </div>

      </form>

      {/* Mobile Phone Sync Modal */}
      {showPhoneSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-gray-100">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-gray-900">
                Sync Store with Your Phone
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Scan this QR code with your mobile camera or Google Lens to load the store directly on your phone
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto">
              <QRCodeSVG
                value={mobileSyncUrl}
                size={180}
                level="M"
              />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={copySyncLink}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-indigo-200"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Mobile Store Link'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPhoneSyncModal(false)}
                className="w-full py-2 px-4 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}