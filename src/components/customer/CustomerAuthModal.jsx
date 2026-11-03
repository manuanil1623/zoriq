import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Sparkles
} from 'lucide-react';

export default function CustomerAuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    loginCustomer,
    signupCustomer,
    setIsCheckoutOpen,
    cartCount
  } = useStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // Sign up fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Kerala');
  const [pincode, setPincode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (authModalMode === 'login') {
        if (!identifier.trim() || !password) {
          throw new Error('Please enter both Email/Mobile and Password.');
        }
        await loginCustomer(identifier.trim(), password);
      } else {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (!email.trim() || !email.includes('@')) throw new Error('Please enter a valid email address.');
        if (!phone.trim() || phone.replace(/\D/g, '').length < 10) throw new Error('Please enter a valid 10-digit mobile number.');
        if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');
        if (!address.trim()) throw new Error('Please enter your shipping address.');
        if (!city.trim()) throw new Error('Please enter your city.');
        if (!pincode.trim() || pincode.length < 6) throw new Error('Please enter a valid 6-digit pincode.');

        await signupCustomer({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
        });
      }

      // If user has cart items, automatically proceed to checkout
      if (cartCount > 0) {
        setIsCheckoutOpen(true);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#101317]/95 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-white/10 relative my-6 text-[var(--ink)] backdrop-blur-2xl">
        
        {/* Top Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[var(--amber)]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono tracking-widest text-[var(--amber)] uppercase block font-bold">
                ZORIQ Customer Account
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Syne']">
                {authModalMode === 'login' ? 'Sign In to Your Account' : 'Create Customer Account'}
              </h2>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 text-[var(--ink2)] hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info banner explaining mandatory login */}
        <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-xs text-amber-200">
          <Sparkles className="w-3.5 h-3.5 text-[var(--amber)] flex-shrink-0" />
          <span>Login is required to place orders, access tax invoices, and track shipments live.</span>
        </div>

        {/* Toggle Mode Tabs */}
        <div className="p-3 bg-white/5 border-b border-white/10 flex gap-2">
          <button
            type="button"
            onClick={() => {
              if (!identifier && email) setIdentifier(email);
              setAuthModalMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authModalMode === 'login'
                ? 'bg-amber-500 text-black shadow-md font-semibold'
                : 'text-[var(--ink2)] hover:text-white hover:bg-white/5'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              if (!email && identifier.includes('@')) setEmail(identifier);
              setAuthModalMode('signup');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authModalMode === 'signup'
                ? 'bg-amber-500 text-black shadow-md font-semibold'
                : 'text-[var(--ink2)] hover:text-white hover:bg-white/5'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center justify-between gap-2">
              <span className="flex-1">{errorMsg}</span>
              {errorMsg.toLowerCase().includes('already exists') && (
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier(email || identifier);
                    setAuthModalMode('login');
                    setErrorMsg('');
                  }}
                  className="px-2.5 py-1 bg-white text-rose-900 font-bold rounded-lg text-[11px] whitespace-nowrap shadow-sm hover:bg-gray-100 transition-colors"
                >
                  Sign In Now
                </button>
              )}
            </div>
          )}

          {authModalMode === 'login' ? (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--ink2)] mb-1 uppercase tracking-wider">
                  Email Address or 10-Digit Mobile *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. name@example.com or 9946899258"
                    className="w-full pl-9 pr-3 py-2.5 bg-black/50 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)] transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--ink2)] mb-1 uppercase tracking-wider">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full pl-9 pr-3 py-2.5 bg-black/50 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)] transition-all font-medium"
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--ink2)] mb-1 uppercase tracking-wider">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2 bg-black/50 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--amber)]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--ink2)] mb-1 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className="w-full px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--amber)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--ink2)] mb-1 uppercase tracking-wider">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--amber)]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--ink2)] mb-1 uppercase tracking-wider">
                  Password (min 6 characters) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full pl-9 pr-3 py-2 bg-black/50 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--amber)]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--ink2)] mb-1 uppercase tracking-wider">
                  Delivery Street Address *
                </label>
                <textarea
                  rows="2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House/Flat number, building name, street area"
                  className="w-full px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--amber)] resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-[var(--ink2)] mb-1 uppercase">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-2.5 py-1.5 bg-black/50 border border-white/15 rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[var(--amber)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[var(--ink2)] mb-1 uppercase">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black/50 border border-white/15 rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[var(--amber)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[var(--ink2)] mb-1 uppercase">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="6 digits"
                    className="w-full px-2.5 py-1.5 bg-black/50 border border-white/15 rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[var(--amber)]"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[var(--amber)] hover:bg-[#d67e2a] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <>
                <span>{authModalMode === 'login' ? 'Sign In & Continue' : 'Create Account & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-2 text-center text-[11px] text-[var(--ink2)]">
            {authModalMode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('signup');
                    setErrorMsg('');
                  }}
                  className="text-[var(--amber)] hover:underline font-semibold cursor-pointer"
                >
                  Create one now
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('login');
                    setErrorMsg('');
                  }}
                  className="text-[var(--amber)] hover:underline font-semibold cursor-pointer"
                >
                  Sign in here
                </button>
              </span>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}
