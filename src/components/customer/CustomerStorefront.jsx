import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function CustomerStorefront() {
  const {
    products,
    sellerSettings,
    cartCount,
    addToCart,
    setIsCartOpen,
    setSelectedProduct,
    setIsMyOrdersOpen,
    setIsAdminLoginModalOpen,
  } = useStore();

  // Active Category filter
  const [activeCat, setActiveCat] = useState('All');

  // Hero refs
  const heroRef = useRef(null);
  const plRef = useRef(null);
  const prRef = useRef(null);
  const wordRef = useRef(null);
  const w1Ref = useRef(null);
  const w2Ref = useRef(null);
  const daRef = useRef(null);
  const dbRef = useRef(null);
  const introRef = useRef(null);

  // Deck state
  const deckRef = useRef(null);
  const [topIndex, setTopIndex] = useState(0);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(null);
  const isBusyRef = useRef(false);

  // Store description from settings (no fallback invented)
  const storeDescription = (sellerSettings?.tagline || sellerSettings?.description || '').trim();

  // Free shipping & delivery estimates from settings
  const freeShipping = sellerSettings?.freeShippingThreshold || 599;
  const shippingFee = sellerSettings?.standardShippingFee || 40;
  const deliveryTime = sellerSettings?.deliveryTimeEstimate || '5–9 days';

  // Real products only — strictly from website catalog, never demo placeholders
  const deckItems = useMemo(() => {
    return products.slice(0, 8);
  }, [products]);

  // Keep topIndex within bounds if products list changes
  useEffect(() => {
    if (topIndex >= deckItems.length) {
      setTopIndex(0);
    }
  }, [deckItems.length, topIndex]);

  // Derived categories with item counts
  const categoriesList = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      const cat = p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const entries = Object.entries(counts).map(([k, v]) => [k, v]);
    return [['All', products.length], ...entries];
  }, [products]);

  // Filtered products for grid
  const filteredProducts = useMemo(() => {
    if (activeCat === 'All') return products;
    return products.filter((p) => {
      const cat = p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : 'General';
      return cat === activeCat;
    });
  }, [products, activeCat]);

  // 1. SCROLL PORTAL ANIMATION (Exact formula from demo)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    const portal = () => {
      const hero = heroRef.current;
      if (!hero) return;

      const total = hero.offsetHeight - window.innerHeight;
      if (total <= 0) return;

      const p = clamp(-hero.getBoundingClientRect().top / total, 0, 1);

      if (plRef.current) plRef.current.style.transform = `translateX(${-p * 105}%)`;
      if (prRef.current) prRef.current.style.transform = `translateX(${p * 105}%)`;

      if (wordRef.current) {
        wordRef.current.style.transform = `scale(${1 + p * 0.28})`;
        wordRef.current.style.letterSpacing = `${0.02 - p * 0.09}em`;
        wordRef.current.style.opacity = 1 - clamp((p - 0.78) / 0.22, 0, 1);
      }

      if (w1Ref.current) w1Ref.current.style.transform = `translateX(${-p * 55}%)`;
      if (w2Ref.current) w2Ref.current.style.transform = `translateX(${p * 55}%)`;

      const w = window.innerWidth;
      const h = window.innerHeight;

      if (daRef.current) daRef.current.style.transform = `translate(${-p * w * 0.42}px, ${-p * h * 0.34}px)`;
      if (dbRef.current) dbRef.current.style.transform = `translate(${p * w * 0.42}px, ${p * h * 0.34}px)`;

      if (introRef.current) introRef.current.style.opacity = 1 - clamp((p - 0.25) / 0.3, 0, 1);
    };

    window.addEventListener('scroll', portal, { passive: true });
    window.addEventListener('resize', portal);
    portal();

    return () => {
      window.removeEventListener('scroll', portal);
      window.removeEventListener('resize', portal);
    };
  }, []);

  // 2. INTERSECTION OBSERVER FOR .rv REVEALS
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const elements = document.querySelectorAll('.rv');

    if (reduce || !('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [products, activeCat]);

  // 3. CARD DECK TOSS
  const toss = (dir) => {
    if (isBusyRef.current || deckItems.length === 0) return;
    isBusyRef.current = true;

    const deck = deckRef.current;
    if (!deck) return;

    const cards = deck.querySelectorAll('.card');
    const currentCard = cards[topIndex];
    const w = deck.offsetWidth;

    if (currentCard) {
      currentCard.classList.remove('drag');
      currentCard.style.transform = `translate(${dir * w * 1.15}px, -24px) rotate(${dir * 20}deg)`;
      currentCard.style.opacity = '0';
    }

    setTimeout(() => {
      setTopIndex((prev) => (prev + 1) % deckItems.length);
      isBusyRef.current = false;
    }, 320);
  };

  // Pointer drag for card deck
  const handlePointerDown = (e) => {
    if (isBusyRef.current || deckItems.length === 0) return;
    startXRef.current = e.clientX;
    isDraggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);

    const cards = deckRef.current?.querySelectorAll('.card');
    if (cards && cards[topIndex]) {
      cards[topIndex].classList.add('drag');
    }
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || startXRef.current === null) return;
    const dx = e.clientX - startXRef.current;
    const cards = deckRef.current?.querySelectorAll('.card');
    if (cards && cards[topIndex]) {
      cards[topIndex].style.transform = `translate(${dx}px, 0) rotate(${dx * 0.06}deg) scale(1.02)`;
    }
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current || startXRef.current === null) return;
    const dx = e.clientX - startXRef.current;
    startXRef.current = null;
    isDraggingRef.current = false;

    const deck = deckRef.current;
    if (deck && Math.abs(dx) > deck.offsetWidth * 0.1) {
      toss(dx > 0 ? 1 : -1);
    } else {
      const cards = deck?.querySelectorAll('.card');
      if (cards && cards[topIndex]) {
        cards[topIndex].classList.remove('drag');
        // Reset card back to default stack pos
        cards[topIndex].style.transform = 'translate(0, 0) scale(1) rotate(0deg)';
      }
    }
  };

  // Keyboard left/right for deck
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      toss(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      toss(-1);
    }
  };

  const handleScrollToShop = () => {
    const shopEl = document.getElementById('shop');
    if (shopEl) {
      shopEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="zoriq-storefront-wrapper">
      
      {/* 1. HERO OPENING WITH STAGE & PANELS */}
      <header className="hero" id="hero" ref={heroRef}>
        <div className="stage">
          {/* Left and right dark panels */}
          <div className="panel l" id="pl" ref={plRef} />
          <div className="panel r" id="pr" ref={prRef} />

          {/* Accent flying dots */}
          <span className="dot a" id="da" ref={daRef} />
          <span className="dot b" id="db" ref={dbRef} />

          {/* Corner labels */}
          <div className="corner t label">
            <span className="demo-tag">ZORIQ Store</span>
            <span>Free shipping over ₹{freeShipping}</span>
          </div>

          {/* Center ZORIQ + Small store text */}
          <div className="center">
            <div className="word" id="word" ref={wordRef}>
              <span id="w1" ref={w1Ref}>ZOR</span>
              <span id="w2" ref={w2Ref}>IQ</span>
            </div>

            <div id="intro" ref={introRef}>
              {storeDescription && (
                <p className="desc fade-in">
                  {storeDescription}
                </p>
              )}
              <div
                className="cue label fade-in"
                onClick={handleScrollToShop}
                role="button"
                tabIndex={0}
                aria-label="Scroll to shop"
              >
                Scroll to shop
              </div>
            </div>
          </div>

          <div className="corner b label">
            <span>Delivery in {deliveryTime}</span>
            <span>Scroll</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN STORE CONTENT */}
      <main className="store" id="shop">
        
        {/* NEW IN THE STORE SECTION: DECK */}
        <section className="wrap two">
          <div className="rv">
            <h2 className="store-h2">New in the store</h2>
            <p className="lede">
              {deckItems.length > 0
                ? 'Swipe or drag a card aside to explore our latest additions, or click any item to view details.'
                : 'Products added through the Owner Portal will appear directly in this card deck.'}
            </p>
            <div className="btns">
              <a className="btn main" href="#all">
                Shop all
              </a>
              <button className="btn" type="button" onClick={() => setIsCartOpen(true)}>
                View cart ({cartCount})
              </button>
            </div>
          </div>

          <div className="deck-box rv">
            {deckItems.length === 0 ? (
              <div className="deck" id="deck" tabIndex={0}>
                <div className="card text-center flex flex-col justify-center items-center p-8 bg-[#101317]">
                  <ShoppingBag className="w-10 h-10 text-[var(--ink2)] mb-3 opacity-50" />
                  <h3 className="text-base font-semibold text-[var(--ink)]">No Products in Store</h3>
                  <p className="text-xs text-[var(--ink2)] mt-2 leading-relaxed max-w-[24ch]">
                    Add your real products in the Owner Portal to display them live in this deck.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="deck"
                  id="deck"
                  ref={deckRef}
                  tabIndex={0}
                  aria-label="Product deck. Use left and right arrow keys or swipe."
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onKeyDown={handleKeyDown}
                >
                  {deckItems.map((it, i) => {
                    const n = deckItems.length;
                    const k = (i - topIndex + n) % n;
                    const zIndex = n - k;
                    const opacity = k > 2 ? 0 : 1;
                    const transform = `translate(${k * 12}px, ${-k * 9}px) scale(${1 - k * 0.045}) rotate(${k * 1.8}deg)`;

                    return (
                      <div
                        key={it.id || `deck-${i}`}
                        className="card"
                        style={{
                          zIndex,
                          opacity,
                          transform,
                        }}
                        onClick={() => {
                          if (it.id && setSelectedProduct) setSelectedProduct(it);
                        }}
                      >
                        <div className="w-full flex-1 flex flex-col justify-center items-center overflow-hidden py-2">
                          {it.image ? (
                            <img
                              src={it.image}
                              alt={it.name}
                              className="max-h-40 w-auto object-contain rounded-lg drop-shadow-md select-none pointer-events-none"
                              loading="lazy"
                            />
                          ) : (
                            <div className="glyph select-none">
                              {it.name ? it.name.charAt(0).toUpperCase() : 'Z'}
                            </div>
                          )}
                        </div>

                        <div className="mt-2">
                          <h3 className="truncate">{it.name}</h3>
                          <div className="flex items-center justify-between mt-1">
                            <span className="price font-semibold">₹{it.price}</span>
                            <button
                              type="button"
                              className="text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full border border-[var(--line)] hover:border-[var(--amber)] hover:text-[var(--amber)] transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(it);
                              }}
                            >
                              Add to cart
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="hint">
                  <span className="label" id="hint">Drag or use ← →</span>
                  <div className="dots" id="dots">
                    {deckItems.map((_, i) => (
                      <b key={i} className={i === topIndex ? 'on' : ''} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* CATEGORIES AND PRODUCT GRID */}
        <section className="wrap" style={{ paddingTop: 0 }} id="all">
          <div className="rv">
            <span className="label">Categories</span>
            
            {/* Category Rows */}
            <div className="rows" id="rows">
              {categoriesList.map(([catName, count], idx) => (
                <button
                  key={catName}
                  type="button"
                  className={`row ${catName === activeCat ? 'on' : ''}`}
                  onClick={() => setActiveCat(catName)}
                >
                  <span className="label">{idx === 0 ? 'Everything' : 'Category'}</span>
                  <span className="name">{catName}</span>
                  <span className="count">{count} {count === 1 ? 'item' : 'items'}</span>
                </button>
              ))}
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="my-16 text-center border border-[var(--line)] rounded-2xl p-12 bg-[var(--ground2)]">
                <ShoppingBag className="w-10 h-10 text-[var(--ink2)] mx-auto mb-3 opacity-60" />
                <h3 className="text-lg font-bold text-[var(--ink)] mb-1">
                  Catalog Updating
                </h3>
                <p className="text-xs text-[var(--ink2)] max-w-sm mx-auto">
                  New collections are being added. Check back shortly or log in to the owner portal to publish products!
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="my-12 text-center border border-[var(--line)] rounded-2xl p-8 bg-[var(--ground2)]">
                <p className="text-sm text-[var(--ink2)]">
                  No products found in category "{activeCat}".
                </p>
              </div>
            ) : (
              <div className="grid" id="grid">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="pc">
                    {product.image ? (
                      <div className="h-28 w-full flex items-center justify-center mb-auto overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="glyph">
                        {product.name ? product.name.charAt(0).toUpperCase() : 'Z'}
                      </div>
                    )}

                    <h3>{product.name}</h3>
                    <div className="price">₹{product.price}</div>
                    
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      Add to cart
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </section>

        {/* DELIVERY AND PAYMENT INFO TABLE */}
        <section className="wrap" style={{ paddingTop: 0 }} id="info">
          <div className="rv">
            <h2 className="store-h2">Delivery and payment</h2>
            <table className="tbl">
              <thead>
                <tr className="label">
                  <th>Topic</th>
                  <th>Detail</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Shipping</td>
                  <td>₹{shippingFee} standard</td>
                  <td>Free over ₹{freeShipping}</td>
                </tr>
                <tr>
                  <td>Delivery</td>
                  <td>{deliveryTime}</td>
                  <td>Across India</td>
                </tr>
                <tr>
                  <td>Payments</td>
                  <td>Razorpay, COD</td>
                  <td>UPI, cards, netbanking</td>
                </tr>
              </tbody>
            </table>
            <p className="label" style={{ marginTop: '18px' }}>
              All rules are synced live from your store settings.
            </p>
          </div>
        </section>

        {/* FOOTER & LARGE CROPPED TYPOGRAPHY */}
        <div className="foot label">
          <span
            onClick={() => setIsAdminLoginModalOpen(true)}
            className="cursor-pointer hover:text-[var(--ink)] transition-colors select-none"
            title="ZORIQ"
          >
            © {sellerSettings?.storeName || 'ZORIQ'}
          </span>
          <span>{sellerSettings?.tagline || 'Direct-to-Consumer Flagship Store'}</span>
        </div>
        <div className="crop" aria-hidden="true">
          <div>{sellerSettings?.storeName || 'ZORIQ'}</div>
        </div>

      </main>

    </div>
  );
}
