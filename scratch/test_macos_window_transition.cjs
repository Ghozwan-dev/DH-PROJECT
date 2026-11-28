const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TEST: MACOS WINDOW MINIMIZE & EMERGE TRANSITION ===\n');

const baseCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'base.css'), 'utf-8');
const authJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'auth.js'), 'utf-8');

let passed = 0;
let total = 0;

function assert(cond, msg) {
  total++;
  if (cond) {
    console.log(`[PASS] ${msg}`);
    passed++;
  } else {
    console.error(`[FAIL] ${msg}`);
    process.exitCode = 1;
  }
}

assert(
  baseCss.includes('.screen-page.macos-window-leaving') &&
  baseCss.includes('.screen-page.macos-window-entering') &&
  baseCss.includes('@keyframes macosWindowMinimize') &&
  baseCss.includes('@keyframes macosWindowEmerge') &&
  baseCss.includes('--macos-origin-x') &&
  baseCss.includes('--macos-origin-y'),
  'base.css defines macosWindowMinimize, macosWindowEmerge, and CSS variable transform-origin rules'
);

assert(
  baseCss.includes('prefers-reduced-motion: reduce'),
  'base.css disables macOS window keyframes cleanly under prefers-reduced-motion'
);

function makeNode(id, isPage = false, rect = { left: 260, top: 64, width: 1000, height: 700 }) {
  const cls = new Set(isPage ? ['screen-page'] : []);
  const props = {};
  return {
    id,
    scrollTop: 0,
    style: {
      setProperty: (k, v) => { props[k] = v; },
      getPropertyValue: (k) => props[k] || ''
    },
    _props: props,
    classList: {
      add: (...c) => c.forEach(x => cls.add(x)),
      remove: (...c) => c.forEach(x => cls.delete(x)),
      contains: x => cls.has(x)
    },
    getBoundingClientRect: () => rect,
    querySelectorAll: () => [],
    addEventListener: () => {}
  };
}

const shell = makeNode('shell');
const viewport = makeNode('flowViewport', false, { left: 260, top: 64, width: 1000, height: 700 });
const sbHome = makeNode('sbLinkHome', false, { left: 16, top: 130, width: 220, height: 42 });
const sbStudents = makeNode('sbLinkStudents', false, { left: 16, top: 202, width: 220, height: 42 });

const pages = ['pageLogin', 'pageRegister', 'pageHome', 'pageStudentList', 'pageScheduleList', 'pageSettings'].map(id => makeNode(id, true));
const map = Object.fromEntries(pages.map(p => [p.id, p]));
map.sbLinkHome = sbHome;
map.sbLinkStudents = sbStudents;

const timers = [];
const ctx = {
  console,
  Date,
  setTimeout: (fn, ms) => {
    const id = timers.length + 1;
    timers.push({ id, fn, ms, cleared: false });
    return id;
  },
  clearTimeout: (id) => {
    const t = timers.find(item => item.id === id);
    if (t) t.cleared = true;
  },
  window: {
    innerWidth: 1280,
    scrollTo: () => {},
    matchMedia: () => ({ matches: false }),
    addEventListener: () => {}
  },
  document: {
    getElementById: id => map[id] || makeNode(id),
    querySelector: sel => {
      if (sel === '.device-shell') return shell;
      if (sel === '.flow-viewport') return viewport;
      return null;
    },
    querySelectorAll: sel => sel === '.screen-page' ? pages : [],
    addEventListener: () => {}
  }
};

vm.runInNewContext(authJs, ctx);

// 1. Initial transition to pageHome should NOT trigger leaving animation (prevActivePage is null)
ctx.showOnlyScreenPage('pageHome');
assert(
  map.pageHome.classList.contains('active') &&
  !map.pageHome.classList.contains('macos-window-entering') &&
  !map.pageHome.classList.contains('macos-window-leaving'),
  'Initial load opens pageHome cleanly without spurious minimize/emerge animation'
);

// 2. Switching from pageHome -> pageStudentList should minimize pageHome and emerge pageStudentList
ctx.showOnlyScreenPage('pageStudentList');
assert(
  !map.pageHome.classList.contains('active') &&
  map.pageHome.classList.contains('macos-window-leaving') &&
  map.pageStudentList.classList.contains('active') &&
  map.pageStudentList.classList.contains('macos-window-entering'),
  'Navigating pageHome -> pageStudentList applies macos-window-leaving to old page and macos-window-entering to new page'
);

assert(
  map.pageHome._props['--macos-origin-x'] === '-134px' &&
  map.pageStudentList._props['--macos-origin-x'] === '-134px' &&
  map.pageHome._props['--macos-origin-y'] === '87px' &&
  map.pageStudentList._props['--macos-origin-y'] === '159px',
  `Origins anchor accurately to sidebar buttons (Beranda: ${map.pageHome._props['--macos-origin-x']} ${map.pageHome._props['--macos-origin-y']}, Data Santri: ${map.pageStudentList._props['--macos-origin-x']} ${map.pageStudentList._props['--macos-origin-y']})`
);

// 3. Timers finish and strip animation classes cleanly
timers.filter(t => !t.cleared).forEach(t => t.fn());
assert(
  !map.pageHome.classList.contains('macos-window-leaving') &&
  !map.pageStudentList.classList.contains('macos-window-entering') &&
  map.pageStudentList.classList.contains('active'),
  'Completion timers clean up transition classes while preserving active target page'
);

// 4. Logout clears all macos transition classes cleanly
ctx.showOnlyScreenPage('pageSettings');
ctx.logoutFromHome();
assert(
  pages.every(p => !p.classList.contains('active') && !p.classList.contains('macos-window-leaving') && !p.classList.contains('macos-window-entering')),
  'logoutFromHome cleans all active and macos transition classes across every screen page'
);

console.log(`\n==============================================`);
console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
console.log(`==============================================`);
