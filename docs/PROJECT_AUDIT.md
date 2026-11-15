# LAPORAN AUDIT ARSITEKTUR & KODE
## SISTEM INFORMASI ABSENSI SANTRI — PONDOK PESANTREN ISLAM DARUL HIKMAH

- **Tanggal Audit**: 15 November 2026
- **Auditor**: Senior Flutter Developer & Software Architect
- **Target Platform**: Flutter Web & Android
- **Target Backend Mendatang**: NestJS + PostgreSQL + Prisma ORM via REST API
- **Pola Arsitektur Target**: Feature-Based Clean Architecture (Repository Pattern)

---

## 1. BASELINE DAN KONDISI AWAL PROYEK

### 1.1 Status Git & Working Directory
- **Branch**: `master` (up to date dengan `origin/master`).
- **File Termodifikasi (Uncommitted)**:
  - `lib/features/attendance/data/models/schedule_model.dart`
  - `lib/features/attendance/presentation/pages/schedule_management_page.dart`
  - `lib/features/attendance/presentation/widgets/schedule_card.dart`
  - `lib/features/auth/data/models/user_model.dart`
  - `lib/features/home/data/models/attendance_models.dart`
  - `lib/features/students/data/models/student_model.dart`
  - `lib/features/students/data/services/student_service.dart`
  - `preview.html`
- **File Untracked**:
  - `lib/features/attendance/data/models/lesson_attendance_model.dart`
  - `lib/features/attendance/data/services/lesson_attendance_service.dart`
  - `lib/features/attendance/presentation/pages/attendance_form_page.dart`
  - `lib/features/attendance/presentation/widgets/attendance_history_view.dart`
  - `test/` (Unit test modul absensi)
- **Komitmen Keamanan**: Seluruh file kerja yang belum di-commit dipertahankan 100%, tidak ada file yang ditimpa atau dihapus.

### 1.2 Lingkungan Flutter & Tooling Host
- **Status CLI Flutter Host**: Perintah `flutter` tidak tersedia di PATH host environment saat ini.
- **Strategi Audit Alternatif**:
  - Validasi sintaksis statis dengan AST Delimiter Balancer (0 error pada kurung kurawal, kurung siku, dan tanda kurung di seluruh 49 file Dart).
  - Validasi import konsistensi terhadap `pubspec.yaml` (Ditemukan mismatch package import di file unit test).
  - Simulasi eksekusi logic VM headless pada Node sandbox.
  - Validasi interoperabilitas web pada `preview.html` (121.984 karakter JS valid).

---

## 2. INVENTARISASI & STATISTIK FILE DART

Total file kode Dart dalam proyek: **49 File**, terdistribusi dalam 4 Feature Modul dan 1 Core Modul:

| Modul | Lokasi Direktori | Jumlah File | Karakteristik Utama |
|---|---|---|---|
| **Core** | `lib/core/` | 10 File | Tema, Warna, Validator, Widget reusable dasar |
| **Auth** | `lib/features/auth/` | 6 File | Model pengguna, otentikasi SHA-256 tersalt, halaman Login & Register |
| **Home** | `lib/features/home/` | 11 File | Dashboard Admin & Guru, ringkasan absensi, kartu aktivitas |
| **Students** | `lib/features/students/` | 8 File | Manajemen santri, formulir santri, profil detail santri |
| **Attendance** | `lib/features/attendance/` | 13 File | Jadwal pelajaran, absensi per mapel, validasi bentrok, riwayat |
| **App Root** | `lib/main.dart` | 1 File | Entry point aplikasi |

---

## 3. IDENTIFIKASI CODE SMELLS & MASALAH ARSITEKTURAL

### 3.1 File dengan Tanggung Jawab Berlebihan (*God Files*)
Beberapa file presentation menangani terlalu banyak tanggung jawab sekaligus (rendering UI, local state, dialogs, validation, direct service calls):

1. **`student_form_page.dart` (777 baris, ~32 KB)**:
   - *Masalah*: Menggabungkan formulir multi-section (identitas, akademik, orang tua/wali), date picker handler, logika validasi, dialog konfirmasi keluar, dan bottom sheet pemilih foto profil dalam 1 kelas State.
   - *Rekomendasi*: Pisahkan bottom sheet pemilih avatar (`student_avatar_picker_sheet.dart`) dan card form section (`student_form_section_card.dart`).

2. **`student_detail_page.dart` (680 baris, ~24 KB)**:
   - *Masalah*: Menggabungkan tampilan profil, status chip, baris data identitas, dialog konfirmasi hapus, dan duplikasi kode bottom sheet pemilih foto profil yang hampir identik dengan yang ada di `student_form_page.dart`.
   - *Rekomendasi*: Gunakan kembali avatar picker sheet yang diekstrak.

3. **`schedule_form_page.dart` (682 baris, ~24 KB)**:
   - *Masalah*: Menggabungkan form input, time picker dialog builder, banner penanganan bentrok jadwal, dan dropdown picker dalam 1 file State.
   - *Rekomendasi*: Ekstrak selector waktu dan banner bentrok ke widget mandiri.

4. **`attendance_history_view.dart` (1053 baris, ~40 KB)**:
   - *Masalah*: Menggabungkan tab riwayat, bar filter pencarian, 4 kolom rekap statistik, kartu riwayat sesi mapel, AND modal pop-up bottom sheet rincian hasil absensi 320 baris di dalam file yang sama.
   - *Rekomendasi*: Ekstrak modal rincian hasil absensi menjadi `attendance_result_sheet.dart`.

### 3.2 Pencampuran Data Dummy dengan Business Logic (*Data Source Tight Coupling*)
1. **`student_service.dart`**:
   - Berisi array in-memory `_students` sebanyak ~90 baris data dummy statis langsung di dalam konstruktor service.
   - Service langsung memanipulasi list in-memory tanpa lapisan abstraksi repository.
2. **`schedule_service.dart`**:
   - Berisi array in-memory `_schedules` lebih dari 270 baris langsung di dalam kelas service.
   - Logika validasi bentrok jadwal (*conflict detection*) bercampur dengan penyimpanan in-memory.
3. **`auth_service.dart`**:
   - Berisi array akun `_userDatabase` langsung di dalam kelas service.
4. **`lesson_attendance_service.dart`**:
   - Berisi seed dummy records langsung di dalam kelas service.

### 3.3 Kode Duplikasi (*Code Duplication*)
1. **Photo Picker Bottom Sheet**:
   - Ditemukan duplikasi kode UI pemilih foto profil santri putra/putri di `student_form_page.dart` (baris 120-250) dan `student_detail_page.dart` (baris 54-180).
2. **Date & Time Picker Theming**:
   - Kode pembuatan DatePicker dialog builder dengan konfigurasi tema warna primer diulang di `student_form_page.dart`, `schedule_form_page.dart`, dan `attendance_history_view.dart`.

### 3.4 Ketergantungan Paket & Error Import
- **Temuan Kritis**: Pada file `test/features/attendance/lesson_attendance_test.dart`, impor menggunakan package `package:darul_hikmah_app/...`, sementara pada `pubspec.yaml` nama aplikasi adalah `darul_hikmah_absensi`. Hal ini menyebabkan kegagalan resolusi paket saat dijalankan dengan analyzer Dart resmi.

### 3.5 Kesiapan Integrasi NestJS REST API & PostgreSQL
- Saat ini belum ada:
  1. Abstraksi Network Client (`ApiClient`).
  2. Standarisasi Error Handling & Exception HTTP (`ApiException`, `UnauthorizedException`, `ValidationException`).
  3. Format Envelope Response (`ApiResponse<T>`).
  4. Repository Interface (`IStudentRepository`, `IScheduleRepository`, `IAuthRepository`, `IAttendanceRepository`).
  5. Konfigurasi endpoint terpusat (`ApiEndpoints`).

---

## 4. RENCANA STRATEGIS REFACTORING TAHAP 1

Untuk menyiapkan aplikasi menuju backend NestJS + PostgreSQL tanpa merusak UI/UX atau alur yang sudah berjalan:
1. **Membangun Core Network Layer**:
   - `lib/core/network/api_endpoints.dart`
   - `lib/core/network/api_exception.dart`
   - `lib/core/network/api_response.dart`
   - `lib/core/network/api_client.dart`
2. **Mengisolasi Mock Data Source**:
   - Pindahkan seluruh data in-memory / seed dummy ke file terpisah (`mock_student_data.dart`, `mock_schedule_data.dart`, `mock_attendance_data.dart`, `mock_auth_data.dart`).
3. **Menerapkan Repository Pattern**:
   - Buat kontrak interface abstrak untuk setiap domain.
   - Buat implementasi Mock Repository yang menggunakan mock data source terisolasi.
   - Hubungkan Service ke Repository Interface sehingga saat backend NestJS siap, cukup dibuat Remote/Http Repository tanpa mengubah UI atau Service layer.
4. **Memecah God Files & Menghilangkan Duplikasi**:
   - Buat `student_avatar_picker_sheet.dart` yang dapat dipakai bersama.
   - Ekstrak modal rincian absensi menjadi `attendance_result_sheet.dart`.
5. **Memperbaiki Error Import & Menjalankan Uji Regresi 100%**.
