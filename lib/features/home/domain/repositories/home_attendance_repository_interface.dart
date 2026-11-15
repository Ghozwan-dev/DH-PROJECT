import '../../../auth/data/models/user_model.dart';
import '../../data/models/attendance_models.dart';

/// Kontrak Repository untuk Ringkasan Absensi Beranda
abstract class IHomeAttendanceRepository {
  AttendanceSummaryModel getSummary({
    required UserRole role,
    AttendanceFilter filter = AttendanceFilter.today,
  });

  List<AttendanceActivityModel> getRecentActivities({
    required UserRole role,
    int limit = 3,
  });
}
