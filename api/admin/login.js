import adminLoginHandler from '../admin-login.js';

export default async function handler(req, res) {
  return adminLoginHandler(req, res);
}
