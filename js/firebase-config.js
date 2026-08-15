/* ==========================================================================
   Firebase konfiguratsiyasi
   Quyidagi qiymatlarni Firebase Console > Project settings > Your apps
   bo'limidan olib, shu yerga joylashtiring. Loyiha yaratish qadamlari
   README-FIREBASE.md faylida yozilgan.
   ========================================================================== */

var firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Konfiguratsiya to'ldirilganmi yo'qmi — to'ldirilmagan bo'lsa,
// forma/narx integratsiyasi jim tarzda o'chirilgan holatda qoladi
// (sayt asosiy funksiyalari baribir statik holatda ishlashda davom etadi).
var isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

window.ecoDb = null;
window.ecoAuth = null;

if (isFirebaseConfigured && window.firebase) {
  firebase.initializeApp(firebaseConfig);
  window.ecoDb = firebase.firestore();
  window.ecoAuth = firebase.auth();
}
