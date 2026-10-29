import { setCorsHeaders, requireAdminAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const isAuth = await requireAdminAuth(req, res);
  if (!isAuth) return;

  return res.status(200).json({ valid: true });
}
