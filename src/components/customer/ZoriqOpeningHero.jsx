import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';

/**
 * ZoriqOpeningHero:
 * 1. ZORIQ FIRST: On load, shows near-black (#0A0C0E) ground with "ZORIQ"
 *    centred in 'Syne' 700, ink #EDE7DC. Split into "ZOR" and "IQ" spans.
 * 2. SMALL STORE TEXT: Fades in after ~0.8s in 'Sora' 12px #9EA5A8, max-w ~36ch.
 *    Reads from synced settings (tagline/description). If empty, shows nothing.
 *    Below it, a tiny uppercase label "Scroll to shop" (10.5px) with a thin line.
 * 3. STORE APPEARS: As user scrolls (or taps "Scroll to shop"), "ZOR" slides left,
 *    "IQ" slides right, wordmark tightens letter-spacing, dark panels part outward,
 *    revealing the live web store directly underneath.
 *    Reversible on scroll up.
 * 4. Respects prefers-reduced-motion (skips split and renders stacked normally).
 * 5. Mobile first: responsive clamp sizing, no overflow, tap target >= 44px.
 */
export default function ZoriqOpeningHero() {
  const { sellerSettings } = useStore();
  const [textVisible, setTextVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Store description from synced settings
  const storeDescription = (sellerSettings?.tagline || sellerSettings?.description || '').trim();

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener?.('change', listener);
      return () => mediaQuery.removeEventListener?.('change', listener);
    }
  }, []);

  // 0.8s fade-in for small store text
  useEffect(() => {
    const timer = setTimeout(() => {
      setTextVisible(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Calculate reveal distance based on viewport
  const getRevealThreshold = useCallback(() => {
    if (typeof window === 'undefined') return 450;
    return Math.max(350, Math.min(650, window.innerHeight * 0.65));
  }, []);

  // Scroll listener tied to window scroll position
  useEffect(() => {
    if (prefersReducedMotion) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset || 0;
          const threshold = getRevealThreshold();
          const progress = Math.min(1, Math.max(0, scrollY / threshold));
          setScrollProgress(progress);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReducedMotion, getRevealThreshold]);

  // Handle tap / click on "Scroll to shop"
  const handleScrollToShop = () => {
    const threshold = getRevealThreshold();
    window.scrollTo({
      top: threshold + 30,
      behavior: 'smooth'
    });
  };

  // If user prefers reduced motion: render static stacked layout
  if (prefersReducedMotion) {
    return (
      <section className="bg-[#0A0C0E] py-20 px-4 text-center select-none border-b border-white/5">
        <h1
          className="font-syne font-bold leading-none inline-flex items-center justify-center tracking-tight"
          style={{
            fontSize: 'clamp(3.2rem, 14vw, 9.5rem)',
            color: '#EDE7DC',
          }}
        >
          <span>ZOR</span>
          <span>IQ</span>
        </h1>

        {storeDescription && (
          <p
            className="mt-4 font-sora text-[12px] text-[#9EA5A8] text-center leading-relaxed max-w-[36ch] mx-auto px-4"
          >
            {storeDescription}
          </p>
        )}
      </section>
    );
  }

  // Animation parameters
  const isFullyOpen = scrollProgress >= 1;
  const letterSpacingValue = `${(1 - scrollProgress) * 0.02 - scrollProgress * 0.08}em`;

  return (
    <>
      {/* Top spacer to give natural scroll track for the curtain reveal */}
      <div
        className="w-full pointer-events-none select-none"
        style={{ height: 'clamp(280px, 45vh, 420px)' }}
        aria-hidden="true"
      />

      {/* FIXED THEATRE STAGE CURTAINS (z-50) */}
      <div
        className={`fixed inset-0 z-50 overflow-hidden select-none transition-visibility duration-150 ${
          isFullyOpen ? 'pointer-events-none invisible' : 'pointer-events-auto visible'
        }`}
        style={{ touchAction: 'pan-y' }}
      >
        {/* LEFT OPENING PANEL (#0A0C0E) */}
        <div
          className="absolute inset-y-0 left-0 w-[50.5%] bg-[#0A0C0E] will-change-transform"
          style={{
            transform: `translate3d(-${scrollProgress * 102}%, 0, 0)`,
          }}
        />

        {/* RIGHT OPENING PANEL (#0A0C0E) */}
        <div
          className="absolute inset-y-0 right-0 w-[50.5%] bg-[#0A0C0E] will-change-transform"
          style={{
            transform: `translate3d(${scrollProgress * 102}%, 0, 0)`,
          }}
        />

        {/* CENTER CONTENT LAYER: Large ZORIQ Wordmark + Small Store Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
          
          {/* 1. ZORIQ WORDMARK (Syne 700, #EDE7DC, split into ZOR + IQ) */}
          <div
            className="relative flex items-center justify-center font-syne font-bold leading-none select-none text-center"
            style={{
              fontSize: 'clamp(3.2rem, 14vw, 9.5rem)',
              color: '#EDE7DC',
              letterSpacing: letterSpacingValue,
              whiteSpace: 'nowrap',
            }}
          >
            {/* SPAN 1: "ZOR" (slides left as scroll increases) */}
            <span
              className="inline-block will-change-transform transition-opacity duration-75"
              style={{
                transform: `translate3d(-${scrollProgress * 65}vw, 0, 0)`,
                opacity: 1 - Math.max(0, (scrollProgress - 0.72) / 0.28),
              }}
            >
              ZOR
            </span>

            {/* SPAN 2: "IQ" (slides right as scroll increases) */}
            <span
              className="inline-block will-change-transform transition-opacity duration-75"
              style={{
                transform: `translate3d(${scrollProgress * 65}vw, 0, 0)`,
                opacity: 1 - Math.max(0, (scrollProgress - 0.72) / 0.28),
              }}
            >
              IQ
            </span>
          </div>

          {/* 2. SMALL STORE TEXT & SCROLL TO SHOP BUTTON */}
          <div
            className={`flex flex-col items-center justify-center mt-5 transition-all duration-700 ${
              textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
            style={{
              opacity: textVisible ? Math.max(0, 1 - scrollProgress * 2.8) : 0,
              transform: `translate3d(0, ${scrollProgress * 24}px, 0)`,
            }}
          >
            {/* Store short description (Sora 12px, #9EA5A8, max 36ch). If empty, render nothing */}
            {storeDescription ? (
              <p className="font-sora text-[12px] text-[#9EA5A8] text-center leading-relaxed max-w-[36ch] mx-auto px-4">
                {storeDescription}
              </p>
            ) : null}

            {/* Tiny uppercase label "Scroll to shop" (10.5px, wide letter-spacing) with thin line */}
            <button
              onClick={handleScrollToShop}
              type="button"
              aria-label="Scroll to shop"
              className="mt-5 group flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-4 py-2 cursor-pointer pointer-events-auto transition-transform active:scale-95"
            >
              <span
                className="font-sora text-[10.5px] uppercase tracking-[0.25em] text-[#9EA5A8] group-hover:text-[#EDE7DC] transition-colors"
                style={{ letterSpacing: '0.25em' }}
              >
                Scroll to shop
              </span>
              <div className="mt-2 w-7 h-[1px] bg-[#9EA5A8]/40 group-hover:bg-[#EDE7DC] group-hover:w-11 transition-all duration-300" />
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
