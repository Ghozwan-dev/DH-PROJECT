import 'package:flutter/foundation.dart';
import '../../../auth/data/models/user_model.dart';
import '../../../students/data/models/student_model.dart';
import '../../domain/repositories/lesson_attendance_repository_interface.dart';
import '../models/attendance_report_model.dart';
import '../models/lesson_attendance_model.dart';
import '../models/schedule_model.dart';
import '../models/student_attendance_recap_model.dart';
import '../repositories/mock_lesson_attendance_repository.dart';

/// Pengecualian Akses Ditolak untuk RBAC
class UnauthorizedAttendanceException implements Exception {
  final String message;
  const UnauthorizedAttendanceException(this.message);

  @override
  String toString() => message;
}

/// Service Absensi Santri Per Mata Pelajaran
/// - Menggunakan Repository Pattern (ILessonAttendanceRepository)
/// - Menjaga reaktivitas UI dengan ChangeNotifier
/// - Siap diintegrasikan dengan REST API NestJS & PostgreSQL
class LessonAttendanceService extends ChangeNotifier {
  static final LessonAttendanceService _instance = LessonAttendanceService._internal();
  factory LessonAttendanceService() => _instance;

  ILessonAttendanceRepository _repository;

  LessonAttendanceService._internal([ILessonAttendanceRepository? repository])
      : _repository = repository ?? MockLessonAttendanceRepository();

  /// Mengganti implementasi repository (misal: beralih dari Mock ke REST API)
  void setRepository(ILessonAttendanceRepository repository) {
    _repository = repository;
    notifyListeners();
  }

  List<LessonAttendanceModel> get allRecords => _repository.getAllRecords();

  /// Mengambil seluruh rekaman absensi santri
  List<LessonAttendanceModel> getAttendanceRecords() => _repository.getAllRecords();

  /// Cek apakah pengguna memiliki hak akses untuk mengelola jadwal ini
  bool canManageSchedule({required UserModel user, required ScheduleModel schedule}) =>
      _repository.canManageSchedule(user: user, schedule: schedule);

  /// Mengambil santri untuk kelas tertentu
  List<StudentModel> getStudentsForClass(String className) =>
      _repository.getStudentsForClass(className);

  /// Mencari absensi yang sudah ada berdasarkan scheduleId dan tanggal (YYYY-MM-DD)
  LessonAttendanceModel? findExistingAttendance({
    required String scheduleId,
    required String date,
  }) =>
      _repository.findExistingAttendance(scheduleId: scheduleId, date: date);

  /// Mengambil riwayat absensi tersaring berdasarkan hak akses dan filter
  List<LessonAttendanceModel> getFilteredHistory({
    required UserModel user,
    String? dateFilter,
    String? classFilter,
    String? subjectFilter,
    String? teacherFilter,
    String? searchQuery,
  }) =>
      _repository.getFilteredHistory(
        user: user,
        dateFilter: dateFilter,
        classFilter: classFilter,
        subjectFilter: subjectFilter,
        teacherFilter: teacherFilter,
        searchQuery: searchQuery,
      );

  /// Menyimpan atau memperbarui data absensi
  Future<LessonAttendanceModel> saveAttendance({
    required UserModel user,
    required ScheduleModel schedule,
    required String date,
    required List<StudentAttendanceItemModel> items,
  }) async {
    final result = await _repository.saveAttendance(
      user: user,
      schedule: schedule,
      date: date,
      items: items,
    );
    notifyListeners();
    return result;
  }

  /// Menghapus data absensi (HANYA BISA DILAKUKAN OLEH ADMIN)
  Future<bool> deleteAttendance({
    required UserModel user,
    required String attendanceId,
  }) async {
    final result = await _repository.deleteAttendance(
      user: user,
      attendanceId: attendanceId,
    );
    if (result) {
      notifyListeners();
    }
    return result;
  }

  /// Menghitung Ringkasan Rekapitulasi Hadir, Izin, Sakit, Alfa
  Map<String, int> getSummaryRecap({
    required UserModel user,
    String? dateFilter,
    String? classFilter,
    String? subjectFilter,
  }) =>
      _repository.getSummaryRecap(
        user: user,
        dateFilter: dateFilter,
        classFilter: classFilter,
        subjectFilter: subjectFilter,
      );

  /// Mengambil data rekapitulasi absensi per santri (KHUSUS ADMIN)
  List<StudentAttendanceRecapModel> getStudentRecapList({
    required UserModel user,
    String? classFilter,
    String? searchQuery,
    DateTime? startDate,
    DateTime? endDate,
  }) =>
      _repository.getStudentRecapList(
        user: user,
        classFilter: classFilter,
        searchQuery: searchQuery,
        startDate: startDate,
        endDate: endDate,
      );

  /// Menghasilkan laporan absensi santri komprehensif (KHUSUS ADMIN)
  AttendanceReportResult generateReport({
    required UserModel user,
    required AttendanceReportType type,
    String? studentId,
    String? classFilter,
    String? subjectFilter,
    DateTime? startDate,
    DateTime? endDate,
  }) =>
      _repository.generateReport(
        user: user,
        type: type,
        studentId: studentId,
        classFilter: classFilter,
        subjectFilter: subjectFilter,
        startDate: startDate,
        endDate: endDate,
      );
}
