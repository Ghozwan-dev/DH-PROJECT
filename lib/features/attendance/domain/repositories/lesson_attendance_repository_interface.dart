import '../../../auth/data/models/user_model.dart';
import '../../../students/data/models/student_model.dart';
import '../../data/models/attendance_report_model.dart';
import '../../data/models/lesson_attendance_model.dart';
import '../../data/models/schedule_model.dart';
import '../../data/models/student_attendance_recap_model.dart';

/// Kontrak Repository untuk Absensi Santri Per Mata Pelajaran
/// Menjembatani akses data absensi untuk REST API NestJS & PostgreSQL
abstract class ILessonAttendanceRepository {
  List<LessonAttendanceModel> getAllRecords();

  LessonAttendanceModel? findExistingAttendance({
    required String scheduleId,
    required String date,
  });

  List<LessonAttendanceModel> getFilteredHistory({
    required UserModel user,
    String? dateFilter,
    String? classFilter,
    String? subjectFilter,
    String? teacherFilter,
    String? searchQuery,
  });

  Future<LessonAttendanceModel> saveAttendance({
    required UserModel user,
    required ScheduleModel schedule,
    required String date,
    required List<StudentAttendanceItemModel> items,
  });

  Future<bool> deleteAttendance({
    required UserModel user,
    required String attendanceId,
  });

  Map<String, int> getSummaryRecap({
    required UserModel user,
    String? dateFilter,
    String? classFilter,
    String? subjectFilter,
  });

  List<StudentAttendanceRecapModel> getStudentRecapList({
    required UserModel user,
    String? classFilter,
    String? searchQuery,
    DateTime? startDate,
    DateTime? endDate,
  });

  AttendanceReportResult generateReport({
    required UserModel user,
    required AttendanceReportType type,
    String? studentId,
    String? classFilter,
    String? subjectFilter,
    DateTime? startDate,
    DateTime? endDate,
  });

  bool canManageSchedule({
    required UserModel user,
    required ScheduleModel schedule,
  });

  List<StudentModel> getStudentsForClass(String className);
}
