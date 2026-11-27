const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TEST: STUDENT FILTER CHIPS SLIDING PILL ANIMATION ===\n');

const previewHtml = require('../scripts/html-assembler').loadPreviewHtml();
const studentCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'student.css'), 'utf-8');
const studentJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'student.js'), 'utf-8');

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

assert(
  previewHtml.includes('id="sntGradeFilterRow"') &&
  previewHtml.includes('id="sntGradeSlidingPill"') &&
  previewHtml.includes('id="sntGenderFilterRow"') &&
  previewHtml.includes('id="sntGenderSlidingPill"'),
  'preview.html contains #sntGradeFilterRow/#sntGradeSlidingPill and #sntGenderFilterRow/#sntGenderSlidingPill'
);
assert(
  studentCss.includes('.snt-chip-sliding-pill') &&
  studentCss.includes('.snt-gender-sliding-pill') &&
  studentCss.includes('linear(') &&
  studentCss.includes('.snt-gender-sliding-pill.is-putra') &&
  studentCss.includes('.snt-gender-sliding-pill.is-putri'),
  'student.css defines grade & gender iOS spring sliding pills with Putra/Putri states'
);
assert(
  studentCss.includes('prefers-reduced-motion: reduce'),
  'student.css respects prefers-reduced-motion: reduce'
);

function makeEl(id, x = 0, w = 80) {
  const cls = new Set();
  const el = {
    id,
    style: {},
    dataset: {},
    scrollLeft: 0,
    clientWidth: 480,
    offsetLeft: x,
    offsetTop: 4,
    offsetWidth: w,
    offsetHeight: 28,
    innerText: '',
    innerHTML: '',
    scrollTo: () => {},
    classList: {
      add: (...c) => c.forEach(item => cls.add(item)),
      remove: (...c) => c.forEach(item => cls.delete(item)),
      contains: item => cls.has(item)
    },
    _children: [],
    querySelector: (sel) => {
      if (sel === '.snt-chip.active') return el._children.find(c => c.classList.contains('active')) || null;
      if (sel === '.snt-gchip.active-putra') return el._children.find(c => c._clsStr && c._clsStr.includes('active-putra')) || null;
      if (sel === '.snt-gchip.active-putri') return el._children.find(c => c._clsStr && c._clsStr.includes('active-putri')) || null;
      return null;
    }
  };
  Object.defineProperty(el, 'className', {
    get: () => el._clsStr || '',
    set: (v) => {
      el._clsStr = v;
      cls.clear();
      v.split(/\s+/).filter(Boolean).forEach(item => cls.add(item));
    }
  });
  return el;
}

const gradeIds = [
  ['chipGradeAll', 2, 92],
  ['chipGradeVII', 100, 74],
  ['chipGradeVIII', 180, 78],
  ['chipGradeIX', 264, 74],
  ['chipGradeX', 344, 70],
  ['chipGradeXI', 420, 74],
  ['chipGradeXII', 500, 78]
];

const gradeRow = makeEl('sntGradeFilterRow');
const gradePill = makeEl('sntGradeSlidingPill');
const gradeChips = gradeIds.map(([id, x, w]) => {
  const c = makeEl(id, x, w);
  if (id === 'chipGradeAll') c.classList.add('active');
  return c;
});
gradeRow._children = gradeChips;

const genderRow = makeEl('sntGenderFilterRow');
const genderPill = makeEl('sntGenderSlidingPill');
const chipPutra = makeEl('chipGendPutra', 2, 110);
const chipPutri = makeEl('chipGendPutri', 118, 106);
chipPutra.className = 'snt-gchip';
chipPutri.className = 'snt-gchip';
genderRow._children = [chipPutra, chipPutri];

const elements = {
  sntGradeFilterRow: gradeRow,
  sntGradeSlidingPill: gradePill,
  sntGenderFilterRow: genderRow,
  sntGenderSlidingPill: genderPill,
  chipGendPutra: chipPutra,
  chipGendPutri: chipPutri,
  sntResultCount: makeEl('sntResultCount'),
  sntListContainer: makeEl('sntListContainer'),
  sntTopAddBtn: makeEl('sntTopAddBtn'),
  sntRoleSubDesc: makeEl('sntRoleSubDesc'),
  pageStudentList: makeEl('pageStudentList')
};
gradeChips.forEach(c => { elements[c.id] = c; });

const ctx = {
  console,
  currentLoggedInUser: { role: 'Admin', fullName: 'Administrator' },
  mockStudents: [],
  document: {
    getElementById: id => elements[id] || makeEl(id),
    querySelector: () => null,
    querySelectorAll: () => []
  },
  window: { addEventListener: () => {} },
  requestAnimationFrame: cb => cb()
};
vm.runInNewContext(studentJs, ctx);

ctx.openStudentListPage();
assert(
  gradePill.style.opacity === '1' &&
  gradePill.style.transform === 'translate3d(2px, 4px, 0)' &&
  gradePill.style.width === '92px',
  `Initial grade pill snaps cleanly to "Semua Kelas" (${gradePill.style.transform}, width=${gradePill.style.width})`
);
assert(
  genderPill.style.opacity === '0',
  'Initial gender pill starts hidden when selectedGenderFilter is "Semua"'
);

ctx.setGradeFilter('IX');
assert(
  gradePill.style.transform === 'translate3d(264px, 4px, 0)' &&
  gradePill.style.width === '74px',
  `setGradeFilter("IX") slides grade pill smoothly (${gradePill.style.transform}, width=${gradePill.style.width})`
);

ctx.setGenderFilter('Putra');
assert(
  genderPill.style.opacity === '1' &&
  genderPill.classList.contains('is-putra') &&
  genderPill.style.transform === 'translate3d(2px, 4px, 0)' &&
  genderPill.style.width === '110px',
  `setGenderFilter("Putra") activates Putra pill with sky-blue state (${genderPill.style.transform})`
);

ctx.setGenderFilter('Putri');
assert(
  genderPill.style.opacity === '1' &&
  !genderPill.classList.contains('is-putra') &&
  genderPill.classList.contains('is-putri') &&
  genderPill.style.transform === 'translate3d(118px, 4px, 0)' &&
  genderPill.style.width === '106px',
  `setGenderFilter("Putri") glides gender pill from Putra to Putri and switches to pink (${genderPill.style.transform})`
);

ctx.setGenderFilter('Putri');
assert(
  genderPill.style.opacity === '0' &&
  !genderPill.classList.contains('is-putri') &&
  genderPill.style.transform.includes('scale(0.92)'),
  `Toggling off gender filter dissolves pill smoothly (${genderPill.style.transform}, opacity=${genderPill.style.opacity})`
);

console.log(`\n==============================================`);
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log(`==============================================`);
