/**
 * Vercel Serverless Function: Real-Time Universal Sync
 * Acts as a secure, same-origin cloud bridge for Zoriq Store.
 * Eliminates all browser CORS / preflight / network issues across mobile & laptop.
 */

const CLOUD_STORAGE_URL = 'https://extendsclass.com/api/json-storage/bin/ebecffe';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET: Retrieve the live shared catalog, orders, and settings
  if (req.method === 'GET') {
    try {
      const response = await fetch(CLOUD_STORAGE_URL, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to fetch cloud store' });
      }

      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) {
      console.error('API Sync GET error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // POST / PUT: Update the live shared catalog across all devices
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      let payload = req.body;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch {
          // keep as is
        }
      }

      const response = await fetch(CLOUD_STORAGE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to update cloud store' });
      }

      return res.status(200).json({ success: true, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.error('API Sync POST error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
