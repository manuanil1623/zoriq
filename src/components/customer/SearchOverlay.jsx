import React, { useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Search as SearchIcon } from 'lucide-react';

export default function SearchOverlay() {
  const {
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    products,
    setSelectedProduct,
  } = useStore();

  const inputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  // Escape to close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      window.addEventListener('keydown', onKey);
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const q = searchQuery.trim().toLowerCase();
  const searchResults = q
    ? products.filter((p) => {
        return (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
        );
      })
    : [];

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setIsSearchOpen(false);
  };

  return (
    <>
      {/* Background Backdrop */}
      <div
        className="scrim on"
        style={{ zIndex: 96 }}
        onClick={() => setIsSearchOpen(false)}
      ></div>

      {/* Slide-down Search Bar */}
      <div className="search on" role="dialog" aria-label="Search">
        <div className="sb">
          <svg className="i" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4.5 4.5" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            placeholder="Search products, cookware, glassware..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
          <button
            type="button"
            className="close"
            aria-label="Close search"
            onClick={() => setIsSearchOpen(false)}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="res">
          {q && searchResults.length === 0 && (
            <div className="py-8 text-center text-sm text-[var(--ink2)]">
              No products found matching "{searchQuery}".
            </div>
          )}

          {searchResults.map((product) => (
            <div
              key={product.id}
              className="item"
              onClick={() => handleSelectProduct(product)}
            >
              <div className="t">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} />
                ) : (
                  <div className="w-full h-full bg-[#f4f0e9] flex items-center justify-center text-xs text-gray-400">
                    zoriq
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <b className="font-normal text-sm block truncate text-[var(--ink)]">
                  {product.name}
                </b>
                <small className="text-xs text-[var(--muted)] capitalize">
                  {product.category || 'General'} · ₹{Number(product.price).toLocaleString('en-IN')}
                </small>
              </div>
            </div>
          ))}

          {!q && (
            <div className="hint">
              Popular searches: Glasses, Canisters, Water Bottles, Lunchbox, Steel
            </div>
          )}
        </div>
      </div>
    </>
  );
}
