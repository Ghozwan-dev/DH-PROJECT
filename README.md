# Aplikasi Absensi Santri Pondok Pesantren Islam Darul Hikmah
## Modul: Login, Register, & Homepage Admin/Guru (Flutter)

Aplikasi mobile berbasis Flutter untuk sistem absensi santri di Pondok Pesantren Islam Darul Hikmah, Cellong Arjasa Kangean. Proyek ini mencakup alur lengkap:
**Login &rarr; Verifikasi Akun &amp; Role &rarr; Homepage Admin atau Homepage Guru**, dengan tampilan mobile presisi sesuai gambar referensi resmi bertema *Modern Islamic Dashboard*.

---

## 1. Konsep & Karakter Desain
- **Platform**: Flutter (Android & iOS).
- **Tema**: Modern Islamic Dashboard.
- **Warna Utama**: Hijau tua (`#0E6838` / `#084B27`) dan hijau emerald (`#0A5C36`).
- **Warna Pendukung**: Putih (`#FFFFFF`), hijau muda (`#E8F5E9`), emas/kuning (`#E5B842`), dan abu-abu netral (`#6B7280`, `#E5E7EB`, `#F8FAFC`).
- **Desain**: Bersih, modern, profesional, rounded corners (radius 16-18px), dan soft elevation shadow.
- **Identitas Lembaga**: Menggunakan logo medali resmi Pondok Pesantren Islam Darul Hikmah.

---

## 2. Struktur Folder & Kode Modular

```
d:\Kiro Folder\Darul Hikmah\
├── assets/
│   └── images/
│       ├── logo.png                  # Logo resmi resolusi tinggi Darul Hikmah
│       ├── pesantren_building.png    # Foto gedung pesantren untuk welcome banner
│       ├── santri_ahmad.png          # Avatar santri Ahmad Fauzi
│       ├── santri_aisyah.png         # Avatar santri Siti Aisyah
│       └── santri_rizky.png          # Avatar santri Muhammad Rizky
├── lib/
│   ├── main.dart                     # Entry point & pendaftaran rute aplikasi
│   ├── core/
│   │   ├── constants/
│   │   │   ├── app_colors.dart       # Palet warna hijau tua, emerald, emas, & status
│   │   │   ├── app_constants.dart    # Konfigurasi nama, tagline, & rute
│   │   │   └── app_text_styles.dart  # Tipografi konsisten
│   │   ├── theme/
│   │   │   └── app_theme.dart        # ThemeData Material 3
│   │   ├── utils/
│   │   │   ├── form_validators.dart  # Validasi form input
│   │   │   └── password_hasher.dart  # Hashing SHA-256 bersalt
│   │   └── widgets/
│   │       ├── app_header.dart       # Header logo resmi + nama + tagline
│   │       ├── custom_button.dart    # Tombol aksi reusable
│   │       ├── custom_text_field.dart# Input field reusable dengan toggle password
│   │       └── feedback_banner.dart  # SnackBar / notifikasi
│   └── features/
│       ├── auth/                     # Modul Autentikasi
│       │   ├── data/
│       │   │   ├── models/user_model.dart
│       │   │   └── services/auth_service.dart
│       │   └── presentation/
│       │       ├── pages/login_page.dart
│       │       ├── pages/register_page.dart
│       │       └── widgets/role_security_badge.dart
│       └── home/                     # Modul Homepage Admin & Guru
│           ├── data/
│           │   ├── models/attendance_models.dart
│           │   └── services/attendance_service.dart
│           └── presentation/
│               ├── pages/
│               │   ├── home_page.dart        # Dashboard utama terintegrasi
│               │   ├── admin_home_page.dart  # Rute khusus Admin
│               │   └── guru_home_page.dart   # Rute khusus Guru
│               └── widgets/
│                   ├── home_header.dart              # Header logo, profil & dropdown role
│                   ├── welcome_hero_banner.dart      # Banner sapaan, gedung & lengkungan emas
│                   ├── main_menu_grid.dart           # 4 menu kartu utama satu baris
│                   ├── attendance_summary_card.dart  # Ringkasan absensi (Hadir, Izin, Alpha)
│                   ├── recent_activities_card.dart   # Aktivitas terakhir santri
│                   ├── custom_bottom_nav_bar.dart    # Navigasi bawah (Beranda, Absensi, Laporan, Pengaturan)
│                   └── feature_placeholder_modal.dart# Modal kontrol hak akses fitur
├── preview.html                      # Pratinjau interaktif web alur Login -> Homepage
├── pubspec.yaml                      # Konfigurasi dependensi Flutter & aset
└── README.md
```

---

## 3. Komponen & Fitur Homepage (Sesuai Referensi)

### 1. Header Aplikasi (Sesuai Butir 2)
- **Logo Darul Hikmah**: Logo resmi di sebelah kiri.
- **Nama Darul Hikmah** & Tulisan **Pondok Pesantren**.
- **Foto Profil Pengguna** & **Dropdown Role**: Tombol pil interaktif di kanan atas untuk beralih mode tampilan antara **Admin** dan **Guru**, serta fungsi **Logout** yang mengarahkan kembali ke halaman Login.

### 2. Welcome Section (Sesuai Butir 3)
- Sapaan: *"Assalamu'alaikum, Selamat Datang! di Aplikasi Santriya"*.
- Latar belakang gradasi hijau tua dengan foto arsitektur gedung pesantren di sisi kanan yang berbaur secara halus.
- Aksen lengkungan ganda warna emas (`#E5B842`) dan latar belakang tubuh dashboard di bagian bawah.

### 3. Menu Utama (Sesuai Butir 4)
Empat kartu dalam satu baris dengan ukuran kartu yang sama dan shadow lembut:
1. **Data Santri**: Ikon kelompok santri &rarr; Navigasi ke Data Santri.
2. **Absensi**: Ikon kalender &rarr; Navigasi ke Absensi Santri.
3. **Laporan**: Ikon grafik statistik &rarr; Navigasi ke Laporan Absensi.
4. **Pengaturan**: Ikon gear &rarr; Navigasi ke Pengaturan (dengan indikator status akses).

### 4. Ringkasan Absensi (Sesuai Butir 5)
- Header kartu hijau tua bertuliskan *"Ringkasan Absensi"* dilengkapi filter tanggal dropdown (*Hari Ini*, *Kemarin*, *Pekan Ini*).
- Tiga kolom metrik horizontal:
  - **Hadir**: Lingkaran hijau muda, angka jumlah hadir, teks hijau.
  - **Izin**: Lingkaran oranye muda, angka jumlah izin, teks oranye.
  - **Alpha**: Lingkaran merah muda, angka jumlah tanpa keterangan, teks merah.
- Perhitungan statistik terbarui secara otomatis saat filter tanggal diubah.

### 5. Pengajar Hari Ini (Sesuai Butir 6)
- Judul kartu *"Pengajar Hari Ini"* dilengkapi tombol *"Lihat Semua >"*.
- Menampilkan 3 data absensi terbaru:
  1. **Ahmad Fauzi** &bull; Hadir &bull; Kelas VII A (08:12, Hari Ini).
  2. **Siti Aisyah** &bull; Izin &bull; Kelas VIII B (07:50, Hari Ini).
  3. **Muhammad Rizky** &bull; Alpha &bull; Kelas VII B (07:30, Hari Ini).
- Disertai avatar santri dan indikator badge melayang (Hijau untuk Hadir, Oranye untuk Izin, Merah untuk Alpha).

### 6. Bottom Navigation (Sesuai Butir 7)
Navigasi tetap di bagian bawah layar dengan 4 menu:
1. **Beranda**: Menu aktif dengan badge kapsul hijau tua, ikon rumah putih, teks tebal hijau, dan garis indikator bawah aktif.
2. **Absensi**: Ikon kalender abu-abu.
3. **Laporan**: Ikon dokumen abu-abu.
4. **Pengaturan**: Ikon roda gigi abu-abu.

---

## 4. Hak Akses Admin dan Guru (Sesuai Butir 8)

| Fitur / Modul | Administrator | Guru |
|---|---|---|
| **Cakupan Ringkasan** | Seluruh santri pesantren (245 santri) | Kelas/Rombel yang diampu (68 santri) |
| **Data Santri** | Akses penuh seluruh database pondok | Melihat santri kelas binaan |
| **Absensi Santri** | Monitoring & pencatatan global | Input & presensi kelas harian |
| **Laporan** | Laporan berkala komprehensif pondok | Rekapitulasi kelas binaan |
| **Pengaturan** | Manajemen akun & sistem pondok | **Akses Dibatasi** (Tidak dapat mengelola admin) |
| **Pengajar Hari Ini** | Seluruh riwayat presensi santri | Riwayat santri kelas terkait |

---

## 5. Akun Uji Coba (Demo Kredensial)

1. **Akun Administrator**:
   - Username: `admin` atau `admin@darulhikmah.ponpes.id`
   - Password: `admin123`
   - Role: `Admin` (Mengarahkan langsung ke Homepage Admin)
2. **Akun Guru**:
   - Username: `ustadz_ahmad` atau `ahmad.fauzi@darulhikmah.ponpes.id`
   - Password: `guru123`
   - Role: `Guru` (Mengarahkan langsung ke Homepage Guru)

---

## 6. Cara Menjalankan & Menguji Aplikasi

Jalankan perintah berikut di terminal:
```bash
npm run web
```
Perintah ini akan membuka [preview.html](file:///d:/Kiro%20Folder/Darul%20Hikmah/preview.html) di browser Anda.

**Alur yang dapat diuji:**
1. Masuk menggunakan akun **Admin** atau **Guru** &rarr; otomatis diarahkan ke Homepage dengan data sesuai role.
2. Klik tombol dropdown role di kanan atas header untuk beralih seketika antara mode Admin dan mode Guru.
3. Klik tombol filter tanggal *"Hari Ini ⌄"* pada kartu Ringkasan Absensi untuk melihat angka terbarui otomatis.
4. Klik kartu menu *"Pengaturan"* saat login sebagai Guru untuk melihat notifikasi pembatasan hak akses yang elegan.
5. Klik *"Lihat Semua >"* pada Pengajar Hari Ini untuk membuka riwayat presensi harian.
6. Klik *"Keluar (Logout)"* pada menu dropdown profil untuk kembali ke halaman Login.
