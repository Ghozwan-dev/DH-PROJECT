import '../../auth/data/models/user_model.dart';
import '../models/attendance_models.dart';

/// Service untuk data Absensi Santri Darul Hikmah (Sesuai Butir 5, 6, 8, 9)
/// - Siap diintegrasikan dengan database / API backend.
/// - Menyediakan data dinamis berdasarkan filter tanggal & role pengguna.
class AttendanceService {
  static final AttendanceService _instance = AttendanceService._internal();
  factory AttendanceService() => _instance;
  AttendanceService._internal();

  /// Mendapatkan ringkasan absensi berdasarkan role dan filter tanggal
  AttendanceSummaryModel getSummary({
    required UserRole role,
    AttendanceFilter filter = AttendanceFilter.today,
  }) {
    if (role == UserRole.admin) {
      // Data Admin: Seluruh santri pesantren
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
      // Data Guru: Khusus rombel / kelas yang diampu
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

  /// Mendapatkan daftar aktivitas absensi terakhir (Maksimal 3 pada Homepage - Butir 6)
  List<AttendanceActivityModel> getRecentActivities({
    required UserRole role,
    int limit = 3,
  }) {
    // Data sesuai persis dengan gambar referensi resmi
    final allActivities = [
      const AttendanceActivityModel(
        id: 'ACT-001',
        studentName: 'Ahmad Fauzi',
        className: 'Kelas VII A',
        status: AttendanceStatus.hadir,
        time: '08:12',
        timeLabel: 'Hari Ini',
        avatarAsset: 'assets/images/santri_ahmad.png',
        isFemale: false,
      ),
      const AttendanceActivityModel(
        id: 'ACT-002',
        studentName: 'Siti Aisyah',
        className: 'Kelas VIII B',
        status: AttendanceStatus.izin,
        time: '07:50',
        timeLabel: 'Hari Ini',
        avatarAsset: 'assets/images/santri_aisyah.png',
        isFemale: true,
      ),
      const AttendanceActivityModel(
        id: 'ACT-003',
        studentName: 'Muhammad Rizky',
        className: 'Kelas VII B',
        status: AttendanceStatus.alpha,
        time: '07:30',
        timeLabel: 'Hari Ini',
        avatarAsset: 'assets/images/santri_rizky.png',
        isFemale: false,
      ),
      // Aktivitas tambahan untuk dialog 'Lihat Semua'
      const AttendanceActivityModel(
        id: 'ACT-004',
        studentName: 'Fatimah Zahra',
        className: 'Kelas VII A',
        status: AttendanceStatus.hadir,
        time: '07:15',
        timeLabel: 'Hari Ini',
        isFemale: true,
      ),
      const AttendanceActivityModel(
        id: 'ACT-005',
        studentName: 'Zaidan Al-Farisi',
        className: 'Kelas IX A',
        status: AttendanceStatus.hadir,
        time: '07:10',
        timeLabel: 'Hari Ini',
        isFemale: false,
      ),
    ];

    if (role == UserRole.guru) {
      // Guru melihat aktivitas pada kelas binaannya
      return allActivities
          .where((act) => act.className.contains('VII'))
          .take(limit)
          .toList();
    }

    return allActivities.take(limit).toList();
  }
}
