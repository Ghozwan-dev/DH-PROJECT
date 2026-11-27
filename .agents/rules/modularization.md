# Aturan Modularisasi Kode — Darul Hikmah

Setiap penambahan atau perubahan kode pada proyek ini **wajib** mengikuti prinsip modularisasi berikut (berlaku untuk seluruh kode baru maupun lanjutan):

## 1. Web Preview HTML (`preview.html` & `assets/partials/`)
- **`preview.html` harus tetap berupa shell ringan** (target `< 100` baris) yang hanya berisi `<head>`, link CSS, direktif `<!-- @include assets/partials/... -->`, dan `<script>` module imports.
- **Dilarang menulis markup halaman, layout, atau modal langsung di dalam `preview.html`**.
- Tempatkan potongan HTML pada direktori yang sesuai:
  - `assets/partials/layout/` — komponen kerangka global (navbar, sidebar, bottom navigation).
  - `assets/partials/pages/` — satu file per halaman atau modul fitur (maksimal ~350–400 baris per file; pecah menjadi sub-file jika melebihi batas).
  - `assets/partials/modals/` — dialog modal, toast, dan overlay global.
- Jika menambah partial baru, daftarkan di `preview.html` menggunakan `<!-- @include assets/partials/... -->` (dirangkai otomatis oleh `server.js` dan `scripts/html-assembler.js`).

## 2. Stylesheet CSS (`assets/css/`)
- **Dilarang menambahkan blok `<style>` inline** di `preview.html` maupun di dalam file `assets/partials/*.html`.
- Simpan aturan CSS pada file modul fitur terkait di `assets/css/` (`base.css`, `auth.css`, `home.css`, `student.css`, `schedule.css`, `attendance.css`) atau buat file CSS fitur baru dan hubungkan di `<head>` `preview.html`.

## 3. JavaScript Modules (`assets/js/`)
- **Dilarang menambahkan blok `<script>` inline** di `preview.html` maupun di dalam file `assets/partials/*.html`.
- Pisahkan logika per domain/fitur di `assets/js/` (satu tanggung jawab utama per file), jaga fungsi tetap ringkas, hindari duplikasi logika, dan muat modul baru sebelum `assets/js/app.js` di `preview.html`.

## 4. Aplikasi Flutter (`lib/`)
- Tetap patuhi Feature-Based Clean Architecture di `lib/features/<fitur>/` (`data/models/`, `data/datasources/`, `data/repositories/`, `domain/repositories/`, `presentation/pages/`, `presentation/widgets/`).
- Pisahkan widget reusable ke `presentation/widgets/` agar file halaman (`presentation/pages/`) tidak membengkak.

## 5. Pengujian (`scratch/` & `test/`)
- Skrip verifikasi yang memeriksa markup web **wajib** memuat HTML hasil rakitan melalui `loadPreviewHtml()` dari `scripts/html-assembler.js` (bukan membaca raw shell `preview.html` secara langsung).
