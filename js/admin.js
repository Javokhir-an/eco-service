/* ==========================================================================
   Eco Service — Admin dashboard logikasi
   Faqat pages/admin-dashboard.html sahifasida ishlatiladi.
   ========================================================================== */

(function () {
  'use strict';

  if (!isFirebaseConfigured) {
    document.body.innerHTML = '<div style="padding:48px;text-align:center;font-family:sans-serif;">' +
      '<h1>Firebase sozlanmagan</h1>' +
      '<p>Admin panel ishlashi uchun js/firebase-config.js faylini to\'ldiring. Qadamlar README-FIREBASE.md faylida.</p></div>';
    return;
  }

  var SOURCE_LABELS = {
    'header-cta': 'Header tugmasi',
    'mobile-bar': 'Mobil pastki panel',
    'hero-order-form': 'Bosh sahifa formasi',
    'pricing-table': 'Narxlar jadvali',
    'calculator': 'Kalkulyator',
    'service-page-hero': 'Xizmat sahifasi (yuqori CTA)',
    'service-page-form': 'Xizmat sahifasi formasi',
    'category-page-form': 'Kategoriya sahifasi formasi',
    'aloqa-page-form': 'Aloqa sahifasi',
    'b2b-form': 'B2B murojaat',
    'modal-order': "Ariza modali (umumiy)"
  };

  var STATUS_LABELS = {
    'yangi': 'Yangi',
    'bog_langan': "Bog'lanildi",
    'bajarildi': 'Bajarildi'
  };

  var PRICE_CATALOG = {
    kompyuter: {
      label: 'Kompyuter va noutbuk',
      services: [
        { id: 'kompyuter-diagnostika', label: 'Noutbuk diagnostikasi', price: 'Bepul', duration: '30 daqiqa' },
        { id: 'kompyuter-ekran', label: 'Noutbuk ekranini almashtirish', price: "350 000 so'mdan", duration: '1 kun' },
        { id: 'kompyuter-yigish', label: "Kompyuter yig'ish (konfiguratsiya)", price: "200 000 so'mdan", duration: '2 soat' },
        { id: 'kompyuter-termopasta', label: 'Termopasta almashtirish', price: "80 000 so'mdan", duration: '1 soat' }
      ]
    },
    tarmoq: {
      label: 'Tarmoq',
      services: [
        { id: 'tarmoq-wifi', label: 'Wi-Fi tarmoq sozlash', price: "150 000 so'mdan", duration: '1–2 soat' },
        { id: 'tarmoq-video', label: "Video kuzatuv o'rnatish (1 kamera)", price: "300 000 so'mdan", duration: '3 soat' },
        { id: 'tarmoq-server', label: "Server o'rnatish va sozlash", price: "800 000 so'mdan", duration: '1 kun' }
      ]
    },
    dasturiy: {
      label: "Dasturiy ta'minot",
      services: [
        { id: 'dasturiy-windows', label: "Windows o'rnatish", price: "100 000 so'mdan", duration: '1 soat' },
        { id: 'dasturiy-virus', label: 'Viruslardan tozalash', price: "90 000 so'mdan", duration: '1 soat' },
        { id: 'dasturiy-ofis', label: "Ofis dasturlarini o'rnatish", price: "70 000 so'mdan", duration: '40 daqiqa' }
      ]
    },
    malumot: {
      label: "Ma'lumot tiklash",
      services: [
        { id: 'malumot-hdd', label: "HDD/SSD dan ma'lumot tiklash", price: "250 000 so'mdan", duration: '1–3 kun' },
        { id: 'malumot-flash', label: 'Flash-kartadan tiklash', price: "120 000 so'mdan", duration: '1 kun' },
        { id: 'malumot-zaxira', label: 'Zaxira nusxalash tizimini sozlash', price: "200 000 so'mdan", duration: '2 soat' }
      ]
    },
    printer: {
      label: 'Printer',
      services: [
        { id: 'printer-diagnostika', label: 'Printer diagnostikasi', price: 'Bepul', duration: '30 daqiqa' },
        { id: 'printer-kartrij', label: "Kartrij to'ldirish", price: "40 000 so'mdan", duration: '20 daqiqa' },
        { id: 'printer-mfu', label: "MFU ta'mirlash", price: "150 000 so'mdan", duration: '1 kun' }
      ]
    },
    b2b: {
      label: 'B2B',
      services: [
        { id: 'b2b-autsorsing', label: 'Oylik IT autsorsing (kichik ofis)', price: "1 500 000 so'mdan / oy", duration: 'Shartnoma' },
        { id: 'b2b-tarmoq', label: "Korporativ tarmoq o'rnatish", price: 'Kelishilgan holda', duration: 'Loyihaga qarab' },
        { id: 'b2b-texnika', label: "Ofis texnikasini ta'minlash va xizmat", price: 'Kelishilgan holda', duration: 'Shartnoma' }
      ]
    }
  };

  /* ---------- Autentifikatsiya ---------- */
  window.ecoAuth.onAuthStateChanged(function (user) {
    if (!user) {
      window.location.href = 'admin-login.html';
      return;
    }
    document.getElementById('admin-user-email').textContent = user.email;
    initDashboard();
  });

  document.getElementById('admin-logout').addEventListener('click', function () {
    window.ecoAuth.signOut().then(function () {
      window.location.href = 'admin-login.html';
    });
  });

  /* ---------- Nav almashish ---------- */
  var navButtons = document.querySelectorAll('.admin-nav__item[data-view]');
  var views = document.querySelectorAll('.admin-view');
  navButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-view');
      navButtons.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
      views.forEach(function (v) { v.classList.toggle('is-active', v.id === 'view-' + key); });
    });
  });

  var submissionsCache = [];

  function initDashboard() {
    loadSubmissions();
    renderPriceEditor();
  }

  /* ---------- Arizalarni yuklash ---------- */
  function loadSubmissions() {
    window.ecoDb.collection('submissions').orderBy('createdAt', 'desc').limit(300).get()
      .then(function (snapshot) {
        submissionsCache = [];
        snapshot.forEach(function (doc) {
          var d = doc.data();
          submissionsCache.push({
            id: doc.id,
            name: d.name || d.organization || '—',
            phone: d.phone || '—',
            service: d.service || d.message || '—',
            source: d.source || 'boshqa',
            page: d.page || '—',
            status: d.status || 'yangi',
            createdAt: d.createdAt && d.createdAt.toDate ? d.createdAt.toDate() : null
          });
        });
        renderStats();
        renderSubmissionsTable();
      })
      .catch(function (err) {
        console.error('Arizalarni yuklashda xatolik:', err);
        document.getElementById('submissions-tbody').innerHTML =
          '<tr><td colspan="7" class="admin-empty">Ma\'lumotlarni yuklab bo\'lmadi. Firestore qoidalarini (rules) tekshiring.</td></tr>';
      });
  }

  function startOfDay(d) {
    var x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  function renderStats() {
    var total = submissionsCache.length;
    var today = startOfDay(new Date());
    var weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);

    var todayCount = 0, weekCount = 0;
    var bySource = {};

    submissionsCache.forEach(function (s) {
      if (s.createdAt) {
        if (s.createdAt >= today) todayCount++;
        if (s.createdAt >= weekAgo) weekCount++;
      }
      bySource[s.source] = (bySource[s.source] || 0) + 1;
    });

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-today').textContent = todayCount;
    document.getElementById('stat-week').textContent = weekCount;

    var sortedSources = Object.keys(bySource).sort(function (a, b) { return bySource[b] - bySource[a]; });
    document.getElementById('stat-top-source').textContent = sortedSources.length
      ? (SOURCE_LABELS[sortedSources[0]] || sortedSources[0])
      : '—';

    var maxCount = sortedSources.length ? bySource[sortedSources[0]] : 0;
    var barsHtml = sortedSources.map(function (key) {
      var count = bySource[key];
      var pct = maxCount ? Math.round((count / maxCount) * 100) : 0;
      var label = SOURCE_LABELS[key] || key;
      return '<div class="admin-bar-row">' +
        '<span>' + escapeHtml(label) + '</span>' +
        '<span class="admin-bar-row__track"><span class="admin-bar-row__fill" style="width:' + pct + '%"></span></span>' +
        '<span class="admin-bar-row__count">' + count + '</span>' +
        '</div>';
    }).join('');
    document.getElementById('source-breakdown').innerHTML = barsHtml || '<p class="text-secondary text-small">Hali arizalar yo\'q.</p>';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(d) {
    if (!d) return '—';
    var pad = function (n) { return n < 10 ? '0' + n : n; };
    return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  /* ---------- Arizalar jadvali + filtrlar ---------- */
  var filterSource = document.getElementById('filter-source');
  var filterStatus = document.getElementById('filter-status');
  var filterSearch = document.getElementById('filter-search');

  function populateSourceFilter() {
    var sources = Object.keys(SOURCE_LABELS);
    filterSource.innerHTML = '<option value="">Barcha bo\'limlar</option>' +
      sources.map(function (s) { return '<option value="' + s + '">' + SOURCE_LABELS[s] + '</option>'; }).join('');
  }
  populateSourceFilter();

  [filterSource, filterStatus, filterSearch].forEach(function (el) {
    el.addEventListener('input', renderSubmissionsTable);
    el.addEventListener('change', renderSubmissionsTable);
  });

  function renderSubmissionsTable() {
    var sourceVal = filterSource.value;
    var statusVal = filterStatus.value;
    var searchVal = filterSearch.value.trim().toLowerCase();

    var filtered = submissionsCache.filter(function (s) {
      if (sourceVal && s.source !== sourceVal) return false;
      if (statusVal && s.status !== statusVal) return false;
      if (searchVal && s.name.toLowerCase().indexOf(searchVal) === -1 && s.phone.toLowerCase().indexOf(searchVal) === -1) return false;
      return true;
    });

    var tbody = document.getElementById('submissions-tbody');
    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="admin-empty">Hech narsa topilmadi.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(function (s) {
      var statusClass = 'admin-status--' + s.status;
      return '<tr>' +
        '<td>' + escapeHtml(s.name) + '</td>' +
        '<td><a href="tel:' + escapeHtml(s.phone) + '">' + escapeHtml(s.phone) + '</a></td>' +
        '<td>' + escapeHtml(s.service) + '</td>' +
        '<td>' + escapeHtml(SOURCE_LABELS[s.source] || s.source) + '</td>' +
        '<td>' + escapeHtml(s.page) + '</td>' +
        '<td>' + formatDate(s.createdAt) + '</td>' +
        '<td><select class="admin-status-select" data-id="' + s.id + '">' +
          Object.keys(STATUS_LABELS).map(function (key) {
            return '<option value="' + key + '"' + (key === s.status ? ' selected' : '') + '>' + STATUS_LABELS[key] + '</option>';
          }).join('') +
        '</select></td>' +
        '</tr>';
    }).join('');

    tbody.querySelectorAll('.admin-status-select').forEach(function (select) {
      select.addEventListener('change', function () {
        var id = select.getAttribute('data-id');
        var newStatus = select.value;
        window.ecoDb.collection('submissions').doc(id).update({ status: newStatus }).then(function () {
          var item = submissionsCache.filter(function (s) { return s.id === id; })[0];
          if (item) item.status = newStatus;
        }).catch(function (err) {
          console.error('Holatni yangilashda xatolik:', err);
        });
      });
    });
  }

  /* ---------- Narxlarni boshqarish ---------- */
  function renderPriceEditor() {
    var tabsWrap = document.getElementById('price-tabs');
    var panelsWrap = document.getElementById('price-panels');
    var categories = Object.keys(PRICE_CATALOG);

    tabsWrap.innerHTML = categories.map(function (key, i) {
      return '<button type="button" class="pricing__tab' + (i === 0 ? ' is-active' : '') + '" data-price-tab="' + key + '">' +
        PRICE_CATALOG[key].label + '</button>';
    }).join('');

    panelsWrap.innerHTML = categories.map(function (key, i) {
      var cat = PRICE_CATALOG[key];
      var rows = cat.services.map(function (s) {
        return '<div class="admin-price-row" data-price-id="' + s.id + '">' +
          '<span>' + escapeHtml(s.label) + '</span>' +
          '<input type="text" class="admin-price-input" value="' + escapeHtml(s.price) + '" aria-label="Narx">' +
          '<input type="text" class="admin-duration-input" value="' + escapeHtml(s.duration) + '" aria-label="Muddat">' +
          '</div>';
      }).join('');
      return '<div class="admin-price-panel' + (i === 0 ? ' is-active' : '') + '" data-price-panel="' + key + '"' + (i === 0 ? '' : ' hidden') + '>' +
        '<div class="admin-card">' + rows +
        '<div class="admin-save-bar">' +
          '<button type="button" class="btn btn--primary" data-save-category="' + key + '">Saqlash</button>' +
          '<span class="admin-save-bar__status" id="save-status-' + key + '">Saqlandi</span>' +
        '</div></div></div>';
    }).join('');

    // Firestore'dagi mavjud narxlarni yuklab, formani yangilaymiz (agar avval saqlangan bo'lsa)
    window.ecoDb.collection('prices').doc('services').get().then(function (doc) {
      if (!doc.exists) return;
      var data = doc.data();
      Object.keys(data).forEach(function (id) {
        var row = panelsWrap.querySelector('[data-price-id="' + id + '"]');
        if (!row) return;
        if (data[id].price) row.querySelector('.admin-price-input').value = data[id].price;
        if (data[id].duration) row.querySelector('.admin-duration-input').value = data[id].duration;
      });
    });

    tabsWrap.querySelectorAll('[data-price-tab]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var key = tab.getAttribute('data-price-tab');
        tabsWrap.querySelectorAll('[data-price-tab]').forEach(function (t) { t.classList.toggle('is-active', t === tab); });
        panelsWrap.querySelectorAll('[data-price-panel]').forEach(function (p) {
          var match = p.getAttribute('data-price-panel') === key;
          p.hidden = !match;
          p.classList.toggle('is-active', match);
        });
      });
    });

    panelsWrap.querySelectorAll('[data-save-category]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-save-category');
        var panel = panelsWrap.querySelector('[data-price-panel="' + key + '"]');
        var updates = {};
        panel.querySelectorAll('.admin-price-row').forEach(function (row) {
          var id = row.getAttribute('data-price-id');
          updates[id] = {
            price: row.querySelector('.admin-price-input').value.trim(),
            duration: row.querySelector('.admin-duration-input').value.trim()
          };
        });
        btn.disabled = true;
        window.ecoDb.collection('prices').doc('services').set(updates, { merge: true })
          .then(function () {
            var statusEl = document.getElementById('save-status-' + key);
            statusEl.classList.add('is-visible');
            setTimeout(function () { statusEl.classList.remove('is-visible'); }, 2000);
          })
          .catch(function (err) {
            console.error('Narxlarni saqlashda xatolik:', err);
            alert("Saqlashda xatolik yuz berdi. Internet aloqasini va Firestore qoidalarini tekshiring.");
          })
          .finally(function () {
            btn.disabled = false;
          });
      });
    });
  }
})();
