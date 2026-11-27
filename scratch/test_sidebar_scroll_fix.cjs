const fs = require('fs');
const path = require('path');

console.log('=== TEST: SIDEBAR FOOTER & FIXED POSITIONING SCROLL FIX VERIFICATION ===\n');

const previewHtml = require('../scripts/html-assembler').loadPreviewHtml();
const baseCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'base.css'), 'utf8');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// 1. Check preview.html markup
assert(previewHtml.includes('class="sidebar-nav-container"'), 
  'preview.html contains .sidebar-nav-container wrapper for scrollable menu items');

const sidebarHtml = previewHtml.split('id="appSidebar"')[1].split('</aside>')[0];
assert(sidebarHtml.includes('class="sidebar-nav-container"') && sidebarHtml.includes('class="sidebar-footer"'),
  'Both .sidebar-nav-container and .sidebar-footer exist inside #appSidebar');

// Ensure sidebar-footer is outside the scrollable sidebar-nav-container
const footerStartIndex = sidebarHtml.indexOf('class="sidebar-footer"');
assert(footerStartIndex > -1, 'Footer is placed after scrollable nav container in DOM hierarchy');

// 2. Check CSS rules in base.css
assert(baseCss.includes('.sidebar-nav-container {'), 'base.css defines .sidebar-nav-container');
assert(baseCss.includes('overflow-y: auto') && baseCss.includes('flex: 1') && baseCss.includes('min-height: 0'), 
  'sidebar-nav-container has flex: 1, min-height: 0, and overflow-y: auto');
assert(baseCss.includes('.sidebar-footer {') && baseCss.includes('flex-shrink: 0'), 
  'sidebar-footer has flex-shrink: 0 (stays permanently anchored, does not shrink or scroll with items)');

// 3. Check persistent desktop fixed positioning
assert(baseCss.includes('position: fixed') && baseCss.includes('top: var(--navbar-height)') && baseCss.includes('width: var(--sidebar-width)'),
  'app-sidebar is position: fixed on desktop to stay permanently on screen during page scroll');
assert(baseCss.includes('margin-left: var(--sidebar-width)'),
  'main-content-viewport offsets content with margin-left: var(--sidebar-width) on desktop');
assert(baseCss.includes('.device-shell:not(.on-home) .main-content-viewport {\n      margin-left: 0 !important;'),
  'main-content-viewport resets margin-left to 0 when logged out');

console.log(`\n==============================================`);
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log(`==============================================\n`);

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
