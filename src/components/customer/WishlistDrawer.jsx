import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Trash2, ShoppingBag } from 'lucide-react';

export default function WishlistDrawer() {
  const {
    wishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    toggleWishlist,
    addToCart,
    setSelectedProduct,
  } = useStore();

  if (!isWishlistOpen) return null;

  return (
    <>
      {/* Scrim */}
      <div
        className="scrim on"
        style={{ zIndex: 94 }}
        onClick={() => setIsWishlistOpen(false)}
      ></div>

      {/* Wishlist Panel */}
      <aside className="panel on" id="wishP" aria-label="Wishlist">
        <div className="ph2">
          <b>Wishlist ({wishlist.length})</b>
          <button
            type="button"
            className="close"
            aria-label="Close Wishlist"
            onClick={() => setIsWishlistOpen(false)}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="bd2">
          {wishlist.length === 0 ? (
            <div className="py-20 text-center text-[var(--ink2)]">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-gray-300 stroke-current fill-none"
                viewBox="0 0 24 24"
              >
                <path d="M12 20.5S3.5 15 3.5 9a4.5 4.5 0 0 1 8.5-2 4.5 4.5 0 0 1 8.5 2c0 6-8.5 11.5-8.5 11.5z" />
              </svg>
              <p className="text-base font-medium text-[var(--ink)]">Your wishlist is empty</p>
              <p className="text-xs text-[var(--muted)] mt-1">
                Tap the heart on any product to save it for later.
              </p>
            </div>
          ) : (
            wishlist.map((item) => (
              <div key={item.id} className="line-it">
                <div
                  className="t cursor-pointer"
                  onClick={() => {
                    setSelectedProduct(item);
                    setIsWishlistOpen(false);
                  }}
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <div className="w-full h-full bg-[#f4f0e9] flex items-center justify-center text-xs text-gray-400">
                      zoriq
                    </div>
                  )}
                </div>

                <div className="m">
                  <b
                    className="cursor-pointer hover:text-[var(--gold)] transition-colors truncate"
                    onClick={() => {
                      setSelectedProduct(item);
                      setIsWishlistOpen(false);
                    }}
                  >
                    {item.name}
                  </b>
                  <small className="block mt-0.5">
                    ₹{Number(item.price).toLocaleString('en-IN')}
                    {item.originalPrice && item.originalPrice > item.price && (
                      <s className="ml-2 text-gray-400">
                        ₹{Number(item.originalPrice).toLocaleString('en-IN')}
                      </s>
                    )}
                  </small>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => addToCart(item, 1)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider bg-[var(--ink)] text-white hover:bg-[var(--gold)] transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Bag</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(item)}
                      className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
