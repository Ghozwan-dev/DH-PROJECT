import '../../../auth/data/models/user_model.dart';
import '../../domain/repositories/home_attendance_repository_interface.dart';
import '../models/attendance_models.dart';
import '../repositories/mock_home_attendance_repository.dart';

/// Service untuk data Absensi Santri Darul Hikmah (Beranda)
/// - Menggunakan Repository Pattern (IHomeAttendanceRepository)
/// - Siap diintegrasikan dengan database / API backend NestJS
class AttendanceService {
  static final AttendanceService _instance = AttendanceService._internal();
  factory AttendanceService() => _instance;

  IHomeAttendanceRepository _repository;

  AttendanceService._internal([IHomeAttendanceRepository? repository])
      : _repository = repository ?? MockHomeAttendanceRepository();

  /// Mengganti implementasi repository (misal: beralih dari Mock ke REST API)
  void setRepository(IHomeAttendanceRepository repository) {
    _repository = repository;
  }

  /// Mendapatkan ringkasan absensi berdasarkan role dan filter tanggal
  AttendanceSummaryModel getSummary({
    required UserRole role,
    AttendanceFilter filter = AttendanceFilter.today,
  }) =>
      _repository.getSummary(role: role, filter: filter);

  /// Mendapatkan daftar aktivitas absensi terakhir
  List<AttendanceActivityModel> getRecentActivities({
    required UserRole role,
    int limit = 3,
  }) =>
      _repository.getRecentActivities(role: role, limit: limit);
}
