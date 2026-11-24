const fs = require('fs');
const path = require('path');

console.log('=== VERIFYING BOTTOM NAVIGATION IMPLEMENTATION ===');

// 1. Read preview.html and inspect bottom-nav-fixed
const previewHtml = fs.readFileSync(path.join(__dirname, '..', 'preview.html'), 'utf-8');
const startIdx = previewHtml.indexOf('<div class="bottom-nav-fixed">');
if (startIdx === -1) {
  console.error('FAIL: .bottom-nav-fixed block not found in preview.html');
  process.exit(1);
}
const endIdx = previewHtml.indexOf('<!-- ================= HALAMAN 4: MODUL DATA SANTRI', startIdx);
const navContent = previewHtml.substring(startIdx, endIdx);

const tabMatches = [...navContent.matchAll(/<span class="tab-label[^"]*" id="tabLabel(\d+)">([^<]+)<\/span>/g)];

console.log(`Tabs found in .bottom-nav-fixed: ${tabMatches.length}`);
if (tabMatches.length !== 5) {
  console.error(`FAIL: Expected 5 tabs, found ${tabMatches.length}`);
  process.exit(1);
}

const expectedTabs = ['Beranda', 'Absensi', 'Data Santri', 'Laporan', 'Pengaturan'];
tabMatches.forEach((m, idx) => {
  const index = parseInt(m[1], 10);
  const title = m[2].trim();
  console.log(`  Tab ${index}: "${title}"`);
  if (index !== idx || title !== expectedTabs[idx]) {
    console.error(`FAIL: Tab ${idx} mismatch. Got index ${index}, title "${title}". Expected ${idx}, "${expectedTabs[idx]}"`);
    process.exit(1);
  }
});
console.log('PASS: preview.html contains all 5 tabs in correct sequence!');

// 2. Read auth.js and verify switchNavTab logic
const authJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'auth.js'), 'utf-8');

if (!authJs.includes("if (index === 2) {\n        openStudentListPage();\n        return;\n      }")) {
  console.error('FAIL: switchNavTab(2) does not route to openStudentListPage()');
  process.exit(1);
}
console.log('PASS: switchNavTab(2) correctly routes to openStudentListPage()');

if (!authJs.includes("if (index === 3) {\n        const isAdmin = currentLoggedInUser && currentLoggedInUser.role === 'Admin';\n        if (isAdmin) {\n          openAttendanceReportPage();")) {
  console.error('FAIL: switchNavTab(3) does not route to openAttendanceReportPage()');
  process.exit(1);
}
console.log('PASS: switchNavTab(3) correctly routes to openAttendanceReportPage() with admin check');

if (!authJs.includes("if (index === 4) {\n        openSettingsPage();\n        return;\n      }")) {
  console.error('FAIL: switchNavTab(4) does not route to openSettingsPage()');
  process.exit(1);
}
console.log('PASS: switchNavTab(4) correctly routes to openSettingsPage()');

// 3. Verify syncActiveNav has bottom nav tab sync
if (!authJs.includes("'students': 2") || !authJs.includes("tabPill") || !authJs.includes("tabUnderline")) {
  console.error('FAIL: syncActiveNav missing bottom nav tab synchronization');
  process.exit(1);
}
console.log('PASS: syncActiveNav includes 5-tab active state synchronization!');

// 4. Read home.css and verify bottom-nav-fixed styling
const homeCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'home.css'), 'utf-8');
if (!homeCss.includes('.bottom-nav-fixed') || !homeCss.includes('@media (max-width: 767px)')) {
  console.error('FAIL: home.css missing .bottom-nav-fixed responsive style');
  process.exit(1);
}
console.log('PASS: home.css has responsive mobile bottom nav styles!');

console.log('\n==============================================');
console.log('ALL BOTTOM NAVIGATION TESTS PASSED (100%)!');
console.log('==============================================');
