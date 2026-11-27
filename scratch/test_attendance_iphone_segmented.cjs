const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TEST: ATTENDANCE IPHONE SEGMENTED CONTROL & SLIDING PILL ===\n');

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
  attendanceCss.includes('.att-status-chips') &&
  attendanceCss.includes('grid-template-columns: repeat(4, 1fr)') &&
  attendanceCss.includes('.att-status-sliding-pill') &&
  attendanceCss.includes('linear(') &&
  attendanceCss.includes('.att-status-sliding-pill.is-hadir') &&
  attendanceCss.includes('.att-status-sliding-pill.is-alfa'),
  'attendance.css defines iPhone segmented track, 4-column grid, white sliding thumb, and iOS spring easing'
);

function makeNode(id) {
  const cls = new Set();
  const attrs = {};
  const el = {
    id,
    style: {},
    dataset: {},
    innerText: '',
    offsetWidth: 70,
    _children: [],
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
    querySelectorAll: (sel) => sel === '.att-chip' ? el._children : []
  };
  Object.defineProperty(el, 'className', {
    get: () => el._clsStr || '',
    set: (v) => {
      el._clsStr = v;
      cls.clear();
      String(v).split(/\s+/).filter(Boolean).forEach(x => cls.add(x));
    }
  });
  return el;
}

const byId = {
  attStudentListContainer: makeNode('attStudentListContainer'),
  attStudentCountLabel: makeNode('attStudentCountLabel'),
  attValidationBanner: makeNode('attValidationBanner'),
  attStatH: makeNode('attStatH'),
  attStatI: makeNode('attStatI'),
  attStatS: makeNode('attStatS'),
  attStatA: makeNode('attStatA'),
  attStatU: makeNode('attStatU'),
  attStatUnassignedWrap: makeNode('attStatUnassignedWrap')
};

function hydrateMockCards(html) {
  ['s1', 's2'].forEach((sid) => {
    const chipsWrap = makeNode('attChips_' + sid);
    const pill = makeNode('attStatusPill_' + sid);
    const pillMatch = html.match(new RegExp(`id="attStatusPill_${sid}" data-idx="(\\d+)" style="([^"]*)"`));
    if (pillMatch) {
      pill.dataset.idx = pillMatch[1];
      if (pillMatch[2].includes('opacity:1')) pill.style.opacity = '1';
      else pill.style.opacity = '0';
      const txMatch = pillMatch[2].match(/transform:([^;]+)/);
      if (txMatch) pill.style.transform = txMatch[1];
    }
    const btns = ['hadir', 'izin', 'sakit', 'alfa'].map((st) => {
      const b = makeNode('');
      b.setAttribute('data-status', st);
      b.className = html.includes(`data-status="${st}" onclick="setAttendanceItemStatus('${sid}'`) ? 'att-chip' : 'att-chip';
      return b;
    });
    chipsWrap._children = btns;
    byId['attCard_' + sid] = makeNode('attCard_' + sid);
    byId['attChips_' + sid] = chipsWrap;
    byId['attStatusPill_' + sid] = pill;
    byId['attUnassignedWarn_' + sid] = makeNode('attUnassignedWarn_' + sid);
    byId['attUnassignedBadge_' + sid] = makeNode('attUnassignedBadge_' + sid);
    byId['attNotesWrap_' + sid] = makeNode('attNotesWrap_' + sid);
  });
}

Object.defineProperty(byId.attStudentListContainer, 'innerHTML', {
  get: () => byId.attStudentListContainer._html || '',
  set: (v) => {
    byId.attStudentListContainer._html = v;
    hydrateMockCards(v);
  }
});

const ctx = {
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  currentLoggedInUser: { id: 'u1', fullName: 'Admin', role: 'Admin' },
  mockSchedules: [
    { id: 'sch_001', className: 'VII A', subject: 'Fiqih', teacherName: 'Ustadz Ahmad', periodNumber: 1, startTime: '07:30', endTime: '08:15' }
  ],
  mockStudents: [
    { id: 's1', nis: '101', fullName: 'Ahmad', className: 'VII A', gender: 'Putra', isActive: true },
    { id: 's2', nis: '102', fullName: 'Budi', className: 'VII A', gender: 'Putra', isActive: true }
  ],
  mockAttendanceRecords: [],
  currentAttendanceScheduleId: 'sch_001',
  currentAttendanceDate: '2026-11-27',
  currentAttendanceItems: [
    { studentId: 's1', studentNis: '101', studentName: 'Ahmad', gender: 'Putra', avatar: '', status: 'hadir', note: '' },
    { studentId: 's2', studentNis: '102', studentName: 'Budi', gender: 'Putra', avatar: '', status: '', note: '' }
  ],
  attendanceValidationActive: false,
  document: {
    getElementById: id => byId[id] || null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {}
  },
  window: { addEventListener: () => {} },
  requestAnimationFrame: cb => cb(),
  showToast: () => {}
};

vm.runInNewContext(attendanceJs, ctx);
ctx.renderAttendanceStudentList();

const pillS1Before = byId.attStatusPill_s1;
const pillS2Before = byId.attStatusPill_s2;

assert(
  pillS1Before.style.opacity === '1' &&
  pillS1Before.style.transform.includes('translate3d(0%, 0, 0)'),
  'Student 1 starts with pill positioned at Hadir (0%)'
);
assert(
  pillS2Before.style.opacity === '0',
  'Student 2 (unassigned) starts with hidden pill (opacity: 0)'
);

ctx.setAttendanceItemStatus('s1', 'sakit');
assert(
  byId.attStatusPill_s1 === pillS1Before &&
  pillS1Before.style.transform === 'translate3d(200%, 0, 0)' &&
  pillS1Before.classList.contains('is-sakit') &&
  byId.attNotesWrap_s1.style.display === 'block',
  'Clicking Sakit slides Student 1 pill in-place to 200% (is-sakit) and shows note input without recreating DOM'
);

ctx.setAttendanceItemStatus('s1', 'sakit');
assert(
  pillS1Before.style.opacity === '0' &&
  pillS1Before.style.transform.includes('scale(0.92)') &&
  byId.attNotesWrap_s1.style.display === 'none',
  'Toggling Sakit off smoothly dissolves pill and hides note input'
);

ctx.quickMarkAllStatus('izin');
assert(
  byId.attStatusPill_s1 === pillS1Before &&
  byId.attStatusPill_s2 === pillS2Before &&
  pillS1Before.style.transform === 'translate3d(100%, 0, 0)' &&
  pillS2Before.style.transform === 'translate3d(100%, 0, 0)' &&
  pillS1Before.classList.contains('is-izin') &&
  pillS2Before.classList.contains('is-izin'),
  'quickMarkAllStatus("izin") slides all cards pills in-place to 100% (is-izin)'
);

console.log(`\n==============================================`);
console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
console.log(`==============================================`);
