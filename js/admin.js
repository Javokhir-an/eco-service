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
    'header-cta': "Tepadagi 'Ariza qoldirish' tugmasi",
    'mobile-bar': 'Mobil pastki panel',
    'hero-order-form': "Tezkor qo'ng'iroq formasi",
    'pricing-table': 'Narxlar jadvalidagi tugma',
    'calculator': 'Narx kalkulyatori',
    'service-page-hero': 'Sahifa yuqorisidagi tugma',
    'service-page-form': 'Sahifa pastidagi forma',
    'category-page-form': 'Sahifa pastidagi forma',
    'category-page-card': 'Xizmat kartochkasi',
    'aloqa-page-form': 'Aloqa formasi',
    'b2b-form': 'B2B murojaat formasi',
    'b2b-checklist': 'Afzallik kartochkasi',
    'modal-order': 'Ariza tugmasi'
  };

  var STATUS_LABELS = {
    'yangi': 'Yangi',
    'bog_langan': "Bog'lanildi",
    'bajarildi': 'Bajarildi'
  };

  var REVIEW_STATUS_LABELS = {
    'kutilmoqda': 'Kutilmoqda',
    'tasdiqlangan': 'Tasdiqlangan',
    'rad_etilgan': 'Rad etilgan'
  };

  var SERVICE_LABELS = {
    kompyuter: 'Kompyuter va noutbuk',
    tarmoq: 'Tarmoq va server',
    dasturiy: "Dasturiy ta'minot",
    malumot: "Ma'lumotlarni tiklash",
    printer: 'Printer va ofis texnikasi',
    b2b: 'Biznes uchun IT (B2B)'
  };

  // Forma "service" maydonini to'ldirmagan hollarda (xizmat sahifasidagi
  // qisqa formalar) sahifa manzilidan xizmat turini aniqlaymiz — Telegram
  // xabarnomasidagi mantiq bilan bir xil.
  var PAGE_TO_SERVICE = {
    'xizmat-noutbuk-tamirlash.html': 'kompyuter',
    'xizmat-kompyuter-yigish.html': 'kompyuter',
    'xizmat-monobloq-tamirlash.html': 'kompyuter',
    'kategoriya-kompyuter.html': 'kompyuter',
    'xizmat-wifi-sozlash.html': 'tarmoq',
    'xizmat-server-ornatish.html': 'tarmoq',
    'xizmat-video-kuzatuv.html': 'tarmoq',
    'kategoriya-tarmoq.html': 'tarmoq',
    'xizmat-windows-ornatish.html': 'dasturiy',
    'xizmat-virus-tozalash.html': 'dasturiy',
    'xizmat-dastur-ornatish.html': 'dasturiy',
    'kategoriya-dasturiy.html': 'dasturiy',
    'xizmat-hdd-tiklash.html': 'malumot',
    'xizmat-flash-tiklash.html': 'malumot',
    'xizmat-zaxira-nusxalash.html': 'malumot',
    'kategoriya-malumot.html': 'malumot',
    'xizmat-printer-tamirlash.html': 'printer',
    'xizmat-kartrij-toldirish.html': 'printer',
    'xizmat-mfu-xizmat.html': 'printer',
    'kategoriya-printer.html': 'printer',
    'b2b.html': 'b2b'
  };

  var PAGE_LABELS = {
    '': 'Bosh sahifa',
    'index.html': 'Bosh sahifa',
    'narxlar.html': 'Narxlar',
    'mutaxassislar.html': 'Mutaxassislar',
    'sharhlar.html': 'Sharhlar',
    'aksiyalar.html': 'Aksiyalar',
    'aloqa.html': 'Aloqa',
    'biz-haqimizda.html': 'Biz haqimizda',
    'blog.html': 'Blog',
    'b2b.html': 'B2B',
    'kategoriya-kompyuter.html': 'Kategoriya: Kompyuter va noutbuk',
    'kategoriya-tarmoq.html': 'Kategoriya: Tarmoq',
    'kategoriya-dasturiy.html': "Kategoriya: Dasturiy ta'minot",
    'kategoriya-malumot.html': "Kategoriya: Ma'lumotlarni tiklash",
    'kategoriya-printer.html': 'Kategoriya: Printer',
    'xizmat-noutbuk-tamirlash.html': "Noutbuk ta'mirlash",
    'xizmat-kompyuter-yigish.html': "Kompyuter yig'ish",
    'xizmat-monobloq-tamirlash.html': "Monobloq ta'mirlash",
    'xizmat-wifi-sozlash.html': 'Wi-Fi tarmoq sozlash',
    'xizmat-server-ornatish.html': "Server o'rnatish",
    'xizmat-video-kuzatuv.html': 'Video kuzatuv tizimi',
    'xizmat-windows-ornatish.html': "Windows o'rnatish",
    'xizmat-virus-tozalash.html': 'Viruslardan tozalash',
    'xizmat-dastur-ornatish.html': "Dastur o'rnatish",
    'xizmat-hdd-tiklash.html': "HDD/SSD dan ma'lumot tiklash",
    'xizmat-flash-tiklash.html': 'Flash-kartadan tiklash',
    'xizmat-zaxira-nusxalash.html': 'Zaxira nusxalash xizmati',
    'xizmat-printer-tamirlash.html': "Printer ta'mirlash",
    'xizmat-kartrij-toldirish.html': "Kartrij to'ldirish",
    'xizmat-mfu-xizmat.html': "MFU xizmat ko'rsatish"
  };

  function pageBasename(page) {
    return (page || '').replace(/\/$/, '').split('/').pop();
  }

  function inferServiceFromPage(page) {
    return PAGE_TO_SERVICE[pageBasename(page)] || '';
  }

  function getPageLabel(page) {
    return PAGE_LABELS[pageBasename(page)] || page || '—';
  }

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
    var avatarEl = document.getElementById('admin-avatar');
    if (avatarEl) avatarEl.textContent = (user.email || '?').substring(0, 2).toUpperCase();
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

  function switchView(key) {
    navButtons.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-view') === key); });
    views.forEach(function (v) { v.classList.toggle('is-active', v.id === 'view-' + key); });
  }

  navButtons.forEach(function (btn) {
    btn.addEventListener('click', function () { switchView(btn.getAttribute('data-view')); });
  });

  var submissionsCache = [];
  var reviewsCache = [];

  function initDashboard() {
    loadSubmissions();
    loadReviews();
    renderPriceEditor();
    initCrud();
    loadSettings();
  }

  function setUpdatedNow() {
    var now = formatDate(new Date());
    ['stats-updated-at', 'submissions-updated-at', 'reviews-updated-at'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = now;
    });
  }

  /* ---------- Arizalarni yuklash ---------- */
  function loadSubmissions(onDone) {
    window.ecoDb.collection('submissions').orderBy('createdAt', 'desc').limit(300).get()
      .then(function (snapshot) {
        submissionsCache = [];
        snapshot.forEach(function (doc) {
          var d = doc.data();
          var serviceKey = d.service || inferServiceFromPage(d.page || '');
          submissionsCache.push({
            id: doc.id,
            name: d.name || d.organization || '—',
            phone: d.phone || '—',
            serviceKey: serviceKey,
            service: SERVICE_LABELS[serviceKey] || serviceKey || '—',
            source: d.source || 'boshqa',
            page: getPageLabel(d.page || ''),
            pageRaw: d.page || '—',
            message: d.message || '',
            organization: d.organization || '',
            email: d.email || '',
            status: d.status || 'yangi',
            createdAt: d.createdAt && d.createdAt.toDate ? d.createdAt.toDate() : null
          });
        });
        renderStats();
        renderSubmissionsTable();
        setUpdatedNow();
        if (onDone) onDone();
      })
      .catch(function (err) {
        console.error('Arizalarni yuklashda xatolik:', err);
        document.getElementById('submissions-tbody').innerHTML =
          '<tr><td colspan="7" class="admin-empty">Ma\'lumotlarni yuklab bo\'lmadi. Firestore qoidalarini (rules) tekshiring.</td></tr>';
        if (onDone) onDone();
      });
  }

  function bindRefreshButton(id, loader) {
    var btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', function () {
      btn.classList.add('is-loading');
      btn.disabled = true;
      loader(function () {
        btn.classList.remove('is-loading');
        btn.disabled = false;
        showToast("Ma'lumotlar yangilandi");
      });
    });
  }
  bindRefreshButton('stats-refresh', loadSubmissions);
  bindRefreshButton('submissions-refresh', loadSubmissions);
  bindRefreshButton('reviews-refresh', loadReviews);

  /* ---------- Sharhlarni yuklash va moderatsiya ---------- */
  function loadReviews(onDone) {
    window.ecoDb.collection('reviews').orderBy('createdAt', 'desc').limit(200).get()
      .then(function (snapshot) {
        reviewsCache = [];
        snapshot.forEach(function (doc) {
          var d = doc.data();
          reviewsCache.push({
            id: doc.id,
            name: d.name || '—',
            serviceKey: d.service || '',
            service: SERVICE_LABELS[d.service] || d.service || '—',
            rating: parseInt(d.rating, 10) || 5,
            text: d.text || '',
            status: d.status || 'kutilmoqda',
            createdAt: d.createdAt && d.createdAt.toDate ? d.createdAt.toDate() : null
          });
        });
        renderReviewsTable();
        updatePendingReviewsBadge();
        setUpdatedNow();
        if (onDone) onDone();
      })
      .catch(function (err) {
        console.error('Sharhlarni yuklashda xatolik:', err);
        var tbody = document.getElementById('reviews-tbody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="admin-empty">Ma\'lumotlarni yuklab bo\'lmadi. Firestore qoidalarini (rules) tekshiring.</td></tr>';
        if (onDone) onDone();
      });
  }

  function updatePendingReviewsBadge() {
    var badge = document.getElementById('reviews-pending-badge');
    if (!badge) return;
    var count = reviewsCache.filter(function (r) { return r.status === 'kutilmoqda'; }).length;
    badge.textContent = count;
    badge.hidden = count === 0;
  }

  var reviewFilterStatus = document.getElementById('review-filter-status');
  reviewFilterStatus && reviewFilterStatus.addEventListener('change', renderReviewsTable);

  function starsHtml(rating) {
    var full = '★★★★★'.substring(0, rating);
    var empty = '☆☆☆☆☆'.substring(0, 5 - rating);
    return full + empty;
  }

  function renderReviewsTable() {
    var statusVal = reviewFilterStatus ? reviewFilterStatus.value : '';
    var filtered = reviewsCache.filter(function (r) {
      return !statusVal || r.status === statusVal;
    });

    var tbody = document.getElementById('reviews-tbody');
    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="admin-empty">Hech narsa topilmadi.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(function (r) {
      return '<tr>' +
        '<td>' + escapeHtml(r.name) + '</td>' +
        '<td>' + escapeHtml(r.service) + '</td>' +
        '<td><span class="admin-table__stars">' + starsHtml(r.rating) + '</span></td>' +
        '<td><div class="admin-table__text-truncate">' + escapeHtml(r.text) + '</div></td>' +
        '<td>' + formatDate(r.createdAt) + '</td>' +
        '<td><span class="admin-status admin-status--' + r.status + '">' + REVIEW_STATUS_LABELS[r.status] + '</span></td>' +
        '<td><div class="admin-table__actions">' +
          '<button type="button" class="admin-icon-btn admin-icon-btn--approve" data-review-id="' + r.id + '" data-review-status="tasdiqlangan" aria-label="Tasdiqlash" title="Tasdiqlash">' +
            '<svg class="icon" aria-hidden="true" focusable="false"><use href="../img/icons/sprite.svg#icon-check"></use></svg></button>' +
          '<button type="button" class="admin-icon-btn admin-icon-btn--reject" data-review-id="' + r.id + '" data-review-status="rad_etilgan" aria-label="Rad etish" title="Rad etish">' +
            '<svg class="icon" aria-hidden="true" focusable="false"><use href="../img/icons/sprite.svg#icon-close"></use></svg></button>' +
        '</div></td>' +
        '</tr>';
    }).join('');

    tbody.querySelectorAll('[data-review-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        updateReviewStatus(btn.getAttribute('data-review-id'), btn.getAttribute('data-review-status'));
      });
    });
  }

  function updateReviewStatus(id, newStatus) {
    window.ecoDb.collection('reviews').doc(id).update({ status: newStatus }).then(function () {
      var item = reviewsCache.filter(function (r) { return r.id === id; })[0];
      if (item) item.status = newStatus;
      renderReviewsTable();
      updatePendingReviewsBadge();
      showToast('Sharh holati: ' + REVIEW_STATUS_LABELS[newStatus]);
    }).catch(function (err) {
      console.error('Sharh holatini yangilashda xatolik:', err);
      showToast('Xatolik: holat yangilanmadi', 'error');
    });
  }

  function startOfDay(d) {
    var x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  var STATUS_BAR_COLORS = { yangi: 'amber', bog_langan: 'blue', bajarildi: 'green' };

  function renderStats() {
    var total = submissionsCache.length;
    var today = startOfDay(new Date());
    var weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);

    var todayCount = 0, weekCount = 0;
    var bySource = {};
    var byStatus = { yangi: 0, bog_langan: 0, bajarildi: 0 };

    submissionsCache.forEach(function (s) {
      if (s.createdAt) {
        if (s.createdAt >= today) todayCount++;
        if (s.createdAt >= weekAgo) weekCount++;
      }
      bySource[s.source] = (bySource[s.source] || 0) + 1;
      byStatus[s.status] = (byStatus[s.status] || 0) + 1;
    });

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-today').textContent = todayCount;
    document.getElementById('stat-week').textContent = weekCount;

    Object.keys(byStatus).forEach(function (key) {
      var el = document.getElementById('stat-status-' + key);
      if (el) el.textContent = byStatus[key];
    });

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

    var maxStatusCount = Math.max(byStatus.yangi, byStatus.bog_langan, byStatus.bajarildi, 1);
    var statusHtml = Object.keys(STATUS_LABELS).map(function (key) {
      var count = byStatus[key] || 0;
      var pct = Math.round((count / maxStatusCount) * 100);
      return '<div class="admin-bar-row admin-bar-row--clickable" data-goto-status="' + key + '">' +
        '<span>' + escapeHtml(STATUS_LABELS[key]) + '</span>' +
        '<span class="admin-bar-row__track"><span class="admin-bar-row__fill admin-bar-row__fill--' + STATUS_BAR_COLORS[key] + '" style="width:' + pct + '%"></span></span>' +
        '<span class="admin-bar-row__count">' + count + '</span>' +
        '</div>';
    }).join('');
    document.getElementById('status-breakdown').innerHTML = statusHtml;

    document.querySelectorAll('[data-goto-status]').forEach(function (el) {
      el.addEventListener('click', function () {
        goToSubmissionsFiltered(el.getAttribute('data-goto-status'));
      });
    });
  }

  function goToSubmissionsFiltered(statusKey) {
    switchView('submissions');
    filterStatus.value = statusKey;
    renderSubmissionsTable();
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------- Toast bildirishnomalar ---------- */
  function showToast(message, type) {
    var container = document.getElementById('toast-container');
    if (!container) return;
    var toast = document.createElement('div');
    toast.className = 'admin-toast' + (type === 'error' ? ' admin-toast--error' : '');
    toast.innerHTML =
      '<svg class="icon admin-toast__icon" aria-hidden="true" focusable="false"><use href="../img/icons/sprite.svg#icon-' +
      (type === 'error' ? 'close' : 'check') + '"></use></svg><span>' + escapeHtml(message) + '</span>';
    container.appendChild(toast);
    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      setTimeout(function () { toast.remove(); }, 200);
    }, 3200);
  }

  function formatDate(d) {
    if (!d) return '—';
    var pad = function (n) { return n < 10 ? '0' + n : n; };
    return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  /* ---------- Arizalar jadvali + filtrlar ---------- */
  var filterSource = document.getElementById('filter-source');
  var filterStatus = document.getElementById('filter-status');
  var filterDate = document.getElementById('filter-date');
  var filterSearch = document.getElementById('filter-search');

  function populateSourceFilter() {
    var sources = Object.keys(SOURCE_LABELS);
    filterSource.innerHTML = '<option value="">Barcha bo\'limlar</option>' +
      sources.map(function (s) { return '<option value="' + s + '">' + SOURCE_LABELS[s] + '</option>'; }).join('');
  }
  populateSourceFilter();

  [filterSource, filterStatus, filterDate, filterSearch].forEach(function (el) {
    el.addEventListener('input', renderSubmissionsTable);
    el.addEventListener('change', renderSubmissionsTable);
  });

  function matchesDateFilter(createdAt, filterVal) {
    if (!filterVal) return true;
    if (!createdAt) return false;
    var today = startOfDay(new Date());
    if (filterVal === 'today') return createdAt >= today;
    if (filterVal === 'week') return createdAt >= new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    if (filterVal === 'month') return createdAt >= new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
    return true;
  }

  function getFilteredSubmissions() {
    var sourceVal = filterSource.value;
    var statusVal = filterStatus.value;
    var dateVal = filterDate.value;
    var searchVal = filterSearch.value.trim().toLowerCase();

    return submissionsCache.filter(function (s) {
      if (sourceVal && s.source !== sourceVal) return false;
      if (statusVal && s.status !== statusVal) return false;
      if (!matchesDateFilter(s.createdAt, dateVal)) return false;
      if (searchVal && s.name.toLowerCase().indexOf(searchVal) === -1 && s.phone.toLowerCase().indexOf(searchVal) === -1) return false;
      return true;
    });
  }

  function renderSubmissionsTable() {
    var filtered = getFilteredSubmissions();
    var tbody = document.getElementById('submissions-tbody');
    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="admin-empty">Hech narsa topilmadi.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(function (s) {
      return '<tr data-id="' + s.id + '"' + (s.status === 'yangi' ? ' class="is-new"' : '') + '>' +
        '<td><span class="admin-table__name">' + (s.status === 'yangi' ? '<span class="admin-table__new-dot" aria-hidden="true"></span>' : '') + escapeHtml(s.name) + '</span></td>' +
        '<td><a href="tel:' + escapeHtml(s.phone) + '" onclick="event.stopPropagation()">' + escapeHtml(s.phone) + '</a></td>' +
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
      select.addEventListener('click', function (e) { e.stopPropagation(); });
      select.addEventListener('change', function () {
        updateSubmissionStatus(select.getAttribute('data-id'), select.value);
      });
    });

    tbody.querySelectorAll('tr[data-id]').forEach(function (row) {
      row.addEventListener('click', function () {
        openDetailPanel(row.getAttribute('data-id'));
      });
    });
  }

  function updateSubmissionStatus(id, newStatus) {
    window.ecoDb.collection('submissions').doc(id).update({ status: newStatus }).then(function () {
      var item = submissionsCache.filter(function (s) { return s.id === id; })[0];
      if (item) item.status = newStatus;
      renderSubmissionsTable();
      renderStats();
    }).catch(function (err) {
      console.error('Holatni yangilashda xatolik:', err);
      showToast('Holatni yangilab bo\'lmadi', 'error');
    });
  }

  /* ---------- Ariza tafsilotlari paneli ---------- */
  var detailPanel = document.getElementById('detail-panel');
  var detailBackdrop = document.getElementById('detail-backdrop');
  var detailBody = document.getElementById('detail-body');
  var detailCallBtn = document.getElementById('detail-call-btn');

  function detailRow(iconName, label, value) {
    if (!value) return '';
    return '<div class="admin-detail-row">' +
      '<svg class="icon admin-detail-row__icon" aria-hidden="true" focusable="false"><use href="../img/icons/sprite.svg#icon-' + iconName + '"></use></svg>' +
      '<div><div class="admin-detail-row__label">' + escapeHtml(label) + '</div><div class="admin-detail-row__value">' + escapeHtml(value) + '</div></div>' +
      '</div>';
  }

  function openDetailPanel(id) {
    var s = submissionsCache.filter(function (x) { return x.id === id; })[0];
    if (!s) return;

    detailBody.innerHTML =
      detailRow('note', 'Ism', s.name) +
      detailRow('phone', 'Telefon', s.phone) +
      detailRow('briefcase', 'Tashkilot', s.organization) +
      detailRow('mail', 'Email', s.email) +
      detailRow('tools', 'Xizmat', s.service) +
      detailRow('pin', "Bo'lim", SOURCE_LABELS[s.source] || s.source) +
      detailRow('monitor', 'Sahifa', s.page) +
      detailRow('timer', 'Sana', formatDate(s.createdAt)) +
      detailRow('document', 'Izoh', s.message);

    detailCallBtn.href = 'tel:' + s.phone;
    detailPanel.classList.add('is-open');
    detailPanel.setAttribute('aria-hidden', 'false');
    detailBackdrop.classList.add('is-open');
  }

  function closeDetailPanel() {
    detailPanel.classList.remove('is-open');
    detailPanel.setAttribute('aria-hidden', 'true');
    detailBackdrop.classList.remove('is-open');
  }

  document.getElementById('detail-close').addEventListener('click', closeDetailPanel);
  detailBackdrop.addEventListener('click', closeDetailPanel);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDetailPanel();
  });

  /* ---------- CSV eksport ---------- */
  document.getElementById('submissions-export').addEventListener('click', function () {
    var rows = getFilteredSubmissions();
    if (!rows.length) {
      showToast('Eksport qilish uchun ariza topilmadi', 'error');
      return;
    }
    var header = ['Ism', 'Telefon', 'Xizmat', "Bo'lim", 'Sahifa', 'Sana', 'Holat', 'Izoh'];
    var lines = [header.join(',')];
    rows.forEach(function (s) {
      var cells = [
        s.name, s.phone, s.service, SOURCE_LABELS[s.source] || s.source,
        s.page, formatDate(s.createdAt), STATUS_LABELS[s.status] || s.status, s.message
      ];
      lines.push(cells.map(csvCell).join(','));
    });
    var csv = '﻿' + lines.join('\r\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'eco-service-arizalar-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(rows.length + ' ta ariza CSV formatida yuklab olindi');
  });

  function csvCell(value) {
    var str = String(value == null ? '' : value).replace(/"/g, '""');
    return '"' + str + '"';
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
            showToast(PRICE_CATALOG[key].label + ' narxlari saqlandi');
          })
          .catch(function (err) {
            console.error('Narxlarni saqlashda xatolik:', err);
            showToast("Saqlashda xatolik yuz berdi. Internet aloqasini tekshiring.", 'error');
          })
          .finally(function () {
            btn.disabled = false;
          });
      });
    });
  }

  /* ==========================================================================
     Umumiy CRUD tizimi — Mutaxassislar, Aksiyalar, Blog uchun bir xil mantiq
     ========================================================================== */
  var CRUD_CONFIGS = {
    specialists: {
      title: 'Mutaxassis',
      orderField: 'name',
      fields: [
        { key: 'name', label: 'Ism', type: 'text', required: true },
        { key: 'specialty', label: 'Mutaxassislik', type: 'text', required: true },
        { key: 'experience', label: 'Tajriba (yil)', type: 'number', def: 1 },
        { key: 'rating', label: "Reyting (masalan 4.9)", type: 'text', def: '5.0' },
        { key: 'reviewCount', label: 'Baholar soni', type: 'number', def: 0 },
        { key: 'active', label: "Faol (saytda ko'rinadi)", type: 'checkbox', def: true }
      ]
    },
    promotions: {
      title: 'Aksiya',
      orderField: 'title',
      fields: [
        { key: 'title', label: 'Sarlavha', type: 'text', required: true },
        { key: 'description', label: 'Tavsif', type: 'textarea' },
        { key: 'terms', label: 'Shartlar', type: 'textarea' },
        { key: 'validUntil', label: 'Amal qilish muddati', type: 'date' },
        { key: 'active', label: "Faol (saytda ko'rinadi)", type: 'checkbox', def: true }
      ]
    },
    blogPosts: {
      title: 'Blog maqolasi',
      orderField: 'title',
      fields: [
        { key: 'title', label: 'Sarlavha', type: 'text', required: true },
        { key: 'excerpt', label: 'Qisqacha tavsif', type: 'textarea' },
        { key: 'link', label: 'Havola (masalan blog-noutbuk-qiziydi.html)', type: 'text' },
        { key: 'readTime', label: "O'qish vaqti (masalan \"5 daqiqa\")", type: 'text', def: '5 daqiqa' },
        { key: 'active', label: "Nashr etilgan (ko'rinadimi)", type: 'checkbox', def: true }
      ]
    }
  };

  var crudCaches = { specialists: [], promotions: [], blogPosts: [] };

  function initCrud() {
    Object.keys(CRUD_CONFIGS).forEach(function (key) {
      loadCrudCollection(key);
    });

    document.querySelectorAll('[data-crud-add]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openCrudForm(btn.getAttribute('data-crud-add'), null);
      });
    });

    document.getElementById('crud-close').addEventListener('click', closeCrudPanel);
    document.getElementById('crud-backdrop').addEventListener('click', closeCrudPanel);
    document.getElementById('crud-form').addEventListener('submit', function (e) {
      e.preventDefault();
      saveCrudForm();
    });
  }

  function loadCrudCollection(key) {
    window.ecoDb.collection(key).get()
      .then(function (snapshot) {
        var items = [];
        snapshot.forEach(function (doc) {
          items.push(Object.assign({ id: doc.id }, doc.data()));
        });
        var orderField = CRUD_CONFIGS[key].orderField;
        items.sort(function (a, b) {
          return (a[orderField] || '').toString().localeCompare((b[orderField] || '').toString());
        });
        crudCaches[key] = items;
        renderCrudTable(key);
      })
      .catch(function (err) {
        console.error('Yuklashda xatolik (' + key + '):', err);
        var tbody = document.getElementById(key + '-tbody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="admin-empty">Yuklab bo\'lmadi. Firestore qoidalarini tekshiring.</td></tr>';
      });
  }

  function renderCrudTable(key) {
    var config = CRUD_CONFIGS[key];
    var tbody = document.getElementById(key + '-tbody');
    if (!tbody) return;
    var items = crudCaches[key];

    if (!items.length) {
      var colCount = tbody.closest('table').querySelectorAll('thead th').length;
      tbody.innerHTML = '<tr><td colspan="' + colCount + '" class="admin-empty">Hali hech narsa qo\'shilmagan.</td></tr>';
      return;
    }

    tbody.innerHTML = items.map(function (item) {
      var cells = '';
      if (key === 'specialists') {
        cells =
          '<td>' + escapeHtml(item.name || '') + '</td>' +
          '<td>' + escapeHtml(item.specialty || '') + '</td>' +
          '<td>' + escapeHtml(item.experience != null ? item.experience + ' yil' : '') + '</td>' +
          '<td>' + escapeHtml(item.rating || '') + '</td>';
      } else if (key === 'promotions') {
        cells =
          '<td>' + escapeHtml(item.title || '') + '</td>' +
          '<td>' + escapeHtml(item.validUntil || '') + '</td>';
      } else if (key === 'blogPosts') {
        cells =
          '<td>' + escapeHtml(item.title || '') + '</td>' +
          '<td>' + escapeHtml(item.link || '') + '</td>';
      }
      cells += '<td>' + (item.active === false ? "Yashirilgan" : 'Faol') + '</td>';
      cells += '<td><div class="admin-table__actions">' +
        '<button type="button" class="admin-icon-btn" data-crud-edit="' + key + '" data-id="' + item.id + '" aria-label="Tahrirlash" title="Tahrirlash">' +
          '<svg class="icon" aria-hidden="true" focusable="false"><use href="../img/icons/sprite.svg#icon-pen"></use></svg></button>' +
        '</div></td>';
      return '<tr>' + cells + '</tr>';
    }).join('');

    tbody.querySelectorAll('[data-crud-edit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openCrudForm(btn.getAttribute('data-crud-edit'), btn.getAttribute('data-id'));
      });
    });
  }

  var crudCurrentKey = null;
  var crudCurrentId = null;

  function openCrudForm(key, id) {
    var config = CRUD_CONFIGS[key];
    crudCurrentKey = key;
    crudCurrentId = id;

    var item = id ? crudCaches[key].filter(function (x) { return x.id === id; })[0] : null;

    document.getElementById('crud-panel-title').textContent = (id ? "Tahrirlash: " : "Qo'shish: ") + config.title;

    var formEl = document.getElementById('crud-form');
    formEl.innerHTML = config.fields.map(function (f) {
      var value = item ? item[f.key] : f.def;
      var fieldId = 'crud-field-' + f.key;
      if (f.type === 'textarea') {
        return '<div class="field"><label class="field__label" for="' + fieldId + '">' + escapeHtml(f.label) + '</label>' +
          '<textarea class="field__input" id="' + fieldId + '" rows="3">' + escapeHtml(value || '') + '</textarea></div>';
      }
      if (f.type === 'checkbox') {
        return '<div class="field"><div class="field__checkbox-row"><input type="checkbox" id="' + fieldId + '"' + (value ? ' checked' : '') + '>' +
          '<label for="' + fieldId + '" class="text-small">' + escapeHtml(f.label) + '</label></div></div>';
      }
      return '<div class="field"><label class="field__label" for="' + fieldId + '">' + escapeHtml(f.label) + '</label>' +
        '<input class="field__input" type="' + f.type + '" id="' + fieldId + '" value="' + escapeHtml(value == null ? '' : value) + '"' + (f.required ? ' required' : '') + '></div>';
    }).join('');

    var deleteBtn = document.getElementById('crud-delete');
    if (id) {
      deleteBtn.hidden = false;
      deleteBtn.onclick = function () { deleteCrudItem(key, id); };
    } else {
      deleteBtn.hidden = true;
      deleteBtn.onclick = null;
    }

    document.getElementById('crud-panel').classList.add('is-open');
    document.getElementById('crud-panel').setAttribute('aria-hidden', 'false');
    document.getElementById('crud-backdrop').classList.add('is-open');
  }

  function closeCrudPanel() {
    document.getElementById('crud-panel').classList.remove('is-open');
    document.getElementById('crud-panel').setAttribute('aria-hidden', 'true');
    document.getElementById('crud-backdrop').classList.remove('is-open');
  }

  function saveCrudForm() {
    var key = crudCurrentKey;
    var config = CRUD_CONFIGS[key];
    var data = {};

    for (var i = 0; i < config.fields.length; i++) {
      var f = config.fields[i];
      var el = document.getElementById('crud-field-' + f.key);
      if (f.type === 'checkbox') {
        data[f.key] = el.checked;
      } else if (f.type === 'number') {
        if (f.required && !el.value.trim()) { el.focus(); return; }
        data[f.key] = el.value === '' ? null : Number(el.value);
      } else {
        if (f.required && !el.value.trim()) { el.focus(); return; }
        data[f.key] = el.value.trim();
      }
    }

    var saveBtn = document.getElementById('crud-save');
    saveBtn.disabled = true;

    var promise = crudCurrentId
      ? window.ecoDb.collection(key).doc(crudCurrentId).update(data)
      : window.ecoDb.collection(key).add(data);

    promise.then(function () {
      showToast(config.title + (crudCurrentId ? ' yangilandi' : " qo'shildi"));
      closeCrudPanel();
      loadCrudCollection(key);
    }).catch(function (err) {
      console.error('Saqlashda xatolik:', err);
      showToast('Xatolik: saqlanmadi', 'error');
    }).finally(function () {
      saveBtn.disabled = false;
    });
  }

  function deleteCrudItem(key, id) {
    if (!window.confirm("Rostdan ham o'chirilsinmi? Bu amalni ortga qaytarib bo'lmaydi.")) return;
    window.ecoDb.collection(key).doc(id).delete().then(function () {
      showToast("O'chirildi");
      closeCrudPanel();
      loadCrudCollection(key);
    }).catch(function (err) {
      console.error("O'chirishda xatolik:", err);
      showToast("Xatolik: o'chirilmadi", 'error');
    });
  }

  /* ---------- Sayt sozlamalari (telefon, manzil, ish vaqti) ---------- */
  var SETTINGS_FIELDS = ['phone', 'address', 'hoursWork', 'hoursWeekend', 'email', 'telegram'];

  function loadSettings() {
    window.ecoDb.collection('settings').doc('contact').get().then(function (doc) {
      if (!doc.exists) return;
      var data = doc.data();
      var map = {
        phone: 'settings-phone',
        address: 'settings-address',
        hoursWork: 'settings-hours-work',
        hoursWeekend: 'settings-hours-weekend',
        email: 'settings-email',
        telegram: 'settings-telegram'
      };
      Object.keys(map).forEach(function (key) {
        var el = document.getElementById(map[key]);
        if (el && data[key]) el.value = data[key];
      });
    }).catch(function (err) {
      console.error('Sozlamalarni yuklashda xatolik:', err);
    });
  }

  var settingsForm = document.getElementById('settings-form');
  settingsForm && settingsForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = {
      phone: document.getElementById('settings-phone').value.trim(),
      address: document.getElementById('settings-address').value.trim(),
      hoursWork: document.getElementById('settings-hours-work').value.trim(),
      hoursWeekend: document.getElementById('settings-hours-weekend').value.trim(),
      email: document.getElementById('settings-email').value.trim(),
      telegram: document.getElementById('settings-telegram').value.trim()
    };
    var btn = settingsForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    window.ecoDb.collection('settings').doc('contact').set(data, { merge: true })
      .then(function () {
        showToast('Sozlamalar saqlandi');
      })
      .catch(function (err) {
        console.error('Sozlamalarni saqlashda xatolik:', err);
        showToast('Xatolik: saqlanmadi', 'error');
      })
      .finally(function () {
        btn.disabled = false;
      });
  });
})();
