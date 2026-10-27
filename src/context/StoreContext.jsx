import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PRODUCTS, STARTER_PRODUCTS, DEFAULT_SELLER_SETTINGS, SAMPLE_ORDERS } from '../data/initialData';
import { fetchCloudProducts, pushCloudProducts, exportCatalogToJson, parseCatalogFromJson } from '../services/cloudSync';

const StoreContext = createContext();

const STORAGE_KEYS = {
  PRODUCTS: 'nexmart_products_v2',
  ORDERS: 'nexmart_live_orders',
  SETTINGS: 'nexmart_settings_v1',
  CART: 'nexmart_cart_v1',
};

// Immediate cleanup of any legacy demo orders stored in browser
try {
  localStorage.removeItem('nexmart_orders_v1');
  localStorage.removeItem('nexmart_orders_v2');
  localStorage.removeItem('nexmart_live_orders');
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

  // 2. Products State with LocalStorage & Starter Catalog Fallback
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!saved) return INITIAL_PRODUCTS;
      const parsed = JSON.parse(saved);
      // Remove all demo products (prod-1 through prod-8)
      const demoIds = new Set(['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5', 'prod-6', 'prod-7', 'prod-8']);
      const filtered = parsed.filter((p) => !demoIds.has(p.id));
      return filtered.length > 0 ? filtered : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Asynchronous cloud catalog sync across devices
  useEffect(() => {
    let isMounted = true;
    fetchCloudProducts().then((cloudProds) => {
      if (isMounted && cloudProds && Array.isArray(cloudProds) && cloudProds.length > 0) {
        setProducts((localProds) => {
          const existingIds = new Set(localProds.map((p) => p.id));
          const newFromCloud = cloudProds.filter((p) => !existingIds.has(p.id));
          if (newFromCloud.length > 0) {
            return [...localProds, ...newFromCloud];
          }
          return localProds;
        });
      }
    });
    return () => { isMounted = false; };
  }, []);

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
        ...parsed,
        storeName: !parsed.storeName || parsed.storeName.includes('NexMart') ? 'ZORIQ' : parsed.storeName,
        merchantName: !parsed.merchantName || parsed.merchantName.includes('NexMart') ? 'ZORIQ Official' : parsed.merchantName,
        adminPin: parsed.adminPin === '1234' || !parsed.adminPin ? '7784' : parsed.adminPin
      };
    } catch {
      return DEFAULT_SELLER_SETTINGS;
    }
  });

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
      paymentMethod, // 'UPI' | 'COD'
      paymentStatus: paymentMethod === 'RAZORPAY' ? 'Paid' : paymentMethod === 'UPI' ? 'Verification Pending' : 'Pending',
      upiTxnId: paymentMethod === 'UPI' ? (paymentDetails.upiTxnId || null) : null,
      upiVpa: paymentMethod === 'UPI' ? paymentDetails.upiVpa || null : null,
      razorpayPaymentId: paymentMethod === 'RAZORPAY' ? (paymentDetails.razorpayPaymentId || null) : null,
      razorpayOrderId: paymentMethod === 'RAZORPAY' ? (paymentDetails.razorpayOrderId || null) : null,
      razorpaySignature: paymentMethod === 'RAZORPAY' ? (paymentDetails.razorpaySignature || null) : null,
      orderStatus: 'Placed',
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
    setOrders((prev) => [newOrder, ...prev]);

    // Clear cart
    clearCart();

    addToast(`Order #${orderId} placed successfully!`, 'success');
    return newOrder;
  };

  // --- Seller Actions with Automatic Cloud Sync ---
  const addProduct = (productData) => {
    const newId = `prod-${Date.now()}`;
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

    setProducts((prev) => {
      const updated = [newProduct, ...prev];
      pushCloudProducts(updated);
      return updated;
    });
    addToast(`Product "${newProduct.name}" added and synced!`, 'success');
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
      pushCloudProducts(updated);
      return updated;
    });
    addToast('Product updated and synced!', 'success');
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
      pushCloudProducts(updated);
      return updated;
    });
  };

  const deleteProduct = (productId) => {
    const prod = products.find((p) => p.id === productId);
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      pushCloudProducts(updated);
      return updated;
    });
    // also remove from cart if present
    setCart((prev) => prev.filter((item) => item.id !== productId));
    addToast(`Product "${prod?.name || 'Item'}" deleted.`, 'info');
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
        pushCloudProducts(imported);
        addToast(`Successfully imported ${imported.length} products to this store!`, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to import catalog', 'error');
    }
  };

  const toggleProductStock = (productId) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id === productId) {
          const nextStockState = !prod.inStock;
          return {
            ...prod,
            inStock: nextStockState,
            stock: nextStockState ? (prod.stock > 0 ? prod.stock : 10) : 0,
          };
        }
        return prod;
      })
    );
    addToast('Stock status updated', 'info');
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated = { ...ord, orderStatus: newStatus };
          // If marked Delivered and COD, mark payment as Paid
          if (newStatus === 'Delivered' && ord.paymentMethod === 'COD') {
            updated.paymentStatus = 'Paid';
          }
          return updated;
        }
        return ord;
      })
    );
    addToast(`Order #${orderId} marked as ${newStatus}`, 'success');
  };

  const updatePaymentStatus = (orderId, newPaymentStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
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
      })
    );
    addToast(`Order #${orderId} payment marked as "${newPaymentStatus}"`, 'info');
  };

  const updateSellerSettings = (newSettings) => {
    setSellerSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('Store settings updated!', 'success');
  };

  const resetAllDataToDefault = () => {
    setProducts(INITIAL_PRODUCTS);
    setOrders(SAMPLE_ORDERS);
    setSellerSettings(DEFAULT_SELLER_SETTINGS);
    setCart([]);
    setCoupon(null);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    addToast('Store reset to clean defaults', 'info');
  };

  const loadStarterProducts = () => {
    setProducts(STARTER_PRODUCTS);
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(STARTER_PRODUCTS));
    } catch (e) {
      console.error('Error saving starter products:', e);
    }
    addToast('Loaded starter catalog with 6 products!', 'success');
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
