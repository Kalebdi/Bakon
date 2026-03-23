(function () {

  /* ── TOAST ───────────────────────────────────────────────── */
  function toast(msg, isErr) {
    var ex = document.querySelector('.toast');
    if (ex) ex.remove();
    var t = document.createElement('div');
    t.className = 'toast' + (isErr ? ' err' : '');
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () {
      setTimeout(function () { t.classList.add('show'); }, 10);
      setTimeout(function () {
        t.classList.remove('show');
        setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 300);
      }, 2200);
    });
  }

  /* ── COPY ─────────────────────────────────────────────────── */
  window.cp = function (txt) {
    function ok() { toast('Disalin ke clipboard!'); }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(txt).then(ok).catch(function () { fbCopy(txt, ok); });
    } else {
      fbCopy(txt, ok);
    }
  };

  function fbCopy(txt, cb) {
    var ta = document.createElement('textarea');
    ta.value = txt;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    cb();
  }

  /* ── QR EMPTY ─────────────────────────────────────────────── */
  var QR_EMPTY = [
    '<div class="qr-empty">',
    '<div class="ico">',
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,0.5)" stroke-width="1.5">',
    '<rect x="3" y="3" width="7" height="7" rx="1.5"/>',
    '<rect x="14" y="3" width="7" height="7" rx="1.5"/>',
    '<rect x="3" y="14" width="7" height="7" rx="1.5"/>',
    '<circle cx="17.5" cy="17.5" r="2.5" fill="rgba(148,163,184,0.3)" stroke="none"/>',
    '</svg></div>',
    '<span>Masukkan URL lalu klik Buat QR</span>',
    '</div>'
  ].join('');

  /* ── RESET QR ─────────────────────────────────────────────── */
  window.resetQR = function () {
    document.getElementById('qr-stage').innerHTML = QR_EMPTY;
  };

  /* ── SVG ICONS ────────────────────────────────────────────── */
  var DL_ICO = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
    + '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>'
    + '<polyline points="7 10 12 15 17 10"/>'
    + '<line x1="12" y1="15" x2="12" y2="3"/></svg>';

  var CP_ICO = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
    + '<rect x="9" y="9" width="13" height="13" rx="2"/>'
    + '<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';

  var OK_ICO = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">'
    + '<polyline points="20 6 9 17 4 12"/></svg>';

  /* ── GENERATE QR ──────────────────────────────────────────── */
  window.genQR = function () {
    var val = document.getElementById('qi').value.trim();
    var sz  = parseInt(document.getElementById('qs').value, 10);
    var btn = document.getElementById('genBtn');

    if (!val) {
      document.getElementById('qi').focus();
      toast('Masukkan URL terlebih dahulu!', true);
      return;
    }

    btn.disabled  = true;
    btn.innerHTML = '<span class="spin"></span>Membuat...';

    var imgUrl = 'https://api.qrserver.com/v1/create-qr-code/'
      + '?size=' + sz + 'x' + sz
      + '&data=' + encodeURIComponent(val)
      + '&bgcolor=110926&color=c7d2fe&margin=16';
    var disp = Math.min(sz, 240);

    setTimeout(function () {
      var safeUrl = imgUrl.replace(/'/g, '%27');
      document.getElementById('qr-stage').innerHTML = [
        '<div class="qr-result">',
        '<div class="qr-img-col">',
          '<img src="' + imgUrl + '" width="' + disp + '" height="' + disp + '" alt="QR Code"/>',
        '</div>',
        '<div class="qr-info-col">',
          '<div>',
            '<div class="field-label">URL Target</div>',
            '<div class="qr-url-text">' + val + '</div>',
          '</div>',
          '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--txt2)">',
            '<span>Resolusi</span>',
            '<span style="color:var(--txt);font-weight:600">' + sz + '\xd7' + sz + 'px</span>',
          '</div>',
          '<div class="divider"></div>',
          '<div style="display:flex;flex-wrap:wrap;gap:8px">',
            '<a class="btn-sm" href="' + imgUrl + '" download="qrcode.png" target="_blank">' + DL_ICO + 'Unduh PNG</a>',
            '<button class="btn-sm" onclick="cp(\'' + safeUrl + '\')">' + CP_ICO + 'Salin URL Gambar</button>',
          '</div>',
          '<div class="badge-ok">' + OK_ICO + 'QR siap digunakan</div>',
        '</div>',
        '</div>'
      ].join('');

      btn.disabled    = false;
      btn.textContent = 'Buat QR \u2197';
      toast('QR Code berhasil dibuat!');
    }, 600);
  };

  /* ── SHORTEN ──────────────────────────────────────────────── */
  window.shorten = function () {
    var url   = document.getElementById('url').value.trim();
    var btn   = document.getElementById('shortBtn');
    var resEl = document.getElementById('result');

    if (!url) {
      toast('Tempel URL terlebih dahulu!', true);
      document.getElementById('url').focus();
      return;
    }
    if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
      toast('URL harus diawali http:// atau https://', true);
      return;
    }

    btn.disabled    = true;
    btn.innerHTML   = '<span class="spin"></span>Mempersingkat...';
    resEl.innerHTML = '';

    fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.error) { toast(data.error, true); return; }

      var short    = data.short;
      var safeShort = short.replace(/'/g, '%27');
      var qUrl     = 'https://api.qrserver.com/v1/create-qr-code/'
        + '?size=80x80&data=' + encodeURIComponent(short)
        + '&margin=8&bgcolor=110926&color=c7d2fe';

      resEl.innerHTML = [
        '<div class="result-box">',
          '<div class="result-label">Tautan Pendek</div>',
          '<a class="result-link" href="' + short + '" target="_blank">' + short + '</a>',
          '<div class="result-actions">',
            '<button class="btn-sm" onclick="cp(\'' + safeShort + '\')">' + CP_ICO + 'Salin</button>',
            '<a class="btn-sm" href="' + short + '" target="_blank">Buka \u2197</a>',
            '<div class="qr-mini" style="margin-left:auto">',
              '<img src="' + qUrl + '" width="56" height="56" alt="QR"/>',
            '</div>',
          '</div>',
        '</div>'
      ].join('');

      toast('Tautan berhasil dipersingkat!');
    })
    .catch(function () {
      toast('Gagal terhubung. Periksa koneksi internet.', true);
    })
    .finally(function () {
      btn.disabled    = false;
      btn.textContent = 'Persingkat \u2197';
    });
  };

})();
