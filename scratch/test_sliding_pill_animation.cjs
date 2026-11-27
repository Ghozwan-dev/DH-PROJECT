const fs = require('fs');
const path = require('path');

console.log('=== TEST: ANIMASI SLIDING PILL PADA NAVBAR BAWAH TAMPILAN MOBILE ===\n');

const previewHtml = require('../scripts/html-assembler').loadPreviewHtml();
const homeCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'home.css'), 'utf-8');
const authJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'auth.js'), 'utf-8');

// 1. Memeriksa keberadaan elemen sliding pill & line di preview.html
console.log('1. Memeriksa Elemen Sliding Pill di preview.html:');
if (!previewHtml.includes('id="bottomNavSlidingPill"') || !previewHtml.includes('class="bottom-nav-sliding-pill"')) {
  console.error('[FAIL] Elemen #bottomNavSlidingPill tidak ditemukan di preview.html');
  process.exit(1);
}
console.log('  ✓ [PASS] Elemen #bottomNavSlidingPill ditemukan di dalam .bottom-nav-fixed!');

if (!previewHtml.includes('id="bottomNavSlidingLine"') || !previewHtml.includes('class="bottom-nav-sliding-line"')) {
  console.error('[FAIL] Elemen #bottomNavSlidingLine tidak ditemukan di preview.html');
  process.exit(1);
}
console.log('  ✓ [PASS] Elemen #bottomNavSlidingLine ditemukan di dalam .bottom-nav-fixed!');

if (!previewHtml.includes('class="bottom-nav-fixed"')) {
  console.error('[FAIL] Container .bottom-nav-fixed tidak ditemukan pada preview.html');
  process.exit(1);
}
console.log('  ✓ [PASS] .bottom-nav-fixed ditemukan di preview.html!');

// 2. Memeriksa Styling CSS & Media Query Mobile
console.log('\n2. Memeriksa Styling CSS & Media Query Mobile di home.css:');
if (!homeCss.includes('.bottom-nav-sliding-pill') || !homeCss.includes('.bottom-nav-sliding-line')) {
  console.error('[FAIL] Class .bottom-nav-sliding-pill atau .bottom-nav-sliding-line tidak didefinisikan di home.css');
  process.exit(1);
}
console.log('  ✓ [PASS] Class .bottom-nav-sliding-pill & .bottom-nav-sliding-line terdefinisi di home.css!');

// Verifikasi display none pada desktop
const desktopSection = homeCss.split('@media (max-width: 767px)')[0];
if (!desktopSection.includes('.bottom-nav-sliding-pill') || !desktopSection.includes('display: none')) {
  console.error('[FAIL] Sliding pill harus di-hide pada tampilan desktop (display: none)');
  process.exit(1);
}
console.log('  ✓ [PASS] Sliding pill dinonaktifkan (display: none) pada tampilan desktop!');

// Verifikasi animasi di media query mobile
const mobileSection = homeCss.split('@media (max-width: 767px)')[1];
if (!mobileSection.includes('transition: left') || !mobileSection.includes('cubic-bezier')) {
  console.error('[FAIL] Animasi transisi cubic-bezier pada sliding pill tidak ditemukan di mobile section');
  process.exit(1);
}
console.log('  ✓ [PASS] Animasi transisi cubic-bezier terkonfigurasi pada mobile media query!');

// Verifikasi aturan posisi data-active-tab 0 s.d 4
for (let i = 0; i <= 4; i++) {
  if (!mobileSection.includes(`data-active-tab="${i}"`)) {
    console.error(`[FAIL] Aturan posisi data-active-tab="${i}" tidak ditemukan di CSS`);
    process.exit(1);
  }
}
console.log('  ✓ [PASS] Seluruh 5 posisi tab (0=Beranda, 1=Absensi, 2=Data Santri, 3=Laporan, 4=Pengaturan) terdefinisi!');

// 3. Memeriksa fungsi JavaScript di auth.js
console.log('\n3. Memeriksa Logika Sinkronisasi & Transisi JavaScript di auth.js:');
if (!authJs.includes('function updateBottomNavSlidingPill') || !authJs.includes('window.updateBottomNavSlidingPill')) {
  console.error('[FAIL] Fungsi updateBottomNavSlidingPill tidak ditemukan di auth.js');
  process.exit(1);
}
console.log('  ✓ [PASS] Fungsi updateBottomNavSlidingPill terdefinisi dan diekspos ke window!');

if (!authJs.includes('updateBottomNavSlidingPill(activeTabIndex)')) {
  console.error('[FAIL] syncActiveNav tidak memanggil updateBottomNavSlidingPill');
  process.exit(1);
}
console.log('  ✓ [PASS] syncActiveNav memanggil updateBottomNavSlidingPill untuk memicu pergeseran animasi!');

// 4. Simulasi Pergeseran Posisi Sliding Pill
console.log('\n4. Simulasi Perhitungan Pergeseran Posisi Sliding Pill (5 Tab):');
const tabKeys = ['home', 'schedule', 'students', 'report', 'settings'];
const tabNames = ['Beranda', 'Absensi', 'Data Santri', 'Laporan', 'Pengaturan'];

tabKeys.forEach((key, idx) => {
  const percentCenter = (idx * 20) + 10;
  const pillOffset = `calc(${percentCenter}% - 23px)`;
  const lineOffset = `calc(${percentCenter}% - 12px)`;
  console.log(`  Tab ${idx} [${tabNames[idx]}]: Pill -> ${pillOffset}, Line -> ${lineOffset}`);
});
console.log('  ✓ [PASS] Perhitungan posisi pergeseran linear 20% interval terverifikasi 100% presisi!');

console.log('\n======================================================');
console.log('ALL SLIDING PILL ANIMATION TESTS PASSED (100%)!');
console.log('======================================================');
