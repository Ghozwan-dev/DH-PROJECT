const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TEST: SISTEM NOTIFIKASI PENGINGAT UNTUK GURU ===\n');

const previewHtml = require('../scripts/html-assembler').loadPreviewHtml();
const homeCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'home.css'), 'utf8');
const authJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'auth.js'), 'utf8');
const scheduleJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'schedule.js'), 'utf8');
const attendanceJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'attendance.js'), 'utf8');
const settingsJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'settings.js'), 'utf8');
const notifJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'notifications.js'), 'utf8');

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

// 1. Markup & CSS checks
assert(previewHtml.includes('id="teacherNotifBellBtn"'), 'preview.html includes #teacherNotifBellBtn in navbar');
assert(previewHtml.includes('id="teacherNotifPanel"'), 'preview.html includes #teacherNotifPanel dropdown');
assert(!previewHtml.includes('id="teacherReminderCard"'), 'preview.html does NOT render inline #teacherReminderCard on homepage');
assert(!previewHtml.includes("openSettingDetail('notifications')"), 'Notification panel does NOT expose settings/edit shortcut');
assert(!previewHtml.includes('id="btnSimulateTeacherNotif"'), 'Notification panel does NOT expose test/edit toolbar buttons');
assert(!previewHtml.includes('markAllTeacherNotifsRead()'), 'Notification panel does NOT expose mark-all-read edit button');
assert(previewHtml.includes('id="teacherReminderToast"'), 'preview.html includes #teacherReminderToast floating alert');
assert(previewHtml.includes('assets/js/notifications.js'), 'preview.html loads assets/js/notifications.js');

assert(homeCss.includes('.notif-bell-btn'), 'home.css defines .notif-bell-btn');
assert(homeCss.includes('.notif-popover'), 'home.css defines .notif-popover');
assert(homeCss.includes('.notif-today-section'), 'home.css defines .notif-today-section');
assert(homeCss.includes('.reminder-floating-toast'), 'home.css defines .reminder-floating-toast');

// 2. Sandbox simulation
const domElements = {};
function makeEl(id) {
  return {
    id,
    style: { display: 'none' },
    innerHTML: '',
    innerText: '',
    value: '',
    checked: true,
    classList: {
      _set: new Set(),
      add(c) { this._set.add(c); },
      remove(c) { this._set.delete(c); },
      contains(c) { return this._set.has(c); }
    },
    onclick: null
  };
}

const neededIds = [
  'teacherNotifBadge', 'teacherNotifBellBtn', 'teacherNotifPanel', 'teacherNotifList',
  'teacherNotifPanelSubtitle', 'btnEnableBrowserNotif', 'btnSimulateTeacherNotif',
  'teacherReminderCard', 'teacherReminderDateBadge', 'teacherReminderCardBody',
  'teacherReminderToast', 'teacherReminderToastTitle', 'teacherReminderToastDesc',
  'teacherReminderToastAction', 'homeRoleLabel', 'popoverUserName', 'popoverUserEmail',
  'adminAttendanceChartCard', 'homeActivitiesList', 'settingsDetailModal',
  'settingsModalTitle', 'settingsModalSubtitle', 'settingsModalIcon', 'settingsModalBody'
];
neededIds.forEach(id => { domElements[id] = makeEl(id); });

const toasts = [];
let openedAttendanceArgs = null;

const sandbox = {
  console,
  Date,
  Math,
  Number,
  String,
  Array,
  Object,
  JSON,
  setTimeout: () => 1,
  clearTimeout: () => {},
  setInterval: () => 1,
  clearInterval: () => {},
  document: {
    getElementById(id) {
      if (!domElements[id]) domElements[id] = makeEl(id);
      return domElements[id];
    },
    querySelector() { return makeEl('q'); },
    querySelectorAll() { return []; },
    addEventListener() {}
  },
  showToast(msg, type) {
    toasts.push({ msg, type });
  },
  mockStudents: [
    { id: 'SNT-001', nis: '2024001', fullName: 'Ahmad Fauzi', className: 'VIII A', isActive: true }
  ],
  showOnlyScreenPage() {},
  syncActiveNav() {},
  openScheduleListPage() {},
  renderAttendancePieChart() {},
  openStudentListPage() {},
  openScheduleDetail() {}
};

vm.createContext(sandbox);
vm.runInContext(authJs, sandbox);
vm.runInContext(scheduleJs, sandbox);
vm.runInContext(attendanceJs, sandbox);
vm.runInContext(settingsJs, sandbox);
vm.runInContext(notifJs, sandbox);

// Wrap openAttendanceForm so we can assert call arguments while running real attendanceJs
vm.runInContext(`
  const _origOpenAtt = openAttendanceForm;
  openAttendanceForm = function(scheduleId, targetDate) {
    _capturedAttCall = { scheduleId, targetDate };
  };
`, sandbox);

// Test A: Guru upcoming schedule reminder (Senin 07:20 -> 10 mins before 07:30 sch_001)
vm.runInContext("currentLoggedInUser = mockUsers[1];", sandbox); // Ustadz Ahmad Fauzi (Guru)
const monday0720 = new Date(2026, 10, 23, 7, 20, 0); // Monday Nov 23 2026 07:20
const mondayNotifs = sandbox.refreshTeacherReminders({ nowDate: monday0720, silent: true });

assert(mondayNotifs.some(n => n.type === 'upcoming_class' && n.scheduleId === 'sch_001'),
  'Guru receives upcoming_class reminder 10 minutes before Monday 07:30 Fiqih class');
assert(!mondayNotifs.some(n => n.type === 'schedule_change'),
  'Guru does NOT receive generic Ringkasan Jadwal Mengajar info notification');
assert(mondayNotifs.every(n => n.scheduleId === 'sch_001' || n.scheduleId === 'sch_005'),
  'All Monday notifications for Ustadz Ahmad Fauzi belong exclusively to his schedules (sch_001, sch_005)');
assert(!domElements['teacherNotifList'].innerHTML.includes('Jadwal Mengajar Hari Ini'),
  'Duplicate Jadwal Mengajar Hari Ini block is removed from notification panel');
assert(domElements['teacherNotifList'].innerHTML.includes('Segera Masuk: Fiqih (VII A)') &&
  domElements['teacherNotifList'].innerHTML.includes('10 menit lagi'),
  'Notification bell panel displays exact upcoming reminder "Segera Masuk: Fiqih (VII A)" and "10 menit lagi"');
assert(Number(domElements['teacherNotifBadge'].innerText) >= 1,
  'Unread notification badge displays count >= 1');

// Test B: Guru missing attendance reminder (Senin 08:30 -> sch_001 already ended, sch_005 ongoing)
const monday0830 = new Date(2026, 10, 23, 8, 30, 0);
const ongoingNotifs = sandbox.refreshTeacherReminders({ nowDate: monday0830, silent: true });
assert(ongoingNotifs.some(n => n.type === 'missing_attendance' && n.scheduleId === 'sch_001'),
  'Guru receives missing_attendance reminder for ended class without attendance record');
assert(ongoingNotifs.some(n => n.type === 'missing_attendance' && n.scheduleId === 'sch_005'),
  'Guru receives missing_attendance reminder for ongoing class without attendance record');

// Test C: Mark attendance recorded -> reminder automatically resolved
vm.runInContext(`
  mockAttendanceRecords.unshift({
    id: 'ATT-TEST',
    scheduleId: 'sch_001',
    date: '2026-11-23',
    className: 'VII A',
    subject: 'Fiqih',
    items: []
  });
`, sandbox);
sandbox.markScheduleReminderResolved('sch_001', '2026-11-23');
const afterResolve = sandbox.refreshTeacherReminders({ nowDate: monday0830, silent: true });
assert(!afterResolve.some(n => n.scheduleId === 'sch_001' && !n.isRead),
  'Reminder for sch_001 is resolved and removed from unread notifications after attendance is saved');

// Test D: Admin mode shows pending teacher sessions in notification panel and allows sending manual reminder
vm.runInContext("currentLoggedInUser = mockUsers[0];", sandbox); // Admin
const adminNotifs = sandbox.refreshTeacherReminders({ nowDate: monday0830, silent: true });
assert(!domElements['teacherNotifList'].innerHTML.includes('Jadwal Mengajar Hari Ini'),
  'Teacher daily schedule section is not shown inside Admin notification panel');
assert(adminNotifs.some(n => n.type === 'admin_monitor'),
  'Admin sees pending teacher sessions in notification panel');

sandbox.sendManualTeacherReminder('sch_005');
vm.runInContext("currentLoggedInUser = mockUsers[1];", sandbox); // Switch back to Guru
const guruAfterManual = sandbox.refreshTeacherReminders({ nowDate: monday0830, silent: true });
assert(guruAfterManual.some(n => n.type === 'manual_reminder' && n.scheduleId === 'sch_005'),
  'Guru receives manual reminder dispatched by Admin for sch_005');

// Test E: Simulate reminder & action click
sandbox.simulateTeacherReminder();
assert(domElements['teacherReminderToast'].style.display === 'flex',
  'simulateTeacherReminder displays floating reminder toast');
sandbox.openAttendanceFromReminder('sch_005');
const capturedAtt = vm.runInContext('_capturedAttCall', sandbox);
assert(capturedAtt && capturedAtt.scheduleId === 'sch_005',
  'Clicking Isi Absensi on reminder navigates directly to attendance form for that schedule');

// Test F: Settings notification edit modal is restricted to Admin only (no edit access for Guru)
vm.runInContext("currentLoggedInUser = mockUsers[1];", sandbox); // Guru
domElements['settingsModalBody'].innerHTML = '';
sandbox.openSettingDetail('notifications');
assert(domElements['settingsModalBody'].innerHTML === '',
  'Guru cannot open notification preference edit modal');

vm.runInContext("currentLoggedInUser = mockUsers[0];", sandbox); // Admin
sandbox.openSettingDetail('notifications');
const settingsHtml = domElements['settingsModalBody'].innerHTML;
assert(settingsHtml.includes('setNotifPengingatMengajar') &&
  settingsHtml.includes('setNotifPengingatAbsensi') &&
  settingsHtml.includes('setNotifLeadMinutes') &&
  settingsHtml.includes('setNotifSuara'),
  'Admin settings notification modal includes reminder toggles, lead time selector, and sound toggle');

domElements['setNotifPengingatMengajar'] = makeEl('setNotifPengingatMengajar');
domElements['setNotifPengingatAbsensi'] = makeEl('setNotifPengingatAbsensi');
domElements['setNotifLeadMinutes'] = makeEl('setNotifLeadMinutes');
domElements['setNotifSuara'] = makeEl('setNotifSuara');
domElements['setNotifPengingatMengajar'].checked = true;
domElements['setNotifPengingatAbsensi'].checked = true;
domElements['setNotifLeadMinutes'].value = '30';
domElements['setNotifSuara'].checked = false;
domElements['setNotifSesi'] = makeEl('setNotifSesi');
domElements['setNotifRekap'] = makeEl('setNotifRekap');
domElements['setNotifJadwal'] = makeEl('setNotifJadwal');
domElements['setNotifPeng'] = makeEl('setNotifPeng');
sandbox.saveSettingDetail('notifications');
const savedPrefs = vm.runInContext('notificationPreferences', sandbox);
assert(savedPrefs.leadMinutes === 30 && savedPrefs.suaraNotifikasi === false,
  'Saving notifications settings updates leadMinutes (30) and suaraNotifikasi (false)');

console.log(`\n==============================================`);
console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
console.log(`==============================================`);
