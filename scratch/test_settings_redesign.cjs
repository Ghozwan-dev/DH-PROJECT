const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TEST: SETTINGS MODAL REDESIGN & DATA BINDING VERIFICATION ===\n');

// 1. Read files
const baseCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'base.css'), 'utf8');
const previewHtml = require('../scripts/html-assembler').loadPreviewHtml();
const authJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'auth.js'), 'utf8');
const settingsJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'settings.js'), 'utf8');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// Check 1: Extract settingsDetailModal block and check no back button exists
const modalBlock = previewHtml.split('id="settingsDetailModal"')[1].split('id="modalConfirmLogout"')[0];
assert(!modalBlock.includes('title="Kembali"'), 'Redundant back button removed from #settingsDetailModal header in preview.html');
assert(!modalBlock.includes('polyline points="15 18 9 12 15 6"'), 'Chevron back icon removed from #settingsDetailModal header');

// Check 2: Header contains clean title, subtitle, icon and close button
assert(modalBlock.includes('id="settingsModalTitle"'), 'Modal title element exists');
assert(modalBlock.includes('id="settingsModalSubtitle"'), 'Modal subtitle element exists');
assert(modalBlock.includes('id="settingsModalIcon"'), 'Modal icon element exists');
assert(modalBlock.includes('class="btn-modal-close"'), 'Modal close button with clean styling exists');

// Check 3: CSS classes defined in base.css
const requiredClasses = [
  '.settings-modal-header',
  '.settings-modal-header-icon',
  '.btn-modal-close',
  '.profile-identity-card',
  '.profile-avatar-circle',
  '.form-group',
  '.form-label',
  '.form-input',
  '.form-input-readonly',
  '.modal-btn-row',
  '.btn-modal-cancel',
  '.btn-modal-submit',
  '.settings-toggle-card',
  '.switch-toggle'
];
for (const cls of requiredClasses) {
  assert(baseCss.includes(cls), `CSS class ${cls} is defined in base.css`);
}

// Check 4: Modal width is well-proportioned
assert(baseCss.includes('max-width: 490px'), 'Modal panel has well-proportioned max-width (490px)');

// Check 5: Mock Users in auth.js have phone & phoneNumber defined
assert(authJs.includes("phone: '081234567890'") && authJs.includes("phoneNumber: '081234567890'"), 
  'Admin user in auth.js has valid phone and phoneNumber');
assert(authJs.includes("phone: '081987654321'") && authJs.includes("phoneNumber: '081987654321'"), 
  'Guru user in auth.js has valid phone and phoneNumber');

// Check 6: Runtime execution in DOM environment
const domMock = {
  elements: {},
  toasts: [],
  createElement(tag) {
    return {
      tagName: tag.toUpperCase(),
      style: {},
      classList: {
        add(c) { this.classes = this.classes || []; this.classes.push(c); },
        remove(c) { this.classes = (this.classes || []).filter(x => x !== c); },
        contains(c) { return (this.classes || []).includes(c); }
      },
      _innerHTML: '',
      set innerHTML(val) {
        this._innerHTML = val;
        // Parse simple IDs and inputs
        const idMatches = val.matchAll(/id="([^"]+)"/g);
        for (const m of idMatches) {
          const id = m[1];
          if (!domMock.elements[id]) {
            domMock.elements[id] = domMock.createElement('div');
            domMock.elements[id].id = id;
          }
          // if value attribute exists, set it
          const regex = new RegExp(`id="${id}"[^>]*value="([^"]*)"`);
          const valMatch = val.match(regex);
          if (valMatch) {
            domMock.elements[id].value = valMatch[1];
          }
        }
      },
      get innerHTML() {
        return this._innerHTML;
      },
      innerText: '',
      value: ''
    };
  }
};

const domIds = [
  'settingsDetailModal', 'settingsModalTitle', 'settingsModalSubtitle', 'settingsModalIcon', 
  'settingsModalBody', 'settingsContainer', 'settingsUserAvatar', 'settingsUserName', 
  'settingsUserSubtitle', 'settingsUserRoleBadge', 'pageSettings', 'pageHome'
];

for (const id of domIds) {
  domMock.elements[id] = domMock.createElement('div');
  domMock.elements[id].id = id;
}

const sandbox = {
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  document: {
    getElementById(id) {
      if (!domMock.elements[id]) {
        domMock.elements[id] = domMock.createElement('div');
        domMock.elements[id].id = id;
      }
      return domMock.elements[id];
    },
    querySelector(sel) {
      return domMock.createElement('div');
    },
    querySelectorAll(sel) {
      return [];
    },
    addEventListener(evt, fn) {}
  },
  showToast(msg, type) {
    domMock.toasts.push({ msg, type });
  },
  showOnlyScreenPage(id) {},
  syncActiveNav(tab) {},
  navigateToHome(user) {}
};

vm.createContext(sandbox);
vm.runInContext(authJs, sandbox);
vm.runInContext(settingsJs, sandbox);

// Test 6.1: Open Profile Modal for Admin
sandbox.openSettingDetail('profile');
const profileHtml = domMock.elements['settingsModalBody'].innerHTML;

assert(!profileHtml.includes('undefined'), 'Profile modal body does NOT contain "undefined"');
assert(profileHtml.includes('081234567890'), 'Profile modal correctly populates phone number 081234567890');
assert(profileHtml.includes('Administrator Pondok'), 'Profile modal contains user full name');
assert(profileHtml.includes('profile-identity-card'), 'Profile modal contains profile-identity-card');
assert(profileHtml.includes('btn-modal-cancel'), 'Profile modal contains Batal (cancel) button');
assert(profileHtml.includes('btn-modal-submit'), 'Profile modal contains Simpan Perubahan submit button');
assert(profileHtml.includes('id="setProfileName"'), 'Input setProfileName is present');
assert(profileHtml.includes('id="setProfilePhone"'), 'Input setProfilePhone is present');
assert(domMock.elements['settingsDetailModal'].style.display === 'flex', 'Modal opens with display: flex');

// Test 6.2: Save Profile changes
domMock.elements['setProfileName'].value = 'Dr. Administrator Pondok';
domMock.elements['setProfilePhone'].value = '081299998888';
sandbox.saveSettingDetail('profile');

const updatedUser = vm.runInContext('currentLoggedInUser', sandbox);
assert(updatedUser.fullName === 'Dr. Administrator Pondok', 'User fullName successfully updated');
assert(updatedUser.phone === '081299998888', 'User phone successfully updated');
assert(updatedUser.phoneNumber === '081299998888', 'User phoneNumber successfully updated');
assert(domMock.elements['settingsDetailModal'].style.display === 'none', 'Modal closes after save');

// Test 6.3: Open Security Modal
sandbox.openSettingDetail('security');
const secHtml = domMock.elements['settingsModalBody'].innerHTML;
assert(secHtml.includes('id="setSecCurrent"'), 'Security modal contains setSecCurrent input');
assert(secHtml.includes('id="setSecNew"'), 'Security modal contains setSecNew input');
assert(secHtml.includes('id="setSecConfirm"'), 'Security modal contains setSecConfirm input');
assert(secHtml.includes('btn-modal-cancel') && secHtml.includes('btn-modal-submit'), 'Security modal has cancel and submit buttons');

// Test 6.4: Open Pesantren Modal
sandbox.openSettingDetail('pesantren');
const pesHtml = domMock.elements['settingsModalBody'].innerHTML;
assert(pesHtml.includes('id="setPesName"'), 'Pesantren modal contains setPesName input');
assert(pesHtml.includes('id="setPesAddr"'), 'Pesantren modal contains setPesAddr input');
assert(pesHtml.includes('btn-modal-cancel') && pesHtml.includes('btn-modal-submit'), 'Pesantren modal has cancel and submit buttons');

// Test 6.5: Open Attendance Modal
sandbox.openSettingDetail('attendance');
const attHtml = domMock.elements['settingsModalBody'].innerHTML;
assert(attHtml.includes('id="setAttStart"'), 'Attendance modal contains setAttStart input');
assert(attHtml.includes('switch-toggle'), 'Attendance modal contains switch toggle component');
assert(attHtml.includes('btn-modal-cancel') && attHtml.includes('btn-modal-submit'), 'Attendance modal has cancel and submit buttons');

// Test 6.6: Open Notifications Modal
sandbox.openSettingDetail('notifications');
const notifHtml = domMock.elements['settingsModalBody'].innerHTML;
assert(notifHtml.includes('id="setNotifSesi"'), 'Notifications modal contains setNotifSesi toggle');
assert(notifHtml.includes('switch-toggle'), 'Notifications modal contains switch toggle components');
assert(notifHtml.includes('btn-modal-cancel') && notifHtml.includes('btn-modal-submit'), 'Notifications modal has cancel and submit buttons');

console.log(`\n==============================================`);
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log(`==============================================\n`);

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
