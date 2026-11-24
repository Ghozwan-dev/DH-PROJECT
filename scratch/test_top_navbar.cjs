const fs = require('fs');
const path = require('path');

console.log('=== TEST: TOP NAVBAR CLEANUP (DEMO BUTTONS, AVATAR, & DESKTOP NAV REMOVED) ===');

const previewHtml = fs.readFileSync(path.join(__dirname, '..', 'preview.html'), 'utf-8');

// 1. Verify demo buttons are removed from top navbar
if (previewHtml.includes('id="demoBtnAdmin"') || previewHtml.includes('id="demoBtnGuru"') || previewHtml.includes('class="demo-buttons"')) {
  console.error('FAIL: Mode Admin / Mode Guru demo buttons are still present in preview.html');
  process.exit(1);
}
console.log('PASS: Mode Admin and Mode Guru buttons successfully removed!');

// 2. Verify avatar/profile is removed from top navbar
if (previewHtml.includes('id="navbarUserAvatar"') || previewHtml.includes('class="navbar-user-profile"')) {
  console.error('FAIL: navbarUserAvatar / navbar-user-profile is still present in top navbar');
  process.exit(1);
}
console.log('PASS: Top navbar avatar/profile icon successfully removed!');

// 3. Verify desktop nav links are removed from top navbar
if (previewHtml.includes('id="navbarDesktopLinks"') || previewHtml.includes('class="navbar-nav-links"')) {
  console.error('FAIL: navbarDesktopLinks is still present in top navbar');
  process.exit(1);
}
console.log('PASS: Top navbar desktop nav links successfully removed!');

// 4. Verify essential brand and navigation elements are preserved
const requiredElements = [
  'id="btnToggleSidebar"',
  'class="navbar-brand"',
  'assets/images/logo.png',
  'Darul Hikmah',
  'class="app-sidebar"',
  'class="bottom-nav-fixed"'
];

requiredElements.forEach(item => {
  if (!previewHtml.includes(item)) {
    console.error(`FAIL: Missing essential element: ${item}`);
    process.exit(1);
  }
});
console.log('PASS: Brand logo, title, hamburger toggle, sidebar, and bottom navbar are all intact!');

console.log('\n==============================================');
console.log('ALL TOP NAVBAR TESTS PASSED (100%)!');
console.log('==============================================');
