import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';

export default function GlassDock() {
  const {
    role,
    cartCount,
    setIsCartOpen,
    isCartOpen,
    isAuthModalOpen,
    isCheckoutOpen,
    isMyOrdersOpen,
    isAdminLoginModalOpen,
    isProductEditorOpen,
  } = useStore();

  const [activeKey, setActiveKey] = useState('home');

  // Any modal/drawer open -> tuck dock away smoothly
  const isAnyModalOpen = Boolean(
    isCartOpen ||
    isAuthModalOpen ||
    isCheckoutOpen ||
    isMyOrdersOpen ||
    isAdminLoginModalOpen ||
    isProductEditorOpen
  );

  // If in seller admin view, hide the customer dock
  if (role !== 'customer') {
    return null;
  }

  const items = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
      ),
    },
    {
      id: 'shop',
      label: 'Shop',
      icon: <path d="M5 8h14l1 12H4z M9 8V6a3 3 0 0 1 6 0v2" />,
    },
    {
      id: 'search',
      label: 'Search',
      icon: (
        <>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </>
      ),
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: (
        <>
          <path d="M3 4h2.5l2.2 10.5h10.3L20 8H6.5" />
          <circle cx="9.5" cy="19" r="1.4" />
          <circle cx="17" cy="19" r="1.4" />
        </>
      ),
    },
  ];

  const handleClick = (id) => {
    setActiveKey(id);

    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (id === 'shop') {
      const el = document.getElementById('all') || document.getElementById('shop');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (id === 'search') {
      const el = document.getElementById('all') || document.getElementById('shop');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const searchInput = document.querySelector('.zq-search');
        if (searchInput) searchInput.focus({ preventScroll: true });
      }, 400);
    } else if (id === 'cart') {
      setIsCartOpen(true);
    }
  };

  // Track active scroll position
  useEffect(() => {
    const handleScroll = () => {
      const allEl = document.getElementById('all') || document.getElementById('shop');
      const vh = window.innerHeight;
      const searchInput = document.querySelector('.zq-search');

      if (searchInput && document.activeElement === searchInput) {
        setActiveKey('search');
        return;
      }

      if (allEl && allEl.getBoundingClientRect().top < vh * 0.6) {
        setActiveKey('shop');
      } else {
        setActiveKey('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeIndex = items.findIndex((it) => it.id === activeKey);
  const lensTranslateX = activeIndex >= 0 ? activeIndex * 66 : 0;

  return (
    <nav className={`zq-dock ${isAnyModalOpen ? 'away' : ''}`} aria-label="Quick navigation">
      {activeIndex >= 0 && (
        <i
          className="zq-lens"
          style={{ transform: `translateX(${lensTranslateX}px)` }}
          aria-hidden="true"
        />
      )}
      {items.map((it) => {
        const isActive = it.id === activeKey;
        return (
          <button
            key={it.id}
            type="button"
            data-k={it.id}
            aria-label={it.label}
            className={isActive ? 'on' : ''}
            onClick={() => handleClick(it.id)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {it.icon}
            </svg>
            <span>{it.label}</span>
            {it.id === 'cart' && (
              <b className={`zq-bd ${cartCount > 0 ? 'show' : ''}`}>
                {cartCount}
              </b>
            )}
          </button>
        );
      })}
    </nav>
  );
}
