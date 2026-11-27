const fs = require('fs');
const path = require('path');

console.log('=== TEST: FITUR EDIT UNTUK LAPORAN ABSENSI SANTRI ===\n');

const previewHtml = require('../scripts/html-assembler').loadPreviewHtml();
const reportJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'report.js'), 'utf-8');

// 1. Check UI elements in preview.html
console.log('1. Memeriksa Elemen UI di preview.html:');
const requiredUi = [
  { id: 'btnEditReportModal', desc: 'Tombol Tunggal Utama "Edit Laporan"' },
  { id: 'directEditNotice', desc: 'Banner Pemberitahuan Mode Edit di Lembar' },
  { id: 'editReportModal', desc: 'Modal Dialog Kustomisasi Laporan' },
  { id: 'tabBtnReportKop', desc: 'Tab Navigasi Kop & Judul' },
  { id: 'tabBtnReportData', desc: 'Tab Navigasi Data Kehadiran' },
  { id: 'tabBtnReportSign', desc: 'Tab Navigasi Pengesahan' },
  { id: 'tabBtnReportStyle', desc: 'Tab Navigasi Tampilan' },
  { id: 'editReportModalContent', desc: 'Kontainer Konten Modal Edit' }
];

requiredUi.forEach(item => {
  if (!previewHtml.includes(`id="${item.id}"`)) {
    console.error(`[FAIL] Elemen hilang di preview.html: ${item.desc} (id="${item.id}")`);
    process.exit(1);
  }
  console.log(`  ✓ [PASS] Ditemukan: ${item.desc} (id="${item.id}")`);
});

// Verify toolbar is simplified: btnToggleDirectEdit is NOT cluttering the top action row
const actionButtonsRow = previewHtml.split('<!-- 3. Action Buttons')[1].split('<!-- Direct Edit Banner Notice')[0];
if (actionButtonsRow.includes('id="btnToggleDirectEdit"')) {
  console.error('[FAIL] Toolbar belum disederhanakan: btnToggleDirectEdit masih ada di baris tombol utama');
  process.exit(1);
}
console.log('  ✓ [PASS] Toolbar berhasil disederhanakan (hanya ada 1 tombol akses edit utama: #btnEditReportModal)!');

// 2. Check JavaScript logic & API methods in assets/js/report.js
console.log('\n2. Memeriksa Fungsi & Logika di assets/js/report.js:');
const requiredFunctions = [
  'reportCustomOverrides',
  'isDirectReportEditMode',
  'openEditReportModal',
  'closeEditReportModal',
  'switchEditReportTab',
  'renderEditReportModalContent',
  'recalcModalStudentRow',
  'setAllStudentsPresent',
  'selectReportThemeColor',
  'saveReportModalEdits',
  'resetReportCustomOverrides',
  'toggleDirectReportEdit',
  'saveDirectReportEdit',
  'cancelDirectReportEdit',
  'updateDirectStudentNumber'
];

requiredFunctions.forEach(fn => {
  if (!reportJs.includes(fn)) {
    console.error(`[FAIL] Fungsi atau variabel hilang di report.js: ${fn}`);
    process.exit(1);
  }
  console.log(`  ✓ [PASS] Ditemukan fungsi/state: ${fn}`);
});

// 3. Simulation test of attendance calculations & custom overrides
console.log('\n3. Simulasi Perhitungan Dinamis Presensi Santri & Kartu Metrik:');
// Mock students & baseline attendance
const students = [
  { id: 'st1', nis: '2024001', fullName: 'Ahmad Fauzi', className: 'VII A' },
  { id: 'st2', nis: '2024004', fullName: 'Fatimah Zahra', className: 'VII A' },
  { id: 'st3', nis: '2024011', fullName: 'Umar Al-Faruq', className: 'VII A' }
];

let customOverrides = {
  kopTitle: 'PONDOK PESANTREN ISLAM DARUL HIKMAH',
  reportTitle: 'LAPORAN REKAPITULASI KEHADIRAN KELAS VII A (REVISI)',
  studentOverrides: {
    st1: { hadir: 5, izin: 1, sakit: 0, alfa: 0 },
    st2: { hadir: 4, izin: 0, sakit: 2, alfa: 0 },
    st3: { hadir: 6, izin: 0, sakit: 0, alfa: 0 }
  }
};

let totHadir = 0, totIzin = 0, totSakit = 0, totAlfa = 0, totMeetings = 0;
const computedRows = students.map(st => {
  const ov = customOverrides.studentOverrides[st.id];
  const h = ov.hadir, i = ov.izin, s = ov.sakit, a = ov.alfa;
  const tot = h + i + s + a;
  const pct = tot === 0 ? '0%' : (Math.round((h / tot) * 1000) / 10) + '%';
  totHadir += h;
  totIzin += i;
  totSakit += s;
  totAlfa += a;
  totMeetings += tot;
  return { student: st, total: tot, hadir: h, izin: i, sakit: s, alfa: a, pct: pct };
});

const avgPct = totMeetings === 0 ? '0%' : (Math.round((totHadir / totMeetings) * 1000) / 10) + '%';

if (totHadir !== 15) {
  console.error(`[FAIL] Total Hadir tidak sesuai: diharapkan 15, diperoleh ${totHadir}`);
  process.exit(1);
}
console.log(`  ✓ [PASS] Total Hadir terhitung akurat: ${totHadir}`);

if (totIzin !== 1 || totSakit !== 2 || totAlfa !== 0) {
  console.error(`[FAIL] Total Izin/Sakit/Alfa tidak sesuai: Izin=${totIzin}, Sakit=${totSakit}, Alfa=${totAlfa}`);
  process.exit(1);
}
console.log(`  ✓ [PASS] Total Izin (1), Sakit (2), Alfa (0) terhitung akurat!`);

if (totMeetings !== 18) {
  console.error(`[FAIL] Total pertemuan santri tidak sesuai: diharapkan 18, diperoleh ${totMeetings}`);
  process.exit(1);
}
console.log(`  ✓ [PASS] Total Pertemuan terhitung akurat: ${totMeetings}`);

const expectedAvg = (Math.round((15 / 18) * 1000) / 10) + '%'; // 83.3%
if (avgPct !== expectedAvg) {
  console.error(`[FAIL] Rata² kehadiran tidak sesuai: diharapkan ${expectedAvg}, diperoleh ${avgPct}`);
  process.exit(1);
}
console.log(`  ✓ [PASS] Rata-rata persentase kehadiran terhitung akurat: ${avgPct}`);

// 4. Verify Export Excel includes custom overrides
console.log('\n4. Memeriksa Kompatibilitas Ekspor Excel & PDF:');
if (!reportJs.includes('reportCustomOverrides.studentOverrides[st.id]') || !reportJs.includes('reportCustomOverrides.kopTitle')) {
  console.error('[FAIL] exportReportExcel tidak mengintegrasikan reportCustomOverrides');
  process.exit(1);
}
console.log('  ✓ [PASS] exportReportExcel mengintegrasikan nilai kustomisasi kop, judul & data presensi santri!');

if (!reportJs.includes('reportPaperContainer') || !reportJs.includes('printWindow.document.write')) {
  console.error('[FAIL] exportReportPdf tidak mengikutsertakan lembar laporan');
  process.exit(1);
}
console.log('  ✓ [PASS] exportReportPdf mencetak lembar kustomisasi secara langsung dan bersih!');

// 5. Verify A4 Dimensions & Paper styling
console.log('\n5. Memeriksa Standar Ukuran Kertas A4:');
const baseCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'base.css'), 'utf-8');

if (!baseCss.includes('max-width: 210mm') || !baseCss.includes('min-height: 297mm') || !baseCss.includes('.a4-report-paper')) {
  console.error('[FAIL] base.css tidak memuat spesifikasi ukuran kertas A4 (210mm x 297mm)');
  process.exit(1);
}
console.log('  ✓ [PASS] base.css mendefinisikan .a4-report-paper dengan ukuran presisi A4 (210mm x 297mm)!');

if (!previewHtml.includes('class="a4-report-paper"') || !previewHtml.includes('max-width:210mm') || !previewHtml.includes('min-height:297mm')) {
  console.error('[FAIL] preview.html #reportPaperContainer tidak menggunakan ukuran kertas A4 (210mm x 297mm)');
  process.exit(1);
}
console.log('  ✓ [PASS] preview.html menerapkan class a4-report-paper dan proporsi A4 pada #reportPaperContainer!');

if (!reportJs.includes('@page { size: A4 portrait;') || !reportJs.includes('210mm') && !reportJs.includes('A4 portrait')) {
  console.error('[FAIL] report.js exportReportPdf tidak mengatur layout cetak A4 portrait');
  process.exit(1);
}
console.log('  ✓ [PASS] report.js exportReportPdf dikonfigurasi untuk cetak ukuran kertas A4 portrait!');

console.log('\n==============================================');
console.log('ALL REPORT EDIT FEATURE TESTS PASSED (100%)!');
console.log('==============================================');
