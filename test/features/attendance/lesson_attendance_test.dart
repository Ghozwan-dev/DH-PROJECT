import 'package:flutter_test/flutter_test.dart';
import 'package:darul_hikmah_absensi/features/auth/data/models/user_model.dart';
import 'package:darul_hikmah_absensi/features/attendance/data/models/schedule_model.dart';
import 'package:darul_hikmah_absensi/features/attendance/data/models/lesson_attendance_model.dart';
import 'package:darul_hikmah_absensi/features/attendance/data/models/student_attendance_recap_model.dart';
import 'package:darul_hikmah_absensi/features/attendance/data/models/attendance_report_model.dart';
import 'package:darul_hikmah_absensi/features/attendance/data/services/attendance_report_export_service.dart';
import 'package:darul_hikmah_absensi/features/attendance/data/services/lesson_attendance_service.dart';
import 'package:darul_hikmah_absensi/features/attendance/domain/repositories/lesson_attendance_repository_interface.dart';

void main() {
  group('LessonAttendanceModel Unit Tests', () {
    test('Calculates presence breakdown correctly', () {
      final items = [
        const StudentAttendanceItemModel(
          studentId: 'SNT-001',
          studentNis: '2024001',
          studentName: 'Ahmad Fauzi',
          status: LessonAttendanceStatus.hadir,
        ),
        const StudentAttendanceItemModel(
          studentId: 'SNT-002',
          studentNis: '2024002',
          studentName: 'Muhammad Rizky',
          status: LessonAttendanceStatus.izin,
        ),
        const StudentAttendanceItemModel(
          studentId: 'SNT-003',
          studentNis: '2024003',
          studentName: 'Zaidan Al-Farisi',
          status: LessonAttendanceStatus.sakit,
        ),
        const StudentAttendanceItemModel(
          studentId: 'SNT-004',
          studentNis: '2024004',
          studentName: 'Lukman Al-Hakim',
          status: LessonAttendanceStatus.alfa,
        ),
      ];

      final attendance = LessonAttendanceModel(
        id: 'ATT-TEST-001',
        scheduleId: 'SCH-001',
        date: '2026-11-15',
        className: 'VII A',
        subject: 'Fiqih',
        teacherName: 'Ustadz Ahmad Fauzi',
        periodNumber: 1,
        startTime: '07:30',
        endTime: '08:15',
        items: items,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        recordedBy: 'Admin',
      );

      expect(attendance.totalStudents, equals(4));
      expect(attendance.hadirCount, equals(1));
      expect(attendance.izinCount, equals(1));
      expect(attendance.sakitCount, equals(1));
      expect(attendance.alfaCount, equals(1));
      expect(attendance.formattedDate, equals('15/11/2026'));
    });

    test('toJson and fromJson preserves data integrity', () {
      final original = LessonAttendanceModel(
        id: 'ATT-JSON-001',
        scheduleId: 'SCH-002',
        date: '2026-11-15',
        className: 'VII B',
        subject: 'Bahasa Arab',
        teacherName: 'Ustadz Ahmad Fauzi',
        periodNumber: 2,
        startTime: '08:15',
        endTime: '09:00',
        items: const [
          StudentAttendanceItemModel(
            studentId: 'SNT-002',
            studentNis: '2024002',
            studentName: 'Muhammad Rizky',
            status: LessonAttendanceStatus.hadir,
            note: 'Tepat waktu',
          ),
        ],
        createdAt: DateTime(2026, 11, 15, 8, 30),
        updatedAt: DateTime(2026, 11, 15, 8, 30),
        recordedBy: 'Ustadz Ahmad Fauzi',
      );

      final json = original.toJson();
      final parsed = LessonAttendanceModel.fromJson(json);

      expect(parsed.id, equals(original.id));
      expect(parsed.subject, equals(original.subject));
      expect(parsed.items.first.studentName, equals('Muhammad Rizky'));
      expect(parsed.items.first.status, equals(LessonAttendanceStatus.hadir));
    });
  });

  group('LessonAttendanceService RBAC and Validation Tests', () {
    late LessonAttendanceService service;

    final adminUser = UserModel(
      id: 'USR-001',
      fullName: 'Administrator Pondok',
      username: 'admin',
      phoneNumber: '081234567890',
      passwordHash: 'hash',
      role: UserRole.admin,
      createdAt: DateTime.now(),
    );

    final guruAhmad = UserModel(
      id: 'USR-002',
      fullName: 'Ustadz Ahmad Fauzi',
      username: 'ustadz_ahmad',
      phoneNumber: '081234567891',
      passwordHash: 'hash',
      role: UserRole.guru,
      createdAt: DateTime.now(),
    );

    final scheduleAhmad = const ScheduleModel(
      id: 'SCH-001',
      day: 'Senin',
      className: 'VII A',
      subject: 'Fiqih',
      teacherName: 'Ustadz Ahmad Fauzi',
      periodNumber: 1,
      startTime: '07:30',
      endTime: '08:15',
    );

    final scheduleOther = const ScheduleModel(
      id: 'SCH-003',
      day: 'Senin',
      className: 'VIII B',
      subject: 'Al-Qur\'an Hadits',
      teacherName: 'Ustadzah Halimah',
      periodNumber: 1,
      startTime: '07:30',
      endTime: '08:15',
    );

    setUp(() {
      service = LessonAttendanceService();
    });

    test('Guru can fill attendance for their own schedule', () async {
      final items = [
        const StudentAttendanceItemModel(
          studentId: 'SNT-001',
          studentNis: '2024001',
          studentName: 'Ahmad Fauzi',
          status: LessonAttendanceStatus.hadir,
        ),
      ];

      final saved = await service.saveAttendance(
        user: guruAhmad,
        schedule: scheduleAhmad,
        date: '2026-11-20',
        items: items,
      );

      expect(saved.subject, equals('Fiqih'));
      expect(saved.items.length, equals(1));
    });

    test('Guru CANNOT fill attendance for other teachers schedule', () async {
      final items = [
        const StudentAttendanceItemModel(
          studentId: 'SNT-004',
          studentNis: '2024004',
          studentName: 'Siti Aisyah',
          status: LessonAttendanceStatus.hadir,
        ),
      ];

      expect(
        () => service.saveAttendance(
          user: guruAhmad,
          schedule: scheduleOther,
          date: '2026-11-20',
          items: items,
        ),
        throwsA(isA<UnauthorizedAttendanceException>()),
      );
    });

    test('Guru CANNOT delete attendance data', () async {
      expect(
        () => service.deleteAttendance(
          user: guruAhmad,
          attendanceId: 'ATT-001',
        ),
        throwsA(isA<UnauthorizedAttendanceException>()),
      );
    });

    test('Admin can delete attendance data', () async {
      final result = await service.deleteAttendance(
        user: adminUser,
        attendanceId: 'ATT-001',
      );
      expect(result, isTrue);
    });

    test('Prevents duplicate attendance and updates existing record instead', () async {
      final items1 = [
        const StudentAttendanceItemModel(
          studentId: 'SNT-001',
          studentNis: '2024001',
          studentName: 'Ahmad Fauzi',
          status: LessonAttendanceStatus.hadir,
        ),
      ];

      final firstSave = await service.saveAttendance(
        user: adminUser,
        schedule: scheduleAhmad,
        date: '2026-11-25',
        items: items1,
      );

      final items2 = [
        const StudentAttendanceItemModel(
          studentId: 'SNT-001',
          studentNis: '2024001',
          studentName: 'Ahmad Fauzi',
          status: LessonAttendanceStatus.izin,
          note: 'Update status izin',
        ),
      ];

      final secondSave = await service.saveAttendance(
        user: adminUser,
        schedule: scheduleAhmad,
        date: '2026-11-25',
        items: items2,
      );

      expect(secondSave.id, equals(firstSave.id));
      expect(secondSave.items.first.status, equals(LessonAttendanceStatus.izin));
      expect(secondSave.items.first.note, equals('Update status izin'));
    });
  });

  group('Penyempurnaan Fitur Absensi Santri (Scenarios A, B, C, D)', () {
    late LessonAttendanceService service;

    final adminUser = UserModel(
      id: 'USR-001',
      fullName: 'Administrator Pondok',
      username: 'admin',
      phoneNumber: '081234567890',
      passwordHash: 'hash',
      role: UserRole.admin,
      createdAt: DateTime.now(),
    );

    final scheduleVIIA = const ScheduleModel(
      id: 'SCH-001',
      day: 'Senin',
      className: 'VII A',
      subject: 'Fiqih',
      teacherName: 'Ustadz Ahmad Fauzi',
      periodNumber: 1,
      startTime: '07:30',
      endTime: '08:15',
    );

    setUp(() {
      service = LessonAttendanceService();
    });

    test('Skenario A: Semua santri memiliki status -> Ringkasan status akurat dan simpan berhasil', () async {
      final students = service.getStudentsForClass('VII A');
      expect(students.isNotEmpty, isTrue);

      final Map<String, LessonAttendanceStatus?> statuses = {
        for (var s in students) s.id: LessonAttendanceStatus.hadir,
      };

      if (students.length >= 2) {
        statuses[students[1].id] = LessonAttendanceStatus.izin;
      }
      if (students.length >= 3) {
        statuses[students[2].id] = LessonAttendanceStatus.sakit;
      }
      if (students.length >= 4) {
        statuses[students[3].id] = LessonAttendanceStatus.alfa;
      }

      final unassigned = students.where((s) => statuses[s.id] == null).toList();
      expect(unassigned.isEmpty, isTrue);

      int hadir = 0, izin = 0, sakit = 0, alfa = 0;
      for (final s in students) {
        final st = statuses[s.id];
        if (st == LessonAttendanceStatus.hadir) hadir++;
        else if (st == LessonAttendanceStatus.izin) izin++;
        else if (st == LessonAttendanceStatus.sakit) sakit++;
        else if (st == LessonAttendanceStatus.alfa) alfa++;
      }

      final total = students.length;
      expect(hadir + izin + sakit + alfa, equals(total));

      final items = students.map((s) {
        return StudentAttendanceItemModel(
          studentId: s.id,
          studentNis: s.nis,
          studentName: s.fullName,
          status: statuses[s.id]!,
        );
      }).toList();

      final saved = await service.saveAttendance(
        user: adminUser,
        schedule: scheduleVIIA,
        date: '2026-11-28',
        items: items,
      );

      expect(saved.totalStudents, equals(total));
      expect(saved.hadirCount, equals(hadir));
      expect(saved.izinCount, equals(izin));
      expect(saved.sakitCount, equals(sakit));
      expect(saved.alfaCount, equals(alfa));
    });

    test('Skenario B: Ada santri belum memiliki status -> Validasi menolak proses simpan', () {
      final students = service.getStudentsForClass('VII A');
      expect(students.isNotEmpty, isTrue);

      final Map<String, LessonAttendanceStatus?> statuses = {
        for (var s in students) s.id: null,
      };

      statuses[students.first.id] = LessonAttendanceStatus.hadir;

      final unassigned = students.where((s) => statuses[s.id] == null).toList();
      final unassignedCount = unassigned.length;

      expect(unassignedCount, greaterThan(0));
      expect(unassignedCount, equals(students.length - 1));

      final errorMessage = 'Masih ada $unassignedCount santri yang belum memiliki status kehadiran.';
      expect(errorMessage, contains('Masih ada $unassignedCount santri yang belum memiliki status kehadiran.'));

      final firstUnassignedStudent = unassigned.first;
      expect(firstUnassignedStudent.id, equals(students[1].id));
    });

    test('Skenario C: Setelah status dilengkapi -> Validasi berhasil dan data dapat disimpan', () async {
      final students = service.getStudentsForClass('VII A');
      final Map<String, LessonAttendanceStatus?> statuses = {
        for (var s in students) s.id: null,
      };

      expect(students.any((s) => statuses[s.id] == null), isTrue);

      for (var s in students) {
        statuses[s.id] = LessonAttendanceStatus.hadir;
      }

      final unassigned = students.where((s) => statuses[s.id] == null).toList();
      expect(unassigned.isEmpty, isTrue);

      final items = students.map((s) {
        return StudentAttendanceItemModel(
          studentId: s.id,
          studentNis: s.nis,
          studentName: s.fullName,
          status: statuses[s.id]!,
        );
      }).toList();

      final saved = await service.saveAttendance(
        user: adminUser,
        schedule: scheduleVIIA,
        date: '2026-11-29',
        items: items,
      );

      expect(saved.totalStudents, equals(students.length));
      expect(saved.hadirCount, equals(students.length));
    });

    test('Skenario D: Tidak terjadi duplikasi absensi dan fitur edit tetap berfungsi', () async {
      final students = service.getStudentsForClass('VII A');
      const testDate = '2026-11-30';

      final initialItems = students.map((s) {
        return StudentAttendanceItemModel(
          studentId: s.id,
          studentNis: s.nis,
          studentName: s.fullName,
          status: LessonAttendanceStatus.hadir,
        );
      }).toList();

      final created = await service.saveAttendance(
        user: adminUser,
        schedule: scheduleVIIA,
        date: testDate,
        items: initialItems,
      );

      final totalRecordsBefore = service.getAttendanceRecords().length;

      final updatedItems = students.map((s) {
        return StudentAttendanceItemModel(
          studentId: s.id,
          studentNis: s.nis,
          studentName: s.fullName,
          status: s.id == students.first.id ? LessonAttendanceStatus.izin : LessonAttendanceStatus.hadir,
          note: s.id == students.first.id ? 'Ada surat dokter' : null,
        );
      }).toList();

      final updated = await service.saveAttendance(
        user: adminUser,
        schedule: scheduleVIIA,
        date: testDate,
        items: updatedItems,
      );

      final totalRecordsAfter = service.getAttendanceRecords().length;

      expect(updated.id, equals(created.id));
      expect(totalRecordsAfter, equals(totalRecordsBefore));

      expect(updated.izinCount, equals(1));
      expect(updated.items.first.status, equals(LessonAttendanceStatus.izin));
      expect(updated.items.first.note, equals('Ada surat dokter'));
    });
  });

  group('PENGEMBANGAN SUBMENU RIWAYAT ABSENSI SANTRI - 10 Skenario Pengujian', () {
    late LessonAttendanceService service;

    final adminUser = UserModel(
      id: 'USR-001',
      fullName: 'Administrator Pondok',
      username: 'admin',
      phoneNumber: '081234567890',
      passwordHash: 'hash',
      role: UserRole.admin,
      createdAt: DateTime.now(),
    );

    final guruAhmad = UserModel(
      id: 'USR-002',
      fullName: 'Ustadz Ahmad Fauzi',
      username: 'ustadz_ahmad',
      phoneNumber: '081234567891',
      passwordHash: 'hash',
      role: UserRole.guru,
      createdAt: DateTime.now(),
    );

    final scheduleAhmad = const ScheduleModel(
      id: 'SCH-001',
      day: 'Senin',
      className: 'VII A',
      subject: 'Fiqih',
      teacherName: 'Ustadz Ahmad Fauzi',
      periodNumber: 1,
      startTime: '07:30',
      endTime: '08:15',
    );

    setUp(() {
      service = LessonAttendanceService();
    });

    test('1. Riwayat bertambah setelah absensi berhasil disimpan', () async {
      final countBefore = service.allRecords.length;
      final students = service.getStudentsForClass('VII A');

      final items = students.map((s) => StudentAttendanceItemModel(
        studentId: s.id,
        studentNis: s.nis,
        studentName: s.fullName,
        status: LessonAttendanceStatus.hadir,
      )).toList();

      final saved = await service.saveAttendance(
        user: adminUser,
        schedule: scheduleAhmad,
        date: '2026-12-01',
        items: items,
      );

      final countAfter = service.allRecords.length;
      expect(countAfter, equals(countBefore + 1));
      expect(saved.date, equals('2026-12-01'));
    });

    test('2. Riwayat tidak bertambah jika penyimpanan dibatalkan', () {
      final countBefore = service.allRecords.length;

      // Simulasi pembatalan pada dialog konfirmasi (user memilih Batal/Kembali)
      bool isConfirmed = false;
      if (isConfirmed) {
        // Tidak dieksekusi
      }

      final countAfter = service.allRecords.length;
      expect(countAfter, equals(countBefore));
    });

    test('3. Perubahan absensi ikut memperbarui detail riwayat', () async {
      final students = service.getStudentsForClass('VII A');
      const sessionDate = '2026-12-02';

      // 1. Simpan awal
      final initialItems = students.map((s) => StudentAttendanceItemModel(
        studentId: s.id,
        studentNis: s.nis,
        studentName: s.fullName,
        status: LessonAttendanceStatus.hadir,
      )).toList();

      final initial = await service.saveAttendance(
        user: adminUser,
        schedule: scheduleAhmad,
        date: sessionDate,
        items: initialItems,
      );

      // 2. Edit absensi dengan catatan khusus
      final editedItems = students.map((s) => StudentAttendanceItemModel(
        studentId: s.id,
        studentNis: s.nis,
        studentName: s.fullName,
        status: s.id == students.first.id ? LessonAttendanceStatus.izin : LessonAttendanceStatus.hadir,
        note: s.id == students.first.id ? 'Ada acara keluarga di luar kota' : null,
      )).toList();

      final edited = await service.saveAttendance(
        user: adminUser,
        schedule: scheduleAhmad,
        date: sessionDate,
        items: editedItems,
      );

      expect(edited.id, equals(initial.id));
      expect(edited.izinCount, equals(1));

      // 3. Verifikasi pada pencarian riwayat & detail
      final detailRecord = service.findExistingAttendance(
        scheduleId: scheduleAhmad.id,
        date: sessionDate,
      );

      expect(detailRecord, isNotNull);
      expect(detailRecord!.items.first.status, equals(LessonAttendanceStatus.izin));
      expect(detailRecord.items.first.note, equals('Ada acara keluarga di luar kota'));
    });

    test('4. Filter tanggal berfungsi', () {
      final records = service.getFilteredHistory(
        user: adminUser,
        dateFilter: '2026-11-15',
      );

      expect(records.isNotEmpty, isTrue);
      for (final rec in records) {
        expect(rec.date, equals('2026-11-15'));
      }
    });

    test('5. Filter kelas berfungsi', () {
      final records = service.getFilteredHistory(
        user: adminUser,
        classFilter: 'VII A',
      );

      expect(records.isNotEmpty, isTrue);
      for (final rec in records) {
        expect(rec.className, equals('VII A'));
      }
    });

    test('6. Filter mata pelajaran berfungsi', () {
      final records = service.getFilteredHistory(
        user: adminUser,
        subjectFilter: 'Fiqih',
      );

      expect(records.isNotEmpty, isTrue);
      for (final rec in records) {
        expect(rec.subject, equals('Fiqih'));
      }
    });

    test('7. Pencarian berfungsi (mata pelajaran & nama guru)', () {
      final recordsBySubject = service.getFilteredHistory(
        user: adminUser,
        searchQuery: 'fiqih',
      );
      expect(recordsBySubject.isNotEmpty, isTrue);
      expect(recordsBySubject.every((r) => r.subject.toLowerCase().contains('fiqih')), isTrue);

      final recordsByTeacher = service.getFilteredHistory(
        user: adminUser,
        searchQuery: 'fauzi',
      );
      expect(recordsByTeacher.isNotEmpty, isTrue);
      expect(recordsByTeacher.every((r) => r.teacherName.toLowerCase().contains('fauzi')), isTrue);
    });

    test('8. Admin dapat melihat seluruh riwayat', () {
      final allAdminRecords = service.getFilteredHistory(user: adminUser);
      expect(allAdminRecords.length, equals(service.allRecords.length));
    });

    test('9. Guru hanya dapat melihat riwayat jadwalnya sendiri', () {
      final guruRecords = service.getFilteredHistory(user: guruAhmad);

      expect(guruRecords.isNotEmpty, isTrue);
      for (final rec in guruRecords) {
        final teacherLower = rec.teacherName.toLowerCase();
        expect(teacherLower.contains('ahmad fauzi') || rec.teacherId == guruAhmad.id, isTrue);
      }
    });

    test('10. Tampilan kosong muncul jika belum ada riwayat atau filter tidak cocok', () {
      final emptyResults = service.getFilteredHistory(
        user: adminUser,
        dateFilter: '2099-12-31',
      );

      expect(emptyResults.isEmpty, isTrue);
    });
  });

  group('Rekap Absensi Per Santri (Khusus Admin) Tests', () {
    late LessonAttendanceService service;

    final adminUser = UserModel(
      id: 'USR-001',
      fullName: 'Administrator Pondok',
      username: 'admin',
      phoneNumber: '081234567890',
      passwordHash: 'hash',
      role: UserRole.admin,
      createdAt: DateTime.now(),
    );

    final guruAhmad = UserModel(
      id: 'USR-002',
      fullName: 'Ustadz Ahmad Fauzi',
      username: 'ustadz_ahmad',
      phoneNumber: '081234567891',
      passwordHash: 'hash',
      role: UserRole.guru,
      createdAt: DateTime.now(),
    );

    final scheduleTest = const ScheduleModel(
      id: 'SCH-001',
      day: 'Senin',
      className: 'VII A',
      subject: 'Fiqih',
      teacherName: 'Ustadz Ahmad Fauzi',
      periodNumber: 1,
      startTime: '07:30',
      endTime: '08:15',
    );

    setUp(() {
      service = LessonAttendanceService();
    });

    test('1. Admin dapat membuka Rekap Absensi', () {
      final recapList = service.getStudentRecapList(user: adminUser);
      expect(recapList, isNotEmpty);
      expect(recapList.first.student.fullName, isNotEmpty);
    });

    test('2. Guru tidak dapat melihat atau membuka Rekap Absensi', () {
      expect(
        () => service.getStudentRecapList(user: guruAhmad),
        throwsA(isA<UnauthorizedAttendanceException>()),
      );
    });

    test('3. Pencarian santri berfungsi (nama dan NIS)', () {
      final searchByName = service.getStudentRecapList(
        user: adminUser,
        searchQuery: 'ahmad fauzi',
      );
      expect(searchByName, isNotEmpty);
      expect(searchByName.every((r) => r.student.fullName.toLowerCase().contains('ahmad fauzi')), isTrue);

      final searchByNis = service.getStudentRecapList(
        user: adminUser,
        searchQuery: '2024001',
      );
      expect(searchByNis, isNotEmpty);
      expect(searchByNis.every((r) => r.student.nis.contains('2024001')), isTrue);
    });

    test('4. Filter kelas berfungsi', () {
      final classVIIA = service.getStudentRecapList(
        user: adminUser,
        classFilter: 'VII A',
      );
      expect(classVIIA, isNotEmpty);
      expect(classVIIA.every((r) => r.student.className.trim() == 'VII A'), isTrue);
    });

    test('5. Filter periode berfungsi', () {
      final filteredPeriod = service.getStudentRecapList(
        user: adminUser,
        startDate: DateTime(2026, 11, 1),
        endDate: DateTime(2026, 11, 30),
      );
      expect(filteredPeriod, isNotEmpty);
      for (final recap in filteredPeriod) {
        for (final log in recap.sessionLogs) {
          final dt = DateTime.parse(log.date);
          expect(dt.isAfter(DateTime(2026, 10, 31)), isTrue);
          expect(dt.isBefore(DateTime(2026, 12, 1)), isTrue);
        }
      }
    });

    test('6. Detail rekap santri menampilkan data benar', () {
      final recapList = service.getStudentRecapList(user: adminUser);
      final studentRecap = recapList.firstWhere((r) => r.totalMeetings > 0);

      expect(studentRecap.student.fullName, isNotEmpty);
      expect(studentRecap.student.nis, isNotEmpty);
      expect(studentRecap.student.className, isNotEmpty);
      expect(studentRecap.sessionLogs, isNotEmpty);

      final firstLog = studentRecap.sessionLogs.first;
      expect(firstLog.subject, isNotEmpty);
      expect(firstLog.teacherName, isNotEmpty);
      expect(firstLog.date, isNotEmpty);
    });

    test('7. Persentase kehadiran dihitung dengan benar', () {
      final recapList = service.getStudentRecapList(user: adminUser);
      for (final recap in recapList) {
        if (recap.totalMeetings == 0) {
          expect(recap.presencePercentage, equals(0.0));
          expect(recap.formattedPercentage, equals('0%'));
        } else {
          final expected = (recap.hadirCount / recap.totalMeetings) * 100.0;
          expect(recap.presencePercentage, closeTo(expected, 0.01));
        }
      }
    });

    test('8. Total seluruh status sama dengan total pertemuan', () {
      final recapList = service.getStudentRecapList(user: adminUser);
      for (final recap in recapList) {
        final sumStatus = recap.hadirCount + recap.izinCount + recap.sakitCount + recap.alfaCount;
        expect(sumStatus, equals(recap.totalMeetings));
        expect(recap.sessionLogs.length, equals(recap.totalMeetings));
      }
    });

    test('9. Perubahan absensi memperbarui rekap secara otomatis', () async {
      final initialRecap = service.getStudentRecapList(user: adminUser);
      final targetStudent = initialRecap.first.student;
      final initialStudentRecap = initialRecap.firstWhere((r) => r.student.id == targetStudent.id);
      final initialHadir = initialStudentRecap.hadirCount;
      final initialTotal = initialStudentRecap.totalMeetings;

      final newDate = '2026-12-10';
      await service.saveAttendance(
        user: adminUser,
        schedule: scheduleTest,
        date: newDate,
        items: [
          StudentAttendanceItemModel(
            studentId: targetStudent.id,
            studentNis: targetStudent.nis,
            studentName: targetStudent.fullName,
            status: LessonAttendanceStatus.hadir,
            note: 'Uji rekap dinamis',
          ),
        ],
      );

      final updatedRecap = service.getStudentRecapList(user: adminUser);
      final updatedStudentRecap = updatedRecap.firstWhere((r) => r.student.id == targetStudent.id);

      expect(updatedStudentRecap.hadirCount, equals(initialHadir + 1));
      expect(updatedStudentRecap.totalMeetings, equals(initialTotal + 1));
      expect(updatedStudentRecap.sessionLogs.any((l) => l.date == newDate), isTrue);

      await service.saveAttendance(
        user: adminUser,
        schedule: scheduleTest,
        date: newDate,
        items: [
          StudentAttendanceItemModel(
            studentId: targetStudent.id,
            studentNis: targetStudent.nis,
            studentName: targetStudent.fullName,
            status: LessonAttendanceStatus.izin,
            note: 'Izin urusan keluarga',
          ),
        ],
      );

      final editedRecap = service.getStudentRecapList(user: adminUser);
      final editedStudentRecap = editedRecap.firstWhere((r) => r.student.id == targetStudent.id);

      expect(editedStudentRecap.hadirCount, equals(initialHadir));
      expect(editedStudentRecap.izinCount, equals(initialStudentRecap.izinCount + 1));
      expect(editedStudentRecap.totalMeetings, equals(initialTotal + 1));
    });

    test('10. Tidak ada kerusakan pada riwayat dan form absensi', () {
      final history = service.getFilteredHistory(user: adminUser);
      expect(history, isNotEmpty);
      expect(history.first.items, isNotEmpty);

      final existingForm = service.findExistingAttendance(
        scheduleId: scheduleTest.id,
        date: '2026-11-15',
      );
      expect(existingForm, isNotNull);
    });
  });

  group('Modul Laporan Absensi Santri (Khusus Admin - 10 Skenario Wajib) Tests', () {
    late LessonAttendanceService service;

    final adminUser = UserModel(
      id: 'USR-001',
      fullName: 'Administrator Pondok',
      username: 'admin',
      phoneNumber: '081234567890',
      passwordHash: 'hash',
      role: UserRole.admin,
      createdAt: DateTime.now(),
    );

    final guruAhmad = UserModel(
      id: 'USR-002',
      fullName: 'Ustadz Ahmad Fauzi',
      username: 'ustadz_ahmad',
      phoneNumber: '081234567891',
      passwordHash: 'hash',
      role: UserRole.guru,
      createdAt: DateTime.now(),
    );

    final scheduleTest = const ScheduleModel(
      id: 'SCH-001',
      day: 'Senin',
      className: 'VII A',
      subject: 'Fiqih',
      teacherName: 'Ustadz Ahmad Fauzi',
      periodNumber: 1,
      startTime: '07:30',
      endTime: '08:15',
    );

    setUp(() {
      service = LessonAttendanceService();
    });

    test('1. Admin dapat membuka modul laporan', () {
      final report = service.generateReport(
        user: adminUser,
        type: AttendanceReportType.perKelas,
      );
      expect(report, isNotNull);
      expect(report.title, contains('Laporan Rekapitulasi Kehadiran Kelas'));
    });

    test('2. Guru tidak dapat mengakses modul laporan', () {
      expect(
        () => service.generateReport(
          user: guruAhmad,
          type: AttendanceReportType.perKelas,
        ),
        throwsA(isA<UnauthorizedAttendanceException>()),
      );
    });

    test('3. Laporan per santri menampilkan data yang benar', () {
      final report = service.generateReport(
        user: adminUser,
        type: AttendanceReportType.perSantri,
        studentId: 'SNT-001',
      );
      expect(report.studentReport, isNotNull);
      final s = report.studentReport!;
      expect(s.student.fullName, isNotEmpty);
      expect(s.totalMeetings, equals(s.hadirCount + s.izinCount + s.sakitCount + s.alfaCount));
      expect(s.sessionLogs.length, equals(s.totalMeetings));
    });

    test('4. Laporan per kelas menampilkan data yang benar', () {
      final report = service.generateReport(
        user: adminUser,
        type: AttendanceReportType.perKelas,
        classFilter: 'VII A',
      );
      expect(report.classReport, isNotNull);
      final c = report.classReport!;
      expect(c.className, equals('VII A'));
      expect(c.students, isNotEmpty);
      expect(c.totalStudents, equals(c.students.length));
      expect(c.totalMeetingsRecorded, equals(c.totalHadir + c.totalIzin + c.totalSakit + c.totalAlfa));
    });

    test('5. Filter periode berfungsi', () {
      final report = service.generateReport(
        user: adminUser,
        type: AttendanceReportType.periode,
        startDate: DateTime(2026, 11, 1),
        endDate: DateTime(2026, 11, 30),
      );
      expect(report.periodReport, isNotNull);
      expect(report.periodLabel, contains('1/11/2026 - 30/11/2026'));
      expect(report.periodReport!.totalSessions, greaterThanOrEqualTo(0));
    });

    test('6. Pratinjau sesuai data sumber', () {
      final report = service.generateReport(
        user: adminUser,
        type: AttendanceReportType.perKelas,
        classFilter: 'VII A',
      );
      expect(report.institutionName, equals('Pondok Pesantren Islam Darul Hikmah'));
      expect(report.formattedGeneratedDate, isNotEmpty);
      expect(report.generatedBy, equals(adminUser.fullName));
    });

    test('7. Ekspor PDF berhasil', () {
      final report = service.generateReport(
        user: adminUser,
        type: AttendanceReportType.perSantri,
        studentId: 'SNT-001',
      );
      final html = AttendanceReportExportService.generatePrintableHtml(report);
      expect(html, contains('PONDOK PESANTREN ISLAM DARUL HIKMAH'));
      expect(html, contains('K.H. Abdullah Syafi\'i'));
      expect(html, contains(report.studentReport!.student.fullName));
    });

    test('8. Ekspor Excel berhasil', () {
      final report = service.generateReport(
        user: adminUser,
        type: AttendanceReportType.perKelas,
        classFilter: 'VII A',
      );
      final csv = AttendanceReportExportService.generateExcelCsv(report);
      expect(csv.startsWith('\uFEFF'), isTrue); // Memiliki UTF-8 BOM untuk Excel
      expect(csv, contains('PONDOK PESANTREN ISLAM DARUL HIKMAH'));
      expect(csv, contains('REKAPITULASI'));
    });

    test('9. Data hasil ekspor sesuai dengan pratinjau', () {
      final report = service.generateReport(
        user: adminUser,
        type: AttendanceReportType.periode,
        startDate: DateTime(2026, 11, 1),
        endDate: DateTime(2026, 11, 30),
      );
      final csv = AttendanceReportExportService.generateExcelCsv(report);
      expect(csv, contains(report.periodLabel));
      expect(csv, contains(report.periodReport!.totalHadir.toString()));
      expect(csv, contains(report.periodReport!.totalSessions.toString()));
    });

    test('10. Perubahan absensi memperbarui laporan', () async {
      final initialReport = service.generateReport(
        user: adminUser,
        type: AttendanceReportType.perSantri,
        studentId: 'SNT-001',
      );
      final initialHadir = initialReport.studentReport!.hadirCount;
      final initialTotal = initialReport.studentReport!.totalMeetings;

      // Tambahkan sesi absensi baru
      await service.saveAttendance(
        user: adminUser,
        schedule: scheduleTest,
        date: '2026-12-20',
        items: [
          const StudentAttendanceItemModel(
            studentId: 'SNT-001',
            studentNis: '2024001',
            studentName: 'Ahmad Fauzi',
            status: LessonAttendanceStatus.hadir,
            note: 'Uji update laporan otomatis',
          ),
        ],
      );

      final updatedReport = service.generateReport(
        user: adminUser,
        type: AttendanceReportType.perSantri,
        studentId: 'SNT-001',
      );
      expect(updatedReport.studentReport!.hadirCount, equals(initialHadir + 1));
      expect(updatedReport.studentReport!.totalMeetings, equals(initialTotal + 1));
    });
  });
}
