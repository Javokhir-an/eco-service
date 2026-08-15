/* ==========================================================================
   Firebase konfiguratsiyasi
   Quyidagi qiymatlarni Firebase Console > Project settings > Your apps
   bo'limidan olib, shu yerga joylashtiring. Loyiha yaratish qadamlari
   README-FIREBASE.md faylida yozilgan.
   ========================================================================== */

var firebaseConfig = {
  apiKey: "AIzaSyCJWM6-L0l6eAubFPhN2UR35z2xpjm55QM",
  authDomain: "service-eco-599ca.firebaseapp.com",
  projectId: "service-eco-599ca",
  storageBucket: "service-eco-599ca.firebasestorage.app",
  messagingSenderId: "195308248557",
  appId: "1:195308248557:web:5f4d720d763585b59bdbe4",
  measurementId: "G-X5C6X93E0V"
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
