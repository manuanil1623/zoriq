import React, { useState } from 'react';
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
  Lock
} from 'lucide-react';

export default function StoreSettings() {
  const { sellerSettings, updateSellerSettings, resetAllDataToDefault } = useStore();

  const [settingsForm, setSettingsForm] = useState({ ...sellerSettings });
  const [copiedField, setCopiedField] = useState(null);

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
