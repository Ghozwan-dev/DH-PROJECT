const fs = require('fs');
const path = require('path');

console.log('=== TEST: ADMIN PIE CHART & MENU ROW REMOVAL ===');

const previewHtml = require('../scripts/html-assembler').loadPreviewHtml();

// 1. Verify .main-menu-row and .summary-card (Ringkasan Absensi) are completely removed
if (previewHtml.includes('class="main-menu-row"') || previewHtml.includes('id="homeMenuStudent"')) {
  console.error('FAIL: .main-menu-row or homeMenuStudent is still present in preview.html');
  process.exit(1);
}
console.log('PASS: .main-menu-row (4 cards) successfully removed from homepage!');

if (previewHtml.includes('class="summary-card"') || previewHtml.includes('<span>Ringkasan Absensi</span>')) {
  console.error('FAIL: .summary-card (Ringkasan Absensi) is still present in preview.html');
  process.exit(1);
}
console.log('PASS: .summary-card (Ringkasan Absensi) successfully removed from homepage!');

// 2. Verify admin chart card and its elements exist
if (!previewHtml.includes('id="adminAttendanceChartCard"')) {
  console.error('FAIL: #adminAttendanceChartCard not found in preview.html');
  process.exit(1);
}
if (!previewHtml.includes('id="attendancePieChartSvg"')) {
  console.error('FAIL: #attendancePieChartSvg not found in preview.html');
  process.exit(1);
}
if (!previewHtml.includes('id="chartClassSelect"')) {
  console.error('FAIL: #chartClassSelect not found in preview.html');
  process.exit(1);
}
if (!previewHtml.includes('legend-card hadir') || !previewHtml.includes('legend-card izin') ||
    !previewHtml.includes('legend-card sakit') || !previewHtml.includes('legend-card alpa')) {
  console.error('FAIL: Legend cards for hadir, izin, sakit, alpa not all found');
  process.exit(1);
}
if (!previewHtml.includes('id="chartDetailCloseBtn"') || previewHtml.includes('class="chart-detail-close" onclick="closeChartStatusDetail()">&times;')) {
  console.error('FAIL: #chartDetailCloseBtn should use centered SVG icon instead of &times;');
  process.exit(1);
}
console.log('PASS: #adminAttendanceChartCard markup with SVG, 4 legend items, and centered SVG close button present!');

// 3. Test auth.js logic & role-based visibility with real student & attendance data
const authJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'auth.js'), 'utf-8');
const studentJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'student.js'), 'utf-8');
const scheduleJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'schedule.js'), 'utf-8');

if (!authJs.includes('renderAttendancePieChart') || !authJs.includes('classAttendanceStats') || !authJs.includes('onClassChartFilterChange')) {
  console.error('FAIL: auth.js missing renderAttendancePieChart or classAttendanceStats functions');
  process.exit(1);
}
console.log('PASS: auth.js contains all required chart data and rendering functions!');

// 4. Test DOM simulation of updateHomeDisplayForRole and onClassChartFilterChange
const mockDocument = {
  elements: {},
  getElementById: function(id) {
    if (!this.elements[id]) {
      this.elements[id] = {
        id: id,
        style: {},
        classList: {
          classes: new Set(),
          add: function(c) { this.classes.add(c); },
          remove: function(c) { this.classes.delete(c); },
          contains: function(c) { return this.classes.has(c); }
        },
        innerText: '',
        innerHTML: '',
        value: '',
        attributes: {},
        setAttribute: function(k, v) { this.attributes[k] = v; },
        getAttribute: function(k) { return this.attributes[k]; }
      };
    }
    return this.elements[id];
  },
  querySelector: function() { return null; },
  querySelectorAll: function() { return []; },
  addEventListener: function() {}
};

// Create chart elements in mockDocument
['adminAttendanceChartCard', 'attendancePieChartSvg', 'pieCenterRate', 'pieCenterLabel', 'chartClassSelect',
 'legendCardHadir', 'legendCardIzin', 'legendCardSakit', 'legendCardAlpa',
 'legendPctHadir', 'legendPctIzin', 'legendPctSakit', 'legendPctAlpa',
 'legendCountHadir', 'legendCountIzin', 'legendCountSakit', 'legendCountAlpa',
 'chartStatusDetailPanel', 'chartStatusDetailList', 'chartDetailHeading', 'chartDetailSubheading', 'chartDetailBadgeIcon', 'chartDetailCloseBtn',
 'chartDetailTabs', 'chartDetailTabsPill', 'chartTabHadir', 'chartTabIzin', 'chartTabSakit', 'chartTabAlpa',
 'homeRoleLabel', 'demoBtnAdmin', 'demoBtnGuru', 'popoverUserName', 'popoverUserEmail',
 'navbarUserName', 'navbarUserRole', 'navbarUserAvatar', 'sidebarUserName', 'sidebarUserRoleBadge',
 'sidebarUserAvatar', 'topNavbarRoleText', 'navLinkReport', 'sbItemReport',
 'popoverItemAdmin', 'popoverItemGuru', 'homeMenuPengaturan', 'statHadir', 'statIzin', 'statAlpha',
 'pageStudentList', 'pageStudentDetail', 'pageScheduleList', 'pageScheduleDetail'
].forEach(id => mockDocument.getElementById(id));

for (let i = 0; i <= 4; i++) {
  mockDocument.getElementById('tabPill' + i);
  mockDocument.getElementById('tabLabel' + i);
  mockDocument.getElementById('tabUnderline' + i);
}

const vm = require('vm');
const sandbox = {
  document: mockDocument,
  window: { scrollTo: function() {} },
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  formatIndoDate: function() { return ''; }
};

vm.createContext(sandbox);
vm.runInContext(authJs, sandbox);
vm.runInContext(studentJs, sandbox);
vm.runInContext(scheduleJs, sandbox);

const api = {
  updateHomeDisplayForRole: sandbox.updateHomeDisplayForRole,
  renderAttendancePieChart: sandbox.renderAttendancePieChart,
  onClassChartFilterChange: sandbox.onClassChartFilterChange,
  syncClassAttendanceStats: sandbox.syncClassAttendanceStats,
  toggleChartStatusDetail: sandbox.toggleChartStatusDetail,
  closeChartStatusDetail: sandbox.closeChartStatusDetail,
  mockAttendanceRecords: vm.runInContext('mockAttendanceRecords', sandbox)
};

// Test Admin display (Semua Kelas -> 12 Hadir, 2 Izin, 1 Sakit, 1 Alpa = 16 total -> 75.0% Hadir)
api.updateHomeDisplayForRole('Admin');
const chartEl = mockDocument.getElementById('adminAttendanceChartCard');
if (chartEl.style.display !== 'block') {
  console.error('FAIL: Expected adminAttendanceChartCard to be "block" for Admin, got ' + chartEl.style.display);
  process.exit(1);
}
console.log('PASS: Chart is visible (display: block) for Admin role!');

const allPctHadir = mockDocument.getElementById('legendPctHadir').innerText;
const allCntHadir = mockDocument.getElementById('legendCountHadir').innerText;
console.log(`  Semua Kelas -> Hadir: ${allPctHadir} (${allCntHadir})`);
if (!allPctHadir.includes('75.0') || !allCntHadir.includes('12 Santri')) {
  console.error(`FAIL: Expected 75.0% and 12 Santri for Semua Kelas, got ${allPctHadir} and ${allCntHadir}`);
  process.exit(1);
}
console.log('PASS: Semua Kelas percentage accurately computed from real attendance records (75.0%, 12 Santri)!');

// Test Guru display
api.updateHomeDisplayForRole('Guru');
if (chartEl.style.display !== 'none') {
  console.error('FAIL: Expected adminAttendanceChartCard to be "none" for Guru, got ' + chartEl.style.display);
  process.exit(1);
}
console.log('PASS: Chart is hidden (display: none) for Guru role!');

// Test Class filter change: Kelas VII A -> 3 Hadir / 3 total = 100.0%
api.updateHomeDisplayForRole('Admin');
api.onClassChartFilterChange('Kelas VII A');
const pctHadir = mockDocument.getElementById('legendPctHadir').innerText;
const cntHadir = mockDocument.getElementById('legendCountHadir').innerText;
console.log(`  Kelas VII A -> Hadir: ${pctHadir} (${cntHadir})`);
if (!pctHadir.includes('100.0') || !cntHadir.includes('3 Santri')) {
  console.error(`FAIL: Expected 100.0% and 3 Santri for Kelas VII A, got ${pctHadir} and ${cntHadir}`);
  process.exit(1);
}
console.log('PASS: Class filter accurately updates pie chart and metrics for Kelas VII A!');

// Test Class filter change: Kelas VII B -> 1 Hadir, 1 Sakit = 50.0%
api.onClassChartFilterChange('Kelas VII B');
const pctHadir7B = mockDocument.getElementById('legendPctHadir').innerText;
const cntHadir7B = mockDocument.getElementById('legendCountHadir').innerText;
const cntSakit7B = mockDocument.getElementById('legendCountSakit').innerText;
console.log(`  Kelas VII B -> Hadir: ${pctHadir7B} (${cntHadir7B}, Sakit: ${cntSakit7B})`);
if (!pctHadir7B.includes('50.0') || !cntHadir7B.includes('1 Santri') || !cntSakit7B.includes('1 Santri')) {
  console.error(`FAIL: Expected 50.0%, 1 Santri Hadir, 1 Santri Sakit for Kelas VII B, got ${pctHadir7B}, ${cntHadir7B}, ${cntSakit7B}`);
  process.exit(1);
}
console.log('PASS: Class filter accurately updates pie chart and metrics for Kelas VII B!');

// Test dynamic live update when new attendance is added
api.mockAttendanceRecords.push({
  id: 'ATT-LIVE',
  scheduleId: 'sch_007',
  date: '2026-11-27',
  className: 'VII A',
  subject: 'Akidah Akhlak',
  items: [
    { studentId: 'SNT-001', studentNis: '2024001', studentName: 'Ahmad Fauzi', status: 'izin', note: 'Sakit ringan' }
  ]
});
api.onClassChartFilterChange('Kelas VII A');
const updatedPct7A = mockDocument.getElementById('legendPctHadir').innerText;
const updatedIzin7A = mockDocument.getElementById('legendCountIzin').innerText;
console.log(`  Kelas VII A (after new record) -> Hadir: ${updatedPct7A}, Izin: ${updatedIzin7A}`);
if (!updatedPct7A.includes('75.0') || !updatedIzin7A.includes('1 Santri')) {
  console.error(`FAIL: Expected live update to 75.0% Hadir and 1 Santri Izin for Kelas VII A, got ${updatedPct7A} and ${updatedIzin7A}`);
  process.exit(1);
}
console.log('PASS: Pie chart recalculates dynamically when attendance records change!');

// Test interactive criteria click (Hadir, Izin, Sakit, Alpa)
api.onClassChartFilterChange('Semua Kelas');
api.toggleChartStatusDetail('izin');
const detailPanel = mockDocument.getElementById('chartStatusDetailPanel');
const detailListHtml = mockDocument.getElementById('chartStatusDetailList').innerHTML;
const detailHeading = mockDocument.getElementById('chartDetailHeading').innerText;
if (!detailPanel.classList.contains('open') || !detailHeading.includes('Izin')) {
  console.error('FAIL: Clicking Izin did not open #chartStatusDetailPanel with Izin heading');
  process.exit(1);
}
if (!detailListHtml.includes('Nabila Nur Azizah') || !detailListHtml.includes('Kelas VIII A') || !detailListHtml.includes('Fiqih')) {
  console.error('FAIL: Izin list missing expected student name, class, and subject');
  process.exit(1);
}
if (!mockDocument.getElementById('legendCardIzin').classList.contains('active')) {
  console.error('FAIL: legendCardIzin did not receive active class');
  process.exit(1);
}
if (mockDocument.getElementById('chartDetailTabsPill').style.opacity !== '1') {
  console.error('FAIL: Apple segmented pill #chartDetailTabsPill did not activate on criterion click');
  process.exit(1);
}
console.log('PASS: Clicking "Izin" opens Apple-animated detail drawer, sliding segmented pill, and student list!');

api.toggleChartStatusDetail('sakit');
const sakitHtml = mockDocument.getElementById('chartStatusDetailList').innerHTML;
if (!sakitHtml.includes('Khadijah Al-Kubro') || !sakitHtml.includes('Kelas VII B') || !sakitHtml.includes("Al-Qur'an Hadits")) {
  console.error('FAIL: Sakit list missing Khadijah Al-Kubro, Kelas VII B, Al-Qur\'an Hadits');
  process.exit(1);
}
console.log('PASS: Switching to "Sakit" updates drawer with Khadijah Al-Kubro (Kelas VII B, Al-Qur\'an Hadits)!');

api.toggleChartStatusDetail('alpa');
const alpaHtml = mockDocument.getElementById('chartStatusDetailList').innerHTML;
if (!alpaHtml.includes('Maryam Salsabila') || !alpaHtml.includes('Kelas IX B') || !alpaHtml.includes("Tahfidz Al-Qur'an")) {
  console.error('FAIL: Alpa list missing Maryam Salsabila, Kelas IX B, Tahfidz Al-Qur\'an');
  process.exit(1);
}
console.log('PASS: Switching to "Alpa" updates drawer with Maryam Salsabila (Kelas IX B, Tahfidz Al-Qur\'an)!');

// Clicking the same active criterion again closes the drawer
api.toggleChartStatusDetail('alpa');
if (detailPanel.classList.contains('open')) {
  console.error('FAIL: Clicking active criterion again did not collapse detail drawer');
  process.exit(1);
}
console.log('PASS: Clicking active criterion again smoothly collapses detail drawer!');

console.log('\n==============================================');
console.log('ALL ADMIN PIE CHART TESTS PASSED (100%)!');
console.log('==============================================');
