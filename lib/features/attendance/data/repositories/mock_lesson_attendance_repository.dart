import '../../../auth/data/models/user_model.dart';
import '../../../students/data/models/student_model.dart';
import '../../../students/data/services/student_service.dart';
import '../../domain/repositories/lesson_attendance_repository_interface.dart';
import '../datasources/mock_lesson_attendance_data.dart';
import '../models/lesson_attendance_model.dart';
import '../models/schedule_model.dart';
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
}
