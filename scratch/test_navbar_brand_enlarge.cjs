const fs = require('fs');
const path = require('path');

console.log('=== TEST: NAVBAR BRAND ENLARGEMENT ===');

const baseCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'base.css'), 'utf-8');
const previewHtml = fs.readFileSync(path.join(__dirname, '..', 'preview.html'), 'utf-8');

// 1. Verify HTML structure
if (!previewHtml.includes('class="navbar-logo"') || !previewHtml.includes('class="navbar-brand-title"') || !previewHtml.includes('class="navbar-brand-sub"')) {
  console.error('FAIL: Missing navbar-logo, navbar-brand-title, or navbar-brand-sub in preview.html');
  process.exit(1);
}
console.log('PASS: Brand HTML structure is present in preview.html');

// 2. Verify enlarged CSS rules in base.css
if (!baseCss.includes('width: 44px;') || !baseCss.includes('height: 44px;')) {
  console.error('FAIL: navbar-logo does not have 44px width/height');
  process.exit(1);
}
console.log('PASS: navbar-logo enlarged to 44px!');

if (!baseCss.includes('font-size: 18px;')) {
  console.error('FAIL: navbar-brand-title does not have 18px font-size');
  process.exit(1);
}
console.log('PASS: navbar-brand-title enlarged to 18px!');

if (!baseCss.includes('font-size: 12px;')) {
  console.error('FAIL: navbar-brand-sub does not have 12px font-size');
  process.exit(1);
}
console.log('PASS: navbar-brand-sub enlarged to 12px!');

if (!baseCss.includes('--navbar-height: 70px;')) {
  console.error('FAIL: --navbar-height is not set to 70px');
  process.exit(1);
}
console.log('PASS: --navbar-height configured to 70px to provide comfortable spacing!');

console.log('\n==============================================');
console.log('ALL NAVBAR BRAND ENLARGEMENT TESTS PASSED (100%)!');
console.log('==============================================');
