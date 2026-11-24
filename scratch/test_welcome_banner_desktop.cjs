const fs = require('fs');
const path = require('path');

console.log('=== TEST: WELCOME HERO BANNER DESKTOP-ONLY ENLARGEMENT ===');

const homeCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'home.css'), 'utf-8');
const previewHtml = fs.readFileSync(path.join(__dirname, '..', 'preview.html'), 'utf-8');
const dartBanner = fs.readFileSync(path.join(__dirname, '..', 'lib', 'features', 'home', 'presentation', 'widgets', 'welcome_hero_banner.dart'), 'utf-8');

// 1. Verify HTML structure
const requiredClasses = ['welcome-hero', 'welcome-greeting', 'welcome-title', 'welcome-sub'];
requiredClasses.forEach(cls => {
  if (!previewHtml.includes(`class="${cls}"`)) {
    console.error(`FAIL: Missing class="${cls}" in preview.html`);
    process.exit(1);
  }
});
console.log('PASS: preview.html contains all welcome banner elements!');

// 2. Verify Desktop Media Query in home.css
if (!homeCss.includes('@media (min-width: 1024px)')) {
  console.error('FAIL: home.css does not include @media (min-width: 1024px)');
  process.exit(1);
}
console.log('PASS: home.css contains desktop media query (min-width: 1024px)!');

// Check desktop sizes in home.css
const desktopBlocks = homeCss.split('@media (min-width: 1024px)').slice(1);
const desktopWelcomeBlock = desktopBlocks.find(b => b.includes('.welcome-greeting') && b.includes('font-size: 22px;'));
if (!desktopWelcomeBlock) {
  console.error('FAIL: Could not locate desktop welcome banner media query in home.css');
  process.exit(1);
}
console.log('PASS: Desktop greeting enlarged to 22px!');

if (!desktopWelcomeBlock.includes('font-size: 38px;')) {
  console.error('FAIL: Desktop .welcome-title font-size: 38px not found');
  process.exit(1);
}
console.log('PASS: Desktop title enlarged to 38px!');

if (!desktopWelcomeBlock.includes('font-size: 17.5px;')) {
  console.error('FAIL: Desktop .welcome-sub font-size: 17.5px not found');
  process.exit(1);
}
console.log('PASS: Desktop subtitle enlarged to 17.5px!');

if (!desktopWelcomeBlock.includes('min-height: 230px;')) {
  console.error('FAIL: Desktop .welcome-hero min-height: 230px not found');
  process.exit(1);
}
console.log('PASS: Desktop hero min-height increased to 230px!');

// 3. Verify mobile media query still preserves compact sizes
const mobileBlocks = homeCss.split('@media (max-width: 639px)').slice(1);
const mobileWelcomeBlock = mobileBlocks.find(b => b.includes('font-size: 14px;'));
if (!mobileWelcomeBlock) {
  console.error('FAIL: Could not locate mobile welcome media query block in home.css');
  process.exit(1);
}
if (!mobileWelcomeBlock.includes('font-size: 19px;') || !mobileWelcomeBlock.includes('font-size: 11.5px;')) {
  console.error('FAIL: Mobile sizes were unexpectedly modified');
  process.exit(1);
}
console.log('PASS: Mobile compact sizes preserved (14px, 19px, 11.5px)!');

// 4. Verify Flutter widget responsiveness
if (!dartBanner.includes('constraints.maxWidth >= 1024') || !dartBanner.includes('fontSize: 38')) {
  console.error('FAIL: Flutter welcome_hero_banner.dart does not have desktop responsive condition');
  process.exit(1);
}
console.log('PASS: Flutter welcome_hero_banner.dart contains desktop responsive handling!');

console.log('\n==============================================');
console.log('ALL WELCOME BANNER DESKTOP TESTS PASSED (100%)!');
console.log('==============================================');
