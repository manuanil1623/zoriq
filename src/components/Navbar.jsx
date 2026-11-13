import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  Settings,
  PlusCircle,
  LogOut,
  ArrowRight
} from 'lucide-react';

export default function Navbar() {
  const {
    role,
    setRole,
    isAdminLoggedIn,
    setIsAdminLoginModalOpen,
    logoutAdmin,
    cartCount,
    setIsCartOpen,
    orders,
    customerOrders,
    isCustomerLoggedIn,
    customerUser,
    setIsAuthModalOpen,
    setAuthModalMode,
    logoutCustomer,
    setIsMyOrdersOpen,
    wishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    isSearchOpen,
    setIsSearchOpen,
    setActiveInfoPage,
    setSelectedCategory,
    sellerActiveTab,
    setSellerActiveTab,
    setIsProductEditorOpen,
    setProductToEdit,
    products,
  } = useStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Secret Owner Access: ?admin, #admin, or Ctrl+Shift+A
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkUrlSecret = () => {
      const search = window.location.search;
      const hash = window.location.hash;
      if (search.includes('admin') || search.includes('owner') || hash === '#admin' || hash === '#owner') {
        setIsAdminLoginModalOpen(true);
      }
    };

    checkUrlSecret();
    window.addEventListener('hashchange', checkUrlSecret);

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminLoginModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const onScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('hashchange', checkUrlSecret);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', onScroll);
    };
  }, [setIsAdminLoginModalOpen]);

  // Categories list for menu
  const uniqueCategories = React.useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) {
        set.add(p.category.charAt(0).toUpperCase() + p.category.slice(1));
      }
    });
    return Array.from(set);
  }, [products]);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat.toLowerCase());
    setIsMenuOpen(false);
    const shopEl = document.getElementById('shop');
    if (shopEl) {
      shopEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAccountClick = () => {
    if (isCustomerLoggedIn) {
      setIsMyOrdersOpen(true);
    } else {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
    }
  };

  // 1. CUSTOMER MODE: Public Minimalist Header & Drawer
  if (role === 'customer') {
    return (
      <>
        <header className={`hd ${isScrolled ? 'sc' : ''}`} id="hd">
          <div className="in">
            {/* Hamburger Button */}
            <button
              className={`ib burger ${isMenuOpen ? 'x' : ''}`}
              id="burger"
              aria-label="Menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <i></i>
              <i></i>
              <i></i>
            </button>

            {/* Brand Logo in Tenor Sans */}
            <a
              href="#/"
              className="logo select-none"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-label="zoriq home"
            >
              zoriq
              {/* Discrete secret admin trigger dot */}
              <i
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAdminLoginModalOpen(true);
                }}
                title="zoriq"
                style={{ fontStyle: 'normal', cursor: 'pointer', color: 'var(--gold)' }}
              >
                .
              </i>
            </a>

            {/* Desktop Navigation */}
            <nav className="dnav">
              <a
                href="#shop"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedCategory('all');
                  document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Shop
              </a>
              <a
                href="#shop"
                onClick={(e) => {
                  e.preventDefault();
                  handleCategoryClick('Glassware');
                }}
              >
                Glassware
              </a>
              <a
                href="#shop"
                onClick={(e) => {
                  e.preventDefault();
                  handleCategoryClick('Bestsellers');
                }}
              >
                Bestsellers
              </a>
              <button
                type="button"
                onClick={() => setActiveInfoPage('story')}
              >
                Our story
              </button>
              {isAdminLoggedIn && (
                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  style={{ color: 'var(--gold)', fontWeight: 600 }}
                  title="Return to Seller Portal"
                >
                  Admin Portal
                </button>
              )}
            </nav>

            <span className="sp"></span>

            {/* Account Icon */}
            <button
              className="ib"
              id="bAcc"
              aria-label="Account"
              title={isCustomerLoggedIn ? `${customerUser?.name || 'Account'}` : 'Sign In'}
              onClick={handleAccountClick}
            >
              <svg className="i" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
              </svg>
            </button>

            {/* Search Icon */}
            <button
              className="ib"
              id="bSearch"
              aria-label="Search"
              title="Search products"
              onClick={() => setIsSearchOpen(true)}
            >
              <svg className="i" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4.5 4.5" />
              </svg>
            </button>

            {/* Wishlist Icon */}
            <button
              className="ib"
              id="bWish"
              aria-label="Wishlist"
              title="Wishlist"
              onClick={() => setIsWishlistOpen(true)}
            >
              <svg className="i" viewBox="0 0 24 24">
                <path d="M12 20.5S3.5 15 3.5 9a4.5 4.5 0 0 1 8.5-2 4.5 4.5 0 0 1 8.5 2c0 6-8.5 11.5-8.5 11.5z" />
              </svg>
              {wishlist && wishlist.length > 0 && (
                <span className="bd">{wishlist.length}</span>
              )}
            </button>

            {/* Cart Icon */}
            <button
              className="ib"
              id="bCart"
              aria-label="Cart"
              title="View Cart"
              onClick={() => setIsCartOpen(true)}
            >
              <svg className="i" viewBox="0 0 24 24">
                <path d="M5 8h14l1 12.5H4z" />
                <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
              </svg>
              {cartCount > 0 && <span className="bd">{cartCount}</span>}
            </button>
          </div>
        </header>

        {/* Mobile Scrim */}
        <div
          className={`scrim ${isMenuOpen ? 'on' : ''}`}
          id="scrim"
          onClick={() => setIsMenuOpen(false)}
        ></div>

        {/* Mobile Slide-out Drawer */}
        <aside id="menu" className={isMenuOpen ? 'on' : ''} aria-label="Menu">
          <span className="cap">Shop by category</span>
          <div className="cats" id="mCats">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setIsMenuOpen(false);
                document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              All products
            </button>
            {uniqueCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="big">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setIsMenuOpen(false);
                document.getElementById('new-arrivals')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              New arrivals <span>→</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setIsMenuOpen(false);
                document.getElementById('bestsellers')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Bestsellers <span>→</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                setActiveInfoPage('story');
              }}
            >
              Our story <span>→</span>
            </button>
            {isCustomerLoggedIn ? (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsMyOrdersOpen(true);
                }}
              >
                My Orders & Account <span>→</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
              >
                Customer Sign In <span>→</span>
              </button>
            )}
          </div>
        </aside>
      </>
    );
  }

  // 2. SELLER MODE: Admin Portal Top Bar
  return (
    <div className="atop">
      <div className="alogo">z</div>
      <span>
        zoriq merchant
        <b className="live">● LIVE SYNC</b>
      </span>

      <div className="asp"></div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setProductToEdit(null);
            setIsProductEditorOpen(true);
          }}
          className="ab sm flex items-center gap-1.5"
          title="Add New Product"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Add Product</span>
        </button>

        <button
          type="button"
          onClick={() => setRole('customer')}
          className="ag flex items-center gap-1"
          title="Switch to Storefront"
        >
          <span>Storefront</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={logoutAdmin}
          className="p-2 text-rose-600 hover:text-rose-700 transition-colors"
          title="Sign out of Admin"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
