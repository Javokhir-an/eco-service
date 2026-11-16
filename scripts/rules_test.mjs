// firestore.rules sinovi — Firestore emulyatorida, haqiqiy ma'lumotga tegmasdan.
// GitHub Actions'da: npx firebase emulators:exec --only firestore --project demo-itexnika "node scripts/rules_test.mjs"
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import {
  doc, getDoc, setDoc, updateDoc, addDoc, collection, getDocs, query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';

const ADMIN_UID = 'V3PXTj7if2fq3qlvWwPFF0MCJny2';
const env = await initializeTestEnvironment({
  projectId: 'demo-itexnika',
  firestore: { rules: readFileSync('firestore.rules', 'utf8') },
});

await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await setDoc(doc(db, 'settings/contact'), { phone: '+998 20 004-88-86' });
  await setDoc(doc(db, 'prices/services'), { a: { price: '1' } });
  await setDoc(doc(db, 'submissions/s1'), { name: 'Ali', phone: '+998901112233', status: 'yangi' });
  await setDoc(doc(db, 'reviews/ok'), { name: 'A', text: 'Zo\'r', status: 'tasdiqlangan', createdAt: new Date() });
  await setDoc(doc(db, 'reviews/wait'), { name: 'B', text: 'Kutilmoqda', status: 'kutilmoqda', createdAt: new Date() });
});

const guest = env.unauthenticatedContext().firestore();
const stranger = env.authenticatedContext('begona-hisob').firestore();
const admin = env.authenticatedContext(ADMIN_UID).firestore();

// js/main.js submitFormToFirestore() yuboradigan shakl
const lead = (extra = {}) => ({
  page: '/', createdAt: serverTimestamp(), status: 'yangi', notified: false,
  name: 'Ali', phone: '+998 (90) 111-22-33', consent: 'on', source: 'hero-form', ...extra,
});
const review = (extra = {}) => ({
  page: '/pages/sharhlar.html', createdAt: serverTimestamp(), status: 'kutilmoqda', notified: false,
  name: 'Ali', service: 'kompyuter', rating: '5', text: 'Hammasi zo\'r', source: 'review-form', ...extra,
});

let failed = 0;
async function t(name, expectAllow, fn) {
  try {
    await (expectAllow ? assertSucceeds(fn()) : assertFails(fn()));
    console.log('OK   ' + name);
  } catch (e) {
    failed++;
    console.log('XATO ' + name + ' — ' + (e && e.message));
  }
}

await t('ariza yuborish (mehmon)', true, () => addDoc(collection(guest, 'submissions'), lead()));
await t('ariza: B2B formasi (email, organization, message)', true,
  () => addDoc(collection(guest, 'submissions'), lead({ email: 'a@b.uz', organization: 'MCHJ', message: 'Salom' })));
await t('ariza: soxta holat bilan', false, () => addDoc(collection(guest, 'submissions'), lead({ status: 'bajarildi' })));
await t('ariza: juda uzun xabar', false, () => addDoc(collection(guest, 'submissions'), lead({ message: 'x'.repeat(5000) })));
await t('arizalarni o\'qish (mehmon)', false, () => getDoc(doc(guest, 'submissions/s1')));
await t('arizalar ro\'yxati (begona hisob)', false, () => getDocs(collection(stranger, 'submissions')));
await t('arizalar ro\'yxati (admin)', true, () => getDocs(collection(admin, 'submissions')));
await t('arizani yangilash (admin)', true, () => updateDoc(doc(admin, 'submissions/s1'), { status: 'bajarildi' }));
await t('arizani yangilash (begona)', false, () => updateDoc(doc(stranger, 'submissions/s1'), { status: 'bajarildi' }));

await t('sharh yuborish (mehmon)', true, () => addDoc(collection(guest, 'reviews'), review()));
await t('sharh: o\'zi tasdiqlab yuborish', false, () => addDoc(collection(guest, 'reviews'), review({ status: 'tasdiqlangan' })));
await t('saytdagi sharhlar so\'rovi (tasdiqlanganlar)', true, () => getDocs(query(collection(guest, 'reviews'),
  where('status', '==', 'tasdiqlangan'), orderBy('createdAt', 'desc'))));
await t('kutilayotgan sharhni o\'qish (mehmon)', false, () => getDoc(doc(guest, 'reviews/wait')));
await t('barcha sharhlar (admin)', true, () => getDocs(query(collection(admin, 'reviews'), orderBy('createdAt', 'desc'))));
await t('sharhni tasdiqlash (admin)', true, () => updateDoc(doc(admin, 'reviews/wait'), { status: 'tasdiqlangan' }));
await t('sharhni tasdiqlash (begona)', false, () => updateDoc(doc(stranger, 'reviews/ok'), { status: 'rad_etilgan' }));

await t('sozlamalarni o\'qish (mehmon)', true, () => getDoc(doc(guest, 'settings/contact')));
await t('telefonni o\'zgartirish (mehmon)', false, () => updateDoc(doc(guest, 'settings/contact'), { phone: '1' }));
await t('telefonni o\'zgartirish (begona)', false, () => updateDoc(doc(stranger, 'settings/contact'), { phone: '1' }));
await t('telefonni o\'zgartirish (admin)', true, () => setDoc(doc(admin, 'settings/contact'), { phone: '2' }, { merge: true }));
await t('narxlarni o\'qish (mehmon)', true, () => getDoc(doc(guest, 'prices/services')));
await t('narxni o\'zgartirish (begona)', false, () => setDoc(doc(stranger, 'prices/services'), { a: 1 }, { merge: true }));
await t('narxni o\'zgartirish (admin)', true, () => setDoc(doc(admin, 'prices/services'), { a: 1 }, { merge: true }));
await t('mutaxassis qo\'shish (begona)', false, () => addDoc(collection(stranger, 'specialists'), { name: 'X' }));
await t('mutaxassis qo\'shish (admin)', true, () => addDoc(collection(admin, 'specialists'), { name: 'X' }));
await t('noma\'lum kolleksiya (begona)', false, () => addDoc(collection(stranger, 'boshqa'), { a: 1 }));

await env.cleanup();
console.log(failed ? `\n${failed} ta sinov XATO` : '\nHamma sinovlar o\'tdi');
process.exit(failed ? 1 : 0);
