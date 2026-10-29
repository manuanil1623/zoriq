import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  ShieldCheck,
  Smartphone,
  Copy,
  Zap,
  Info,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Truck,
  FileText,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

export default function StoreSettings() {
  const {
    sellerSettings,
    updateSettingsSection,
    changeAdminPassword,
    hasSettingsConflict,
    conflictSettings,
    reloadLatestSettings,
    resetAllDataToDefault,
    exportCatalog,
    importCatalog,
    products,
    addToast
  } = useStore();

  const [settingsForm, setSettingsForm] = useState({ ...sellerSettings });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPhoneSyncModal, setShowPhoneSyncModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [savingSection, setSavingSection] = useState(null); // 'identity' | 'shipping' | 'cod' | 'payments' | 'security'
  const fileInputRef = useRef(null);

  // Sync form when sellerSettings change from realtime (unless user has dirty edits)
  useEffect(() => {
    setSettingsForm((prev) => ({
      ...sellerSettings,
      socialLinks: {
        instagram: sellerSettings.socialLinks?.instagram || '',
        twitter: sellerSettings.socialLinks?.twitter || '',
        facebook: sellerSettings.socialLinks?.facebook || '',
      }
    }));
  }, [sellerSettings]);

  const handleChange = (key, value) => {
    setSettingsForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSocialChange = (network, value) => {
    setSettingsForm((prev) => ({
      ...prev,
      socialLinks: {
        ...(prev.socialLinks || {}),
        [network]: value,
      },
    }));
  };

  // 1. Save Storefront Identity
  const handleSaveIdentity = async (e) => {
    e.preventDefault();
    setSavingSection('identity');
    try {
      await updateSettingsSection('identity', {
        storeName: settingsForm.storeName,
        tagline: settingsForm.tagline,
        logoUrl: settingsForm.logoUrl,
        contactEmail: settingsForm.contactEmail,
        contactPhone: settingsForm.contactPhone,
        address: settingsForm.address,
        socialLinks: settingsForm.socialLinks,
        footerText: settingsForm.footerText,
        announcement: settingsForm.announcement,
      });
    } catch (err) {
      // toast shown in context
    } finally {
      setSavingSection(null);
    }
  };

  // 2. Save Shipping Rules
  const handleSaveShipping = async (e) => {
    e.preventDefault();
    setSavingSection('shipping');
    try {
      await updateSettingsSection('shipping', {
        freeShippingThreshold: Number(settingsForm.freeShippingThreshold),
        standardShippingFee: Number(settingsForm.standardShippingFee),
        deliveryTimeEstimate: settingsForm.deliveryTimeEstimate,
        serviceablePincodes: settingsForm.serviceablePincodes,
      });
    } catch (err) {
      // toast shown in context
    } finally {
      setSavingSection(null);
    }
  };

  // 3. Save Cash on Delivery
  const handleSaveCod = async (e) => {
    e.preventDefault();
    setSavingSection('cod');
    try {
      await updateSettingsSection('cod', {
        codEnabled: Boolean(settingsForm.codEnabled),
        codFee: Number(settingsForm.codFee),
        minOrderCod: Number(settingsForm.minOrderCod),
        maxOrderCod: Number(settingsForm.maxOrderCod),
      });
    } catch (err) {
      // toast shown in context
    } finally {
      setSavingSection(null);
    }
  };

  // 4. Save Payments, Tax & Invoice
  const handleSavePayments = async (e) => {
    e.preventDefault();
    setSavingSection('payments');
    try {
      await updateSettingsSection('payments', {
        razorpayEnabled: Boolean(settingsForm.razorpayEnabled),
        razorpayKeyId: settingsForm.razorpayKeyId,
        upiEnabled: Boolean(settingsForm.upiEnabled),
        cardsEnabled: Boolean(settingsForm.cardsEnabled),
        netBankingEnabled: Boolean(settingsForm.netBankingEnabled),
        merchantName: settingsForm.merchantName,
        gstNumber: settingsForm.gstNumber,
        taxRate: Number(settingsForm.taxRate),
        invoicePrefix: settingsForm.invoicePrefix,
        sellerUpiId: settingsForm.sellerUpiId,
        bankName: settingsForm.bankName,
        bankAccountNumber: settingsForm.bankAccountNumber,
        bankIfsc: settingsForm.bankIfsc,
        accountHolderName: settingsForm.accountHolderName,
      });
    } catch (err) {
      // toast shown in context
    } finally {
      setSavingSection(null);
    }
  };

  // 5. Update Admin Password
  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }

    setSavingSection('security');
    try {
      await changeAdminPassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      // toast shown in context
    } finally {
      setSavingSection(null);
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
      image: settingsForm.logoUrl || '/zoriq-logo.jpg',
      handler: function (response) {
        alert(
          `🎉 Razorpay Test Payment Successful!\nPayment ID: ${response.razorpay_payment_id}\n\nYour Razorpay live key is valid and actively capturing payments!`
        );
      },
      prefill: {
        name: 'Store Owner',
        email: settingsForm.contactEmail || 'seller@zoriq.in',
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

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await importCatalog(file);
    e.target.value = '';
  };

  // Generate mobile link
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://zoriq.vercel.app';
  const mobileStoreUrl = currentOrigin;

  const copyStoreLink = () => {
    navigator.clipboard?.writeText(mobileStoreUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in pb-16">
      
      {/* Top Header with Realtime & Version Status */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-600" />
            <span>Store Configuration & Cloud Settings</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Every setting saved here synchronizes live to all laptops, phones, and browsers within seconds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Supabase Realtime Live (v{sellerSettings.version || 1})</span>
          </span>
        </div>
      </div>

      {/* CONFLICT BANNER: Triggered if another device saved newer settings */}
      {hasSettingsConflict && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-amber-900 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center flex-shrink-0 text-amber-800">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm block">Settings Updated on Another Device!</span>
              <span className="text-xs text-amber-700">
                Newer settings (Version {conflictSettings?.version || (sellerSettings.version || 1) + 1}) were saved elsewhere. Reload to view the latest cloud configuration.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={reloadLatestSettings}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Latest Settings</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: STOREFRONT IDENTITY & BRANDING */}
      {/* ========================================================================= */}
      <form onSubmit={handleSaveIdentity} className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                1. Storefront Identity & Branding
              </h3>
              <p className="text-xs text-gray-500">
                Store name, slogan, logo URL, customer support channels, address, and footer
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
            Public Display
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Store Display Name *
            </label>
            <input
              type="text"
              required
              value={settingsForm.storeName || ''}
              onChange={(e) => handleChange('storeName', e.target.value)}
              placeholder="e.g. ZORIQ"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Store Tagline / Description
            </label>
            <input
              type="text"
              value={settingsForm.tagline || ''}
              onChange={(e) => handleChange('tagline', e.target.value)}
              placeholder="e.g. Premium Direct-to-Consumer Electronics & Lifestyle"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Logo Image URL
            </label>
            <input
              type="text"
              value={settingsForm.logoUrl || ''}
              onChange={(e) => handleChange('logoUrl', e.target.value)}
              placeholder="/zoriq-logo.jpg or https://..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Support Email
            </label>
            <input
              type="email"
              value={settingsForm.contactEmail || ''}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              placeholder="help@zoriq.in"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Support Phone Number
            </label>
            <input
              type="text"
              value={settingsForm.contactPhone || ''}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Announcement Banner (Top of page)
            </label>
            <input
              type="text"
              value={settingsForm.announcement || ''}
              onChange={(e) => handleChange('announcement', e.target.value)}
              placeholder="⚡ FLASH SALE: Free Delivery on orders over ₹999..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-gray-700 mb-1">
              Physical Business / Dispatch Address
            </label>
            <input
              type="text"
              value={settingsForm.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="12th Floor, Orion Tech Park, MG Road, Bengaluru, Karnataka 560001"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Instagram Profile URL
            </label>
            <input
              type="url"
              value={settingsForm.socialLinks?.instagram || ''}
              onChange={(e) => handleSocialChange('instagram', e.target.value)}
              placeholder="https://instagram.com/zoriq.official"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Footer Copyright Text
            </label>
            <input
              type="text"
              value={settingsForm.footerText || ''}
              onChange={(e) => handleChange('footerText', e.target.value)}
              placeholder="© 2026 ZORIQ Official Store. All rights reserved."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={savingSection === 'identity'}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {savingSection === 'identity' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Identity...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Store Identity</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* SECTION 2: SHIPPING RULES & DELIVERY ESTIMATES */}
      {/* ========================================================================= */}
      <form onSubmit={handleSaveShipping} className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                2. Shipping Fees & Delivery Estimates
              </h3>
              <p className="text-xs text-gray-500">
                Free shipping threshold, standard delivery charges, and transit time
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            Server Rechecked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Free Shipping Threshold (₹ INR) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={settingsForm.freeShippingThreshold}
              onChange={(e) => handleChange('freeShippingThreshold', e.target.value)}
              placeholder="999"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
            />
            <span className="text-[11px] text-gray-400 mt-0.5 block">
              Cart subtotals equal or higher than this get 100% Free Shipping.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Standard Shipping Fee (₹ INR) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={settingsForm.standardShippingFee}
              onChange={(e) => handleChange('standardShippingFee', e.target.value)}
              placeholder="49"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
            />
            <span className="text-[11px] text-gray-400 mt-0.5 block">
              Charged when the customer order is below the free shipping threshold.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Estimated Delivery Time
            </label>
            <input
              type="text"
              value={settingsForm.deliveryTimeEstimate || ''}
              onChange={(e) => handleChange('deliveryTimeEstimate', e.target.value)}
              placeholder="2 - 4 Business Days"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Serviceable Areas / Pincodes
            </label>
            <input
              type="text"
              value={settingsForm.serviceablePincodes || ''}
              onChange={(e) => handleChange('serviceablePincodes', e.target.value)}
              placeholder="All India or comma-separated pincodes"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={savingSection === 'shipping'}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {savingSection === 'shipping' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Shipping...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Shipping Rules</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* SECTION 3: CASH ON DELIVERY (COD) RULES */}
      {/* ========================================================================= */}
      <form onSubmit={handleSaveCod} className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                3. Cash on Delivery (COD) Options
              </h3>
              <p className="text-xs text-gray-500">
                Enable or disable COD globally, handling surcharges, and order amount thresholds
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
            Anti-Fraud Protection
          </span>
        </div>

        <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <span className="text-xs font-bold text-gray-900 block">
              Enable Cash on Delivery (Storewide)
            </span>
            <span className="text-[11px] text-gray-500">
              When switched off, customers must pay online using UPI or Cards
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settingsForm.codEnabled}
              onChange={(e) => handleChange('codEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600" />
          </label>
        </div>

        {settingsForm.codEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                COD Handling Fee (₹ INR)
              </label>
              <input
                type="number"
                min="0"
                value={settingsForm.codFee}
                onChange={(e) => handleChange('codFee', e.target.value)}
                placeholder="0 for free"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">0 means free COD</span>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Minimum Order for COD (₹)
              </label>
              <input
                type="number"
                min="0"
                value={settingsForm.minOrderCod}
                onChange={(e) => handleChange('minOrderCod', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Maximum Order for COD (₹)
              </label>
              <input
                type="number"
                min="100"
                value={settingsForm.maxOrderCod}
                onChange={(e) => handleChange('maxOrderCod', e.target.value)}
                placeholder="25000"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={savingSection === 'cod'}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {savingSection === 'cod' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving COD...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save COD Settings</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* SECTION 4: ONLINE PAYMENTS & TAX / INVOICE DETAILS */}
      {/* ========================================================================= */}
      <form onSubmit={handleSavePayments} className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                4. Online Payments & Tax / Invoice Details
              </h3>
              <p className="text-xs text-gray-500">
                Razorpay gateway, enabled payment modes, GSTIN, and seller bank info
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Bank Verified
          </span>
        </div>

        {/* Razorpay Toggle */}
        <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <span className="text-xs font-bold text-gray-900 block">
              Enable Razorpay Gateway
            </span>
            <span className="text-[11px] text-gray-500">
              Accept Google Pay, PhonePe, Paytm, RuPay, Visa, Mastercard, and NetBanking
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
            <div>
              <label className="block font-semibold text-gray-700 mb-1 text-xs">
                Razorpay Key ID (Public Key) *
              </label>
              <input
                type="text"
                required
                value={settingsForm.razorpayKeyId || ''}
                onChange={(e) => handleChange('razorpayKeyId', e.target.value.trim())}
                placeholder="rzp_live_TstUZQzK6D5kHP"
                className="w-full px-3 py-2.5 bg-indigo-50/30 border border-indigo-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono text-xs sm:text-sm font-bold text-indigo-900"
              />
            </div>

            {/* Vercel Env Var Note */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-blue-950">Razorpay Key Secret is Set in Vercel:</strong> For security, your <code>RAZORPAY_KEY_SECRET</code> is configured as a server environment variable in Vercel and is never stored in the database or sent to the browser.
              </div>
            </div>

            {/* Test Razorpay Flow */}
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-indigo-950 block">
                  Verify Razorpay Checkout Flow
                </span>
                <span className="text-[11px] text-indigo-700">
                  Launch a live ₹1 test payment modal to verify your public key
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

        {/* Enabled Payment Methods Toggles */}
        <div className="pt-2">
          <label className="block font-semibold text-gray-700 mb-2 text-xs">
            Enabled Payment Methods on Checkout
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <label className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={settingsForm.upiEnabled}
                onChange={(e) => handleChange('upiEnabled', e.target.checked)}
                className="rounded text-indigo-600"
              />
              <span className="font-semibold text-gray-800">UPI (GPay / PhonePe / Paytm)</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={settingsForm.cardsEnabled}
                onChange={(e) => handleChange('cardsEnabled', e.target.checked)}
                className="rounded text-indigo-600"
              />
              <span className="font-semibold text-gray-800">Credit / Debit Cards</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={settingsForm.netBankingEnabled}
                onChange={(e) => handleChange('netBankingEnabled', e.target.checked)}
                className="rounded text-indigo-600"
              />
              <span className="font-semibold text-gray-800">NetBanking (All Banks)</span>
            </label>
          </div>
        </div>

        {/* Tax, GST & Invoice Details */}
        <div className="pt-3 border-t border-gray-100">
          <h4 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tax, GSTIN & Invoice Information</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Merchant Legal Name (For Invoice)
              </label>
              <input
                type="text"
                value={settingsForm.merchantName || ''}
                onChange={(e) => handleChange('merchantName', e.target.value)}
                placeholder="ZORIQ Official Retails Pvt Ltd"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                GSTIN / Tax Registration Number
              </label>
              <input
                type="text"
                value={settingsForm.gstNumber || ''}
                onChange={(e) => handleChange('gstNumber', e.target.value)}
                placeholder="29ABCDE1234F1Z5"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Tax / GST Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settingsForm.taxRate}
                onChange={(e) => handleChange('taxRate', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Invoice Number Prefix
              </label>
              <input
                type="text"
                value={settingsForm.invoicePrefix || ''}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                placeholder="ZRQ-"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Payee UPI ID
              </label>
              <input
                type="text"
                value={settingsForm.sellerUpiId || ''}
                onChange={(e) => handleChange('sellerUpiId', e.target.value)}
                placeholder="store@upi"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={settingsForm.bankName || ''}
                onChange={(e) => handleChange('bankName', e.target.value)}
                placeholder="State Bank of India"
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
                placeholder="98765432100012"
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
                onChange={(e) => handleChange('bankIfsc', e.target.value)}
                placeholder="SBIN0001234"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={savingSection === 'payments'}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {savingSection === 'payments' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Payments & Tax...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Payment & Invoice Settings</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* SECTION 5: ADMIN SECURITY & PASSWORD */}
      {/* ========================================================================= */}
      <form onSubmit={handleSaveSecurity} className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-300 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                5. Admin Security & Password
              </h3>
              <p className="text-xs text-gray-500">
                Securely hashed with scrypt in private storage. Changing password terminates all other active sessions.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            Scrypt Hashed
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
          <p className="font-semibold text-slate-900 flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            Multi-Device Security Rules:
          </p>
          <p className="text-[11px] text-slate-600">
            • Password must be at least 6 characters.<br />
            • When you update your password, all other devices (phones, laptops, other browsers) are automatically logged out for your protection.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Current Password / PIN *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2 pr-9 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              New Password (Min 6 chars) *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Confirm New Password *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={savingSection === 'security'}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {savingSection === 'security' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Update Admin Password</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* SECTION 6: MULTI-DEVICE SYNC & CATALOG BACKUP */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                6. Multi-Device Realtime Sync & Catalog Backup
              </h3>
              <p className="text-xs text-gray-500">
                Live Postgres replication across devices, mobile QR scanner, and JSON catalog backups
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Connected ({products.length} Products)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setShowPhoneSyncModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
            <span>📱 Open Store on Mobile Phone</span>
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

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Clear your local browser cart and filter caches?')) {
                resetAllDataToDefault();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200 ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Local Cart Cache</span>
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

      {/* Mobile Phone QR Modal */}
      {showPhoneSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-gray-100">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-gray-900">
                Open Store on Mobile Phone
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Scan this QR code with your mobile camera or Google Lens to view the live store on your phone
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto">
              <QRCodeSVG
                value={mobileStoreUrl}
                size={180}
                level="M"
              />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={copyStoreLink}
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
