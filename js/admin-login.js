/* ==========================================================================
   Eco Service — Admin login logikasi
   Faqat pages/admin-login.html sahifasida ishlatiladi.
   ========================================================================== */

(function () {
  'use strict';

  var form = document.getElementById('admin-login-form');
  var errorBox = document.getElementById('login-error');
  var submitBtn = document.getElementById('login-submit');

  if (!isFirebaseConfigured) {
    errorBox.textContent = "Firebase hali sozlanmagan. README-FIREBASE.md faylidagi qadamlarni bajaring.";
    errorBox.classList.add('is-visible');
    submitBtn.disabled = true;
    return;
  }

  // Allaqachon tizimga kirgan bo'lsa, to'g'ridan-to'g'ri dashboardga o'tkazamiz
  window.ecoAuth.onAuthStateChanged(function (user) {
    if (user) window.location.href = 'admin-dashboard.html';
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorBox.classList.remove('is-visible');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Kirilmoqda...';

    var email = document.getElementById('login-email').value.trim();
    var password = document.getElementById('login-password').value;

    window.ecoAuth.signInWithEmailAndPassword(email, password)
      .then(function () {
        window.location.href = 'admin-dashboard.html';
      })
      .catch(function () {
        errorBox.textContent = "Email yoki parol noto'g'ri";
        errorBox.classList.add('is-visible');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Kirish';
      });
  });
})();
