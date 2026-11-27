const fs = require('fs');
const path = require('path');

console.log('=== TEST: NAVBAR BRAND TOP "PONDOK PESANTREN ISLAM" ===\n');

const previewHtml = require('../scripts/html-assembler').loadPreviewHtml();
const baseCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'base.css'), 'utf-8');

// 1. Verify navbar-brand-top is defined in HTML
if (!previewHtml.includes('class="navbar-brand-top"')) {
  console.error('FAIL: Missing class="navbar-brand-top" in preview.html');
  process.exit(1);
}
console.log('[PASS] preview.html contains class="navbar-brand-top"!');

// 2. Verify "Pondok Pesantren Islam" is located inside .navbar-brand-text and ABOVE "Darul Hikmah"
const brandTextStart = previewHtml.indexOf('<div class="navbar-brand-text">');
const brandTextEnd = previewHtml.indexOf('</div>', brandTextStart);
const brandTextContent = previewHtml.substring(brandTextStart, brandTextEnd);

const topIdx = brandTextContent.indexOf('Pondok Pesantren Islam');
const titleIdx = brandTextContent.indexOf('Darul Hikmah');
const subIdx = brandTextContent.indexOf('Sistem Absensi &amp; Kesiswaan');

if (topIdx === -1) {
  console.error('FAIL: "Pondok Pesantren Islam" not found in .navbar-brand-text');
  process.exit(1);
}
if (titleIdx === -1) {
  console.error('FAIL: "Darul Hikmah" not found in .navbar-brand-text');
  process.exit(1);
}
if (subIdx === -1) {
  console.error('FAIL: "Sistem Absensi & Kesiswaan" not found in .navbar-brand-text');
  process.exit(1);
}

if (topIdx >= titleIdx) {
  console.error('FAIL: "Pondok Pesantren Islam" must appear ABOVE "Darul Hikmah" in .navbar-brand-text');
  process.exit(1);
}
if (titleIdx >= subIdx) {
  console.error('FAIL: "Darul Hikmah" must appear ABOVE "Sistem Absensi & Kesiswaan" in .navbar-brand-text');
  process.exit(1);
}
console.log('[PASS] "Pondok Pesantren Islam" is placed directly above "Darul Hikmah" in .navbar-brand-text!');

// 3. Verify CSS rules
if (!baseCss.includes('.navbar-brand-top')) {
  console.error('FAIL: base.css does not define .navbar-brand-top');
  process.exit(1);
}
console.log('[PASS] base.css defines .navbar-brand-top styling!');

// 4. Verify green navbar background & role pill button
if (!baseCss.includes('linear-gradient(135deg, #074724 0%, #0E6838 100%)')) {
  console.error('FAIL: .app-navbar does not have green gradient background');
  process.exit(1);
}
if (!previewHtml.includes('class="role-dropdown-btn"') || !previewHtml.includes('id="roleDropdownBtn"')) {
  console.error('FAIL: Top navbar missing role-dropdown-btn or roleDropdownBtn');
  process.exit(1);
}
console.log('[PASS] .app-navbar has green background and icon-only role-dropdown-btn!');

// 5. Verify text colors (white & mint green for contrast on green navbar)
const topCssStart = baseCss.indexOf('.navbar-brand-top {');
const topCssEnd = baseCss.indexOf('}', topCssStart);
const topCss = baseCss.substring(topCssStart, topCssEnd);

const titleCssStart = baseCss.indexOf('.navbar-brand-title {');
const titleCssEnd = baseCss.indexOf('}', titleCssStart);
const titleCss = baseCss.substring(titleCssStart, titleCssEnd);

if (!topCss.includes('color: #FFFFFF;')) {
  console.error('FAIL: .navbar-brand-top does not use color: #FFFFFF');
  process.exit(1);
}
if (!titleCss.includes('color: #D1FAE5;')) {
  console.error('FAIL: .navbar-brand-title does not use color: #D1FAE5');
  process.exit(1);
}
console.log('[PASS] Both .navbar-brand-top (#FFFFFF) and .navbar-brand-title (#D1FAE5) have high-contrast white styling!');

console.log('\n==============================================');
console.log('ALL NAVBAR BRAND TOP TESTS PASSED (100%)!');
console.log('==============================================');
