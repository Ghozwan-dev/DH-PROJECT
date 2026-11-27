const fs = require('fs');
const path = require('path');
const { loadPreviewHtml, resolveHtmlIncludes } = require('../scripts/html-assembler');

console.log('=== TEST: MODULARISASI preview.html & STANDAR KODE SELANJUTNYA ===\n');

const rootDir = path.resolve(__dirname, '..');
const rawShell = fs.readFileSync(path.join(rootDir, 'preview.html'), 'utf8');
const shellLines = rawShell.split(/\r?\n/).length;
const assembled = loadPreviewHtml(rootDir);
const assembledLines = assembled.split(/\r?\n/).length;

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

assert(shellLines < 100, `preview.html shell is compact (${shellLines} lines < 100)`);
assert(!rawShell.includes('<style>') && !rawShell.includes('<style '), 'preview.html contains no inline <style> blocks');
assert(!/<script(?![^>]*\bsrc=)[^>]*>/i.test(rawShell), 'preview.html contains no inline <script> blocks');
assert(assembledLines > 2000, `Assembled HTML expands cleanly from modular partials (${assembledLines} lines)`);
assert(!assembled.includes('<!-- @include'), 'All @include directives resolved with zero leftovers');

const expectedPartials = [
  'assets/partials/layout/navbar.html',
  'assets/partials/layout/sidebar.html',
  'assets/partials/layout/bottom-nav.html',
  'assets/partials/pages/auth.html',
  'assets/partials/pages/home.html',
  'assets/partials/pages/students.html',
  'assets/partials/pages/schedule-list.html',
  'assets/partials/pages/schedule-detail.html',
  'assets/partials/pages/schedule-form.html',
  'assets/partials/pages/attendance.html',
  'assets/partials/pages/report.html',
  'assets/partials/pages/settings.html',
  'assets/partials/modals/attendance-modals.html',
  'assets/partials/modals/global-modals.html',
  'assets/partials/modals/teacher-reminder-toast.html',
];

expectedPartials.forEach(rel => {
  const full = path.join(rootDir, rel);
  const exists = fs.existsSync(full);
  assert(exists, `Partial exists: ${rel}`);
  if (exists) {
    const content = fs.readFileSync(full, 'utf8');
    const lines = content.split(/\r?\n/).length;
    assert(lines <= 400, `Partial ${rel} stays modular (${lines} lines <= 400)`);
    assert(!/<style\b/i.test(content) && !/<script\b/i.test(content), `Partial ${rel} has no inline <style> or <script>`);
  }
});

const expectedIds = [
  'appNavbar', 'teacherNotifBellBtn', 'roleDropdownBtn', 'appSidebar',
  'pageLogin', 'pageRegister', 'pageHome', 'pageStudentList', 'pageStudentDetail',
  'pageStudentForm', 'pageScheduleList', 'pageScheduleDetail', 'pageScheduleForm',
  'pageAttendanceForm', 'pageAttendanceReport', 'pageStudentRecapDetail',
  'pageSettings', 'settingsDetailModal', 'modalConfirmLogout',
  'attendanceConfirmModal', 'attendanceSubmenuModal', 'attendanceResultModal',
  'appToast', 'appModal', 'photoPickerModal', 'editReportModal', 'teacherReminderToast'
];

expectedIds.forEach(id => {
  assert(assembled.includes(`id="${id}"`), `Assembled HTML preserves element #${id}`);
});

// Verify modularization standards/rules exist
assert(fs.existsSync(path.join(rootDir, '.agents', 'rules', 'modularization.md')),
  '.agents/rules/modularization.md rule exists for future work');
assert(fs.existsSync(path.join(rootDir, 'GEMINI.md')),
  'GEMINI.md exists at workspace root');
assert(fs.existsSync(path.join(rootDir, 'docs', 'MODULARIZATION_STANDARD.md')),
  'docs/MODULARIZATION_STANDARD.md documentation exists');

// Verify path traversal protection in resolveHtmlIncludes
let blockedTraversal = false;
try {
  resolveHtmlIncludes('<!-- @include ../package.json -->', rootDir);
} catch (e) {
  blockedTraversal = true;
}
assert(blockedTraversal, 'resolveHtmlIncludes blocks path traversal outside workspace root');

console.log(`\n==============================================`);
console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
console.log(`==============================================`);
