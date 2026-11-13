import React, { useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ShoppingBag,
  Eye,
  Heart,
  MessageCircle,
  Gift,
  ShieldCheck,
  Grid as GridIcon,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export default function CustomerStorefront() {
  const {
    products,
    sellerSettings,
    addToCart,
    setSelectedProduct,
    toggleWishlist,
    isInWishlist,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    setActiveInfoPage,
  } = useStore();

  // Derived categories with item counts
  const categoriesList = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      const cat = p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const entries = Object.entries(counts).map(([k, v]) => ({ name: k, count: v }));
    return [{ name: 'All', count: products.length }, ...entries];
  }, [products]);

  // Curated collections with representative products
  const collectionsWithImages = useMemo(() => {
    const list = [];
    const seen = new Set();

    products.forEach((p) => {
      const cat = p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : 'General';
      if (!seen.has(cat)) {
        seen.add(cat);
        list.push({
          category: cat,
          image: p.imageUrl || null,
          sampleProduct: p,
        });
      }
    });

    // Provide default fallback categories if catalog is small
    if (list.length < 3) {
      if (!seen.has('Glassware')) list.push({ category: 'Glassware', image: null });
      if (!seen.has('Kitchen Finds')) list.push({ category: 'Kitchen Finds', image: null });
      if (!seen.has('Bottles')) list.push({ category: 'Bottles', image: null });
    }

    return list.slice(0, 6);
  }, [products]);

  // Filtered & Sorted products for Grid
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const cat = p.category ? p.category.toLowerCase() : 'general';
      const selected = selectedCategory.toLowerCase();
      const matchesCat = selected === 'all' || cat === selected;

      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));

      return matchesCat && matchesQuery;
    });

    // Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'name-az') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  // New Arrivals rail (first 6 products)
  const newArrivals = useMemo(() => {
    return products.slice(0, 8);
  }, [products]);

  // Bestsellers rail (products marked bestseller or top rated)
  const bestsellers = useMemo(() => {
    const marked = products.filter((p) => p.isBestseller || p.featured || p.rating >= 4.5);
    return marked.length >= 3 ? marked : products.slice().reverse().slice(0, 8);
  }, [products]);

  const handleCollectionSelect = (cat) => {
    setSelectedCategory(cat.toLowerCase());
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
  };

  const supportWhatsapp = sellerSettings?.supportWhatsapp || '919876543210';

  return (
    <div className="bg-[#fcfbf8] text-[#1c1a17]">
      {/* 1. HERO SECTION */}
      <section className="hero">
        {/* Floating subtle geometric illustration */}
        <div className="art" aria-hidden="true">
          <svg viewBox="0 0 200 250" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="250" rx="16" fill="rgba(255,255,255,0.4)" />
            <circle cx="100" cy="110" r="54" fill="#c9a56b" opacity="0.3" />
            <rect x="58" y="70" width="84" height="110" rx="12" fill="#fff" opacity="0.6" />
          </svg>
        </div>

        <div className="c">
          <div className="eyebrow">Everyday store</div>
          <h1>
            Useful things for <em>home and kitchen</em>
          </h1>
          <div className="btns">
            <a
              href="#shop"
              className="btn dark"
              onClick={(e) => {
                e.preventDefault();
                setSelectedCategory('all');
                document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Shop all <ArrowRight className="w-4 h-4 ml-1" />
            </a>
            <a
              href="#collections"
              className="btn line"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Browse by collection
            </a>
          </div>
        </div>
      </section>

      {/* 2. ROTATING CIRCULAR COLLECTIONS ROW */}
      <div id="collections" className="wrap">
        <div className="cols">
          {collectionsWithImages.map((col, idx) => (
            <div
              key={idx}
              className="col"
              onClick={() => handleCollectionSelect(col.category)}
            >
              <div className="ring">
                <div>
                  {col.image ? (
                    <img src={col.image} alt={col.category} />
                  ) : (
                    <div className="w-full h-full bg-[#f4f0e9] flex items-center justify-center text-xs font-semibold uppercase tracking-widest text-[var(--gold)]">
                      {col.category.slice(0, 3)}
                    </div>
                  )}
                </div>
              </div>
              <span>{col.category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. NEW ARRIVALS RAIL */}
      {newArrivals.length > 0 && (
        <section id="new-arrivals" className="sec">
          <div className="wrap">
            <div className="eyebrow">Fresh finds</div>
            <h2>
              <em>New</em> arrivals
            </h2>
          </div>

          <div className="rail">
            {newArrivals.map((product) => {
              const inWish = isInWishlist(product.id);
              const hasDiscount = product.originalPrice && product.originalPrice > product.price;

              return (
                <div key={product.id} className="card">
                  <div
                    className="im"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} />
                    ) : (
                      <div className="w-full h-full bg-[#f4f0e9] flex items-center justify-center text-xs text-gray-400">
                        zoriq
                      </div>
                    )}

                    {hasDiscount ? (
                      <span className="tg">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </span>
                    ) : (
                      <span className="tg">New</span>
                    )}

                    {/* Quick View Button */}
                    <button
                      type="button"
                      className="ac q"
                      title="Quick View"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(product);
                      }}
                    >
                      <Eye className="i" />
                    </button>

                    {/* Instant Add to Bag Button */}
                    <button
                      type="button"
                      className="ac b"
                      title="Add to Bag"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product, 1);
                      }}
                    >
                      <ShoppingBag className="i" />
                    </button>
                  </div>

                  <h3 onClick={() => setSelectedProduct(product)}>
                    <a>{product.name}</a>
                  </h3>

                  <div className="pr">
                    <b>₹{Number(product.price).toLocaleString('en-IN')}</b>
                    {hasDiscount && (
                      <s>₹{Number(product.originalPrice).toLocaleString('en-IN')}</s>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. BESTSELLERS RAIL */}
      {bestsellers.length > 0 && (
        <section id="bestsellers" className="sec" style={{ paddingTop: '10px' }}>
          <div className="wrap">
            <div className="eyebrow">Customer favorites</div>
            <h2>
              <em>Bestsellers</em>
            </h2>
          </div>

          <div className="rail">
            {bestsellers.map((product) => {
              const hasDiscount = product.originalPrice && product.originalPrice > product.price;

              return (
                <div key={`bs-${product.id}`} className="card">
                  <div
                    className="im"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} />
                    ) : (
                      <div className="w-full h-full bg-[#f4f0e9] flex items-center justify-center text-xs text-gray-400">
                        zoriq
                      </div>
                    )}

                    <span className="tg">Bestseller</span>

                    <button
                      type="button"
                      className="ac q"
                      title="Quick View"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(product);
                      }}
                    >
                      <Eye className="i" />
                    </button>

                    <button
                      type="button"
                      className="ac b"
                      title="Add to Bag"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product, 1);
                      }}
                    >
                      <ShoppingBag className="i" />
                    </button>
                  </div>

                  <h3 onClick={() => setSelectedProduct(product)}>
                    <a>{product.name}</a>
                  </h3>

                  <div className="pr">
                    <b>₹{Number(product.price).toLocaleString('en-IN')}</b>
                    {hasDiscount && (
                      <s>₹{Number(product.originalPrice).toLocaleString('en-IN')}</s>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. SHOP ALL GRID */}
      <section id="shop" className="sec" style={{ paddingTop: '20px' }}>
        <div className="wrap">
          <div className="ph">
            <div className="eyebrow">Catalog</div>
            <h1>
              Shop <em>all products</em>
            </h1>
            <p>Thoughtfully made glassware, storage canisters, and everyday kitchen essentials.</p>
          </div>

          {/* Category Filter Chips */}
          <div className="chips">
            {categoriesList.map((cat) => (
              <button
                key={cat.name}
                type="button"
                className={`chip ${selectedCategory.toLowerCase() === cat.name.toLowerCase() ? 'on' : ''}`}
                onClick={() => setSelectedCategory(cat.name.toLowerCase())}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>

          {/* Bar with count & sorting */}
          <div className="bar">
            <span>Showing {filteredProducts.length} items</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-az">Name: A to Z</option>
            </select>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center text-[var(--ink2)]">
              <p className="text-lg">No products found in this category.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="btn dark mt-4"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid">
              {filteredProducts.map((product) => {
                const inWish = isInWishlist(product.id);
                const hasDiscount = product.originalPrice && product.originalPrice > product.price;

                return (
                  <div key={product.id} className="card">
                    <div
                      className="im"
                      onClick={() => setSelectedProduct(product)}
                    >
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} />
                      ) : (
                        <div className="w-full h-full bg-[#f4f0e9] flex items-center justify-center text-xs text-gray-400">
                          zoriq
                        </div>
                      )}

                      {hasDiscount ? (
                        <span className="tg">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </span>
                      ) : (
                        <span className="tg">{product.category || 'Kitchen'}</span>
                      )}

                      {/* Wishlist Heart Top Right */}
                      <button
                        type="button"
                        className={`ac q ${inWish ? 'text-rose-500' : ''}`}
                        title={inWish ? 'Remove from wishlist' : 'Save to wishlist'}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                      >
                        <Heart className={`i ${inWish ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>

                      {/* Add to Bag Bottom Right */}
                      <button
                        type="button"
                        className="ac b"
                        title="Add to Bag"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product, 1);
                        }}
                      >
                        <ShoppingBag className="i" />
                      </button>
                    </div>

                    <h3 onClick={() => setSelectedProduct(product)}>
                      <a>{product.name}</a>
                    </h3>

                    <div className="pr">
                      <b>₹{Number(product.price).toLocaleString('en-IN')}</b>
                      {hasDiscount && (
                        <s>₹{Number(product.originalPrice).toLocaleString('en-IN')}</s>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 6. FEATURES SECTION */}
      <section className="feat">
        <div className="wrap">
          <div className="g">
            <div className="it">
              <Gift className="i" />
              <b>Useful little finds</b>
              <span>Daily goods chosen for ease, durability, and daily joy.</span>
            </div>
            <div className="it">
              <ShieldCheck className="i" />
              <b>Secure checkout</b>
              <span>Fast shipping across India with reliable delivery & COD available.</span>
            </div>
            <div className="it">
              <HelpCircle className="i" />
              <b>Questions welcome</b>
              <span>Tap chat anytime for care instructions and product advice.</span>
            </div>
            <div className="it">
              <GridIcon className="i" />
              <b>Curated collections</b>
              <span>Everyday home and kitchen objects crafted for mindful living.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="ft">
        <div className="wrap">
          <div className="grid4">
            <div>
              <a
                href="#/"
                className="logo"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                zoriq
              </a>
              <p className="tag">
                {sellerSettings?.tagline || 'Useful things for home and kitchen.'}
              </p>
            </div>

            <div className="cl" style={{ gridColumn: 'span 2' }}>
              <div>
                <h4>Shop</h4>
                <a
                  href="#shop"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedCategory('all');
                    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Shop all
                </a>
                <button
                  type="button"
                  onClick={() => setActiveInfoPage('journal')}
                >
                  Journal & Care
                </button>
              </div>

              <div>
                <h4>Information</h4>
                <button
                  type="button"
                  onClick={() => setActiveInfoPage('about')}
                >
                  About us
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInfoPage('contact')}
                >
                  Contact
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInfoPage('shipping')}
                >
                  Shipping & Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInfoPage('returns')}
                >
                  Returns
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInfoPage('privacy')}
                >
                  Privacy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Large subtle watermark */}
        <div className="wm" aria-hidden="true">
          zoriq
        </div>

        <div className="wrap cp">
          © zoriq · All rights reserved.
        </div>
      </footer>

      {/* 8. FLOATING WHATSAPP / CHAT BUTTON */}
      <a
        href={`https://wa.me/${supportWhatsapp}?text=Hi%20zoriq%2C%20I%20have%20a%20question%20about%20your%20products.`}
        target="_blank"
        rel="noopener noreferrer"
        className="chat"
        title="Chat with us on WhatsApp"
        aria-label="Chat with us"
      >
        <MessageCircle className="i" />
      </a>
    </div>
  );
}
