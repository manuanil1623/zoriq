import React from 'react';
import zoriqLogoImg from '../assets/zoriq-logo.jpg';

export default function ZoriqLogo({
  size = 'md', // 'sm', 'md', 'lg', 'compact'
  withTagline = true,
  className = '',
  mode = 'auto' // 'auto', 'dark', 'light'
}) {
  // Height presets
  const heightClasses = {
    sm: 'h-7',
    md: 'h-10',
    lg: 'h-14',
    compact: 'h-8'
  };

  const selectedHeight = heightClasses[size] || heightClasses.md;

  return (
    <div className={`inline-flex items-center select-none group ${className}`}>
      {/* 
        The logo image has a dark background.
        By applying `mix-blend-mode: screen`, black pixels become 100% transparent,
        allowing the radiant cyan-to-purple 'Z' symbol and 'ZORIQ' typography
        to blend organically into dark backgrounds, gradients, or dark-pill wrappers!
      */}
      <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-slate-950/80 px-2 py-0.5 border border-slate-800/80 shadow-inner group-hover:border-cyan-500/40 transition-all duration-300">
        {/* Subtle Ambient Backlight Glow behind the 'Z' */}
        <div className="absolute left-2 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-600/20 blur-md pointer-events-none" />

        <img
          src={zoriqLogoImg}
          alt="ZORIQ - Shop More. Live Better."
          className={`${selectedHeight} w-auto object-contain mix-blend-screen contrast-125 transition-transform duration-300 group-hover:scale-102`}
          style={{
            maxWidth: size === 'lg' ? '220px' : size === 'sm' ? '120px' : '160px'
          }}
        />
      </div>
    </div>
  );
}

// Icon-only emblem for small spots, buttons, favicons, or badges
export function ZoriqEmblem({ size = 28, className = '' }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-slate-950 p-1 border border-slate-800/80 shadow-md ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      title="ZORIQ"
    >
      <img
        src={zoriqLogoImg}
        alt="Z"
        className="w-[180%] max-w-none -translate-x-[7%] scale-150 mix-blend-screen contrast-125"
      />
    </div>
  );
}