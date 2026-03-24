(function () {

  /* ── TOAST ───────────────────────────────────────────────── */
  function toast(msg, type) {
    var ex = document.querySelector('.toast');
    if (ex) ex.remove();
    var t = document.createElement('div');
    t.className = 'toast' + (type === 'err' ? ' err' : type === 'success' ? ' success' : '');
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () {
      setTimeout(function () { t.classList.add('show'); }, 10);
      setTimeout(function () {
        t.classList.remove('show');
        setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 300);
      }, 2500);
    });
  }

  /* ── COPY ─────────────────────────────────────────────────── */
  function copyText(txt, btn) {
    function ok() {
      if (btn) {
        btn.textContent = 'Disalin!';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = 'Salin';
          btn.classList.remove('copied');
        }, 1800);
      }
      toast('Disalin ke clipboard!', 'success');
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(txt).then(ok).catch(function () { fbCopy(txt, ok); });
    } else {
      fbCopy(txt, ok);
    }
  }

  function fbCopy(txt, cb) {
    var ta = document.createElement('textarea');
    ta.value = txt;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    cb();
  }

  /* ── QR EMPTY HTML ──────────────────────────────────────────── */
  var QR_EMPTY = '<div class="qr-empty-msg">'
    + '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">'
    + '<rect x="3" y="3" width="7" height="7"/>'
    + '<rect x="14" y="3" width="7" height="7"/>'
    + '<rect x="3" y="14" width="7" height="7"/>'
    + '<circle cx="17.5" cy="17.5" r="2.5"/>'
    + '</svg>'
    + '<span>Masukkan URL lalu klik Buat QR</span>'
    + '</div>';

  /* ── RESET QR ─────────────────────────────────────────────── */
  window.resetQR = function () {
    document.getElementById('qr-stage').innerHTML = QR_EMPTY;
  };

  /* ── DOWNLOAD ICON ────────────────────────────────────────── */
  var DL_ICO = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>'
    + '<polyline points="7 10 12 15 17 10"/>'
    + '<line x1="12" y1="15" x2="12" y2="3"/>'
    + '</svg>';

  /* ── GENERATE QR ──────────────────────────────────────────── */
  // Tidak ada tombol Salin, tidak ada SVG — hanya gambar QR + tombol Download PNG
  window.genQR = function () {
    var val = document.getElementById('qi').value.trim();
    var sz  = parseInt(document.getElementById('qs').value, 10);
    var btn = document.getElementById('genBtn');

    if (!val) {
      document.getElementById('qi').focus();
      toast('Masukkan URL terlebih dahulu!', 'err');
      return;
    }

    btn.disabled  = true;
    btn.innerHTML = '<span class="spin" style="display:inline-block;width:16px;height:16px;border:3px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-right:6px"></span>Membuat...';

    var imgUrl = 'https://api.qrserver.com/v1/create-qr-code/'
      + '?size=' + sz + 'x' + sz
      + '&data=' + encodeURIComponent(val)
      + '&bgcolor=0f172a&color=c7d2fe&margin=16';

    var disp = Math.min(sz, 260);

    setTimeout(function () {
      var stage = document.getElementById('qr-stage');

      // Build result: gambar QR + tombol Download PNG saja
      // Tidak ada tombol Salin, tidak ada SVG link
      var wrap  = document.createElement('div');
      wrap.className = 'qr-result-wrap';

      var img = document.createElement('img');
      img.src    = imgUrl;
      img.width  = disp;
      img.height = disp;
      img.alt    = 'QR Code';
      img.style.borderRadius = '10px';

      var dlBtn = document.createElement('a');
      dlBtn.href      = imgUrl;
      dlBtn.download  = 'qrcode.png';
      dlBtn.target    = '_blank';
      dlBtn.className = 'btn-download-png';
      dlBtn.innerHTML = DL_ICO + ' Download PNG';

      wrap.appendChild(img);
      wrap.appendChild(dlBtn);

      stage.innerHTML = '';
      stage.appendChild(wrap);

      btn.disabled    = false;
      btn.innerHTML   = '<span>Buat QR</span>'
        + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>';

      toast('QR Code berhasil dibuat!', 'success');
    }, 600);
  };

  /* ── SHORTEN ──────────────────────────────────────────────── */
  // Tidak ada QR kecil — hanya card dengan link pendek + tombol Salin bergradient
  window.shorten = function () {
    var url   = document.getElementById('url').value.trim();
    var btn   = document.getElementById('shortBtn');
    var resEl = document.getElementById('result');

    if (!url) {
      toast('Tempel URL terlebih dahulu!', 'err');
      document.getElementById('url').focus();
      return;
    }
    if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
      toast('URL harus diawali http:// atau https://', 'err');
      return;
    }

    btn.disabled    = true;
    btn.innerHTML   = '<span class="spin" style="display:inline-block;width:16px;height:16px;border:3px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-right:6px"></span>Mempersingkat...';
    resEl.innerHTML = '';

    fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.error) { toast(data.error, 'err'); return; }

      var short = data.short;

      // Build card — tidak ada QR kecil
      var card = document.createElement('div');
      card.className = 'short-card';

      var label = document.createElement('span');
      label.className   = 'short-label';
      label.textContent = 'Tautan Pendek';

      // Row: link + tombol Salin
      var row = document.createElement('div');
      row.className = 'short-link-row';

      var linkSpan = document.createElement('span');
      linkSpan.className   = 'short-link';
      linkSpan.textContent = short;

      var copyBtn = document.createElement('button');
      copyBtn.className   = 'btn-copy-link';
      copyBtn.textContent = 'Salin';
      copyBtn.onclick = function () { copyText(short, copyBtn); };

      row.appendChild(linkSpan);
      row.appendChild(copyBtn);

      // Tombol buka link
      var openLink = document.createElement('a');
      openLink.href      = short;
      openLink.target    = '_blank';
      openLink.textContent = 'Buka \u2197';
      openLink.style.cssText = 'display:inline-block;margin-top:10px;font-size:13px;color:var(--accent);font-weight:600;text-decoration:none;';

      card.appendChild(label);
      card.appendChild(row);
      card.appendChild(openLink);

      resEl.appendChild(card);
      toast('Tautan berhasil dipersingkat!', 'success');
    })
    .catch(function () { toast('Gagal terhubung. Periksa koneksi.', 'err'); })
    .finally(function () {
      btn.disabled    = false;
      btn.innerHTML   = '<span>Persingkat</span>'
        + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>'
        + '<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
    });
  };

  // Spin keyframe (inject sekali)
  if (!document.getElementById('_spin_style')) {
    var st = document.createElement('style');
    st.id = '_spin_style';
    st.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(st);
  }

})();
