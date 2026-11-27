# STANDAR MODULARISASI KODE — DARUL HIKMAH

Dokumen ini menetapkan standar modularisasi resmi untuk pengembangan web preview (`preview.html`) maupun aplikasi Flutter (`lib/`) agar kode tetap ringkas, mudah dirawat, dan bebas dari file monolitik.

---

## 1. Arsitektur Modular Web Preview

`preview.html` tidak lagi menampung ribuan baris markup dalam satu file. File ini berfungsi sebagai **HTML Shell** (~60 baris) yang mengimpor:
- **Stylesheet Modular** dari `assets/css/`
- **HTML Partials Modular** dari `assets/partials/` melalui direktif `<!-- @include ... -->`
- **JavaScript Modules** dari `assets/js/`

### Struktur Direktori Web
```text
├── preview.html                          # Shell utama (< 100 baris)
├── server.js                             # Dev server yang merangkai @include secara dinamis
├── scripts/
│   └── html-assembler.js                 # Utilitas resolver <!-- @include ... --> (Node/Test)
└── assets/
    ├── css/                              # Stylesheet per fitur
    │   ├── base.css
    │   ├── auth.css
    │   ├── home.css
    │   ├── student.css
    │   ├── schedule.css
    │   └── attendance.css
    ├── partials/                         # Potongan HTML modular
    │   ├── layout/
    │   │   ├── navbar.html
    │   │   ├── sidebar.html
    │   │   └── bottom-nav.html
    │   ├── pages/
    │   │   ├── auth.html
    │   │   ├── home.html
    │   │   ├── students.html
    │   │   ├── schedule-list.html
    │   │   ├── schedule-detail.html
    │   │   ├── schedule-form.html
    │   │   ├── attendance.html
    │   │   ├── report.html
    │   │   └── settings.html
    │   └── modals/
    │       ├── attendance-modals.html
    │       ├── global-modals.html
    │       └── teacher-reminder-toast.html
    └── js/                               # Logika JS per domain/fitur
        ├── auth.js
        ├── student.js
        ├── schedule.js
        ├── attendance.js
        ├── recap.js
        ├── report.js
        ├── settings.js
        ├── notifications.js
        └── app.js
```

---

## 2. Aturan Wajib untuk Kode Selanjutnya

1. **Batas Ukuran File & Pemisahan Tanggung Jawab**:
   - `preview.html`: maksimal `< 100` baris (hanya shell, link CSS, `@include`, dan `<script>`).
   - File partial (`assets/partials/**/*.html`): maksimal ~350–400 baris per file. Jika satu modul fitur memiliki beberapa halaman/form besar, pecah seperti `schedule-list.html`, `schedule-detail.html`, `schedule-form.html`.
   - File JS (`assets/js/*.js`) & CSS (`assets/css/*.css`): satu fitur/domain per file; hindari menaruh logika fitur baru ke dalam file fitur lain yang tidak terkait.
2. **Larangan Kode Inline di HTML**:
   - Tidak boleh ada `<style>...</style>` atau `<script>...</script>` inline di `preview.html` ataupun `assets/partials/*.html`.
3. **Menambah Fitur Web Baru**:
   1. Buat partial HTML baru di `assets/partials/pages/<fitur>.html` (atau `modals/` / `layout/`).
   2. Tambahkan `<!-- @include assets/partials/... -->` pada posisi yang tepat di `preview.html`.
   3. Buat/perbarui stylesheet di `assets/css/<fitur>.css` dan daftarkan di `<head>` `preview.html`.
   4. Buat/perbarui modul JS di `assets/js/<fitur>.js` dan muat sebelum `assets/js/app.js`.
   5. Pada skrip uji (`scratch/*.cjs`), gunakan `loadPreviewHtml()` dari `scripts/html-assembler.js` untuk membaca HTML hasil rakitan.
4. **Standar Flutter (`lib/features/<fitur>/`)**:
   - Tetap ikuti arsitektur berbasis fitur (`data/`, `domain/`, `presentation/pages/`, `presentation/widgets/`) sesuai [ARCHITECTURE.md](./ARCHITECTURE.md).
