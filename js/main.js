/* ==========================================================================
   Eco Service — asosiy JS
   Skeleton bosqichi: sticky header, mega-menu, mobil menyu, modal,
   telefon maskasi, forma validatsiyasi, "yuqoriga qaytish"
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Sticky header ---------- */
  var header = document.getElementById('site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
      backToTop && backToTop.classList.toggle('is-visible', window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mega-menu ---------- */
  var megamenu = document.getElementById('megamenu');
  var megamenuToggle = document.getElementById('megamenu-toggle');

  var megamenuServices = {
    kompyuter: [
      { label: "Noutbuk ta'mirlash", href: "xizmat-noutbuk-tamirlash.html" },
      { label: "Kompyuter yig'ish", href: "xizmat-kompyuter-yigish.html" },
      { label: "Monobloq ta'mirlash", href: "xizmat-monobloq-tamirlash.html" },
      { label: "Bepul diagnostika", href: "kategoriya-kompyuter.html" }
    ],
    tarmoq: [
      { label: "Wi-Fi tarmoq sozlash", href: "xizmat-wifi-sozlash.html" },
      { label: "Server o'rnatish", href: "xizmat-server-ornatish.html" },
      { label: "Video kuzatuv tizimi", href: "xizmat-video-kuzatuv.html" },
      { label: "Korporativ tarmoq", href: "kategoriya-tarmoq.html" }
    ],
    dasturiy: [
      { label: "Windows o'rnatish", href: "xizmat-windows-ornatish.html" },
      { label: "Viruslardan tozalash", href: "xizmat-virus-tozalash.html" },
      { label: "Dastur o'rnatish", href: "xizmat-dastur-ornatish.html" },
      { label: "Litsenziyalash", href: "kategoriya-dasturiy.html" }
    ],
    malumot: [
      { label: "HDD/SSD dan ma'lumot tiklash", href: "xizmat-hdd-tiklash.html" },
      { label: "Flash-kartadan tiklash", href: "xizmat-flash-tiklash.html" },
      { label: "Zaxira nusxalash xizmati", href: "xizmat-zaxira-nusxalash.html" }
    ],
    printer: [
      { label: "Printer ta'mirlash", href: "xizmat-printer-tamirlash.html" },
      { label: "Kartrij to'ldirish", href: "xizmat-kartrij-toldirish.html" },
      { label: "MFU xizmat ko'rsatish", href: "xizmat-mfu-xizmat.html" }
    ],
    b2b: [
      { label: "IT autsorsing", href: "b2b.html" },
      { label: "Korporativ xizmat shartnomasi", href: "b2b.html" },
      { label: "Ofis texnikasini ta'minlash", href: "b2b.html" }
    ]
  };

  // Sahifa "pages/" papkasida ochilganmi yoki bosh sahifadanmi — nisbiy yo'lni shunga qarab tuzatamiz
  var pagesPrefix = /\/pages\//.test(window.location.pathname) ? '' : 'pages/';

  function openMegamenu() {
    if (!megamenu) return;
    megamenu.classList.add('is-open');
    megamenu.setAttribute('aria-hidden', 'false');
    megamenuToggle && megamenuToggle.setAttribute('aria-expanded', 'true');
  }

  function closeMegamenu() {
    if (!megamenu) return;
    megamenu.classList.remove('is-open');
    megamenu.setAttribute('aria-hidden', 'true');
    megamenuToggle && megamenuToggle.setAttribute('aria-expanded', 'false');
  }

  megamenuToggle && megamenuToggle.addEventListener('click', function () {
    var isOpen = megamenu.classList.contains('is-open');
    isOpen ? closeMegamenu() : openMegamenu();
  });

  document.querySelectorAll('[data-megamenu-close]').forEach(function (el) {
    el.addEventListener('click', closeMegamenu);
  });

  var categoryButtons = document.querySelectorAll('.megamenu__category');
  var servicesPanel = document.getElementById('megamenu-services');

  categoryButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      categoryButtons.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');

      var key = btn.getAttribute('data-category');
      var items = megamenuServices[key] || [];
      if (servicesPanel) {
        servicesPanel.innerHTML = items.map(function (item) {
          var href = item.href === '#' ? '#' : pagesPrefix + item.href;
          return '<a href="' + href + '">' + item.label + '</a>';
        }).join('');
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMegamenu();
      closeAllModals();
    }
  });

  /* ---------- Mobil burger menyu ---------- */
  var mobileToggle = document.getElementById('mobile-menu-toggle');
  mobileToggle && mobileToggle.addEventListener('click', function () {
    var expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    mobileToggle.setAttribute('aria-expanded', String(!expanded));
    expanded ? closeMegamenu() : openMegamenu();
  });

  /* ---------- Modallar (fokus-tuzoq bilan, TZ 6.4) ---------- */
  var lastFocusedBeforeModal = null;

  function getFocusable(container) {
    var selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.prototype.slice.call(container.querySelectorAll(selector)).filter(function (el) {
      return el.offsetParent !== null;
    });
  }

  function closeAllModals() {
    document.querySelectorAll('.modal.is-open').forEach(function (m) {
      m.classList.remove('is-open');
      m.setAttribute('aria-hidden', 'true');
    });
    if (lastFocusedBeforeModal) {
      lastFocusedBeforeModal.focus();
      lastFocusedBeforeModal = null;
    }
  }

  document.querySelectorAll('[data-modal-open]').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      var id = trigger.getAttribute('data-modal-open');
      var modal = document.getElementById(id);
      if (modal) {
        lastFocusedBeforeModal = trigger;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        var firstField = modal.querySelector('input, select, textarea');
        firstField && firstField.focus();

        var sourceField = modal.querySelector('#order-source');
        if (sourceField) {
          sourceField.value = trigger.getAttribute('data-source') || 'modal-order';
        }
      }
    });
  });

  document.querySelectorAll('[data-modal-close]').forEach(function (el) {
    el.addEventListener('click', closeAllModals);
  });

  // Ochiq modal ichida Tab bilan fokusni ushlab turish — orqa fon elementlariga chiqmaydi
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var openModal = document.querySelector('.modal.is-open');
    if (!openModal) return;
    var panel = openModal.querySelector('.modal__panel');
    if (!panel) return;
    var focusable = getFocusable(panel);
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* ---------- Telefon maskasi (+998 (__) ___-__-__) ---------- */
  document.querySelectorAll('input[type="tel"]').forEach(function (input) {
    input.addEventListener('input', function () {
      var digits = input.value.replace(/\D/g, '').replace(/^998/, '');
      digits = digits.substring(0, 9);
      var formatted = '+998';
      if (digits.length > 0) formatted += ' (' + digits.substring(0, 2);
      if (digits.length >= 2) formatted += ') ' + digits.substring(2, 5);
      if (digits.length >= 5) formatted += '-' + digits.substring(5, 7);
      if (digits.length >= 7) formatted += '-' + digits.substring(7, 9);
      input.value = formatted;
    });
  });

  /* ---------- Forma validatsiyasi (frontend, skeleton bosqichi) ---------- */
  document.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot — spam himoyasi (TZ 6.1)
      var honeypot = form.querySelector('input[name="website"]');
      if (honeypot && honeypot.value) return;

      var valid = true;
      form.querySelectorAll('[required]').forEach(function (field) {
        var wrapper = field.closest('.field');
        var isEmpty = field.type === 'checkbox' ? !field.checked : !field.value.trim();
        if (isEmpty) {
          valid = false;
          wrapper && wrapper.classList.add('field--invalid');
        } else {
          wrapper && wrapper.classList.remove('field--invalid');
        }
      });

      if (!valid) return;

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Yuborilmoqda...';
      }

      submitFormToFirestore(form);

      setTimeout(function () {
        alert("Rahmat! Menejer 3 daqiqa ichida bog'lanadi.");
        form.reset();
        closeAllModals();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Yuborish';
        }
      }, 600);
    });
  });

  /* ---------- Firestore'ga forma ma'lumotlarini yozish (admin panel uchun, TZ 6.1) ---------- */
  function submitFormToFirestore(form) {
    if (!window.ecoDb || typeof firebase === 'undefined') return;

    var collectionName = form.id === 'review-form' ? 'reviews' : 'submissions';
    var data = {
      page: window.location.pathname,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'yangi',
      notified: false
    };

    new FormData(form).forEach(function (value, key) {
      if (key === 'website') return; // honeypot maydonini yozmaymiz
      data[key] = value;
    });

    if (!data.source) {
      data.source = form.getAttribute('data-source') || form.id || 'boshqa';
    }

    window.ecoDb.collection(collectionName).add(data).catch(function (err) {
      console.error('Firestore write error:', err);
    });
  }

  /* ---------- Narxlarni Firestore'dan dinamik yuklash (admin panelda tahrirlangan bo'lsa) ---------- */
  if (window.ecoDb && document.querySelector('[data-price-id]')) {
    window.ecoDb.collection('prices').doc('services').get().then(function (doc) {
      if (!doc.exists) return;
      var data = doc.data();
      Object.keys(data).forEach(function (id) {
        var rows = document.querySelectorAll('[data-price-id="' + id + '"]');
        rows.forEach(function (row) {
          var cells = row.querySelectorAll('td');
          if (cells[1] && data[id].price) cells[1].textContent = data[id].price;
          if (cells[2] && data[id].duration) cells[2].textContent = data[id].duration;
        });
      });
    }).catch(function (err) {
      console.error('Narxlarni yuklashda xatolik:', err);
    });
  }

  /* ---------- Yuqoriga qaytish ---------- */
  var backToTop = document.getElementById('back-to-top');
  backToTop && backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Narxlar tab'lari (TZ 4.8) ---------- */
  var pricingTabs = document.querySelectorAll('[data-pricing-tab]');
  pricingTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var key = tab.getAttribute('data-pricing-tab');

      pricingTabs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      document.querySelectorAll('[data-pricing-panel]').forEach(function (panel) {
        var isMatch = panel.getAttribute('data-pricing-panel') === key;
        panel.hidden = !isMatch;
        panel.classList.toggle('is-active', isMatch);
      });
    });
  });

  /* ---------- Xarita facade (lazy load, TZ 4.13) ---------- */
  var mapLoadBtn = document.getElementById('map-load-btn');
  mapLoadBtn && mapLoadBtn.addEventListener('click', function () {
    var mapContainer = document.getElementById('contacts-map');
    if (!mapContainer) return;
    var iframe = document.createElement('iframe');
    iframe.src = 'https://yandex.uz/map-widget/v1/?ll=69.240562%2C41.311081&z=12';
    iframe.loading = 'lazy';
    iframe.title = "Eco Service manzili xaritada";
    mapContainer.innerHTML = '';
    mapContainer.appendChild(iframe);
  });

  /* ---------- Narx kalkulyatori (TZ 4.11) ---------- */
  var calculatorData = {
    kompyuter: [
      { label: "Noutbukni tozalash va termopasta", price: 120000 },
      { label: 'Termopasta almashtirish', price: 80000 },
      { label: "Kompyuter yig'ish (konfiguratsiya)", price: 200000 },
      { label: 'Noutbuk ekranini almashtirish', price: 350000 }
    ],
    tarmoq: [
      { label: 'Wi-Fi tarmoq sozlash', price: 150000 },
      { label: 'Video kuzatuv o\'rnatish (1 kamera)', price: 300000 },
      { label: 'Server o\'rnatish va sozlash', price: 800000 }
    ],
    dasturiy: [
      { label: 'Ofis dasturlarini o\'rnatish', price: 70000 },
      { label: 'Viruslardan tozalash', price: 90000 },
      { label: 'Windows o\'rnatish', price: 100000 }
    ],
    malumot: [
      { label: 'Flash-kartadan tiklash', price: 120000 },
      { label: 'Zaxira nusxalash tizimini sozlash', price: 200000 },
      { label: 'HDD/SSD dan ma\'lumot tiklash', price: 250000 }
    ],
    printer: [
      { label: 'Kartrij to\'ldirish', price: 40000 },
      { label: 'MFU ta\'mirlash', price: 150000 }
    ]
  };

  var calcCategory = document.getElementById('calc-category');
  var calcService = document.getElementById('calc-service');
  var calcComplexity = document.getElementById('calc-complexity');
  var calcSubmit = document.getElementById('calc-submit');
  var calcResult = document.getElementById('calc-result');
  var calcPrice = document.getElementById('calc-price');
  var calcOrderBtn = document.getElementById('calc-order-btn');
  var orderServiceSelect = document.getElementById('order-service');

  function formatSum(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
  }

  calcCategory && calcCategory.addEventListener('change', function () {
    var items = calculatorData[calcCategory.value] || [];
    calcResult.hidden = true;
    calcSubmit.disabled = true;

    if (!items.length) {
      calcService.innerHTML = '<option value="">Avval kategoriyani tanlang</option>';
      calcService.disabled = true;
      return;
    }

    calcService.innerHTML = '<option value="">Tanlang</option>' + items.map(function (item, i) {
      return '<option value="' + i + '">' + item.label + '</option>';
    }).join('');
    calcService.disabled = false;
  });

  calcService && calcService.addEventListener('change', function () {
    calcSubmit.disabled = calcService.value === '';
    calcResult.hidden = true;
  });

  calcSubmit && calcSubmit.addEventListener('click', function () {
    var items = calculatorData[calcCategory.value] || [];
    var item = items[calcService.value];
    if (!item) return;

    var multiplier = parseFloat(calcComplexity.value) || 1;
    var minPrice = Math.round((item.price * multiplier) / 1000) * 1000;
    var maxPrice = Math.round((minPrice * 1.15) / 1000) * 1000;

    calcPrice.textContent = formatSum(minPrice) + ' – ' + formatSum(maxPrice);
    calcResult.hidden = false;
  });

  calcOrderBtn && calcOrderBtn.addEventListener('click', function () {
    if (orderServiceSelect && calcCategory.value) {
      orderServiceSelect.value = calcCategory.value;
    }
  });

  /* ---------- Sharhlar filtri (TZ 6.2 uslubida, sharhlar.html) ---------- */
  var filterService = document.getElementById('filter-service');
  var filterRating = document.getElementById('filter-rating');
  var reviewsList = document.getElementById('reviews-list');

  function applyReviewsFilter() {
    if (!reviewsList) return;
    var serviceVal = filterService ? filterService.value : 'all';
    var ratingVal = filterRating ? parseInt(filterRating.value, 10) : 0;
    var visibleCount = 0;

    reviewsList.querySelectorAll('.review-card').forEach(function (card) {
      var matchesService = serviceVal === 'all' || card.getAttribute('data-service') === serviceVal;
      var matchesRating = ratingVal === 0 || parseInt(card.getAttribute('data-rating'), 10) >= ratingVal;
      var visible = matchesService && matchesRating;
      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount++;
    });

    var emptyMsg = document.getElementById('reviews-empty');
    if (emptyMsg) emptyMsg.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  filterService && filterService.addEventListener('change', applyReviewsFilter);
  filterRating && filterRating.addEventListener('change', applyReviewsFilter);

  /* ---------- Shahar tanlash (localStorage, TZ 6.3) ---------- */
  function applyCity(city) {
    document.querySelectorAll('#topbar-city-name').forEach(function (el) { el.textContent = city; });
    var heroCity = document.getElementById('hero-city');
    if (heroCity) heroCity.textContent = city + 'dagi';
    document.querySelectorAll('.city-list__item').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-city') === city);
    });
  }

  var cityBtn = document.getElementById('topbar-city-name');
  if (cityBtn) {
    var savedCity = localStorage.getItem('eco-service-city');
    if (savedCity) applyCity(savedCity);
  }

  document.querySelectorAll('.city-list__item').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var city = btn.getAttribute('data-city');
      localStorage.setItem('eco-service-city', city);
      applyCity(city);
      closeAllModals();
    });
  });

  /* ---------- Qidiruv — jonli natija, xatoga chidamli (TZ 4.2, 6.2) ---------- */
  var searchIndex = [
    { label: "Noutbuk ta'mirlash", href: 'xizmat-noutbuk-tamirlash.html' },
    { label: "Kompyuter yig'ish", href: 'xizmat-kompyuter-yigish.html' },
    { label: "Monobloq ta'mirlash", href: 'xizmat-monobloq-tamirlash.html' },
    { label: "Kompyuter va noutbuk ta'mirlash", href: 'kategoriya-kompyuter.html' },
    { label: "Wi-Fi tarmoq sozlash", href: 'xizmat-wifi-sozlash.html' },
    { label: "Server o'rnatish", href: 'xizmat-server-ornatish.html' },
    { label: "Video kuzatuv tizimi", href: 'xizmat-video-kuzatuv.html' },
    { label: "Tarmoq va server xizmatlari", href: 'kategoriya-tarmoq.html' },
    { label: "Windows o'rnatish", href: 'xizmat-windows-ornatish.html' },
    { label: "Viruslardan tozalash", href: 'xizmat-virus-tozalash.html' },
    { label: "Dastur o'rnatish", href: 'xizmat-dastur-ornatish.html' },
    { label: "Dasturiy ta'minot", href: 'kategoriya-dasturiy.html' },
    { label: "HDD/SSD dan ma'lumot tiklash", href: 'xizmat-hdd-tiklash.html' },
    { label: "Flash-kartadan tiklash", href: 'xizmat-flash-tiklash.html' },
    { label: "Zaxira nusxalash xizmati", href: 'xizmat-zaxira-nusxalash.html' },
    { label: "Ma'lumotlarni tiklash", href: 'kategoriya-malumot.html' },
    { label: "Printer ta'mirlash", href: 'xizmat-printer-tamirlash.html' },
    { label: "Kartrij to'ldirish", href: 'xizmat-kartrij-toldirish.html' },
    { label: "MFU xizmat ko'rsatish", href: 'xizmat-mfu-xizmat.html' },
    { label: "Printer va ofis texnikasi", href: 'kategoriya-printer.html' },
    { label: "Biznes uchun IT (B2B)", href: 'b2b.html' },
    { label: 'Narxlar', href: 'narxlar.html' },
    { label: 'Mutaxassislar', href: 'mutaxassislar.html' },
    { label: 'Sharhlar', href: 'sharhlar.html' },
    { label: 'Aksiyalar', href: 'aksiyalar.html' },
    { label: 'Aloqa', href: 'aloqa.html' },
    { label: 'Biz haqimizda', href: 'biz-haqimizda.html' },
    { label: 'Blog', href: 'blog.html' }
  ];

  function normalizeQuery(s) {
    return s.toLowerCase().replace(/[''`ʻʼ]/g, "'").replace(/\s+/g, ' ').trim();
  }

  function levenshtein(a, b) {
    var m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    var dp = [], i, j;
    for (i = 0; i <= m; i++) { dp.push([i]); }
    for (j = 0; j <= n; j++) { dp[0][j] = j; }
    for (i = 1; i <= m; i++) {
      for (j = 1; j <= n; j++) {
        dp[i][j] = a.charAt(i - 1) === b.charAt(j - 1)
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
    return dp[m][n];
  }

  function searchServices(query) {
    var q = normalizeQuery(query);
    if (q.length < 2) return [];
    var results = [];
    searchIndex.forEach(function (item) {
      var label = normalizeQuery(item.label);
      var pos = label.indexOf(q);
      if (pos !== -1) {
        results.push({ item: item, score: pos });
        return;
      }
      var words = label.split(' ');
      var minDist = Infinity;
      words.forEach(function (w) {
        var d = levenshtein(q, w.length > q.length + 2 ? w.substring(0, q.length + 2) : w);
        if (d < minDist) minDist = d;
      });
      if (q.length >= 3 && minDist <= 2) {
        results.push({ item: item, score: 100 + minDist });
      }
    });
    results.sort(function (a, b) { return a.score - b.score; });
    var seen = {};
    var out = [];
    results.forEach(function (r) {
      if (out.length >= 8 || seen[r.item.href]) return;
      seen[r.item.href] = true;
      out.push(r.item);
    });
    return out;
  }

  function setupSearch(input) {
    if (!input || input._ecoSearchInit) return;
    input._ecoSearchInit = true;

    var wrapper = input.closest('.site-header__search') || input.parentElement;
    var results = document.createElement('div');
    results.className = 'search-results';
    results.setAttribute('role', 'listbox');
    results.id = 'search-results-' + Math.random().toString(36).slice(2, 8);
    wrapper.appendChild(results);
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', results.id);
    input.setAttribute('aria-autocomplete', 'list');

    var activeIndex = -1;

    function render(items) {
      activeIndex = -1;
      if (!items.length) {
        results.innerHTML = '<div class="search-results__empty">Topilmadi — <a href="tel:+998901234567">bizga qo\'ng\'iroq qiling</a></div>';
      } else {
        results.innerHTML = items.map(function (item) {
          var href = item.href === '#' ? '#' : pagesPrefix + item.href;
          return '<a href="' + href + '" role="option">' + item.label + '</a>';
        }).join('');
      }
      results.classList.add('is-open');
      input.setAttribute('aria-expanded', 'true');
    }

    function close() {
      results.classList.remove('is-open');
      input.setAttribute('aria-expanded', 'false');
      activeIndex = -1;
    }

    input.addEventListener('input', function () {
      var q = input.value;
      if (normalizeQuery(q).length < 2) { close(); return; }
      render(searchServices(q));
    });

    input.addEventListener('keydown', function (e) {
      var links = results.querySelectorAll('a');
      if (!links.length || !results.classList.contains('is-open')) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex += e.key === 'ArrowDown' ? 1 : -1;
        if (activeIndex < 0) activeIndex = links.length - 1;
        if (activeIndex >= links.length) activeIndex = 0;
        links.forEach(function (a, i) { a.classList.toggle('is-active', i === activeIndex); });
        links[activeIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        if (activeIndex > -1) {
          e.preventDefault();
          window.location.href = links[activeIndex].getAttribute('href');
        }
      } else if (e.key === 'Escape') {
        close();
      }
    });

    input.addEventListener('blur', function () {
      setTimeout(close, 150);
    });

    input.addEventListener('focus', function () {
      if (normalizeQuery(input.value).length >= 2) render(searchServices(input.value));
    });
  }

  document.querySelectorAll('.site-header__search input[type="search"]').forEach(setupSearch);

  /* ---------- Mobilda qidiruv ikonkasini bosish (TZ 4.2) ---------- */
  var mobileSearchBtn = document.querySelector('.site-header__icon-btn--search');
  mobileSearchBtn && mobileSearchBtn.addEventListener('click', function () {
    if (!header) return;
    var isOpen = header.classList.toggle('is-search-open');
    if (isOpen) {
      var input = header.querySelector('.site-header__search input[type="search"]');
      input && input.focus();
    }
  });
})();
