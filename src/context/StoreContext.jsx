import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_SELLER_SETTINGS } from '../data/initialData';
import {
  supabase,
  mapProductFromDb,
  mapSettingsFromDb,
  adminLogin,
  adminVerifyToken,
  adminAddProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminImportProducts,
  adminUpdateSettings,
  adminUpdateSettingsSection,
  adminChangePassword,
  adminGetOrders,
  adminUpdateOrderStatus,
  createCustomerOrder,
  getCustomerOrders,
} from '../services/supabase';

const StoreContext = createContext();

const STORAGE_KEYS = {
  CART: 'nexmart_cart_v1',
  ADMIN_TOKEN: 'zoriq_admin_session_token',
  CUSTOMER_ORDER_IDS: 'zoriq_my_order_ids',
};

// Immediate cleanup of old legacy localStorage products/orders/sync items
try {
  localStorage.removeItem('nexmart_products_v2');
  localStorage.removeItem('nexmart_live_orders');
  localStorage.removeItem('nexmart_settings_v1');
  localStorage.removeItem('nexmart_deleted_ids');
  localStorage.removeItem('nexmart_orders_v1');
  localStorage.removeItem('nexmart_orders_v2');
} catch {}

export function StoreProvider({ children }) {
  // 1. Admin Authentication (Token-based, verified on server)
  const [adminToken, setAdminToken] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN) || '';
    } catch {
      return '';
    }
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(Boolean(adminToken));
  const [role, setRole] = useState(() => (adminToken ? 'seller' : 'customer'));
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // 2. Real-time Database States (Loaded from Supabase, NO localStorage copy)
  const [products, setProducts] = useState([]);
  const [sellerSettings, setSellerSettings] = useState(DEFAULT_SELLER_SETTINGS);
  const [adminOrders, setAdminOrders] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // 3. Cart State with LocalStorage (Only cart and admin token live in localStorage)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 4. Active Applied Coupon
  const [coupon, setCoupon] = useState(null);

  // 5. Modals and Navigation states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Seller Portal modals and tabs
  const [isProductEditorOpen, setIsProductEditorOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [sellerActiveTab, setSellerActiveTab] = useState('dashboard'); // 'dashboard' | 'products' | 'orders' | 'settings'

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [cart]);

  // Verify Admin Token on mount
  useEffect(() => {
    if (!adminToken) {
      setIsAdminLoggedIn(false);
      return;
    }

    let isMounted = true;
    adminVerifyToken(adminToken).then((valid) => {
      if (!isMounted) return;
      if (valid) {
        setIsAdminLoggedIn(true);
      } else {
        setIsAdminLoggedIn(false);
        setAdminToken('');
        try {
          localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
        } catch {}
      }
    });

    return () => {
      isMounted = false;
    };
  }, [adminToken]);

  // Conflict State for Multi-Device Settings Editing
  const [hasSettingsConflict, setHasSettingsConflict] = useState(false);
  const [conflictSettings, setConflictSettings] = useState(null);

  // Load Products & Settings from Supabase + Subscribe to Supabase Realtime
  useEffect(() => {
    let isMounted = true;

    // Helper to fetch latest settings from Supabase
    const fetchLatestPublicSettings = async () => {
      if (!supabase) return;
      try {
        let fetchedData = null;
        const { data: pubData, error: pubErr } = await supabase
          .from('public_settings')
          .select('*')
          .eq('id', 'default')
          .maybeSingle();

        if (!pubErr && pubData) {
          fetchedData = pubData;
        } else {
          const { data: altData } = await supabase
            .from('settings')
            .select('*')
            .or('id.eq.default,id.eq.store_config')
            .maybeSingle();
          if (altData) fetchedData = altData;
        }

        if (fetchedData && isMounted) {
          const mapped = mapSettingsFromDb(fetchedData);
          if (mapped) {
            setSellerSettings((prev) => {
              if (mapped.version !== prev.version) {
                return mapped;
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.warn('[Supabase] Settings poll error:', err.message);
      }
    };

    // A. Initial Load from Supabase Postgres
    const loadInitialData = async () => {
      if (!supabase) {
        try {
          const [pRes, sRes] = await Promise.all([
            fetch('/api/products').then((r) => r.json()).catch(() => null),
            fetch('/api/settings').then((r) => r.json()).catch(() => null),
          ]);
          if (pRes?.products && isMounted) {
            setProducts(pRes.products.map(mapProductFromDb).filter(Boolean));
          }
          if (sRes?.settings && isMounted) {
            const mapped = mapSettingsFromDb(sRes.settings);
            if (mapped) setSellerSettings(mapped);
          }
        } catch (e) {
          console.warn('[Storefront Fallback] error:', e);
        } finally {
          if (isMounted) setIsLoadingProducts(false);
        }
        return;
      }

      try {
        const { data: prodsData, error: prodsErr } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!isMounted) return;

        if (prodsErr) {
          console.error('[Supabase] Products fetch error:', prodsErr.message);
        } else if (prodsData) {
          setProducts(prodsData.map(mapProductFromDb).filter(Boolean));
        }

        // Try public_settings table, fallback to settings table
        let settingsData = null;
        const { data: pubData, error: pubErr } = await supabase
          .from('public_settings')
          .select('*')
          .eq('id', 'default')
          .maybeSingle();

        if (!pubErr && pubData) {
          settingsData = pubData;
        } else {
          const { data: altData } = await supabase
            .from('settings')
            .select('*')
            .or('id.eq.default,id.eq.store_config')
            .maybeSingle();
          if (altData) settingsData = altData;
        }

        if (settingsData && isMounted) {
          const mapped = mapSettingsFromDb(settingsData);
          if (mapped) setSellerSettings(mapped);
        }
      } catch (err) {
        console.error('[Supabase] Initial data load exception:', err);
      } finally {
        if (isMounted) setIsLoadingProducts(false);
      }
    };

    loadInitialData();

    if (!supabase) return;

    // B. Realtime Subscription on products table
    const productsChannel = supabase
      .channel('realtime:products_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (!isMounted) return;

          if (payload.eventType === 'INSERT') {
            const newProd = mapProductFromDb(payload.new);
            if (newProd) {
              setProducts((prev) => [newProd, ...prev.filter((p) => p.id !== newProd.id)]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedProd = mapProductFromDb(payload.new);
            if (updatedProd) {
              setProducts((prev) =>
                prev.map((p) => (p.id === updatedProd.id ? updatedProd : p))
              );
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old?.id;
            if (deletedId) {
              setProducts((prev) => prev.filter((p) => p.id !== deletedId));
            }
          }
        }
      )
      .subscribe();

    // Handler for settings changes from Realtime
    const handleSettingsRealtimeChange = (payload) => {
      if (!isMounted) return;
      if (payload.new) {
        const mapped = mapSettingsFromDb(payload.new);
        if (mapped) {
          setSellerSettings((prev) => {
            if (mapped.version > (prev.version || 1)) {
              setConflictSettings(mapped);
              setHasSettingsConflict(true);
              return mapped;
            }
            return mapped;
          });
        }
      }
    };

    // C. Realtime Subscription on public_settings AND settings tables
    const settingsChannel = supabase
      .channel('realtime:public_settings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'public_settings' },
        handleSettingsRealtimeChange
      )
      .subscribe();

    const fallbackSettingsChannel = supabase
      .channel('realtime:fallback_settings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings' },
        handleSettingsRealtimeChange
      )
      .subscribe();

    // D. Refetch fallback every 15 seconds if realtime disconnects or misses events
    const pollInterval = setInterval(() => {
      fetchLatestPublicSettings();
    }, 15000);

    // E. Refetch immediately when browser tab becomes active
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchLatestPublicSettings();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(fallbackSettingsChannel);
    };
  }, []);

  // Fetch Orders when Admin enters seller orders tab or logs in
  const fetchAdminOrdersList = useCallback(async () => {
    if (!adminToken) return;
    try {
      const ordersList = await adminGetOrders(adminToken);
      setAdminOrders(ordersList);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    }
  }, [adminToken]);

  useEffect(() => {
    if (isAdminLoggedIn && role === 'seller') {
      fetchAdminOrdersList();
    }
  }, [isAdminLoggedIn, role, fetchAdminOrdersList]);

  // Load customer's placed orders on this phone / laptop for tracking
  const loadCustomerOrdersList = useCallback(async () => {
    try {
      const savedIds = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMER_ORDER_IDS) || '[]');
      if (savedIds.length > 0) {
        const fetched = await getCustomerOrders(savedIds);
        setCustomerOrders(fetched);
      } else {
        setCustomerOrders([]);
      }
    } catch (err) {
      console.warn('Error loading customer orders:', err);
    }
  }, []);

  // Run on initial load so customer knows if they have orders
  useEffect(() => {
    loadCustomerOrdersList();
  }, [loadCustomerOrdersList]);

  useEffect(() => {
    if (isMyOrdersOpen) {
      loadCustomerOrdersList();
    }
  }, [isMyOrdersOpen, loadCustomerOrdersList]);

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

  const shippingFee =
    cartSubtotal >= (sellerSettings.freeShippingThreshold || 999) || cartSubtotal === 0
      ? 0
      : (sellerSettings.standardShippingFee || 60);

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

  // --- Customer Order Placement (Creates via Server Route /api/orders) ---
  const placeOrder = async ({ customer, paymentMethod, paymentDetails = {} }) => {
    const payload = {
      customer,
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountAmount,
      couponApplied: coupon ? coupon.code : null,
      shippingFee,
      total: cartTotal,
      paymentMethod,
      paymentDetails,
    };

    try {
      const createdOrder = await createCustomerOrder(payload);

      // Save order ID in customer's local list for "My Orders" tracking
      try {
        const savedIds = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.CUSTOMER_ORDER_IDS) || '[]'
        );
        if (!savedIds.includes(createdOrder.id)) {
          savedIds.unshift(createdOrder.id);
          localStorage.setItem(STORAGE_KEYS.CUSTOMER_ORDER_IDS, JSON.stringify(savedIds));
        }
      } catch {}

      // Save to customer orders and admin orders state
      setCustomerOrders((prev) => [createdOrder, ...prev.filter((o) => o.id !== createdOrder.id)]);
      setAdminOrders((prev) => [createdOrder, ...prev.filter((o) => o.id !== createdOrder.id)]);

      // Clear cart
      clearCart();
      addToast(`Order #${createdOrder.id} placed successfully!`, 'success');
      return createdOrder;
    } catch (err) {
      console.error('Order creation error:', err);
      addToast(`Order failed: ${err.message}`, 'error');
      throw err;
    }
  };

  // --- Admin Actions (Execute via Serverless /api/admin Routes) ---

  const addProduct = async (productData) => {
    try {
      const createdProd = await adminAddProduct(productData, adminToken);
      if (createdProd) {
        setProducts((prev) => [createdProd, ...prev.filter((p) => p.id !== createdProd.id)]);
      }
      addToast(`Product "${productData.name}" added and synced to all devices!`, 'success');
      return createdProd;
    } catch (err) {
      console.error('Add product error:', err);
      addToast(`Failed to add product: ${err.message}`, 'error');
      throw err;
    }
  };

  const updateProduct = async (productId, updatedData) => {
    try {
      const updatedProd = await adminUpdateProduct(productId, updatedData, adminToken);
      if (updatedProd) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? updatedProd : p)));
      }
      addToast('Product updated and synced across all devices!', 'success');
      return updatedProd;
    } catch (err) {
      console.error('Update product error:', err);
      addToast(`Failed to update product: ${err.message}`, 'error');
      throw err;
    }
  };

  const deleteProduct = async (productId) => {
    const prod = products.find((p) => p.id === productId);
    try {
      await adminDeleteProduct(productId, adminToken);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setCart((prev) => prev.filter((item) => item.id !== productId));
      addToast(`Product "${prod?.name || 'Item'}" deleted and synced.`, 'info');
    } catch (err) {
      console.error('Delete product error:', err);
      addToast(`Failed to delete product: ${err.message}`, 'error');
      throw err;
    }
  };

  const toggleProductStock = async (productId) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const nextStock = !prod.inStock;
    const updatedStockValue = nextStock ? (prod.stock > 0 ? prod.stock : 10) : 0;
    try {
      await updateProduct(productId, {
        inStock: nextStock,
        stock: updatedStockValue,
      });
    } catch (err) {
      console.error('Stock toggle error:', err);
    }
  };

  const toggleProductCod = async (productId) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const nextCod = !(prod.codAvailable !== false);
    try {
      await updateProduct(productId, {
        codAvailable: nextCod,
      });
      addToast(
        `Cash on Delivery ${nextCod ? 'enabled' : 'disabled'} for "${prod.name.slice(0, 22)}..."`,
        'info'
      );
    } catch (err) {
      console.error('COD toggle error:', err);
    }
  };

  // Save settings section by section with optimistic locking
  const updateSettingsSection = async (section, sectionData) => {
    try {
      const res = await adminUpdateSettingsSection(
        section,
        sectionData,
        sellerSettings.version,
        adminToken
      );

      if (res && res.settings) {
        setSellerSettings(res.settings);
        setHasSettingsConflict(false);
        setConflictSettings(null);
      }
      addToast(`"${section.toUpperCase()}" settings saved & synced to all devices!`, 'success');
      return { success: true, settings: res.settings };
    } catch (err) {
      console.error(`Save section "${section}" error:`, err);
      if (err.status === 409 || err.conflict) {
        setHasSettingsConflict(true);
        if (err.latestSettings) {
          setConflictSettings(err.latestSettings);
        }
        addToast('Settings were updated on another device. Reload to see changes.', 'warning');
      } else {
        addToast(`Save failed: ${err.message}`, 'error');
      }
      throw err;
    }
  };

  const updateSellerSettings = async (newSettings) => {
    return updateSettingsSection('all', newSettings);
  };

  const reloadLatestSettings = async () => {
    try {
      if (conflictSettings) {
        setSellerSettings(conflictSettings);
        setHasSettingsConflict(false);
        setConflictSettings(null);
        addToast('Reloaded latest settings from cloud!', 'info');
        return;
      }

      if (!supabase) return;
      const { data, error } = await supabase
        .from('public_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (!error && data) {
        const mapped = mapSettingsFromDb(data);
        if (mapped) {
          setSellerSettings(mapped);
          setHasSettingsConflict(false);
          setConflictSettings(null);
          addToast('Reloaded latest settings from cloud!', 'info');
        }
      }
    } catch (err) {
      console.error('Reload settings error:', err);
      addToast('Could not reload settings.', 'error');
    }
  };

  const changeAdminPassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      const res = await adminChangePassword(currentPassword, newPassword, confirmPassword, adminToken);
      if (res && res.token) {
        setAdminToken(res.token);
        try {
          localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, res.token);
        } catch {}
      }
      addToast(res.message || 'Password changed successfully! Other devices logged out.', 'success');
      return { success: true };
    } catch (err) {
      console.error('Change password error:', err);
      addToast(err.message || 'Failed to change admin password.', 'error');
      throw err;
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updatedOrder = await adminUpdateOrderStatus(orderId, newStatus, null, adminToken);
      if (updatedOrder) {
        setAdminOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
        setCustomerOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
      }
      addToast(`Order #${orderId} marked as ${newStatus}`, 'success');
    } catch (err) {
      console.error('Order status update error:', err);
      addToast(`Failed to update order status: ${err.message}`, 'error');
    }
  };

  const updatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      const updatedOrder = await adminUpdateOrderStatus(orderId, null, newPaymentStatus, adminToken);
      if (updatedOrder) {
        setAdminOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
        setCustomerOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
      }
      addToast(`Order #${orderId} payment marked as "${newPaymentStatus}"`, 'info');
    } catch (err) {
      console.error('Payment status update error:', err);
      addToast(`Failed to update payment status: ${err.message}`, 'error');
    }
  };

  const importCatalog = async (file) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const itemsToImport = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.products)
        ? parsed.products
        : null;

      if (!itemsToImport || itemsToImport.length === 0) {
        throw new Error('No valid products array found in the uploaded JSON file.');
      }

      await adminImportProducts(itemsToImport, adminToken);
      addToast(`Successfully imported ${itemsToImport.length} products to store!`, 'success');
    } catch (err) {
      console.error('Catalog import error:', err);
      addToast(`Import failed: ${err.message}`, 'error');
    }
  };

  const exportCatalog = () => {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        storeName: sellerSettings.storeName,
        products,
        sellerSettings,
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zoriq-catalog-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Catalog backup JSON downloaded successfully!', 'success');
    } catch (err) {
      console.error('Export error:', err);
      addToast('Failed to export catalog backup.', 'error');
    }
  };

  const resetAllDataToDefault = () => {
    setCart([]);
    setCoupon(null);
    addToast('Cart and filters cleared.', 'info');
  };

  const loadStarterProducts = () => {
    addToast('Starter products feature retired. Add custom products in Owner Portal.', 'info');
  };

  // --- Admin Security (Server Password Verification) ---
  const loginAdmin = async (inputPassword, autoOpenEditor = false) => {
    try {
      const res = await adminLogin(inputPassword);
      const token = res.token;
      setAdminToken(token);
      setIsAdminLoggedIn(true);
      setRole('seller');
      setIsAdminLoginModalOpen(false);

      try {
        localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
      } catch {}

      if (autoOpenEditor) {
        setSellerActiveTab('products');
        setProductToEdit(null);
        setIsProductEditorOpen(true);
      }

      if (res.isFirstTime) {
        addToast(res.message || 'First-time setup: Please set a custom password in Store Settings!', 'warning');
      } else {
        addToast('Owner verified! Welcome to Merchant Portal.', 'success');
      }
      return { success: true, isFirstTime: res.isFirstTime };
    } catch (err) {
      console.error('Admin login error:', err);
      addToast(err.message || 'Incorrect Admin Password / PIN.', 'error');
      return { success: false, error: err.message };
    }
  };

  const logoutAdmin = () => {
    setAdminToken('');
    setIsAdminLoggedIn(false);
    setRole('customer');
    try {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
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
        // Role & Admin Security
        role,
        setRole,
        switchRole,
        isAdminLoggedIn,
        isAdminLoginModalOpen,
        setIsAdminLoginModalOpen,
        loginAdmin,
        logoutAdmin,
        adminToken,
        sellerActiveTab,
        setSellerActiveTab,

        // Products
        products,
        isLoadingProducts,
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
        orders: role === 'seller' ? adminOrders : customerOrders,
        adminOrders,
        customerOrders,
        updateOrderStatus,
        updatePaymentStatus,
        isMyOrdersOpen,
        setIsMyOrdersOpen,
        selectedInvoice,
        setSelectedInvoice,
        fetchAdminOrdersList,
        loadCustomerOrdersList,

        // Seller Settings & Sync
        sellerSettings,
        updateSellerSettings,
        updateSettingsSection,
        changeAdminPassword,
        hasSettingsConflict,
        conflictSettings,
        reloadLatestSettings,
        isProductEditorOpen,
        setIsProductEditorOpen,
        productToEdit,
        setProductToEdit,
        resetAllDataToDefault,
        exportCatalog,
        importCatalog,

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
