const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TEST: SETTINGS DAFTAR USTADZ / GURU MENU ===\n');

const baseCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'base.css'), 'utf-8');
const settingsJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'settings.js'), 'utf-8');

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
  baseCss.includes('.teacher-add-row') && baseCss.includes('.teacher-master-list') && baseCss.includes('.teacher-master-item'),
  'base.css defines teacher management list and add row styles'
);

function makeEl(id) {
  return {
    id,
    value: '',
    innerText: '',
    innerHTML: '',
    style: { display: 'none' },
    focus: () => {}
  };
}

const byId = {
  settingsContainer: makeEl('settingsContainer'),
  settingsDetailModal: makeEl('settingsDetailModal'),
  settingsModalTitle: makeEl('settingsModalTitle'),
  settingsModalSubtitle: makeEl('settingsModalSubtitle'),
  settingsModalIcon: makeEl('settingsModalIcon'),
  settingsModalBody: makeEl('settingsModalBody'),
  setTeacherNameInput: makeEl('setTeacherNameInput'),
  setTeacherError: makeEl('setTeacherError'),
  setTeacherCount: makeEl('setTeacherCount'),
  setTeacherListWrap: makeEl('setTeacherListWrap'),
  schFormTeacher: makeEl('schFormTeacher'),
  attFilterTeacher: makeEl('attFilterTeacher')
};

const toasts = [];
const ctx = {
  console,
  setTimeout: () => {},
  currentLoggedInUser: { role: 'Admin', fullName: 'Administrator Pondok', username: 'admin' },
  mockSchedules: [
    { teacherName: 'Ustadz Ahmad Fauzi' }
  ],
  document: {
    readyState: 'complete',
    getElementById: id => byId[id] || (byId[id] = makeEl(id)),
    addEventListener: () => {}
  },
  window: {},
  showToast: (msg, type) => toasts.push({ msg, type })
};

vm.runInNewContext(settingsJs, ctx);

ctx.renderSettingsMenu();
assert(
  byId.settingsContainer.innerHTML.includes("openSettingDetail('teachers')") &&
  byId.settingsContainer.innerHTML.includes('Daftar Ustadz / Guru'),
  'Admin settings menu includes "Daftar Ustadz / Guru" item'
);

// Check Guru RBAC block
ctx.currentLoggedInUser = { role: 'Guru', fullName: 'Ustadz Ahmad Fauzi' };
ctx.renderSettingsMenu();
assert(
  !byId.settingsContainer.innerHTML.includes("openSettingDetail('teachers')"),
  'Guru role does NOT see Admin-only "Daftar Ustadz / Guru" menu item'
);
ctx.openSettingDetail('teachers');
assert(
  toasts.some(t => t.type === 'error' && t.msg.includes('Akses ditolak')),
  'RBAC blocks Guru from opening Daftar Ustadz / Guru modal directly'
);

// Open as Admin and add/edit/delete
ctx.currentLoggedInUser = { role: 'Admin', fullName: 'Administrator Pondok' };
ctx.openSettingDetail('teachers');
assert(
  byId.settingsDetailModal.style.display === 'flex' &&
  byId.settingsModalTitle.innerText === 'Daftar Ustadz / Guru' &&
  byId.settingsModalBody.innerHTML.includes('setTeacherNameInput') &&
  byId.setTeacherListWrap.innerHTML.includes('Ustadz Ahmad Fauzi'),
  'Admin opens "Daftar Ustadz / Guru" modal with input field and existing teacher list'
);

// Validation: empty/short
byId.setTeacherNameInput.value = 'ab';
ctx.addTeacherMasterName();
assert(
  byId.setTeacherError.style.display === 'block',
  'Rejects names shorter than 3 characters'
);

// Validation: duplicate
byId.setTeacherNameInput.value = 'ustadz ahmad fauzi';
ctx.addTeacherMasterName();
assert(
  byId.setTeacherError.style.display === 'block' && byId.setTeacherError.innerText.includes('sudah ada'),
  'Rejects duplicate ustadz/guru names case-insensitively'
);

// Valid add
byId.setTeacherNameInput.value = 'Ustadz Hasan Basri';
ctx.addTeacherMasterName();
assert(
  byId.setTeacherNameInput.value === '' &&
  byId.setTeacherListWrap.innerHTML.includes('Ustadz Hasan Basri') &&
  byId.schFormTeacher.innerHTML.includes('Ustadz Hasan Basri') &&
  byId.attFilterTeacher.innerHTML.includes('Ustadz Hasan Basri'),
  'Adding "Ustadz Hasan Basri" updates master list and syncs #schFormTeacher & #attFilterTeacher dropdowns'
);

// Edit added item at index 0
ctx.editTeacherMasterItem(0);
assert(
  byId.setTeacherListWrap.innerHTML.includes('setTeacherEditInput_0'),
  'Clicking edit renders inline edit input for row 0'
);
byId.setTeacherEditInput_0 = makeEl('setTeacherEditInput_0');
byId.setTeacherEditInput_0.value = 'Ustadz Hasan Basri, Lc';
ctx.saveTeacherMasterEdit(0);
assert(
  byId.setTeacherListWrap.innerHTML.includes('Ustadz Hasan Basri, Lc') &&
  byId.schFormTeacher.innerHTML.includes('Ustadz Hasan Basri, Lc'),
  'Saving inline edit updates master list and synced select dropdowns'
);

// Delete item
ctx.deleteTeacherMasterItem(0);
assert(
  !byId.setTeacherListWrap.innerHTML.includes('Ustadz Hasan Basri, Lc') &&
  !byId.schFormTeacher.innerHTML.includes('Ustadz Hasan Basri, Lc'),
  'Deleting item removes teacher from master list and synced select dropdowns'
);

console.log(`\n==============================================`);
console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
console.log(`==============================================`);
