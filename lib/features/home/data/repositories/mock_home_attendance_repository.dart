import '../../../auth/data/models/user_model.dart';
import '../../domain/repositories/home_attendance_repository_interface.dart';
import '../datasources/mock_home_attendance_data.dart';
import '../models/attendance_models.dart';

/// Implementasi Mock Repository untuk Ringkasan Absensi Beranda
class MockHomeAttendanceRepository implements IHomeAttendanceRepository {
  final List<AttendanceActivityModel> _activities;

  MockHomeAttendanceRepository({List<AttendanceActivityModel>? initialActivities})
      : _activities = initialActivities ?? getInitialMockHomeActivities();

  @override
  AttendanceSummaryModel getSummary({
    required UserRole role,
    AttendanceFilter filter = AttendanceFilter.today,
  }) {
    if (role == UserRole.admin) {
      switch (filter) {
        case AttendanceFilter.today:
          return const AttendanceSummaryModel(
            presentCount: 245,
            permissionCount: 12,
            absentCount: 8,
            filter: AttendanceFilter.today,
          );
        case AttendanceFilter.yesterday:
          return const AttendanceSummaryModel(
            presentCount: 248,
            permissionCount: 10,
            absentCount: 7,
            filter: AttendanceFilter.yesterday,
          );
        case AttendanceFilter.thisWeek:
          return const AttendanceSummaryModel(
            presentCount: 242,
            permissionCount: 15,
            absentCount: 8,
            filter: AttendanceFilter.thisWeek,
          );
      }
    } else {
      switch (filter) {
        case AttendanceFilter.today:
          return const AttendanceSummaryModel(
            presentCount: 68,
            permissionCount: 3,
            absentCount: 1,
            filter: AttendanceFilter.today,
          );
        case AttendanceFilter.yesterday:
          return const AttendanceSummaryModel(
            presentCount: 70,
            permissionCount: 2,
            absentCount: 0,
            filter: AttendanceFilter.yesterday,
          );
        case AttendanceFilter.thisWeek:
          return const AttendanceSummaryModel(
            presentCount: 66,
            permissionCount: 4,
            absentCount: 2,
            filter: AttendanceFilter.thisWeek,
          );
      }
    }
  }

  @override
  List<AttendanceActivityModel> getRecentActivities({
    required UserRole role,
    int limit = 3,
  }) {
    return _activities.take(limit).toList();
  }
}
