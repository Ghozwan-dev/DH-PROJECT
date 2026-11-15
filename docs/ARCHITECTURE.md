# DOKUMEN ARSITEKTUR SISTEM
## SISTEM INFORMASI ABSENSI SANTRI — PONDOK PESANTREN ISLAM DARUL HIKMAH

- **Versi**: 1.0.0 (Tahap 1 — Frontend Refactoring & API Integration Readiness)
- **Framework Frontend**: Flutter (Web & Android)
- **Target Backend**: NestJS (TypeScript)
- **Target Database**: PostgreSQL
- **Target ORM**: Prisma ORM
- **Gaya Komunikasi**: REST API (JSON over HTTP/HTTPS)
- **Arsitektur**: Feature-Based Clean Architecture dengan Repository Pattern

---

## 1. PRINSIP ARSITEKTUR UTAMA

1. **Feature-Based Modular Structure**:
   Setiap modul fitur terisolasi dalam direktori masing-masing (`auth`, `home`, `students`, `attendance`). Tiap fitur memiliki pembagian sub-lapisan:
   - `data/models/`: Entity & Data Transfer Object (DTO) dengan serialisasi `fromJson` dan `toJson`.
   - `data/datasources/`: Sumber data (Mock in-memory untuk tahap frontend, Remote API untuk integrasi NestJS).
   - `data/repositories/`: Implementasi konkret dari kontrak repository.
   - `domain/repositories/`: Interface / abstract class repository sebagai batas abstraksi.
   - `presentation/pages/`: Widget tingkat halaman (*screen views*).
   - `presentation/widgets/`: Komponen UI modular dan reusable.

2. **Repository Pattern**:
   Lapisan Presentasi dan Service tidak pernah berkomunikasi langsung dengan sumber data spesifik. Mereka hanya bergantung pada interface `IRepository`.
   - **Mode Saat Ini**: Menggunakan `MockRepository` yang membaca data seed terisolasi.
   - **Mode Backend Mendatang**: Menginjeksi `ApiRepository` yang memanggil REST API NestJS.
   - Pergantian ke backend NestJS tidak memerlukan modifikasi sama sekali pada widget UI atau Controller.

3. **Pragmatic & Clean (Tanpa Over-Abstraction)**:
   Menghindari boilerplate yang berlebihan; menggunakan `ChangeNotifier` yang ringan dan mudah dipahami, sambil memastikan boundary antar-lapisan tetap tegas dan modular.

---

## 2. DIAGRAM ARSITEKTUR SISTEM

```
+------------------------------------------------------------------------+
|                          PRESENTATION LAYER                            |
|  Pages (Views)  <--->  Widgets (Components)  <--->  Notifiers/Services |
+------------------------------------------------------------------------+
                                    |
                                    v
+------------------------------------------------------------------------+
|                        DOMAIN / REPOSITORY LAYER                       |
|   IAuthRepository   |   IStudentRepository   |   IScheduleRepository   |
|                 ILessonAttendanceRepository                            |
+------------------------------------------------------------------------+
                                    |
                 +------------------+------------------+
                 |                                     |
                 v                                     v
+----------------------------------+ +-----------------------------------+
|      MOCK DATA LAYER (Tahap 1)   | |     REMOTE API LAYER (Tahap 2)    |
|   - MockAuthRepository           | |   - ApiAuthRepository             |
|   - MockStudentRepository        | |   - ApiStudentRepository          |
|   - MockScheduleRepository       | |   - ApiScheduleRepository         |
|   - MockAttendanceRepository     | |   - ApiAttendanceRepository       |
|   (In-Memory Seed Data Sources)  | |   (NestJS REST API Client)        |
+----------------------------------+ +-----------------------------------+
                                                       |
                                                       v
                                     +-----------------------------------+
                                     |         BACKEND NESTJS            |
                                     |  Controllers  -> Services         |
                                     |  Prisma ORM   -> PostgreSQL       |
                                     +-----------------------------------+
```

---

## 3. CORE NETWORK ABSTRACTION

Untuk menjembatani komunikasi ke backend NestJS mendatang, dibuat komponen inti di `lib/core/network/`:

1. **`ApiEndpoints`** (`lib/core/network/api_endpoints.dart`):
   Koleksi URL dan route endpoint REST API terpusat, memetakan controller NestJS:
   - `/auth/login`, `/auth/register`, `/auth/profile`
   - `/students`, `/students/:id`
   - `/schedules`, `/schedules/:id`
   - `/attendance/lessons`, `/attendance/lessons/:id`, `/attendance/lessons/summary`

2. **`ApiResponse<T>`** (`lib/core/network/api_response.dart`):
   Standarisasi struktur envelope response dari NestJS:
   ```json
   {
     "statusCode": 200,
     "message": "Operasi berhasil",
     "data": { ... },
     "meta": { "total": 100, "page": 1 }
   }
   ```

3. **`ApiException`** (`lib/core/network/api_exception.dart`):
   Hierarki penanganan exception jaringan yang tangguh:
   - `NetworkException` (Tidak ada koneksi internet / timeout)
   - `UnauthorizedException` (Token kedaluwarsa / 401)
   - `ForbiddenException` (Akses ditolak berdasarkan role RBAC / 403)
   - `NotFoundException` (Data tidak ditemukan / 404)
   - `ValidationException` (Validasi form gagal dari backend / 422)
   - `ServerException` (Internal server error / 500)

4. **`ApiClient`** (`lib/core/network/api_client.dart`):
   Klien HTTP terpadu dengan penyisipan Bearer Token otomatis, timeout handling, dan decoding response aman.

---

## 4. PEMETAAN ENTITAS PRISMA & POSTGRESQL

Untuk memastikan model Dart dapat bermigrasi mulus ke Prisma ORM di tahap backend:

| Entitas Dart | Model Prisma (PostgreSQL) | Kolom Kunci |
|---|---|---|
| `UserModel` | `User` | `id`, `username`, `email`, `passwordHash`, `role`, `createdAt` |
| `StudentModel` | `Student` | `id`, `nis`, `fullName`, `gender`, `className`, `room`, `birthDate`, `parentName`, `parentPhone`, `avatarAsset` |
| `ScheduleModel` | `Schedule` | `id`, `day`, `className`, `subject`, `teacherName`, `periodNumber`, `startTime`, `endTime`, `room` |
| `LessonAttendanceModel` | `LessonAttendance` | `id`, `scheduleId`, `date`, `className`, `subject`, `teacherName`, `periodNumber`, `recordedBy` |
| `StudentAttendanceItemModel` | `AttendanceItem` | `id`, `attendanceId`, `studentId`, `studentNis`, `studentName`, `status`, `note` |

Status Kehadiran Santri (`LessonAttendanceStatus`):
- `hadir` (H)
- `izin` (I)
- `sakit` (S)
- `alfa` (A)
*(Status 'terlambat' telah dihapus secara konsisten sesuai instruksi).*
