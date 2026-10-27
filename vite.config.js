import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const CLOUD_STORAGE_URL = 'https://extendsclass.com/api/json-storage/bin/ebecffe';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    {
      name: 'api-sync-dev-middleware',
      configureServer(server) {
        server.middlewares.use('/api/sync', async (req, res) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
          }

          if (req.method === 'GET') {
            try {
              const fetchRes = await fetch(CLOUD_STORAGE_URL);
              const data = await fetchRes.json();
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          if (req.method === 'POST' || req.method === 'PUT') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', async () => {
              try {
                const putRes = await fetch(CLOUD_STORAGE_URL, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: body
                });
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: putRes.ok }));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }
        });
      }
    }
  ],
});
