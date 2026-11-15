# RENCANA INTEGRASI REST API (NESTJS + POSTGRESQL)
## SISTEM INFORMASI ABSENSI SANTRI — PONDOK PESANTREN ISLAM DARUL HIKMAH

- **Dokumen**: Panduan Arsitektur & Spesifikasi Integrasi REST API Backend
- **Target Backend**: NestJS (TypeScript)
- **Target Database**: PostgreSQL
- **Target ORM**: Prisma ORM
- **Gaya Komunikasi**: JSON over RESTful HTTP/HTTPS

---

## 1. PRINSIP DESAIN API & PROTOKOL KOMUNIKASI

### 1.1 Konvensi Dasar
- **Base URL**: `https://api.darulhikmah.ponpes.id/v1` (Staging/Dev: `http://localhost:3000/v1`)
- **Autentikasi**: JSON Web Token (JWT) standar RFC 7519 yang dikirimkan melalui HTTP Header:
  ```http
  Authorization: Bearer <access_token>
  ```
- **Content-Type**: `application/json; charset=utf-8`
- **Format Tanggal**: ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`) atau tanggal sederhana (`YYYY-MM-DD`).

### 1.2 Format Envelope Respons JSON (ApiResponse Standard)
Setiap endpoint API NestJS wajib membungkus respons dalam format seragam yang sudah disiapkan di Flutter (`lib/core/network/api_response.dart`):

**Format Sukses (HTTP 200 / 201):**
```json
{
  "success": true,
  "message": "Data berhasil diambil.",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 120,
    "totalPages": 6
  }
}
```

**Format Gagal (HTTP 400 / 401 / 403 / 404 / 422 / 500):**
```json
{
  "success": false,
  "message": "Validasi gagal. Periksa kembali input Anda.",
  "errors": {
    "nis": ["NIS '2024001' sudah terdaftar."],
    "className": ["Kelas wajib dipilih."]
  }
}
```

---

## 2. SKEMA DATABASE POSTGRESQL (PRISMA ORM)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  GURU
}

enum Gender {
  PUTRA
  PUTRI
}

enum AttendanceStatus {
  HADIR
  IZIN
  SAKIT
  ALFA
}

model User {
  id           String             @id @default(uuid())
  fullName     String             @map("full_name") @db.VarChar(100)
  username     String             @unique @db.VarChar(50)
  email        String?            @unique @db.VarChar(100)
  phoneNumber  String             @map("phone_number") @db.VarChar(20)
  passwordHash String             @map("password_hash") @db.VarChar(255)
  role         Role               @default(GURU)
  createdAt    DateTime           @default(now()) @map("created_at")
  updatedAt    DateTime           @updatedAt @map("updated_at")

  schedules    Schedule[]
  attendances  LessonAttendance[]

  @@map("users")
}

model Student {
  id             String                   @id @default(uuid())
  nis            String                   @unique @db.VarChar(20)
  fullName       String                   @map("full_name") @db.VarChar(100)
  gender         Gender
  className      String                   @map("class_name") @db.VarChar(20)
  room           String                   @db.VarChar(50)
  birthPlace     String                   @map("birth_place") @db.VarChar(50)
  birthDate      DateTime                 @map("birth_date") @db.Date
  address        String                   @db.Text
  parentName     String                   @map("parent_name") @db.VarChar(100)
  parentPhone    String                   @map("parent_phone") @db.VarChar(20)
  enrollmentDate DateTime                 @map("enrollment_date") @db.Date
  isActive       Boolean                  @default(true) @map("is_active")
  avatarAsset    String?                  @map("avatar_asset") @db.VarChar(255)
  createdAt      DateTime                 @default(now()) @map("created_at")
  updatedAt      DateTime                 @updatedAt @map("updated_at")

  attendanceItems StudentAttendanceItem[]

  @@index([className, isActive])
  @@map("students")
}

model Schedule {
  id           String             @id @default(uuid())
  day          String             @db.VarChar(10)
  className    String             @map("class_name") @db.VarChar(20)
  subject      String             @db.VarChar(100)
  teacherName  String             @map("teacher_name") @db.VarChar(100)
  teacherId    String?            @map("teacher_id")
  periodNumber Int                @map("period_number")
  startTime    String             @map("start_time") @db.VarChar(5) // Format "07:30"
  endTime      String             @map("end_time") @db.VarChar(5)   // Format "08:15"
  room         String?            @db.VarChar(100)
  notes        String?            @db.Text
  createdAt    DateTime           @default(now()) @map("created_at")
  updatedAt    DateTime           @updatedAt @map("updated_at")

  teacher      User?              @relation(fields: [teacherId], references: [id], onDelete: SetNull)
  attendances  LessonAttendance[]

  @@index([day, className])
  @@index([teacherName])
  @@map("schedules")
}

model LessonAttendance {
  id           String                  @id @default(uuid())
  scheduleId   String                  @map("schedule_id")
  date         String                  @db.VarChar(10) // Format "YYYY-MM-DD"
  className    String                  @map("class_name") @db.VarChar(20)
  subject      String                  @db.VarChar(100)
  teacherName  String                  @map("teacher_name") @db.VarChar(100)
  teacherId    String?                 @map("teacher_id")
  periodNumber Int                     @map("period_number")
  startTime    String                  @map("start_time") @db.VarChar(5)
  endTime      String                  @map("end_time") @db.VarChar(5)
  recordedBy   String                  @map("recorded_by") @db.VarChar(100)
  userId       String?                 @map("user_id")
  createdAt    DateTime                @default(now()) @map("created_at")
  updatedAt    DateTime                @updatedAt @map("updated_at")

  schedule     Schedule                @relation(fields: [scheduleId], references: [id], onDelete: Cascade)
  user         User?                   @relation(fields: [userId], references: [id], onDelete: SetNull)
  items        StudentAttendanceItem[]

  @@unique([scheduleId, date])
  @@index([date, className])
  @@map("lesson_attendances")
}

model StudentAttendanceItem {
  id           String           @id @default(uuid())
  attendanceId String           @map("attendance_id")
  studentId    String           @map("student_id")
  studentNis   String           @map("student_nis") @db.VarChar(20)
  studentName  String           @map("student_name") @db.VarChar(100)
  avatarAsset  String?          @map("avatar_asset") @db.VarChar(255)
  status       AttendanceStatus
  note         String?          @db.Text

  attendance   LessonAttendance @relation(fields: [attendanceId], references: [id], onDelete: Cascade)
  student      Student          @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@unique([attendanceId, studentId])
  @@map("student_attendance_items")
}
```

---

## 3. PEMETAAN ENDPOINT REST API (NESTJS CONTROLLER)

### 3.1 Auth Controller (`/auth`)
| Method | Endpoint | Deskripsi | Hak Akses | Status Code |
|---|---|---|---|---|
| `POST` | `/auth/login` | Login dengan username/email/no HP dan password | Publik | `200 OK` |
| `POST` | `/auth/register` | Pendaftaran akun Guru baru (Admin dikunci internal) | Publik | `201 Created` |
| `GET` | `/auth/me` | Mengambil profil pengguna yang sedang login | Authenticated | `200 OK` |
| `POST` | `/auth/forgot-password` | Pengajuan reset password akun | Publik | `200 OK` |

### 3.2 Students Controller (`/students`)
| Method | Endpoint | Deskripsi | Hak Akses | Status Code |
|---|---|---|---|---|
| `GET` | `/students` | Daftar santri dengan pagination, filter kelas, gender, status | Guru, Admin | `200 OK` |
| `GET` | `/students/:id` | Detail data lengkap seorang santri | Guru, Admin | `200 OK` |
| `GET` | `/students/by-class/:className` | Mengambil santri aktif untuk kelas tertentu | Guru, Admin | `200 OK` |
| `POST` | `/students` | Menambah data santri baru (validasi NIS unik) | Admin Saja | `201 Created` |
| `PUT` | `/students/:id` | Memperbarui data santri eksisting | Admin Saja | `200 OK` |
| `PATCH` | `/students/:id/avatar` | Memperbarui foto avatar santri | Admin Saja | `200 OK` |
| `DELETE` | `/students/:id` | Menghapus santri | Admin Saja | `200 OK` |

### 3.3 Schedules Controller (`/schedules`)
| Method | Endpoint | Deskripsi | Hak Akses | Status Code |
|---|---|---|---|---|
| `GET` | `/schedules` | Mengambil seluruh jadwal atau jadwal milik guru login | Guru (miliknya), Admin (semua) | `200 OK` |
| `GET` | `/schedules/:id` | Mengambil detail spesifik satu jadwal | Guru, Admin | `200 OK` |
| `POST` | `/schedules` | Membuat jadwal baru (validasi bentrok guru & kelas) | Admin Saja | `201 Created` |
| `PUT` | `/schedules/:id` | Memperbarui jadwal pelajaran | Admin Saja | `200 OK` |
| `DELETE` | `/schedules/:id` | Menghapus jadwal pelajaran | Admin Saja | `200 OK` |

### 3.4 Lesson Attendance Controller (`/attendance/lessons`)
| Method | Endpoint | Deskripsi | Hak Akses | Status Code |
|---|---|---|---|---|
| `GET` | `/attendance/lessons` | Riwayat sesi absensi tersaring (tanggal, mapel, kelas) | Guru (miliknya), Admin (semua) | `200 OK` |
| `GET` | `/attendance/lessons/recap` | Ringkasan metrik Hadir, Izin, Sakit, Alfa | Guru (miliknya), Admin (semua) | `200 OK` |
| `POST` | `/attendance/lessons` | Simpan / update absensi (upsert per scheduleId + date) | Guru jadwal terkait, Admin | `200 OK / 201 Created` |
| `DELETE` | `/attendance/lessons/:id` | Menghapus catatan absensi | Admin Saja (Guru Forbidden) | `200 OK` |

---

## 4. CONTOH KONTRAK DATA TRANSFER OBJECT (DTO)

### 4.1 SaveAttendanceDto (NestJS Input)
```typescript
import { IsString, IsArray, ValidateNested, ArrayMinSize, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export enum AttendanceStatusEnum {
  HADIR = 'hadir',
  IZIN = 'izin',
  SAKIT = 'sakit',
  ALFA = 'alfa',
}

export class StudentAttendanceItemDto {
  @IsString()
  studentId: string;

  @IsString()
  studentNis: string;

  @IsString()
  studentName: string;

  @IsOptional()
  @IsString()
  avatarAsset?: string;

  @IsEnum(AttendanceStatusEnum)
  status: AttendanceStatusEnum;

  @IsOptional()
  @IsString()
  note?: string;
}

export class SaveAttendanceDto {
  @IsString()
  scheduleId: string;

  @IsString()
  date: string; // "YYYY-MM-DD"

  @IsArray()
  @ArrayMinSize(1, { message: 'Daftar kehadiran santri tidak boleh kosong.' })
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceItemDto)
  items: StudentAttendanceItemDto[];
}
```

---

## 5. PANDUAN IMPLEMENTASI REPOSITORY API FLUTTER (TAHAP BERIKUTNYA)

Ketika backend NestJS sudah siap, pengembang Flutter cukup membuat kelas baru yang mengimplementasikan interface repository yang sudah tersedia:

```dart
// Contoh Implementasi ApiStudentRepository:
class ApiStudentRepository implements IStudentRepository {
  final ApiClient _client;
  ApiStudentRepository(this._client);

  @override
  List<StudentModel> getStudents() {
    // Memanggil API via _client.get(ApiEndpoints.students)
    // Mengembalikan list data dari server
  }

  // Mengimplementasikan method interface lainnya...
}
```

Dan untuk mengaktifkannya di Flutter:
```dart
// Cukup ganti di main.dart atau via Dependency Injection:
final apiClient = ApiClient(baseUrl: 'https://api.darulhikmah.ponpes.id/v1');
StudentService().setRepository(ApiStudentRepository(apiClient));
ScheduleService().setRepository(ApiScheduleRepository(apiClient));
LessonAttendanceService().setRepository(ApiLessonAttendanceRepository(apiClient));
AuthService().setRepository(ApiAuthRepository(apiClient));
```
**Seluruh widget UI, halaman login, dashboard, dan visual Flutter tidak perlu diubah sedikit pun.**

---

## 6. CHECKLIST KEAMANAN & DEPLOYMENT

- [x] **Salt Hashing Password**: SHA-256 tersalt di frontend, siap menggunakan `bcrypt` dengan cost factor 12 di NestJS.
- [x] **RBAC di Logic Layer**: Logika pencegahan guru mengedit/menghapus jadwal guru lain diterapkan di application layer, bukan sekadar menyembunyikan tombol.
- [x] **Pencegahan Akun Admin Publik**: Endpoint pendaftaran publik `/auth/register` secara eksplisit mengunci `role: GURU`.
- [x] **Pencegahan Sesi Ganda**: Constraint database `@unique([scheduleId, date])` menjamin tidak ada duplikasi data absensi untuk mata pelajaran dan tanggal yang sama.
- [x] **Pemisahan Sumber Data**: Tidak ada data dummy yang tertanam langsung di dalam komponen UI atau business logic.
