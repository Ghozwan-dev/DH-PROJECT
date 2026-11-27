const fs = require('fs');
const path = require('path');

console.log('=== TEST: USTADZ TEACHING SCHEDULE (CLEAN SCHEDULE VIEW WITHOUT DETAIL SHORTCUTS) VERIFICATION ===\n');

const previewHtml = require('../scripts/html-assembler').loadPreviewHtml();
const homeCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'home.css'), 'utf-8');
const authJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'auth.js'), 'utf-8');
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

// 1. Check preview.html markup
assert(previewHtml.includes('activity-teaching-box'), 
  'preview.html contains .activity-teaching-box for displaying teaching schedules');

assert(previewHtml.includes('activity-teaching-toggle-wrap'), 
  'preview.html contains .activity-teaching-toggle-wrap container');

assert(previewHtml.includes('btn-teaching-toggle') && previewHtml.includes('Lihat Jadwal'),
  'preview.html contains compact .btn-teaching-toggle button with "Lihat Jadwal" label');

assert(!previewHtml.includes('btn-teaching-modal-pop'),
  'preview.html has redundant second button removed: exactly 1 small access button is present');

// User requested: "tidak perlu akses detail....!"
assert(!previewHtml.includes('btn-sch-header-shortcut') && !previewHtml.includes('Detail Ustadz'),
  'preview.html does NOT contain "Detail Ustadz" shortcut button (user requested no detail shortcuts)');

assert(!previewHtml.includes('btn-item-detail-shortcut'),
  'preview.html does NOT contain "Detail ->" button under items (clean informative schedule layout)');

assert(previewHtml.includes('toggleTeachingBox('),
  'preview.html wires up toggleTeachingBox onclick handler');

assert(previewHtml.includes('style="display: none;"') && previewHtml.includes('id="teachBox_0"'),
  'preview.html has initial teaching boxes collapsed (display: none) to keep homepage neat and compact');

assert(previewHtml.includes('Fiqih') && previewHtml.includes('Kelas VII A') && previewHtml.includes('07:30 - 08:15 WIB'),
  'preview.html displays Mapel, Kelas, and Waktu for Ustadz Ahmad Fauzi (Fiqih, Kelas VII A, 07:30 - 08:15 WIB)');

// 2. Check CSS styling in home.css
assert(homeCss.includes('.activity-teaching-box {') && homeCss.includes('.activity-teaching-item {'),
  'home.css defines styles for .activity-teaching-box and .activity-teaching-item');

assert(homeCss.includes('.btn-teaching-toggle') && homeCss.includes('.activity-teaching-toggle-wrap'),
  'home.css defines styles for .btn-teaching-toggle and .activity-teaching-toggle-wrap');

assert(homeCss.includes('white-space: nowrap;'),
  'home.css defines white-space: nowrap to prevent button label from wrapping into multiple lines');

assert(homeCss.includes('.chevron-arrow') && homeCss.includes('transform: rotate(180deg)'),
  'home.css defines smooth chevron-arrow rotation on active toggle');

// 3. Check JS implementation in auth.js and schedule.js
assert(authJs.includes('function getTeacherScheduleForDay'),
  'auth.js defines getTeacherScheduleForDay helper function');

assert(authJs.includes('function toggleTeachingBox'),
  'auth.js defines toggleTeachingBox function');

// 4. Test Simulated DOM Rendering for auth.js and schedule.js
let domElements = {};
function createMockElement(id, tag = 'div') {
  return {
    id,
    tagName: tag.toUpperCase(),
    style: { display: 'none' },
    classList: {
      _classes: new Set(),
      add(cls) { this._classes.add(cls); },
      remove(cls) { this._classes.delete(cls); },
      contains(cls) { return this._classes.has(cls); }
    },
    attributes: {},
    setAttribute(k, v) { this.attributes[k] = v; },
    getAttribute(k) { return this.attributes[k]; },
    dataset: {},
    innerText: '',
    innerHTML: '',
    querySelector(sel) {
      if (sel === '.btn-toggle-label') {
        if (!this._labelEl) {
          this._labelEl = { innerText: 'Lihat Jadwal' };
        }
        return this._labelEl;
      }
      return null;
    }
  };
}

let renderedHtml = '';
global.document = {
  getElementById: (id) => {
    if (id === 'homeActivitiesList') {
      return {
        set innerHTML(val) { renderedHtml = val; },
        get innerHTML() { return renderedHtml; }
      };
    }
    if (!domElements[id]) {
      domElements[id] = createMockElement(id);
    }
    return domElements[id];
  },
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  removeEventListener: () => {}
};

global.window = {
  innerWidth: 1024,
  addEventListener: () => {}
};

// Evaluate scheduleJs and authJs together to test dynamic linkage
const scriptContext = new Function(scheduleJs + '\n' + authJs + `
  return {
    renderRecentActivities,
    addUstadzActivity,
    getTeacherScheduleForDay,
    toggleTeachingBox,
    mockUstadzActivities,
    mockSchedules
  };
`)();

scriptContext.renderRecentActivities();

assert(renderedHtml.includes('btn-teaching-toggle'),
  'Dynamic renderRecentActivities output contains .btn-teaching-toggle');

assert(renderedHtml.includes('Lihat Jadwal'),
  'Dynamic renderRecentActivities contains concise "Lihat Jadwal" label');

assert(!renderedHtml.includes('btn-teaching-modal-pop'),
  'Dynamic renderRecentActivities produces exactly 1 small access button (no second button)');

assert(!renderedHtml.includes('btn-sch-header-shortcut') && !renderedHtml.includes('Detail Ustadz'),
  'Dynamic renderRecentActivities does NOT produce Detail Ustadz button');

assert(!renderedHtml.includes('btn-item-detail-shortcut'),
  'Dynamic renderRecentActivities does NOT produce Detail buttons on items');

assert(renderedHtml.includes('dynTeachBox_0') && renderedHtml.includes('style="display: none;"'),
  'Dynamic renderRecentActivities output has teaching box collapsed by default with style="display: none;"');

assert(renderedHtml.includes('Fiqih') && renderedHtml.includes('Kelas VII A') && renderedHtml.includes('07:30 - 08:15 WIB'),
  'Dynamic render contains Ustadz Ahmad Fauzi teaching items (Fiqih, Kelas VII A, 07:30 - 08:15 WIB)');

// 5. Test toggleTeachingBox functionality
const testBox = domElements['dynTeachBox_0'] || createMockElement('dynTeachBox_0');
domElements['dynTeachBox_0'] = testBox;
testBox.style.display = 'none';

const testBtn = createMockElement('testToggleBtn', 'button');
testBtn._labelEl = { innerText: 'Lihat Jadwal' };

// Expand box
scriptContext.toggleTeachingBox('dynTeachBox_0', testBtn);
assert(testBox.style.display === 'block', 'toggleTeachingBox expands box (display: block)');
assert(testBtn.classList.contains('active'), 'toggleTeachingBox adds active class to button');
assert(testBtn.getAttribute('aria-expanded') === 'true', 'toggleTeachingBox sets aria-expanded to true');
assert(testBtn.querySelector('.btn-toggle-label').innerText === 'Tutup Jadwal', 'toggleTeachingBox changes label to "Tutup Jadwal"');

// Collapse box
scriptContext.toggleTeachingBox('dynTeachBox_0', testBtn);
assert(testBox.style.display === 'none', 'toggleTeachingBox collapses box back (display: none)');
assert(!testBtn.classList.contains('active'), 'toggleTeachingBox removes active class from button');
assert(testBtn.getAttribute('aria-expanded') === 'false', 'toggleTeachingBox sets aria-expanded to false');
assert(testBtn.querySelector('.btn-toggle-label').innerText === 'Lihat Jadwal', 'toggleTeachingBox restores label to "Lihat Jadwal"');

console.log(`\n==============================================`);
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log(`==============================================\n`);

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
