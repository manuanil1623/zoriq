/**
 * ZORIQ Cloud Synchronization Service
 * Enables real-time catalog & order synchronization across all customer & seller devices.
 */

const SYNC_STORAGE_KEY = 'zoriq_cloud_sync_config';

// Universal free cloud sync endpoint via npoint / jsonbin / mock storage
const DEFAULT_SYNC_API = 'https://api.npoint.io/46fbaef76e3b5e4073ea';

export const getCloudSyncConfig = () => {
  try {
    const saved = localStorage.getItem(SYNC_STORAGE_KEY);
    if (!saved) {
      return {
        enabled: true,
        endpoint: DEFAULT_SYNC_API,
        autoSync: true,
        lastSynced: null
      };
    }
    return JSON.parse(saved);
  } catch {
    return { enabled: true, endpoint: DEFAULT_SYNC_API, autoSync: true, lastSynced: null };
  }
};

export const saveCloudSyncConfig = (config) => {
  try {
    localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving cloud sync config:', e);
  }
};

/**
 * Fetch catalog & products from the cloud
 */
export const fetchCloudProducts = async (customEndpoint) => {
  const config = getCloudSyncConfig();
  const endpoint = customEndpoint || config.endpoint || DEFAULT_SYNC_API;

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch cloud products: HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data && Array.isArray(data.products)) {
      return data.products;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return null;
  } catch (error) {
    console.warn('Cloud sync fetch notice:', error.message);
    return null;
  }
};

/**
 * Push products & updates to the cloud so all devices receive them
 */
export const pushCloudProducts = async (products, customEndpoint) => {
  const config = getCloudSyncConfig();
  const endpoint = customEndpoint || config.endpoint || DEFAULT_SYNC_API;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        products,
        updatedAt: new Date().toISOString()
      })
    });

    if (res.ok) {
      saveCloudSyncConfig({
        ...config,
        lastSynced: new Date().toISOString()
      });
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Cloud sync push notice:', error.message);
    return false;
  }
};

/**
 * Export catalog to a downloadable JSON file for easy 1-click transfer between devices
 */
export const exportCatalogToJson = (products, settings) => {
  const data = {
    storeName: settings?.storeName || 'ZORIQ',
    exportDate: new Date().toISOString(),
    version: '1.0',
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
