import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_SELLER_SETTINGS } from '../data/initialData';
import { fetchCloudStore, pushCloudStore, exportCatalogToJson, parseCatalogFromJson } from '../services/cloudSync';

const StoreContext = createContext();

const STORAGE_KEYS = {
  PRODUCTS: 'nexmart_products_v2',
  ORDERS: 'nexmart_live_orders',
  SETTINGS: 'nexmart_settings_v1',
  CART: 'nexmart_cart_v1',
  DELETED_IDS: 'nexmart_deleted_ids',
};

// Precise identification of demo items to ensure real user items are never filtered
const DEMO_PRODUCT_IDS = new Set([
  'prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5', 'prod-6', 'prod-7', 'prod-8'
]);

const isDemoProduct = (p) => {
  if (!p) return false;
  const id = String(p.id || '');
  if (DEMO_PRODUCT_IDS.has(id)) return true;
  if (/^prod-[1-8]$/.test(id)) return true;
  if (id.startsWith('starter-')) return true;
  const name = String(p.name || '').toLowerCase();
  if (
    name.includes('acousticpro') ||
    name.includes('pulsefit') ||
    name.includes('hypercharge') ||
    name.includes('aerostride') ||
    name.includes('artisan glass') ||
    name.includes('heritage full-grain')
  ) {
    return true;
  }
  return false;
};

// Immediate cleanup of any legacy demo orders and products stored in browser
try {
  localStorage.removeItem('nexmart_orders_v1');
  localStorage.removeItem('nexmart_orders_v2');
  localStorage.removeItem('nexmart_live_orders');
  const storedProds = localStorage.getItem('nexmart_products_v2');
  if (storedProds) {
    const parsed = JSON.parse(storedProds);
    if (Array.isArray(parsed)) {
      const cleaned = parsed.filter((p) => !isDemoProduct(p));
      localStorage.setItem('nexmart_products_v2', JSON.stringify(cleaned));
    }
  }
} catch {}

export function StoreProvider({ children }) {
  // 1. Role State: 'customer' or 'seller' (protected by admin auth)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      return localStorage.getItem('nexmart_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [role, setRole] = useState(() => {
    try {
      const isAuth = localStorage.getItem('nexmart_admin_auth') === 'true';
      return isAuth ? 'seller' : 'customer';
    } catch {
      return 'customer';
    }
  });

  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // 2. Products State with LocalStorage & Clean Empty Fallback
  const [products, setProducts] = useState(() => {
    try {
      const deletedIds = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.DELETED_IDS) || '[]'));
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((p) => !isDemoProduct(p) && !deletedIds.has(p.id));
    } catch {
      return [];
    }
  });

  // 3. Orders State with LocalStorage
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // Clean out any legacy mock demo orders
      return parsed.filter((o) => o.id !== 'ORD-94812' && o.id !== 'ORD-94755');
    } catch {
      return [];
    }
  });

  // 4. Seller Settings with LocalStorage
  const [sellerSettings, setSellerSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!saved) return DEFAULT_SELLER_SETTINGS;
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_SELLER_SETTINGS,
        ...parsed,
        storeName: !parsed.storeName || parsed.storeName.includes('NexMart') ? 'ZORIQ' : parsed.storeName,
        merchantName: !parsed.merchantName || parsed.merchantName.includes('NexMart') ? 'ZORIQ Official' : parsed.merchantName,
        adminPin: parsed.adminPin === '1234' || !parsed.adminPin ? '7784' : parsed.adminPin,
        razorpayKeyId: parsed.razorpayKeyId && !parsed.razorpayKeyId.startsWith('rzp_test_') ? parsed.razorpayKeyId : 'rzp_live_TstUZQzK6D5kHP',
        razorpayEnabled: true
      };
    } catch {
      return DEFAULT_SELLER_SETTINGS;
    }
  });

  // Real-Time Cross-Device Synchronization with Smart Merge
  const syncFromCloud = useCallback(async () => {
    try {
      const cloudData = await fetchCloudStore();
      if (!cloudData) return;

      // 0. Synchronize deleted product IDs (tombstones) across all devices
      let deletedIds = new Set();
      try {
        const localDeleted = JSON.parse(localStorage.getItem(STORAGE_KEYS.DELETED_IDS) || '[]');
        const cloudDeleted = Array.isArray(cloudData.deletedProductIds) ? cloudData.deletedProductIds : [];
        deletedIds = new Set([...localDeleted, ...cloudDeleted]);
        localStorage.setItem(STORAGE_KEYS.DELETED_IDS, JSON.stringify(Array.from(deletedIds)));
      } catch {}

      // 1. Sync Products: ensure products added on mobile or laptop are merged safely
      if (Array.isArray(cloudData.products)) {
        const cloudFiltered = cloudData.products.filter((p) => !isDemoProduct(p) && !deletedIds.has(p.id));

        setProducts((prevLocal) => {
          const localFiltered = prevLocal.filter((p) => !isDemoProduct(p) && !deletedIds.has(p.id));

          // If cloud has 0 valid products, but this device has added products:
          // NEVER wipe local products! Push local products to populate the cloud instead!
          if (cloudFiltered.length === 0 && localFiltered.length > 0) {
            pushCloudStore({
              products: localFiltered,
              sellerSettings,
              orders,
              deletedProductIds: Array.from(deletedIds)
            });
            return localFiltered;
          }

          // Build a merged map: product ID -> product
          const mergedMap = new Map();

          // Add cloud items first
          for (const item of cloudFiltered) {
            if (item && item.id) {
              mergedMap.set(item.id, item);
            }
          }

          // Merge local items (preserves newly added or edited products)
          for (const item of localFiltered) {
            if (item && item.id) {
              mergedMap.set(item.id, item);
            }
          }

          const merged = Array.from(mergedMap.values());
          try {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(merged));
          } catch {}

          return merged;
        });
      }

      // 2. Sync Seller Settings
      if (cloudData.sellerSettings && cloudData.sellerSettings.storeName) {
        setSellerSettings((prev) => ({
          ...prev,
          ...cloudData.sellerSettings,
          razorpayKeyId: cloudData.sellerSettings.razorpayKeyId || prev.razorpayKeyId || 'rzp_live_TstUZQzK6D5kHP',
          razorpayEnabled: true
        }));
      }

      // 3. Sync Orders
      if (Array.isArray(cloudData.orders)) {
        setOrders((prev) => {
          const existingIds = new Set(prev.map((o) => o.id));
          const newOrdersFromCloud = cloudData.orders.filter((o) => !existingIds.has(o.id));
          if (newOrdersFromCloud.length > 0) {
            return [...newOrdersFromCloud, ...prev];
          }
          return prev;
        });
      }
    } catch (err) {
      console.warn('Sync error:', err);
    }
  }, [sellerSettings, orders]);

  // Continuous background sync across all devices
  useEffect(() => {
    syncFromCloud();

    // Auto-sync every 5 seconds so changes on laptop show on mobile almost instantly
    const interval = setInterval(syncFromCloud, 5000);

    // Sync immediately when user switches back to the tab/app on phone or laptop
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncFromCloud();
      }
    };
    window.addEventListener('focus', syncFromCloud);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', syncFromCloud);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [syncFromCloud]);

  // 5. Cart State with LocalStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 6. Active Applied Coupon
  const [coupon, setCoupon] = useState(null); // { code: 'WELCOME10', discountPercent: 10, fixedDiscount: 0 }

  // 7. Modals and Navigation states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Seller editor modal
  const [isProductEditorOpen, setIsProductEditorOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [sellerActiveTab, setSellerActiveTab] = useState('dashboard'); // 'dashboard' | 'products' | 'orders' | 'settings'

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-low', 'price-high', 'rating'

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products:', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving orders:', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(sellerSettings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }, [sellerSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [cart]);

  // Toast notification helper
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Cart Calculations ---
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  let discountAmount = 0;
  if (coupon) {
    if (coupon.discountPercent) {
      discountAmount = Math.round((cartSubtotal * coupon.discountPercent) / 100);
    } else if (coupon.fixedDiscount) {
      discountAmount = Math.min(coupon.fixedDiscount, cartSubtotal);
    }
  }

  const shippingFee = cartSubtotal >= sellerSettings.freeShippingThreshold || cartSubtotal === 0
    ? 0
    : sellerSettings.standardShippingFee;

  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  // --- Cart Actions ---
  const addToCart = (product, quantity = 1) => {
    if (product.stock <= 0 || !product.inStock) {
      addToast('Sorry, this product is currently out of stock!', 'error');
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        if (newQty === existing.quantity) {
          addToast(`Maximum available stock (${product.stock}) reached for this item!`, 'warning');
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.image,
            category: product.category,
            stock: product.stock,
            quantity: Math.min(quantity, product.stock),
          },
        ];
      }
    });

    addToast(`Added "${product.name.slice(0, 24)}..." to cart!`, 'success');
  };

  const updateCartQuantity = (productId, delta) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === productId) {
            const product = products.find((p) => p.id === productId);
            const maxStock = product ? product.stock : 99;
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > maxStock) {
              addToast(`Only ${maxStock} items available in stock.`, 'warning');
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    addToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
  };

  const applyCouponCode = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'WELCOME10') {
      setCoupon({ code: 'WELCOME10', discountPercent: 10, description: '10% OFF on your order' });
      addToast('Coupon WELCOME10 applied! 10% discount added.', 'success');
      return true;
    } else if (cleanCode === 'UPI50') {
      setCoupon({ code: 'UPI50', fixedDiscount: 50, description: '₹50 Instant UPI Discount' });
      addToast('Coupon UPI50 applied! ₹50 discount added.', 'success');
      return true;
    } else if (cleanCode === 'FESTIVE20') {
      setCoupon({ code: 'FESTIVE20', discountPercent: 20, description: '20% Mega Festival Discount' });
      addToast('Coupon FESTIVE20 applied! 20% discount added.', 'success');
      return true;
    } else {
      addToast('Invalid coupon code. Try WELCOME10 or UPI50!', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    addToast('Coupon removed', 'info');
  };

  // --- Order Placement ---
  const placeOrder = ({ customer, paymentMethod, paymentDetails = {} }) => {
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingNumber = `NEX-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newOrder = {
      id: orderId,
      date: new Date().toISOString(),
      customer,
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountAmount,
      couponApplied: coupon ? coupon.code : null,
      shippingFee,
      total: cartTotal,
      paymentMethod, // 'RAZORPAY' | 'COD'
      paymentStatus: paymentMethod === 'RAZORPAY' ? 'Paid' : 'Pending (COD)',
      upiTxnId: paymentMethod === 'RAZORPAY' ? paymentDetails.razorpayPaymentId : null,
      upiVpa: null,
      razorpayPaymentId: paymentMethod === 'RAZORPAY' ? (paymentDetails.razorpayPaymentId || null) : null,
      razorpayOrderId: paymentMethod === 'RAZORPAY' ? (paymentDetails.razorpayOrderId || null) : null,
      razorpaySignature: paymentMethod === 'RAZORPAY' ? (paymentDetails.razorpaySignature || null) : null,
      orderStatus: paymentMethod === 'RAZORPAY' ? 'Confirmed' : 'Placed',
      trackingNumber,
    };

    // Deduct stock from products
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItem = cart.find((c) => c.id === prod.id);
        if (cartItem) {
          const newStock = Math.max(0, prod.stock - cartItem.quantity);
          return {
            ...prod,
            stock: newStock,
            inStock: newStock > 0,
          };
        }
        return prod;
      })
    );

    // Append to orders
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    pushCloudStore({ products, sellerSettings, orders: updatedOrders });

    // Clear cart
    clearCart();

    addToast(`Order #${orderId} placed successfully!`, 'success');
    return newOrder;
  };

  // --- Seller Actions with Automatic Cloud Sync ---
  const addProduct = (productData) => {
    const newId = `product-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newProduct = {
      id: newId,
      sku: productData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      rating: 5.0,
      reviewsCount: 1,
      inStock: Number(productData.stock) > 0,
      codAvailable: productData.codAvailable !== undefined ? Boolean(productData.codAvailable) : true,
      features: Array.isArray(productData.features) ? productData.features : (productData.features || '').split('\n').filter(Boolean),
      ...productData,
      price: Number(productData.price),
      originalPrice: Number(productData.originalPrice || productData.price * 1.3),
      stock: Number(productData.stock),
    };

    // Remove newId from deleted IDs if previously recorded
    try {
      const deleted = JSON.parse(localStorage.getItem(STORAGE_KEYS.DELETED_IDS) || '[]');
      const filteredDeleted = deleted.filter((id) => id !== newId);
      localStorage.setItem(STORAGE_KEYS.DELETED_IDS, JSON.stringify(filteredDeleted));
    } catch {}

    setProducts((prev) => {
      const updated = [newProduct, ...prev.filter((p) => p.id !== newId)];
      try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
      } catch {}
      pushCloudStore({ products: updated, sellerSettings, orders });
      return updated;
    });

    addToast(`Product "${newProduct.name}" added successfully!`, 'success');
  };

  const updateProduct = (productId, updatedData) => {
    setProducts((prev) => {
      const updated = prev.map((prod) => {
        if (prod.id === productId) {
          return {
            ...prod,
            ...updatedData,
            price: Number(updatedData.price),
            originalPrice: Number(updatedData.originalPrice || updatedData.price * 1.3),
            stock: Number(updatedData.stock),
            inStock: Number(updatedData.stock) > 0,
            codAvailable: updatedData.codAvailable !== undefined ? Boolean(updatedData.codAvailable) : (prod.codAvailable !== false),
            features: Array.isArray(updatedData.features)
              ? updatedData.features
              : (updatedData.features || '').split('\n').filter(Boolean),
          };
        }
        return prod;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
      } catch {}
      pushCloudStore({ products: updated, sellerSettings, orders });
      return updated;
    });
    addToast('Product updated and synced across all devices!', 'success');
  };

  const toggleProductCod = (productId) => {
    setProducts((prev) => {
      const updated = prev.map((prod) => {
        if (prod.id === productId) {
          const current = prod.codAvailable !== false;
          const next = !current;
          addToast(`Cash on Delivery (COD) ${next ? 'enabled' : 'disabled'} for "${prod.name.slice(0, 22)}..."`, 'info');
          return {
            ...prod,
            codAvailable: next,
          };
        }
        return prod;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
      } catch {}
      pushCloudStore({ products: updated, sellerSettings, orders });
      return updated;
    });
  };

  const deleteProduct = (productId) => {
    let deletedList = [];
    try {
      const deleted = JSON.parse(localStorage.getItem(STORAGE_KEYS.DELETED_IDS) || '[]');
      if (!deleted.includes(productId)) {
        deleted.push(productId);
      }
      deletedList = deleted;
      localStorage.setItem(STORAGE_KEYS.DELETED_IDS, JSON.stringify(deletedList));
    } catch {}

    setProducts((prev) => {
      const prod = prev.find((p) => p.id === productId);
      const updated = prev.filter((p) => p.id !== productId);
      try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
      } catch {}
      pushCloudStore({
        products: updated,
        sellerSettings,
        orders,
        deletedProductIds: deletedList
      });
      addToast(`Product "${prod?.name || 'Item'}" deleted and synced.`, 'info');
      return updated;
    });

    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const exportCatalog = () => {
    exportCatalogToJson(products, sellerSettings);
    addToast('Catalog JSON downloaded! You can import this file on any device.', 'success');
  };

  const importCatalog = async (file) => {
    try {
      const imported = await parseCatalogFromJson(file);
      if (imported && imported.length > 0) {
        setProducts(imported);
        try {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(imported));
        } catch {}
        pushCloudStore({ products: imported, sellerSettings, orders });
        addToast(`Successfully imported ${imported.length} products to this store!`, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to import catalog', 'error');
    }
  };

  const toggleProductStock = (productId) => {
    setProducts((prev) => {
      const updated = prev.map((prod) => {
        if (prod.id === productId) {
          const nextStockState = !prod.inStock;
          return {
            ...prod,
            inStock: nextStockState,
            stock: nextStockState ? (prod.stock > 0 ? prod.stock : 10) : 0,
          };
        }
        return prod;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
      } catch {}
      pushCloudStore({ products: updated, sellerSettings, orders });
      addToast('Stock status updated and synced', 'info');
      return updated;
    });
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map((ord) => {
      if (ord.id === orderId) {
        const updated = { ...ord, orderStatus: newStatus };
        // If marked Delivered and COD, mark payment as Paid
        if (newStatus === 'Delivered' && ord.paymentMethod === 'COD') {
          updated.paymentStatus = 'Paid';
        }
        return updated;
      }
      return ord;
    });
    setOrders(updatedOrders);
    pushCloudStore({ products, sellerSettings, orders: updatedOrders });
    addToast(`Order #${orderId} marked as ${newStatus}`, 'success');
  };

  const updatePaymentStatus = (orderId, newPaymentStatus) => {
    const updatedOrders = orders.map((ord) => {
      if (ord.id === orderId) {
        const updated = { ...ord, paymentStatus: newPaymentStatus };
        if (newPaymentStatus === 'Paid' && ord.orderStatus === 'Placed') {
          updated.orderStatus = 'Confirmed';
        } else if (newPaymentStatus === 'Failed') {
          updated.orderStatus = 'Cancelled';
        }
        return updated;
      }
      return ord;
    });
    setOrders(updatedOrders);
    pushCloudStore({ products, sellerSettings, orders: updatedOrders });
    addToast(`Order #${orderId} payment marked as "${newPaymentStatus}"`, 'info');
  };

  const updateSellerSettings = (newSettings) => {
    const updated = {
      ...sellerSettings,
      ...newSettings,
      razorpayKeyId: newSettings.razorpayKeyId || sellerSettings.razorpayKeyId || 'rzp_live_TstUZQzK6D5kHP',
      razorpayEnabled: true,
    };
    setSellerSettings(updated);
    pushCloudStore({ products, sellerSettings: updated, orders });
    addToast('Store settings updated and synced across all devices!', 'success');
  };

  const resetAllDataToDefault = () => {
    setProducts([]);
    setOrders([]);
    setSellerSettings(DEFAULT_SELLER_SETTINGS);
    setCart([]);
    setCoupon(null);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.DELETED_IDS);
    pushCloudStore({ products: [], sellerSettings: DEFAULT_SELLER_SETTINGS, orders: [], deletedProductIds: [] });
    addToast('Store reset to clean defaults', 'info');
  };

  const loadStarterProducts = () => {
    setProducts([]);
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
    } catch (e) {
      console.error('Error clearing products:', e);
    }
  };

  // --- Admin Security ---
  const loginAdmin = (inputPin, autoOpenEditor = false) => {
    const validPin = sellerSettings.adminPin || '7784';
    if (inputPin.trim() === validPin) {
      setIsAdminLoggedIn(true);
      setRole('seller');
      setIsAdminLoginModalOpen(false);
      try {
        localStorage.setItem('nexmart_admin_auth', 'true');
      } catch {}
      if (autoOpenEditor) {
        setSellerActiveTab('products');
        setProductToEdit(null);
        setIsProductEditorOpen(true);
      }
      addToast('Owner verified! Welcome to Merchant Portal.', 'success');
      return true;
    } else {
      addToast('Incorrect Admin PIN. Please try again.', 'error');
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setRole('customer');
    try {
      localStorage.removeItem('nexmart_admin_auth');
    } catch {}
    addToast('Logged out of Admin Portal.', 'info');
  };

  const switchRole = (newRole) => {
    if (newRole === 'seller' && !isAdminLoggedIn) {
      setIsAdminLoginModalOpen(true);
    } else {
      setRole(newRole);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        // Role & Layout & Admin Security
        role,
        setRole,
        switchRole,
        isAdminLoggedIn,
        isAdminLoginModalOpen,
        setIsAdminLoginModalOpen,
        loginAdmin,
        logoutAdmin,
        sellerActiveTab,
        setSellerActiveTab,

        // Products
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        loadStarterProducts,
        toggleProductStock,
        toggleProductCod,
        selectedProduct,
        setSelectedProduct,

        // Cart
        cart,
        cartCount,
        cartSubtotal,
        discountAmount,
        shippingFee,
        cartTotal,
        coupon,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        applyCouponCode,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,

        // Checkout & Orders
        isCheckoutOpen,
        setIsCheckoutOpen,
        placeOrder,
        orders,
        updateOrderStatus,
        updatePaymentStatus,
        isMyOrdersOpen,
        setIsMyOrdersOpen,
        selectedInvoice,
        setSelectedInvoice,

        // Seller
        sellerSettings,
        updateSellerSettings,
        isProductEditorOpen,
        setIsProductEditorOpen,
        productToEdit,
        setProductToEdit,
        resetAllDataToDefault,
        exportCatalog,
        importCatalog,
        syncFromCloud,

        // Filter & Search
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,

        // Toasts
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
