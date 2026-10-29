import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Populate process.env with local env variables from .env / .env.local
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [
      tailwindcss(),
      react(),
      {
        name: 'local-api-routes',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (!req.url?.startsWith('/api/')) {
              return next();
            }

            const parsedUrl = new URL(req.url, 'http://localhost');
            const pathname = parsedUrl.pathname;

            const routeMap = {
              '/api/admin-login': './api/admin-login.js',
              '/api/admin/login': './api/admin/login.js',
              '/api/admin/verify': './api/admin/verify.js',
              '/api/admin/change-password': './api/admin/change-password.js',
              '/api/admin/products': './api/admin/products.js',
              '/api/admin/settings': './api/admin/settings.js',
              '/api/settings': './api/settings.js',
              '/api/admin/orders': './api/admin/orders.js',
              '/api/admin/upload': './api/admin/upload.js',
              '/api/orders': './api/orders.js',
            };

            const handlerFile = routeMap[pathname];
            if (!handlerFile) {
              return next();
            }

            try {
              // Polyfill Express/Vercel helper methods if not present on standard Node response
              if (!res.status) {
                res.status = (code) => {
                  res.statusCode = code;
                  return res;
                };
              }
              if (!res.json) {
                res.json = (data) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return res;
                };
              }

              // Dynamic import with cache busting for fast local hot reloading of API routes
              const module = await import(`${handlerFile}?t=${Date.now()}`);
              const handler = module.default;
              if (typeof handler === 'function') {
                await handler(req, res);
              } else {
                next();
              }
            } catch (err) {
              console.error(`[API DEV ERROR] ${req.url}:`, err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Internal Dev API Error' }));
            }
          });
        },
      },
    ],
  };
});
