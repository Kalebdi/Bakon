// api/token.js — CommonJS
const crypto = require('crypto');

module.exports = function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const secret = process.env.APP_SECRET;
  if (!secret) return res.status(500).end();
  const win   = Math.floor(Date.now() / 30000).toString();
  const token = crypto.createHmac('sha256', secret).update(win).digest('hex');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ t: token });
};
