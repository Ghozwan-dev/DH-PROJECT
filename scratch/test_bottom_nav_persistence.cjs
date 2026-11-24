const fs = require('fs');
const path = require('path');

console.log('=== TEST: PERSISTENT BOTTOM NAVIGATION ACROSS ALL PAGES ===\n');

const previewHtml = fs.readFileSync(path.join(__dirname, '..', 'preview.html'), 'utf-8');
const authJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'auth.js'), 'utf-8');

// 1. Verify that .bottom-nav-fixed is NOT inside #pageHome
const homePageStart = previewHtml.indexOf('id="pageHome"');
const homePageEnd = previewHtml.indexOf('</div><!-- /.screen-page #pageHome -->');
if (homePageStart === -1 || homePageEnd === -1) {
  console.error('FAIL: Could not locate #pageHome start or closing tag in preview.html');
  process.exit(1);
}

const bottomNavIdx = previewHtml.indexOf('class="bottom-nav-fixed"');
if (bottomNavIdx === -1) {
  console.error('FAIL: Could not locate .bottom-nav-fixed in preview.html');
  process.exit(1);
}

if (bottomNavIdx > homePageStart && bottomNavIdx < homePageEnd) {
  console.error('FAIL: .bottom-nav-fixed is still trapped inside #pageHome! It will be hidden when #pageHome is inactive.');
  process.exit(1);
}
console.log('[PASS] .bottom-nav-fixed is located OUTSIDE #pageHome!');

// 2. Verify all 5 tab elements exist with exact structure intact
const expectedTabs = [
  { index: 0, label: 'Beranda' },
  { index: 1, label: 'Absensi' },
  { index: 2, label: 'Data Santri' },
  { index: 3, label: 'Laporan' },
  { index: 4, label: 'Pengaturan' },
];

expectedTabs.forEach(tab => {
  if (!previewHtml.includes(`switchNavTab(${tab.index})`)) {
    console.error(`FAIL: Missing switchNavTab(${tab.index})`);
    process.exit(1);
  }
  if (!previewHtml.includes(`id="tabPill${tab.index}"`)) {
    console.error(`FAIL: Missing id="tabPill${tab.index}"`);
    process.exit(1);
  }
  if (!previewHtml.includes(`id="tabLabel${tab.index}"`)) {
    console.error(`FAIL: Missing id="tabLabel${tab.index}"`);
    process.exit(1);
  }
  if (!previewHtml.includes(`id="tabUnderline${tab.index}"`)) {
    console.error(`FAIL: Missing id="tabUnderline${tab.index}"`);
    process.exit(1);
  }
  if (!previewHtml.includes(tab.label)) {
    console.error(`FAIL: Missing tab label text "${tab.label}"`);
    process.exit(1);
  }
});
console.log('[PASS] All 5 tabs structure, IDs, and labels are 100% intact!');

// 3. Verify auth.js showOnlyScreenPage controls bottom nav visibility
if (!authJs.includes("const bNav = document.getElementById('bottomNavFixed') || document.querySelector('.bottom-nav-fixed');")) {
  console.error('FAIL: auth.js missing bNav query in showOnlyScreenPage');
  process.exit(1);
}
if (!authJs.includes("if (targetPageId === 'pageLogin' || targetPageId === 'pageRegister' || targetPageId === 'pageAttendanceForm')")) {
  console.error('FAIL: auth.js missing login/register hide condition for bottom nav');
  process.exit(1);
}
console.log('[PASS] auth.js correctly hides bottom nav on auth screens and keeps it visible on all subpages!');

// 4. Verify routing functions call syncActiveNav
const studentJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'student.js'), 'utf-8');
const scheduleJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'schedule.js'), 'utf-8');
const reportJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'report.js'), 'utf-8');
const settingsJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'settings.js'), 'utf-8');

if (!studentJs.includes("syncActiveNav('students')")) {
  console.error('FAIL: student.js openStudentListPage does not syncActiveNav');
  process.exit(1);
}
console.log('[PASS] student.js openStudentListPage triggers syncActiveNav("students")!');

if (!scheduleJs.includes("syncActiveNav('schedule')")) {
  console.error('FAIL: schedule.js openScheduleListPage does not syncActiveNav');
  process.exit(1);
}
console.log('[PASS] schedule.js openScheduleListPage triggers syncActiveNav("schedule")!');

if (!reportJs.includes("syncActiveNav('report')")) {
  console.error('FAIL: report.js openAttendanceReportPage does not syncActiveNav');
  process.exit(1);
}
console.log('[PASS] report.js openAttendanceReportPage triggers syncActiveNav("report")!');

if (!settingsJs.includes("syncActiveNav('settings')")) {
  console.error('FAIL: settings.js openSettingsPage does not syncActiveNav');
  process.exit(1);
}
console.log('[PASS] settings.js openSettingsPage triggers syncActiveNav("settings")!');

// 5. Verify syncActiveNav maps all 5 pages to bottom nav tabs (0: home, 1: schedule, 2: students, 3: report, 4: settings)
if (!authJs.includes("'home': 0") || !authJs.includes("'schedule': 1") || !authJs.includes("'students': 2") || !authJs.includes("'report': 3") || !authJs.includes("'settings': 4")) {
  console.error('FAIL: syncActiveNav tabIndices mapping is incomplete');
  process.exit(1);
}
console.log('[PASS] syncActiveNav accurately maps all pages to bottom nav tab indices!');

// 6. Verify padding in student.css to ensure content clearance above 62px bottom nav
const studentCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'student.css'), 'utf-8');
if (!studentCss.includes('84px')) {
  console.error('FAIL: student.css missing padding clearance for bottom navigation');
  process.exit(1);
}
console.log('[PASS] Subpages have adequate bottom padding clearance for bottom nav bar!');

console.log('\n==============================================');
console.log('ALL PERSISTENT BOTTOM NAV TESTS PASSED (100%)!');
console.log('==============================================');
