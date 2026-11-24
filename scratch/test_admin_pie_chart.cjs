const fs = require('fs');
const path = require('path');

console.log('=== TEST: ADMIN PIE CHART & MENU ROW REMOVAL ===');

const previewHtml = fs.readFileSync(path.join(__dirname, '..', 'preview.html'), 'utf-8');

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
console.log('PASS: #adminAttendanceChartCard markup with SVG and 4 legend items present!');

// 3. Test auth.js logic & role-based visibility
const authJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'auth.js'), 'utf-8');

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
        value: ''
      };
    }
    return this.elements[id];
  },
  querySelector: function() { return null; },
  querySelectorAll: function() { return []; },
  addEventListener: function() {}
};

// Create chart elements in mockDocument
['adminAttendanceChartCard', 'attendancePieChartSvg', 'pieCenterRate', 'chartClassSelect',
 'legendPctHadir', 'legendPctIzin', 'legendPctSakit', 'legendPctAlpa',
 'legendCountHadir', 'legendCountIzin', 'legendCountSakit', 'legendCountAlpa',
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

const context = {
  document: mockDocument,
  window: { scrollTo: function() {} },
  currentDetailStudentId: null,
  currentDetailScheduleId: null,
  formatIndoDate: function() { return ''; }
};

const runScript = new Function('document', 'window', 'currentDetailStudentId', 'currentDetailScheduleId', `
  ${authJs}
  return {
    updateHomeDisplayForRole,
    renderAttendancePieChart,
    onClassChartFilterChange,
    classAttendanceStats,
    currentLoggedInUser
  };
`);

const api = runScript(mockDocument, context.window, null, null);

// Test Admin display
api.updateHomeDisplayForRole('Admin');
const chartEl = mockDocument.getElementById('adminAttendanceChartCard');
if (chartEl.style.display !== 'block') {
  console.error('FAIL: Expected adminAttendanceChartCard to be "block" for Admin, got ' + chartEl.style.display);
  process.exit(1);
}
console.log('PASS: Chart is visible (display: block) for Admin role!');

// Test Guru display
api.updateHomeDisplayForRole('Guru');
if (chartEl.style.display !== 'none') {
  console.error('FAIL: Expected adminAttendanceChartCard to be "none" for Guru, got ' + chartEl.style.display);
  process.exit(1);
}
console.log('PASS: Chart is hidden (display: none) for Guru role!');

// Test Class filter change
api.updateHomeDisplayForRole('Admin');
api.onClassChartFilterChange('Kelas VII A');
const pctHadir = mockDocument.getElementById('legendPctHadir').innerText;
const cntHadir = mockDocument.getElementById('legendCountHadir').innerText;
console.log(`  Kelas VII A -> Hadir: ${pctHadir} (${cntHadir})`);
if (!pctHadir.includes('88.9') || !cntHadir.includes('32 Santri')) {
  console.error(`FAIL: Expected 88.9% and 32 Santri for Kelas VII A, got ${pctHadir} and ${cntHadir}`);
  process.exit(1);
}
console.log('PASS: Class filter accurately updates pie chart and metrics for Kelas VII A!');

api.onClassChartFilterChange('Kelas VIII A');
const pctHadir8 = mockDocument.getElementById('legendPctHadir').innerText;
const cntHadir8 = mockDocument.getElementById('legendCountHadir').innerText;
console.log(`  Kelas VIII A -> Hadir: ${pctHadir8} (${cntHadir8})`);
if (!pctHadir8.includes('94.4') || !cntHadir8.includes('34 Santri')) {
  console.error(`FAIL: Expected 94.4% and 34 Santri for Kelas VIII A, got ${pctHadir8} and ${cntHadir8}`);
  process.exit(1);
}
console.log('PASS: Class filter accurately updates pie chart and metrics for Kelas VIII A!');

console.log('\n==============================================');
console.log('ALL ADMIN PIE CHART TESTS PASSED (100%)!');
console.log('==============================================');
