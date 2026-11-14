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

function InstagramIcon({ className = 'w-6 h-6' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export const CURATED_DISCOVERY_CIRCLES = [
  {
    title: 'New In',
    subtitle: 'Fresh curated finds',
    img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
    action: 'new-arrivals'
  },
  {
    title: 'Bestsellers',
    subtitle: 'Most loved pieces',
    img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80',
    action: 'bestsellers'
  },
  {
    title: 'Daily Goods',
    subtitle: 'Kitchen & Home staples',
    img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=400&q=80',
    action: 'shop'
  },
  {
    title: 'Under ₹499',
    subtitle: 'Pocket-friendly finds',
    img: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80',
    action: 'under-499'
  },
  {
    title: 'Our Story',
    subtitle: 'Mindful design',
    img: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=400&q=80',
    action: 'story'
  }
];

export default function CustomerStorefront() {
  const {
    products,
    sellerSettings,
    storeImages,
    collections,
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

  // Derived categories with item counts based on store collections
  const categoriesList = useMemo(() => {
    const list = [{ name: 'All', count: products.length }];
    (collections || []).forEach((colName) => {
      const count = products.filter(
        (p) => (p.category || '').toLowerCase() === colName.toLowerCase()
      ).length;
      list.push({ name: colName, count });
    });
    return list;
  }, [collections, products]);

  // Curated collections with representative products
  const collectionsWithImages = useMemo(() => {
    return (collections || []).map((colName) => {
      const sample = products.find(
        (p) => (p.category || '').toLowerCase() === colName.toLowerCase()
      );
      return {
        category: colName,
        image: sample?.imageUrl || null,
        sampleProduct: sample,
      };
    });
  }, [collections, products]);

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

  const handleDiscoveryClick = (action) => {
    if (action === 'new-arrivals') {
      document.getElementById('new-arrivals')?.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'bestsellers') {
      document.getElementById('bestsellers')?.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'story') {
      setActiveInfoPage('story');
    } else {
      setSelectedCategory('all');
      document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const supportWhatsapp = sellerSettings?.supportWhatsapp || '919876543210';
  const heroImage = storeImages?.hero || sellerSettings?.heroImage || '';

  return (
    <div className="bg-[#fcfbf8] text-[#1c1a17]">
      {/* 1. HERO SECTION */}
      <section
        className={`hero ${heroImage ? 'hasimg' : ''}`}
        style={heroImage ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.22), rgba(0,0,0,0.55)), url(${heroImage})` } : undefined}
      >
        {/* Floating subtle geometric illustration (only shown on default gradient) */}
        {!heroImage && (
          <div className="art" aria-hidden="true">
            <svg viewBox="0 0 200 250" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="250" rx="16" fill="rgba(255,255,255,0.4)" />
              <circle cx="100" cy="110" r="54" fill="#c9a56b" opacity="0.3" />
              <rect x="58" y="70" width="84" height="110" rx="12" fill="#fff" opacity="0.6" />
            </svg>
          </div>
        )}

        <div className="c">
          <div className="eyebrow">Everyday store</div>
          <h1>
            Everything you need, <em>curated for you.</em>
          </h1>
          <p className="sub">
            Your all-in-one store, minus the chaos.
          </p>
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

      {/* 2. ROTATING CIRCULAR COLLECTIONS ROW OR CURATED DISCOVERIES */}
      <div id="collections" className="wrap">
        {collectionsWithImages.length > 0 ? (
          <div className="cols">
            {collectionsWithImages.map((col, idx) => {
              const customColImg = storeImages?.cols?.[col.category] || storeImages?.cols?.[col.category?.toLowerCase()] || sellerSettings?.collectionImages?.[col.category];
              const displayImg = customColImg || col.image;

              return (
                <div
                  key={idx}
                  className="col"
                  onClick={() => handleCollectionSelect(col.category)}
                >
                  <div className="ring">
                    <div>
                      {displayImg ? (
                        <img src={displayImg} alt={col.category} />
                      ) : (
                        <div className="w-full h-full bg-[#f4f0e9] flex items-center justify-center text-xs font-semibold uppercase tracking-widest text-[var(--gold)]">
                          {col.category.slice(0, 3)}
                        </div>
                      )}
                    </div>
                  </div>
                  <span>{col.category}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <div className="cols">
              {CURATED_DISCOVERY_CIRCLES.map((item, idx) => (
                <div
                  key={idx}
                  className="col cursor-pointer"
                  onClick={() => handleDiscoveryClick(item.action)}
                  title={item.subtitle}
                >
                  <div className="ring">
                    <div>
                      <img src={item.img} alt={item.title} />
                    </div>
                  </div>
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
              <span>Tap chat or DM @zoriq7 anytime for product advice and order questions.</span>
            </div>
            <div className="it">
              <GridIcon className="i" />
              <b>Curated collections</b>
              <span>Everything you need, curated for you. Minus the chaos.</span>
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
                {sellerSettings?.tagline || 'Everything you need, curated for you. Your all-in-one store, minus the chaos.'}
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

      {/* 8. FLOATING INSTAGRAM CHAT BUTTON */}
      <a
        href="https://www.instagram.com/zoriq7"
        target="_blank"
        rel="noopener noreferrer"
        className="chat ig-chat"
        title="Chat / Message us on Instagram @zoriq7"
        aria-label="Chat with us on Instagram @zoriq7"
      >
        <InstagramIcon className="i" />
      </a>
    </div>
  );
}
