const fs = require('fs');
const path = require('path');

console.log('=== TEST: DESKTOP SIDEBAR SLIDING PILL ANIMATION VERIFICATION ===\n');

const previewHtml = require('../scripts/html-assembler').loadPreviewHtml();
const baseCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'base.css'), 'utf8');
const authJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'auth.js'), 'utf8');

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

// 1. Verify HTML Structure
assert(previewHtml.includes('id="sidebarSlidingPill"') && previewHtml.includes('class="sidebar-sliding-pill"'),
  'preview.html contains #sidebarSlidingPill with class sidebar-sliding-pill');

const navContainerIndex = previewHtml.indexOf('class="sidebar-nav-container"');
const pillIndex = previewHtml.indexOf('id="sidebarSlidingPill"');
const homeLinkIndex = previewHtml.indexOf('id="sbLinkHome"');

assert(navContainerIndex !== -1 && pillIndex > navContainerIndex && pillIndex < homeLinkIndex,
  '#sidebarSlidingPill is placed at the top inside .sidebar-nav-container before nav items');

// 2. Verify CSS Scoping & Styling
assert(baseCss.includes('.sidebar-sliding-pill {') && baseCss.includes('display: none;'),
  'sidebar-sliding-pill is hidden by default (mobile view)');

assert(baseCss.includes('@media (min-width: 768px)'),
  'base.css includes responsive breakpoint for desktop view (min-width: 768px)');

assert(baseCss.includes('border-radius: 10px') && 
       baseCss.includes('background: var(--primary-light, #DCFCE7)') && 
       baseCss.includes('border-left: 3.5px solid var(--primary, #0E6838)'),
  'base.css defines sliding pill with border-radius: 10px, pastel green background, and primary green left border matching screenshot');

assert(baseCss.includes('transition: transform 0.32s cubic-bezier(0.34, 1.25, 0.64, 1)'),
  'base.css defines smooth gliding physics with cubic-bezier easing');

assert(baseCss.includes('.app-sidebar .sidebar-nav-item.active {\n        background: transparent !important;') ||
       baseCss.includes('background: transparent !important;'),
  'desktop sidebar-nav-item.active has transparent background so sliding pill displays cleanly underneath');

// 3. Verify JavaScript Logic in auth.js
assert(authJs.includes('function updateSidebarSlidingPill('),
  'auth.js defines updateSidebarSlidingPill function');

assert(authJs.includes('updateSidebarSlidingPill(pageKey);'),
  'auth.js calls updateSidebarSlidingPill inside syncActiveNav(pageKey)');

assert(authJs.includes('window.updateSidebarSlidingPill = updateSidebarSlidingPill;'),
  'auth.js exports updateSidebarSlidingPill to window object');

// 4. Test Simulated DOM Execution for Desktop and Mobile
const mockContainer = {
  clientWidth: 240,
  offsetLeft: 0,
  offsetTop: 0
};

const mockItems = {
  'sbLinkHome': { offsetTop: 24, offsetLeft: 0, offsetWidth: 232, offsetHeight: 40, offsetParent: mockContainer },
  'sbLinkStudents': { offsetTop: 96, offsetLeft: 0, offsetWidth: 232, offsetHeight: 40, offsetParent: mockContainer },
  'sbLinkSchedule': { offsetTop: 140, offsetLeft: 0, offsetWidth: 232, offsetHeight: 40, offsetParent: mockContainer },
  'sbLinkReport': { offsetTop: 184, offsetLeft: 0, offsetWidth: 232, offsetHeight: 40, offsetParent: mockContainer },
  'sbLinkSettings': { offsetTop: 256, offsetLeft: 0, offsetWidth: 232, offsetHeight: 40, offsetParent: mockContainer }
};

const mockPill = {
  style: {
    transform: '',
    width: '',
    height: '',
    opacity: '0'
  }
};

global.document = {
  getElementById: (id) => {
    if (id === 'sidebarSlidingPill') return mockPill;
    if (mockItems[id]) return mockItems[id];
    return null;
  },
  querySelector: (selector) => {
    if (selector === '.sidebar-nav-container') return mockContainer;
    return null;
  },
  addEventListener: () => {},
  removeEventListener: () => {}
};

global.window = {
  innerWidth: 1024,
  addEventListener: () => {}
};

// Evaluate the script's functions in this context
const scriptContext = new Function(authJs + `
  return {
    syncActiveNav,
    updateSidebarSlidingPill
  };
`)();

// Test Navigation on Desktop (1024px)
scriptContext.updateSidebarSlidingPill('students');
assert(mockPill.style.transform === 'translate3d(0px, 96px, 0)' && mockPill.style.opacity === '1',
  'Desktop: Pill translates to Data Santri (top: 96px) with opacity 1');

scriptContext.updateSidebarSlidingPill('home');
assert(mockPill.style.transform === 'translate3d(0px, 24px, 0)',
  'Desktop: Pill translates back to Beranda (top: 24px)');

scriptContext.updateSidebarSlidingPill('report');
assert(mockPill.style.transform === 'translate3d(0px, 184px, 0)',
  'Desktop: Pill translates to Laporan Absensi (top: 184px)');

// Test Mobile Viewport (< 768px): Should not modify desktop pill transform
global.window.innerWidth = 480;
mockPill.style.transform = 'unchanged';
scriptContext.updateSidebarSlidingPill('settings');
assert(mockPill.style.transform === 'unchanged',
  'Mobile (< 768px): Pill calculation is bypassed to remain strictly on desktop view');

console.log(`\n==============================================`);
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log(`==============================================\n`);

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
