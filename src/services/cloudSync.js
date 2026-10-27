/**
 * ZORIQ Real-Time Universal Cloud Sync Service
 * Synchronizes catalog, products, seller settings, and orders across all devices
 * (Mobile Phone, Laptop, Desktop, Tablet) in real time.
 */

export const CLOUD_STORAGE_FALLBACK = 'https://extendsclass.com/api/json-storage/bin/ebecffe';

/**
 * Fetch the latest live catalog, settings, and orders from the cloud
 */
export const fetchCloudStore = async () => {
  // 1. Try same-origin /api/sync (Zero CORS / preflight issues, works on both Vercel & localhost)
  try {
    const res = await fetch('/api/sync', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      signal: AbortSignal.timeout(6000)
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        return {
          products: data.products,
          sellerSettings: data.sellerSettings || null,
          orders: Array.isArray(data.orders) ? data.orders : [],
          lastUpdated: data.lastUpdated || null
        };
      }
    }
  } catch (err) {
    console.warn('Notice: /api/sync GET fallback:', err.message);
  }

  // 2. Direct cloud fallback
  try {
    const res = await fetch(CLOUD_STORAGE_FALLBACK, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      signal: AbortSignal.timeout(6000)
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        return {
          products: data.products,
          sellerSettings: data.sellerSettings || null,
          orders: Array.isArray(data.orders) ? data.orders : [],
          lastUpdated: data.lastUpdated || null
        };
      }
    }
  } catch (error) {
    console.warn('Notice: Direct cloud fallback:', error.message);
  }

  return null;
};

/**
 * Backward compatibility alias for fetchCloudProducts
 */
export const fetchCloudProducts = async () => {
  const store = await fetchCloudStore();
  return store ? store.products : null;
};

/**
 * Push updated products, settings, or orders to the cloud so all devices immediately receive them
 */
export const pushCloudStore = async ({ products, sellerSettings, orders }) => {
  const payload = {
    products: products || [],
    sellerSettings: sellerSettings || {},
    orders: orders || [],
    lastUpdated: new Date().toISOString()
  };

  // 1. Try same-origin /api/sync
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000)
    });

    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.warn('Notice: /api/sync POST fallback:', err.message);
  }

  // 2. Direct cloud fallback with text/plain
  try {
    const res = await fetch(CLOUD_STORAGE_FALLBACK, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000)
    });
    return res.ok;
  } catch (error) {
    console.warn('Notice: Direct push error:', error.message);
    return false;
  }
};

/**
 * Backward compatibility alias for pushCloudProducts
 */
export const pushCloudProducts = async (products) => {
  return pushCloudStore({ products });
};

/**
 * Export catalog to a downloadable JSON file for easy 1-click manual backup
 */
export const exportCatalogToJson = (products, settings) => {
  const data = {
    storeName: settings?.storeName || 'ZORIQ',
    exportDate: new Date().toISOString(),
    version: '2.0',
    products: products || [],
    settings: settings || {}
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `zoriq-catalog-${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

/**
 * Import catalog from a JSON file uploaded by the user
 */
export const parseCatalogFromJson = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed && Array.isArray(parsed.products)) {
          resolve(parsed.products);
        } else if (Array.isArray(parsed)) {
          resolve(parsed);
        } else {
          reject(new Error('Invalid catalog format. Expected a list of products.'));
        }
      } catch (err) {
        reject(new Error('Could not parse JSON file: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
};
