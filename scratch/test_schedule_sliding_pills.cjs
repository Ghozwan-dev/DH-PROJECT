const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TEST: SCHEDULE FILTER CHIPS SLIDING PILL ANIMATION ===\n');

const previewHtml = require('../scripts/html-assembler').loadPreviewHtml();
const scheduleCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'schedule.css'), 'utf-8');
const scheduleJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'schedule.js'), 'utf-8');

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

// 1. Markup & CSS checks
assert(
  previewHtml.includes('id="schDayChipsContainer"') && previewHtml.includes('id="schClassChipsContainer"'),
  'preview.html includes #schDayChipsContainer and #schClassChipsContainer'
);
assert(
  scheduleCss.includes('.sch-chip-sliding-pill') &&
  scheduleCss.includes('isolation: isolate;') &&
  scheduleCss.includes('linear(') &&
  scheduleCss.includes('.sch-chips-scroll.has-sliding-pill .sch-chip-text') &&
  scheduleCss.includes('.sch-chips-scroll.has-sliding-pill .sch-chip.active'),
  'schedule.css defines iOS spring linear() easing, isolated z-index layering, .sch-chip-text above pill, and transparent active override'
);
assert(
  scheduleCss.includes('prefers-reduced-motion: reduce'),
  'schedule.css respects prefers-reduced-motion: reduce'
);

// 2. DOM simulation for JS behavior
function createMockElement(id, tagName) {
  const classes = new Set();
  const attrs = {};
  const style = {};
  const el = {
    id,
    tagName: (tagName || 'DIV').toUpperCase(),
    dataset: {},
    style,
    children: [],
    scrollLeft: 0,
    clientWidth: 420,
    scrollTo: () => {},
    classList: {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      contains: (c) => classes.has(c),
      toggle: (c, force) => {
        if (force === undefined) {
          if (classes.has(c)) classes.delete(c);
          else classes.add(c);
        } else if (force) {
          classes.add(c);
        } else {
          classes.delete(c);
        }
      }
    },
    setAttribute: (k, v) => { attrs[k] = String(v); },
    getAttribute: (k) => attrs[k] || null,
    querySelectorAll: (selector) => {
      if (selector === '.sch-chip') return el.children.filter(c => c.classList.contains('sch-chip'));
      return [];
    },
    querySelector: (selector) => {
      if (selector === '.sch-chip.active') return el.children.find(c => c.classList.contains('sch-chip') && c.classList.contains('active')) || null;
      return null;
    }
  };

  Object.defineProperty(el, 'innerHTML', {
    get: () => el._innerHTML || '',
    set: (html) => {
      el._innerHTML = html;
      el.children = [];

      const pillMatch = html.match(/id="([^"]+)"/);
      if (pillMatch && html.includes('sch-chip-sliding-pill')) {
        const pill = createMockElement(pillMatch[1], 'SPAN');
        pill.classList.add('sch-chip-sliding-pill');
        elementsById[pillMatch[1]] = pill;
        el.children.push(pill);
      }

      const chipRegex = /<div class="sch-chip([^"]*)"[^>]*data-value="([^"]+)"[^>]*>/g;
      let m;
      let x = 2;
      while ((m = chipRegex.exec(html)) !== null) {
        const chip = createMockElement('', 'DIV');
        chip.classList.add('sch-chip');
        if (m[1].includes('active')) chip.classList.add('active');
        chip.setAttribute('data-value', m[2]);
        chip.offsetLeft = x;
        chip.offsetTop = 4;
        chip.offsetWidth = 56 + m[2].length * 4;
        chip.offsetHeight = 30;
        x += chip.offsetWidth + 8;
        el.children.push(chip);
      }
    }
  });

  return el;
}

const elementsById = {
  schDayChipsContainer: createMockElement('schDayChipsContainer', 'DIV'),
  schClassChipsContainer: createMockElement('schClassChipsContainer', 'DIV'),
  schResultCount: createMockElement('schResultCount', 'SPAN'),
  schListContainer: createMockElement('schListContainer', 'DIV'),
  schTopAddBtn: createMockElement('schTopAddBtn', 'BUTTON'),
  schSearchInput: createMockElement('schSearchInput', 'INPUT'),
  schClearSearch: createMockElement('schClearSearch', 'BUTTON')
};

const context = {
  console,
  currentLoggedInUser: { role: 'Admin', fullName: 'Administrator Utama' },
  mockSchedules: [],
  mockAttendanceRecords: [],
  document: {
    getElementById: (id) => elementsById[id] || null,
    querySelector: () => null,
    querySelectorAll: () => []
  },
  window: {
    addEventListener: () => {}
  },
  requestAnimationFrame: (cb) => cb()
};
context.globalThis = context;

vm.runInNewContext(scheduleJs, context);

context.renderScheduleChips();

const dayPillFirst = elementsById.schDaySlidingPill;
const classPillFirst = elementsById.schClassSlidingPill;

assert(!!dayPillFirst && !!classPillFirst, 'renderScheduleChips injects #schDaySlidingPill and #schClassSlidingPill');
assert(
  elementsById.schDayChipsContainer.classList.contains('has-sliding-pill') &&
  elementsById.schClassChipsContainer.classList.contains('has-sliding-pill'),
  'Chip containers receive .has-sliding-pill class'
);
assert(
  dayPillFirst.style.opacity === '1' && dayPillFirst.style.transform === 'translate3d(2px, 4px, 0)',
  `Initial Day pill snaps to "Semua" (${dayPillFirst.style.transform}, width=${dayPillFirst.style.width})`
);

// Select "Jumat" -> must reuse exact same pill element and update transform cleanly
context.setScheduleDayFilter('Jumat');
assert(
  elementsById.schDaySlidingPill === dayPillFirst,
  'setScheduleDayFilter updates chips in-place without recreating #schDaySlidingPill (preserves CSS slide transition)'
);
const jumatChip = elementsById.schDayChipsContainer.querySelector('.sch-chip.active');
assert(
  jumatChip && jumatChip.getAttribute('data-value') === 'Jumat' &&
  dayPillFirst.style.transform === `translate3d(${jumatChip.offsetLeft}px, 4px, 0)` &&
  dayPillFirst.style.width === `${jumatChip.offsetWidth}px`,
  `Day pill slides cleanly to "Jumat" (${dayPillFirst.style.transform}, width=${dayPillFirst.style.width})`
);

// Select "XI B" -> must reuse exact same class pill element and update transform cleanly
context.setScheduleClassFilter('XI B');
assert(
  elementsById.schClassSlidingPill === classPillFirst,
  'setScheduleClassFilter updates chips in-place without recreating #schClassSlidingPill'
);
const xiBChip = elementsById.schClassChipsContainer.querySelector('.sch-chip.active');
assert(
  xiBChip && xiBChip.getAttribute('data-value') === 'XI B' &&
  classPillFirst.style.transform === `translate3d(${xiBChip.offsetLeft}px, 4px, 0)` &&
  classPillFirst.style.width === `${xiBChip.offsetWidth}px`,
  `Class pill slides cleanly to "XI B" (${classPillFirst.style.transform}, width=${classPillFirst.style.width})`
);

// Reset filters -> both pills slide back to "Semua" while preserving pill nodes
context.resetScheduleFilters();
assert(
  elementsById.schDaySlidingPill === dayPillFirst &&
  elementsById.schClassSlidingPill === classPillFirst &&
  dayPillFirst.style.transform === 'translate3d(2px, 4px, 0)' &&
  classPillFirst.style.transform === 'translate3d(2px, 4px, 0)',
  'resetScheduleFilters slides both pills smoothly back to "Semua"'
);

console.log(`\n==============================================`);
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log(`==============================================`);
