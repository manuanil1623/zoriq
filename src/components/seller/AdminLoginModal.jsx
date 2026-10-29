import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Lock,
  KeyRound,
  X,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';

export default function AdminLoginModal() {
  const {
    isAdminLoginModalOpen,
    setIsAdminLoginModalOpen,
    loginAdmin,
  } = useStore();

  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAdminLoginModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!pin.trim()) {
      setError('Please enter your admin PIN');
      return;
    }

    setIsSubmitting(true);
    const result = await loginAdmin(pin.trim());
    setIsSubmitting(false);

    if (!result?.success) {
      setError(result?.error || 'Incorrect security PIN. Please try again.');
    } else {
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 relative">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/30 text-amber-300 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Owner / Admin Access</h3>
              <p className="text-[11px] text-gray-400">Restricted merchant portal</p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsAdminLoginModalOpen(false);
              setPin('');
              setError('');
            }}
            className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="text-center space-y-1">
            <p className="text-xs text-gray-600">
              Enter your password to access your products catalog, orders, and store settings.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Admin Password / PIN
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="Enter password or PIN"
                autoFocus
                className="w-full pl-9 pr-10 py-2.5 text-center text-sm font-mono tracking-widest bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-rose-500 text-[11px] font-semibold mt-1 text-center">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <span>{isSubmitting ? 'Verifying with Server...' : 'Unlock Admin Portal'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <p className="text-[10px] text-gray-400 text-center">
            Admin credentials are cryptographically verified server-side.
          </p>

        </form>

      </div>
    </div>
  );
}
