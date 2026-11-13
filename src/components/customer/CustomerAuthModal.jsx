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
    <>
      {/* Scrim */}
      <div
        className="scrim on"
        style={{ zIndex: 96 }}
        onClick={() => setIsAuthModalOpen(false)}
      ></div>

      <div className="fixed inset-0 z-[97] overflow-y-auto flex items-center justify-center p-3 sm:p-4">
        <div className="bg-[#fcfbf8] text-[#1c1a17] max-w-md w-full overflow-hidden shadow-2xl border border-[var(--line)] relative my-6">
          {/* Top Header */}
          <div className="p-5 border-b border-[var(--line)] flex items-center justify-between bg-[#f4f0e9]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[var(--ink)] text-white flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10.5px] uppercase tracking-widest text-[var(--gold)] font-semibold block">
                  zoriq account
                </span>
                <h2 className="text-lg font-tenor text-[var(--ink)]">
                  {authModalMode === 'login' ? 'Sign In to Your Account' : 'Create Customer Account'}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              className="close"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex border-b border-[var(--line)] bg-white text-xs">
            <button
              type="button"
              onClick={() => {
                if (!identifier && email) setIdentifier(email);
                setAuthModalMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-3 text-center uppercase tracking-wider font-semibold transition-colors ${
                authModalMode === 'login'
                  ? 'border-b-2 border-[var(--ink)] text-[var(--ink)] bg-[#fcfbf8]'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
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
              className={`flex-1 py-3 text-center uppercase tracking-wider font-semibold transition-colors ${
                authModalMode === 'signup'
                  ? 'border-b-2 border-[var(--ink)] text-[var(--ink)] bg-[#fcfbf8]'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-2">
                <span>{errorMsg}</span>
                {errorMsg.toLowerCase().includes('already exists') && (
                  <button
                    type="button"
                    onClick={() => {
                      setIdentifier(email || identifier);
                      setAuthModalMode('login');
                      setErrorMsg('');
                    }}
                    className="underline font-semibold"
                  >
                    Sign In
                  </button>
                )}
              </div>
            )}

            {authModalMode === 'login' ? (
              <>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-[var(--ink2)] mb-1">
                    Email or Mobile *
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. name@example.com or 9876543210"
                    className="w-full px-3 py-2.5 bg-white border border-[#cfc6b6] text-[#1c1a17] text-sm outline-0 focus:border-[var(--ink)]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-[var(--ink2)] mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3 py-2.5 bg-white border border-[#cfc6b6] text-[#1c1a17] text-sm outline-0 focus:border-[var(--ink)]"
                    required
                  />
                </div>
              </>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-[var(--ink2)] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 bg-white border border-[#cfc6b6] text-[#1c1a17] text-sm outline-0 focus:border-[var(--ink)]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-medium text-[var(--ink2)] mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rahul@example.com"
                      className="w-full px-3 py-2 bg-white border border-[#cfc6b6] text-[#1c1a17] text-sm outline-0 focus:border-[var(--ink)]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-medium text-[var(--ink2)] mb-1">
                      Mobile *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full px-3 py-2 bg-white border border-[#cfc6b6] text-[#1c1a17] text-sm outline-0 focus:border-[var(--ink)]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-[var(--ink2)] mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3 py-2 bg-white border border-[#cfc6b6] text-[#1c1a17] text-sm outline-0 focus:border-[var(--ink)]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-[var(--ink2)] mb-1">
                    Delivery Address *
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Flat, Street, Area"
                    className="w-full px-3 py-2 bg-white border border-[#cfc6b6] text-[#1c1a17] text-sm outline-0 focus:border-[var(--ink)] resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-medium text-[var(--ink2)] mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#cfc6b6] text-[#1c1a17] text-xs outline-0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-medium text-[var(--ink2)] mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#cfc6b6] text-[#1c1a17] text-xs outline-0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-medium text-[var(--ink2)] mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="682001"
                      maxLength={6}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#cfc6b6] text-[#1c1a17] text-xs outline-0"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn dark w-full mt-4 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{authModalMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
