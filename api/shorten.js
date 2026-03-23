// api/shorten.js — proxy ke is.gd (real URL shortener, no CORS issue)
const https = require('https');

module.exports = function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  let body = '';
  req.on('data', function (chunk) { body += chunk; });
  req.on('end', function () {
    let url = '';
    try { url = JSON.parse(body).url || ''; } catch (_) {}

    if (!url || (!url.startsWith('https://') && !url.startsWith('http://'))) {
      return res.status(400).json({ error: 'URL tidak valid.' });
    }

    const encoded = encodeURIComponent(url);
    const apiUrl  = 'https://is.gd/create.php?format=simple&url=' + encoded;

    https.get(apiUrl, function (apiRes) {
      let data = '';
      apiRes.on('data', function (c) { data += c; });
      apiRes.on('end', function () {
        const short = data.trim();
        if (!short || short.startsWith('Error')) {
          return res.status(500).json({ error: 'Gagal mempersingkat. Coba lagi.' });
        }
        res.setHeader('Cache-Control', 'no-store');
        res.status(200).json({ short: short });
      });
    }).on('error', function () {
      res.status(500).json({ error: 'Koneksi ke layanan gagal. Coba lagi.' });
    });
  });
};
