import '../../../auth/data/models/user_model.dart';
import '../../../students/data/models/student_model.dart';
import '../../../students/data/services/student_service.dart';
import '../../domain/repositories/lesson_attendance_repository_interface.dart';
import '../datasources/mock_lesson_attendance_data.dart';
import '../models/attendance_report_model.dart';
import '../models/lesson_attendance_model.dart';
import '../models/schedule_model.dart';
import '../models/student_attendance_recap_model.dart';
import '../services/lesson_attendance_service.dart';

/// Implementasi Mock Repository untuk Absensi Santri Per Mata Pelajaran
/// Beroperasi secara in-memory untuk tahap preview & pengembangan frontend.
/// Dapat diganti dengan ApiLessonAttendanceRepository saat REST API NestJS siap.
class MockLessonAttendanceRepository implements ILessonAttendanceRepository {
  final List<LessonAttendanceModel> _attendanceRecords;
  final StudentService _studentService;

  MockLessonAttendanceRepository({
    List<LessonAttendanceModel>? initialData,
    StudentService? studentService,
  })  : _attendanceRecords = initialData ?? getInitialMockLessonAttendance(),
        _studentService = studentService ?? StudentService();

  @override
  List<LessonAttendanceModel> getAllRecords() {
    return List.unmodifiable(_attendanceRecords);
  }

  @override
  bool canManageSchedule({required UserModel user, required ScheduleModel schedule}) {
    if (user.isAdmin) return true;
    final userName = user.fullName.toLowerCase().trim();
    final scheduleTeacher = schedule.teacherName.toLowerCase().trim();
    return userName == scheduleTeacher ||
        (schedule.teacherId != null && schedule.teacherId == user.id) ||
        (userName.contains('ahmad fauzi') && scheduleTeacher.contains('ahmad fauzi'));
  }

  @override
  List<StudentModel> getStudentsForClass(String className) {
    return _studentService.getStudentsByClass(className);
  }

  @override
  LessonAttendanceModel? findExistingAttendance({
    required String scheduleId,
    required String date,
  }) {
    try {
      return _attendanceRecords.firstWhere(
        (rec) => rec.scheduleId == scheduleId && rec.date == date,
      );
    } catch (_) {
      return null;
    }
  }

  @override
  List<LessonAttendanceModel> getFilteredHistory({
    required UserModel user,
    String? dateFilter,
    String? classFilter,
    String? subjectFilter,
    String? teacherFilter,
    String? searchQuery,
  }) {
    final isAdmin = user.isAdmin;
    final userName = user.fullName.toLowerCase().trim();

    return _attendanceRecords.where((rec) {
      if (!isAdmin) {
        final recTeacher = rec.teacherName.toLowerCase().trim();
        final matchTeacher = recTeacher == userName ||
            (rec.teacherId != null && rec.teacherId == user.id) ||
            (userName.contains('ahmad fauzi') && recTeacher.contains('ahmad fauzi'));
        if (!matchTeacher) return false;
      }

      if (dateFilter != null && dateFilter.isNotEmpty && dateFilter != 'Semua') {
        if (rec.date != dateFilter) return false;
      }

      if (classFilter != null && classFilter.isNotEmpty && classFilter != 'Semua') {
        if (rec.className.toLowerCase().trim() != classFilter.toLowerCase().trim()) {
          return false;
        }
      }

      if (subjectFilter != null && subjectFilter.isNotEmpty && subjectFilter != 'Semua') {
        if (rec.subject.toLowerCase().trim() != subjectFilter.toLowerCase().trim()) {
          return false;
        }
      }

      if (isAdmin && teacherFilter != null && teacherFilter.isNotEmpty && teacherFilter != 'Semua') {
        if (rec.teacherName.toLowerCase().trim() != teacherFilter.toLowerCase().trim()) {
          return false;
        }
      }

      if (searchQuery != null && searchQuery.trim().isNotEmpty) {
        final q = searchQuery.toLowerCase().trim();
        final matchSubj = rec.subject.toLowerCase().contains(q);
        final matchTeach = rec.teacherName.toLowerCase().contains(q);
        final matchClass = rec.className.toLowerCase().contains(q);
        if (!matchSubj && !matchTeach && !matchClass) return false;
      }

      return true;
    }).toList()
      ..sort((a, b) => b.date.compareTo(a.date));
  }

  @override
  Future<LessonAttendanceModel> saveAttendance({
    required UserModel user,
    required ScheduleModel schedule,
    required String date,
    required List<StudentAttendanceItemModel> items,
  }) async {
    if (!canManageSchedule(user: user, schedule: schedule)) {
      throw const UnauthorizedAttendanceException(
        'Akses ditolak: Guru hanya dapat mengisi dan mengedit absensi pada jadwal mengajar miliknya.',
      );
    }

    if (items.isEmpty) {
      throw const FormatException('Daftar santri untuk kelas ini tidak boleh kosong.');
    }

    final now = DateTime.now();
    final existingIndex = _attendanceRecords.indexWhere(
      (rec) => rec.scheduleId == schedule.id && rec.date == date,
    );

    if (existingIndex != -1) {
      final existing = _attendanceRecords[existingIndex];
      final updated = existing.copyWith(
        items: items,
        updatedAt: now,
        recordedBy: user.fullName,
      );
      _attendanceRecords[existingIndex] = updated;
      return updated;
    } else {
      final newRecord = LessonAttendanceModel(
        id: 'ATT-${now.millisecondsSinceEpoch}',
        scheduleId: schedule.id,
        date: date,
        className: schedule.className,
        subject: schedule.subject,
        teacherName: schedule.teacherName,
        teacherId: schedule.teacherId,
        periodNumber: schedule.periodNumber,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        items: items,
        createdAt: now,
        updatedAt: now,
        recordedBy: user.fullName,
      );
      _attendanceRecords.insert(0, newRecord);
      return newRecord;
    }
  }

  @override
  Future<bool> deleteAttendance({
    required UserModel user,
    required String attendanceId,
  }) async {
    if (!user.isAdmin) {
      throw const UnauthorizedAttendanceException(
        'Akses ditolak: Hanya Administrator yang berwenang menghapus data absensi santri.',
      );
    }

    final countBefore = _attendanceRecords.length;
    _attendanceRecords.removeWhere((rec) => rec.id == attendanceId);
    return _attendanceRecords.length < countBefore;
  }

  @override
  Map<String, int> getSummaryRecap({
    required UserModel user,
    String? dateFilter,
    String? classFilter,
    String? subjectFilter,
  }) {
    final filtered = getFilteredHistory(
      user: user,
      dateFilter: dateFilter,
      classFilter: classFilter,
      subjectFilter: subjectFilter,
    );

    int totalSessions = filtered.length;
    int totalHadir = 0;
    int totalIzin = 0;
    int totalSakit = 0;
    int totalAlfa = 0;

    for (final rec in filtered) {
      totalHadir += rec.hadirCount;
      totalIzin += rec.izinCount;
      totalSakit += rec.sakitCount;
      totalAlfa += rec.alfaCount;
    }

    final totalSantri = totalHadir + totalIzin + totalSakit + totalAlfa;

    return {
      'sessions': totalSessions,
      'students': totalSantri,
      'hadir': totalHadir,
      'izin': totalIzin,
      'sakit': totalSakit,
      'alfa': totalAlfa,
    };
  }

  @override
  List<StudentAttendanceRecapModel> getStudentRecapList({
    required UserModel user,
    String? classFilter,
    String? searchQuery,
    DateTime? startDate,
    DateTime? endDate,
  }) {
    // ATURAN AKSES WAJIB: Khusus Administrator Pondok
    if (!user.isAdmin) {
      throw const UnauthorizedAttendanceException(
        'Akses ditolak: Rekap absensi santri hanya dapat diakses oleh Administrator Pondok.',
      );
    }

    final allStudents = _studentService.getStudents();

    // 1. Filter sesi absensi berdasarkan rentang tanggal
    final filteredAttendances = _attendanceRecords.where((att) {
      if (startDate != null || endDate != null) {
        final attDate = DateTime.tryParse(att.date);
        if (attDate == null) return false;
        if (startDate != null && attDate.isBefore(DateTime(startDate.year, startDate.month, startDate.day))) {
          return false;
        }
        if (endDate != null && attDate.isAfter(DateTime(endDate.year, endDate.month, endDate.day, 23, 59, 59))) {
          return false;
        }
      }
      return true;
    }).toList();

    // Urutkan rekaman sesi dari tanggal terbaru
    filteredAttendances.sort((a, b) => b.date.compareTo(a.date));

    // 2. Filter santri berdasarkan kelas
    var targetStudents = allStudents;
    if (classFilter != null && classFilter.isNotEmpty && classFilter != 'Semua') {
      targetStudents = targetStudents
          .where((s) => s.className.toLowerCase().trim() == classFilter.toLowerCase().trim())
          .toList();
    }

    // 3. Filter santri berdasarkan pencarian nama atau NIS
    if (searchQuery != null && searchQuery.trim().isNotEmpty) {
      final q = searchQuery.trim().toLowerCase();
      targetStudents = targetStudents.where((s) {
        final nameMatch = s.fullName.toLowerCase().contains(q);
        final nisMatch = s.nis.toLowerCase().contains(q);
        return nameMatch || nisMatch;
      }).toList();
    }

    // 4. Hitung rekap kehadiran untuk setiap santri
    final List<StudentAttendanceRecapModel> result = [];

    for (final student in targetStudents) {
      int hadir = 0;
      int izin = 0;
      int sakit = 0;
      int alfa = 0;
      final List<StudentAttendanceSessionLog> logs = [];

      for (final att in filteredAttendances) {
        // Cari status santri pada sesi pelajaran ini
        final item = att.items.where((it) => it.studentId == student.id || it.studentNis == student.nis).firstOrNull;
        if (item != null) {
          switch (item.status) {
            case LessonAttendanceStatus.hadir:
              hadir++;
              break;
            case LessonAttendanceStatus.izin:
              izin++;
              break;
            case LessonAttendanceStatus.sakit:
              sakit++;
              break;
            case LessonAttendanceStatus.alfa:
              alfa++;
              break;
          }

          logs.add(StudentAttendanceSessionLog(
            attendanceId: att.id,
            date: att.date,
            subject: att.subject,
            className: att.className,
            teacherName: att.teacherName,
            periodNumber: att.periodNumber,
            startTime: att.startTime,
            endTime: att.endTime,
            status: item.status,
            note: item.note,
          ));
        }
      }

      final totalMeetings = hadir + izin + sakit + alfa;
      final percentage = totalMeetings == 0 ? 0.0 : ((hadir / totalMeetings) * 100.0);

      result.add(StudentAttendanceRecapModel(
        student: student,
        totalMeetings: totalMeetings,
        hadirCount: hadir,
        izinCount: izin,
        sakitCount: sakit,
        alfaCount: alfa,
        presencePercentage: percentage,
        sessionLogs: logs,
      ));
    }

    return result;
  }

  @override
  AttendanceReportResult generateReport({
    required UserModel user,
    required AttendanceReportType type,
    String? studentId,
    String? classFilter,
    String? subjectFilter,
    DateTime? startDate,
    DateTime? endDate,
  }) {
    // 1. Validasi Akses Wajib: Khusus Admin
    if (!user.isAdmin) {
      throw const UnauthorizedAttendanceException(
        'Akses ditolak: Modul Laporan Absensi hanya dapat diakses oleh Administrator Pondok.',
      );
    }

    // 2. Format label periode
    String periodLabel;
    if (startDate != null && endDate != null) {
      periodLabel = '${startDate.day}/${startDate.month}/${startDate.year} - ${endDate.day}/${endDate.month}/${endDate.year}';
    } else if (startDate != null) {
      periodLabel = 'Sejak ${startDate.day}/${startDate.month}/${startDate.year}';
    } else if (endDate != null) {
      periodLabel = 'Hingga ${endDate.day}/${endDate.month}/${endDate.year}';
    } else {
      periodLabel = 'Semua Periode Tercatat';
    }

    // 3. Filter sesi absensi berdasarkan rentang tanggal & mata pelajaran
    var filteredAttendances = _attendanceRecords.where((att) {
      if (startDate != null || endDate != null) {
        final attDate = DateTime.tryParse(att.date);
        if (attDate == null) return false;
        if (startDate != null && attDate.isBefore(DateTime(startDate.year, startDate.month, startDate.day))) {
          return false;
        }
        if (endDate != null && attDate.isAfter(DateTime(endDate.year, endDate.month, endDate.day, 23, 59, 59))) {
          return false;
        }
      }
      if (subjectFilter != null && subjectFilter.isNotEmpty && subjectFilter != 'Semua' && subjectFilter != 'Semua Mapel') {
        if (att.subject.toLowerCase().trim() != subjectFilter.toLowerCase().trim()) {
          return false;
        }
      }
      return true;
    }).toList();

    filteredAttendances.sort((a, b) => b.date.compareTo(a.date));

    final allStudents = _studentService.getStudents();

    switch (type) {
      case AttendanceReportType.perSantri:
        // Cari target santri
        StudentModel? targetStudent;
        if (studentId != null && studentId.isNotEmpty) {
          targetStudent = allStudents.where((s) => s.id == studentId || s.nis == studentId).firstOrNull;
        }
        targetStudent ??= (classFilter != null && classFilter.isNotEmpty && classFilter != 'Semua'
            ? allStudents.where((s) => s.className.toLowerCase() == classFilter.toLowerCase()).firstOrNull
            : allStudents.firstOrNull);

        if (targetStudent == null) {
          throw Exception('Santri tidak ditemukan untuk pembuatan laporan.');
        }

        int hadir = 0;
        int izin = 0;
        int sakit = 0;
        int alfa = 0;
        final List<StudentAttendanceSessionLog> logs = [];

        for (final att in filteredAttendances) {
          final item = att.items.where((it) => it.studentId == targetStudent!.id || it.studentNis == targetStudent.nis).firstOrNull;
          if (item != null) {
            switch (item.status) {
              case LessonAttendanceStatus.hadir:
                hadir++;
                break;
              case LessonAttendanceStatus.izin:
                izin++;
                break;
              case LessonAttendanceStatus.sakit:
                sakit++;
                break;
              case LessonAttendanceStatus.alfa:
                alfa++;
                break;
            }

            logs.add(StudentAttendanceSessionLog(
              attendanceId: att.id,
              date: att.date,
              subject: att.subject,
              className: att.className,
              teacherName: att.teacherName,
              periodNumber: att.periodNumber,
              startTime: att.startTime,
              endTime: att.endTime,
              status: item.status,
              note: item.note,
            ));
          }
        }

        final totalMeetings = hadir + izin + sakit + alfa;
        final percentage = totalMeetings == 0 ? 0.0 : ((hadir / totalMeetings) * 100.0);

        final studentReportData = StudentReportData(
          student: targetStudent,
          totalMeetings: totalMeetings,
          hadirCount: hadir,
          izinCount: izin,
          sakitCount: sakit,
          alfaCount: alfa,
          presencePercentage: percentage,
          sessionLogs: logs,
        );

        return AttendanceReportResult(
          type: type,
          title: 'Laporan Kehadiran Santri: ${targetStudent.fullName}',
          periodLabel: periodLabel,
          generatedAt: DateTime.now(),
          generatedBy: user.fullName,
          classFilter: targetStudent.className,
          subjectFilter: subjectFilter,
          studentReport: studentReportData,
        );

      case AttendanceReportType.perKelas:
        final targetClass = (classFilter != null && classFilter.isNotEmpty && classFilter != 'Semua')
            ? classFilter
            : (allStudents.isNotEmpty ? allStudents.first.className : 'VII A');

        final classStudents = allStudents.where((s) => s.className.toLowerCase().trim() == targetClass.toLowerCase().trim()).toList();
        final List<StudentReportData> studentReports = [];

        int totalHadir = 0;
        int totalIzin = 0;
        int totalSakit = 0;
        int totalAlfa = 0;
        int totalClassMeetings = 0;

        for (final st in classStudents) {
          int sHadir = 0;
          int sIzin = 0;
          int sSakit = 0;
          int sAlfa = 0;
          final List<StudentAttendanceSessionLog> sLogs = [];

          for (final att in filteredAttendances) {
            final item = att.items.where((it) => it.studentId == st.id || it.studentNis == st.nis).firstOrNull;
            if (item != null) {
              switch (item.status) {
                case LessonAttendanceStatus.hadir:
                  sHadir++;
                  break;
                case LessonAttendanceStatus.izin:
                  sIzin++;
                  break;
                case LessonAttendanceStatus.sakit:
                  sSakit++;
                  break;
                case LessonAttendanceStatus.alfa:
                  sAlfa++;
                  break;
              }
              sLogs.add(StudentAttendanceSessionLog(
                attendanceId: att.id,
                date: att.date,
                subject: att.subject,
                className: att.className,
                teacherName: att.teacherName,
                periodNumber: att.periodNumber,
                startTime: att.startTime,
                endTime: att.endTime,
                status: item.status,
                note: item.note,
              ));
            }
          }

          final sTotal = sHadir + sIzin + sSakit + sAlfa;
          final sPct = sTotal == 0 ? 0.0 : ((sHadir / sTotal) * 100.0);

          totalHadir += sHadir;
          totalIzin += sIzin;
          totalSakit += sSakit;
          totalAlfa += sAlfa;
          totalClassMeetings += sTotal;

          studentReports.add(StudentReportData(
            student: st,
            totalMeetings: sTotal,
            hadirCount: sHadir,
            izinCount: sIzin,
            sakitCount: sSakit,
            alfaCount: sAlfa,
            presencePercentage: sPct,
            sessionLogs: sLogs,
          ));
        }

        final classAvgPct = totalClassMeetings == 0 ? 0.0 : ((totalHadir / totalClassMeetings) * 100.0);

        final classReportData = ClassReportData(
          className: targetClass,
          students: studentReports,
          totalStudents: classStudents.length,
          totalMeetingsRecorded: totalClassMeetings,
          totalHadir: totalHadir,
          totalIzin: totalIzin,
          totalSakit: totalSakit,
          totalAlfa: totalAlfa,
          classAveragePercentage: classAvgPct,
        );

        return AttendanceReportResult(
          type: type,
          title: 'Laporan Rekapitulasi Kehadiran Kelas $targetClass',
          periodLabel: periodLabel,
          generatedAt: DateTime.now(),
          generatedBy: user.fullName,
          classFilter: targetClass,
          subjectFilter: subjectFilter,
          classReport: classReportData,
        );

      case AttendanceReportType.periode:
        // Filter kelas jika ada
        var sessions = filteredAttendances;
        if (classFilter != null && classFilter.isNotEmpty && classFilter != 'Semua') {
          sessions = sessions.where((s) => s.className.toLowerCase().trim() == classFilter.toLowerCase().trim()).toList();
        }

        int totalHadir = 0;
        int totalIzin = 0;
        int totalSakit = 0;
        int totalAlfa = 0;
        int totalRecords = 0;

        final Map<String, Map<String, int>> classBreakdown = {};
        final Map<String, Map<String, int>> subjectBreakdown = {};

        for (final att in sessions) {
          classBreakdown.putIfAbsent(att.className, () => {'hadir': 0, 'izin': 0, 'sakit': 0, 'alfa': 0});
          subjectBreakdown.putIfAbsent(att.subject, () => {'hadir': 0, 'izin': 0, 'sakit': 0, 'alfa': 0});

          for (final it in att.items) {
            totalRecords++;
            switch (it.status) {
              case LessonAttendanceStatus.hadir:
                totalHadir++;
                classBreakdown[att.className]!['hadir'] = (classBreakdown[att.className]!['hadir'] ?? 0) + 1;
                subjectBreakdown[att.subject]!['hadir'] = (subjectBreakdown[att.subject]!['hadir'] ?? 0) + 1;
                break;
              case LessonAttendanceStatus.izin:
                totalIzin++;
                classBreakdown[att.className]!['izin'] = (classBreakdown[att.className]!['izin'] ?? 0) + 1;
                subjectBreakdown[att.subject]!['izin'] = (subjectBreakdown[att.subject]!['izin'] ?? 0) + 1;
                break;
              case LessonAttendanceStatus.sakit:
                totalSakit++;
                classBreakdown[att.className]!['sakit'] = (classBreakdown[att.className]!['sakit'] ?? 0) + 1;
                subjectBreakdown[att.subject]!['sakit'] = (subjectBreakdown[att.subject]!['sakit'] ?? 0) + 1;
                break;
              case LessonAttendanceStatus.alfa:
                totalAlfa++;
                classBreakdown[att.className]!['alfa'] = (classBreakdown[att.className]!['alfa'] ?? 0) + 1;
                subjectBreakdown[att.subject]!['alfa'] = (subjectBreakdown[att.subject]!['alfa'] ?? 0) + 1;
                break;
            }
          }
        }

        final overallPct = totalRecords == 0 ? 0.0 : ((totalHadir / totalRecords) * 100.0);

        final periodReportData = PeriodReportData(
          startDate: startDate ?? (sessions.isNotEmpty ? DateTime.tryParse(sessions.last.date) ?? DateTime.now() : DateTime.now()),
          endDate: endDate ?? (sessions.isNotEmpty ? DateTime.tryParse(sessions.first.date) ?? DateTime.now() : DateTime.now()),
          totalSessions: sessions.length,
          totalAttendanceRecords: totalRecords,
          totalHadir: totalHadir,
          totalIzin: totalIzin,
          totalSakit: totalSakit,
          totalAlfa: totalAlfa,
          overallPercentage: overallPct,
          classBreakdown: classBreakdown,
          subjectBreakdown: subjectBreakdown,
        );

        return AttendanceReportResult(
          type: type,
          title: 'Laporan Absensi Santri Periode $periodLabel',
          periodLabel: periodLabel,
          generatedAt: DateTime.now(),
          generatedBy: user.fullName,
          classFilter: classFilter,
          subjectFilter: subjectFilter,
          periodReport: periodReportData,
        );
    }
  }
}
