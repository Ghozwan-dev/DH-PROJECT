# Standar Modularisasi Proyek Darul Hikmah

1. **HTML (`preview.html` + `assets/partials/`)**: `preview.html` adalah shell ringan (`< 100` baris) menggunakan direktif `<!-- @include assets/partials/... -->` yang dirangkai oleh `scripts/html-assembler.js` dan `server.js`. Semua layout, halaman, dan modal wajib ditempatkan secara terpisah di `assets/partials/layout/`, `assets/partials/pages/`, dan `assets/partials/modals/`. Dilarang menambah markup HTML halaman/modal langsung ke `preview.html`.
2. **CSS (`assets/css/`)**: Dilarang menggunakan blok `<style>` di file HTML; simpan gaya di `assets/css/<fitur>.css`.
3. **JS (`assets/js/`)**: Dilarang menggunakan blok `<script>` inline di file HTML; simpan logika fitur di `assets/js/<fitur>.js` dan muat sebelum `assets/js/app.js`.
4. **Flutter (`lib/features/<fitur>/`)**: Ikuti pemisahan `data/`, `domain/`, dan `presentation/{pages,widgets}/`.
5. **Testing (`scratch/`)**: Gunakan `require('../scripts/html-assembler').loadPreviewHtml()` saat menguji markup `preview.html`.
6. **Panduan Lengkap**: Lihat `docs/MODULARIZATION_STANDARD.md` dan `.agents/rules/modularization.md`.
