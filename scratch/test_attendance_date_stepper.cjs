const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TEST: ATTENDANCE CALENDAR NUMBER STEPPER ===\n');

const previewHtml = require('../scripts/html-assembler').loadPreviewHtml();
const attendanceCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'attendance.css'), 'utf-8');
const attendanceJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'attendance.js'), 'utf-8');

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
  previewHtml.includes('id="attDateStepper"') &&
  previewHtml.includes('id="attDateStepPrev"') &&
  previewHtml.includes('id="attDateStepNext"') &&
  previewHtml.includes('id="attStepperDayNum"') &&
  previewHtml.includes('id="attCalendarPopover"') &&
  previewHtml.includes('id="attFormDate"'),
  'preview.html contains Number Stepper controls, animated day slot, custom calendar popover, and synced #attFormDate'
);
assert(
  attendanceCss.includes('@keyframes attStepRollUp') &&
  attendanceCss.includes('@keyframes attStepRollDown') &&
  attendanceCss.includes('.att-calendar-popover.open') &&
  attendanceCss.includes('.att-stepper-btn:active'),
  'attendance.css defines upward/downward number roll animations, tactile button press, and popover transitions'
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
    offsetWidth: 120,
    classList: {
      add: (...c) => c.forEach(x => cls.add(x)),
      remove: (...c) => c.forEach(x => cls.delete(x)),
      contains: x => cls.has(x)
    },
    setAttribute: (k, v) => { attrs[k] = String(v); },
    getAttribute: k => attrs[k] || null,
    contains: () => false,
    querySelectorAll: () => [],
    addEventListener: () => {}
  };
}

const map = {
  attFormDate: makeEl('attFormDate'),
  attStepperDayNum: makeEl('attStepperDayNum'),
  attStepperMonthYear: makeEl('attStepperMonthYear'),
  attCalendarPopover: makeEl('attCalendarPopover'),
  attDateStepperCenter: makeEl('attDateStepperCenter'),
  attCalMonthLabel: makeEl('attCalMonthLabel'),
  attCalYearLabel: makeEl('attCalYearLabel'),
  attCalDaysGrid: makeEl('attCalDaysGrid'),
  attStudentListContainer: makeEl('attStudentListContainer'),
  attStudentCountLabel: makeEl('attStudentCountLabel'),
  pageAttendanceForm: makeEl('pageAttendanceForm'),
  attValidationBanner: makeEl('attValidationBanner')
};

const ctx = {
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  currentLoggedInUser: { id: 'u1', fullName: 'Administrator Pondok', role: 'Admin' },
  mockSchedules: [
    { id: 'sch_001', className: 'VII A', subject: 'Fiqih', teacherName: 'Ustadz Ahmad Fauzi', periodNumber: 1, startTime: '07:30', endTime: '08:15' }
  ],
  mockStudents: [
    { id: 's1', nis: '101', fullName: 'Ahmad', className: 'VII A', gender: 'Putra', isActive: true }
  ],
  mockAttendanceRecords: [],
  currentAttendanceScheduleId: 'sch_001',
  currentAttendanceDate: '2026-11-27',
  currentAttendanceItems: [],
  attendanceValidationActive: false,
  document: {
    getElementById: id => map[id] || makeEl(id),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {}
  },
  window: { addEventListener: () => {} },
  requestAnimationFrame: cb => cb(),
  showToast: () => {},
  renderScheduleList: () => {}
};

vm.runInNewContext(attendanceJs, ctx);

ctx.openAttendanceForm('sch_001', '2026-11-27');
assert(
  !previewHtml.includes('attStepperWeekday') &&
  map.attFormDate.value === '2026-11-27' &&
  map.attStepperDayNum.innerText === '27' &&
  map.attStepperMonthYear.innerText === 'Nov 2026',
  'openAttendanceForm syncs #attFormDate and compact Stepper display (27 Nov 2026 without outer weekday label)'
);

ctx.stepAttendanceDate(1);
assert(
  map.attFormDate.value === '2026-11-28' &&
  map.attStepperDayNum.innerText === '28' &&
  map.attStepperDayNum.classList.contains('att-step-roll-up'),
  'stepAttendanceDate(+1) steps 27 -> 28 and triggers att-step-roll-up animation'
);

ctx.stepAttendanceDate(3);
assert(
  map.attFormDate.value === '2026-12-01' &&
  map.attStepperDayNum.innerText === '1' &&
  map.attStepperMonthYear.innerText === 'Des 2026',
  'stepAttendanceDate across month boundary handles Nov 28 + 3 -> 1 Des 2026 accurately'
);

ctx.stepAttendanceDate(-1);
assert(
  map.attFormDate.value === '2026-11-30' &&
  map.attStepperDayNum.innerText === '30' &&
  map.attStepperMonthYear.innerText === 'Nov 2026' &&
  map.attStepperDayNum.classList.contains('att-step-roll-down'),
  'stepAttendanceDate(-1) rolls back from Des 1 -> 30 Nov 2026 and triggers att-step-roll-down'
);

ctx.toggleAttendanceCalendarPopover();
assert(
  map.attCalendarPopover.classList.contains('open') &&
  map.attCalMonthLabel.innerText === 'November' &&
  map.attCalYearLabel.innerText === '2026' &&
  map.attCalDaysGrid.innerHTML.includes('data-date="2026-11-30"'),
  'toggleAttendanceCalendarPopover opens dialog with November 2026 and highlights selected day'
);

ctx.stepCalendarViewMonth(1);
ctx.stepCalendarViewYear(1);
assert(
  map.attCalMonthLabel.innerText === 'Desember' &&
  map.attCalYearLabel.innerText === '2027' &&
  map.attCalDaysGrid.innerHTML.includes('data-date="2027-12-15"'),
  'Month and Year Number Steppers update popover view cleanly (Desember 2027)'
);

ctx.selectAttendanceCalendarDate('2026-11-25');
assert(
  map.attFormDate.value === '2026-11-25' &&
  map.attStepperDayNum.innerText === '25' &&
  !map.attCalendarPopover.classList.contains('open'),
  'Selecting a date from the calendar updates #attFormDate, rolls display to 25, and closes popover'
);

console.log(`\n==============================================`);
console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
console.log(`==============================================`);
