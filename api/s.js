// api/s.js — CommonJS
// Logic dibaca dari _logic.js pakai fs.readFileSync
// → tidak ada escaping issue sama sekali
const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');

function makeToken(secret, w) {
  return crypto.createHmac('sha256', secret).update(w.toString()).digest('hex');
}

function isValid(token, secret) {
  if (!token || !secret) return false;
  const now = Math.floor(Date.now() / 30000);
  return [now, now - 1].some(function (w) {
    const exp = makeToken(secret, w);
    try {
      return crypto.timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(exp, 'hex'));
    } catch (_) { return false; }
  });
}

module.exports = function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const secret = process.env.APP_SECRET;
  const token  = req.query.t || '';

  if (!isValid(token, secret)) return res.status(403).end();

  // Baca file logic — tidak ada string escaping
  const logicPath = path.join(__dirname, '_logic.js');
  let code;
  try {
    code = fs.readFileSync(logicPath, 'utf8');
  } catch (e) {
    console.error('[s.js] Gagal baca _logic.js:', e.message);
    return res.status(500).end();
  }

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Content-Type', 'application/javascript');
  return res.status(200).send(code);
};
