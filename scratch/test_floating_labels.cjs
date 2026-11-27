const fs = require('fs');
const path = require('path');
const { loadPreviewHtml } = require('../scripts/html-assembler');

console.log('=== TEST: FLOATING LABEL TEXT FIELD (LOGIN & REGISTER) ===\n');

const previewHtml = loadPreviewHtml();
const authCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'auth.css'), 'utf8');

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

const fields = [
  { id: 'loginIdentifier', label: 'Username atau Email' },
  { id: 'loginPassword', label: 'Password' },
  { id: 'regFullName', label: 'Nama Lengkap' },
  { id: 'regEmail', label: 'Email' },
  { id: 'regPhone', label: 'Nomor HP' },
  { id: 'regPassword', label: 'Password' },
  { id: 'regConfirmPassword', label: 'Konfirmasi Password' }
];

fields.forEach(f => {
  assert(
    previewHtml.includes(`id="${f.id}"`) && previewHtml.includes(`class="input-field floating-input" placeholder=" "`),
    `Input #${f.id} uses floating-input with space placeholder`
  );
  assert(
    previewHtml.includes(`<label for="${f.id}" class="floating-label">${f.label}</label>`),
    `Floating <label> for #${f.id} ("${f.label}") is present`
  );
});

assert(authCss.includes('.input-wrapper.floating-field'), 'auth.css defines .input-wrapper.floating-field');
assert(authCss.includes('overflow: visible;'), 'auth.css sets overflow: visible so floating label is not clipped');
assert(authCss.includes('.floating-input:focus + .floating-label'), 'auth.css floats label on focus');
assert(authCss.includes('.floating-input:not(:placeholder-shown) + .floating-label'), 'auth.css keeps label floated when input has value');
assert(authCss.includes('.input-wrapper.floating-field.error .floating-label'), 'auth.css styles floating label in error state');

console.log(`\n==============================================`);
console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
console.log(`==============================================`);
