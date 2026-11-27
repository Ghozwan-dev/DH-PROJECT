const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TEST: STUDENT FORM CUSTOM CALENDAR STEPPERS (ENROLL & BIRTH DATE) ===\n');

const assembledHtml = require('../scripts/html-assembler').loadPreviewHtml();
const studentCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'student.css'), 'utf-8');
const studentJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'student.js'), 'utf-8');

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
  assembledHtml.includes('id="enrollCalendarPopover"') &&
  assembledHtml.includes('id="formEnrollDisplay"') &&
  assembledHtml.includes('id="formEnrollDate"') &&
  assembledHtml.includes('id="birthCalendarPopover"') &&
  assembledHtml.includes('id="formBirthDate"'),
  'Assembled HTML contains modern calendar stepper popovers & synced inputs for both Enroll Date and Birth Date'
);

assert(
  studentCss.includes('.snt-date-picker-wrapper') &&
  studentCss.includes('.snt-cal-popover') &&
  studentCss.includes('@media (max-width: 640px)') &&
  studentCss.includes('position: fixed !important'),
  'student.css styles custom date popover cleanly for both desktop and mobile bottom-centered viewports'
);

function makeEl(id) {
  const cls = new Set();
  const attrs = {};
  return {
    id,
    value: '',
    innerText: '',
    innerHTML: '',
    style: {},
    checked: false,
    src: '',
    dataset: {},
    classList: {
      add: (...c) => c.forEach(x => cls.add(x)),
      remove: (...c) => c.forEach(x => cls.delete(x)),
      contains: x => cls.has(x),
      toggle: (x, f) => {
        if (f === undefined) {
          if (cls.has(x)) cls.delete(x);
          else cls.add(x);
        } else if (f) {
          cls.add(x);
        } else {
          cls.delete(x);
        }
      }
    },
    setAttribute: (k, v) => { attrs[k] = String(v); },
    getAttribute: k => attrs[k] || null,
    contains: () => false,
    getBoundingClientRect: () => ({ bottom: 200, top: 150 })
  };
}

const byId = {
  formEnrollDateWrapper: makeEl('formEnrollDateWrapper'),
  formEnrollDisplay: makeEl('formEnrollDisplay'),
  formEnrollDate: makeEl('formEnrollDate'),
  enrollCalendarPopover: makeEl('enrollCalendarPopover'),
  formBirthDateWrapper: makeEl('formBirthDateWrapper'),
  formBirthDate: makeEl('formBirthDate'),
  nativeBirthDatePicker: makeEl('nativeBirthDatePicker'),
  birthCalendarPopover: makeEl('birthCalendarPopover'),
  pageStudentForm: makeEl('pageStudentForm'),
  sntFormPageTitle: makeEl('sntFormPageTitle'),
  btnSaveStudent: makeEl('btnSaveStudent'),
  formNis: makeEl('formNis'),
  formName: makeEl('formName'),
  genderPutraRadio: makeEl('genderPutraRadio'),
  genderPutriRadio: makeEl('genderPutriRadio'),
  labelGenderPutra: makeEl('labelGenderPutra'),
  labelGenderPutri: makeEl('labelGenderPutri'),
  formClass: makeEl('formClass'),
  formRoom: makeEl('formRoom'),
  formBirthPlace: makeEl('formBirthPlace'),
  formAddress: makeEl('formAddress'),
  formParentName: makeEl('formParentName'),
  formParentPhone: makeEl('formParentPhone'),
  formIsActiveCheck: makeEl('formIsActiveCheck')
};

const ctx = {
  console,
  currentLoggedInUser: { role: 'Admin', fullName: 'Administrator Pondok' },
  mockStudents: [
    {
      id: 'st_001',
      nis: '2024001',
      fullName: 'Ahmad Fauzi',
      gender: 'Putra',
      className: 'VII A',
      room: 'Al-Fatih 01',
      enrollmentDate: '2024-07-15',
      birthPlace: 'Sumenep',
      birthDate: '2011-04-12',
      address: 'Kangean',
      parentName: 'H. Syukri',
      parentPhone: '081234567890',
      isActive: true
    }
  ],
  currentDetailStudentId: 'st_001',
  document: {
    readyState: 'complete',
    getElementById: id => byId[id] || makeEl(id),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {}
  },
  window: { innerHeight: 800, addEventListener: () => {} },
  updateFormStatusSwitchUI: () => {},
  showToast: () => {}
};

vm.runInNewContext(studentJs, ctx);

// Test Edit mode pre-population
ctx.openStudentDetail('SNT-001');
ctx.openEditStudentForm();
assert(
  byId.formEnrollDate.value === '2024-07-15' &&
  byId.formEnrollDisplay.value === '15/07/2024' &&
  byId.formBirthDate.value === '12/04/2011' &&
  byId.nativeBirthDatePicker.value === '2011-04-12',
  'openEditStudentForm syncs both Enroll Date display (15/07/2024) and Birth Date (12/04/2011)'
);

// Test Birth Date Calendar Popover + Month/Year Steppers
ctx.triggerBirthDatePicker();
assert(
  byId.birthCalendarPopover.classList.contains('open') &&
  byId.birthCalendarPopover.innerHTML.includes('April') &&
  byId.birthCalendarPopover.innerHTML.includes('2011') &&
  byId.birthCalendarPopover.innerHTML.includes('data-date="2011-04-12"'),
  'triggerBirthDatePicker opens custom April 2011 calendar popover (matching Attendance stepper style)'
);

ctx.stepStudentCalendarMonth('birth', 1);
ctx.stepStudentCalendarYear('birth', -1);
assert(
  byId.birthCalendarPopover.innerHTML.includes('Mei') &&
  byId.birthCalendarPopover.innerHTML.includes('2010') &&
  byId.birthCalendarPopover.innerHTML.includes('att-step-roll-down'),
  'Birth calendar Month & Year steppers update popover with roll animation (Mei 2010)'
);

ctx.selectStudentCalendarDate('birth', '2010-05-19');
assert(
  byId.formBirthDate.value === '19/05/2010' &&
  byId.nativeBirthDatePicker.value === '2010-05-19' &&
  !byId.birthCalendarPopover.classList.contains('open'),
  'Selecting a birth date updates #formBirthDate (19/05/2010), syncs #nativeBirthDatePicker, and closes popover'
);

// Test Enroll Date Calendar Popover + Steppers
ctx.openStudentDatePopover('enroll');
assert(
  byId.enrollCalendarPopover.classList.contains('open') &&
  !byId.birthCalendarPopover.classList.contains('open') &&
  byId.enrollCalendarPopover.innerHTML.includes('Juli') &&
  byId.enrollCalendarPopover.innerHTML.includes('2024'),
  'Opening Enroll Date calendar shows Juli 2024 and ensures only one popover is open'
);

ctx.stepStudentCalendarMonth('enroll', 1);
assert(
  byId.enrollCalendarPopover.innerHTML.includes('Agustus') &&
  byId.enrollCalendarPopover.innerHTML.includes('att-step-roll-up'),
  'Enroll calendar Month stepper rolls smoothly forward to Agustus 2024'
);

ctx.selectStudentCalendarDate('enroll', '2024-08-05');
assert(
  byId.formEnrollDate.value === '2024-08-05' &&
  byId.formEnrollDisplay.value === '05/08/2024' &&
  !byId.enrollCalendarPopover.classList.contains('open'),
  'Selecting an enroll date updates hidden #formEnrollDate (2024-08-05) & display (05/08/2024)'
);

console.log(`\n==============================================`);
console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
console.log(`==============================================`);
