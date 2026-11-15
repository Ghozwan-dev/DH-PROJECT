import '../models/attendance_models.dart';

/// Data awal (mock seed) untuk Aktivitas & Ringkasan Absensi Beranda
List<AttendanceActivityModel> getInitialMockHomeActivities() {
  return const [
    AttendanceActivityModel(
      id: 'ACT-001',
      studentName: 'Ahmad Fauzi',
      className: 'Kelas VII A',
      status: AttendanceStatus.hadir,
      time: '08:12',
      timeLabel: 'Hari Ini',
      avatarAsset: 'assets/images/santri_ahmad.png',
      isFemale: false,
    ),
    AttendanceActivityModel(
      id: 'ACT-002',
      studentName: 'Siti Aisyah',
      className: 'Kelas VIII B',
      status: AttendanceStatus.izin,
      time: '07:50',
      timeLabel: 'Hari Ini',
      avatarAsset: 'assets/images/santri_aisyah.png',
      isFemale: true,
    ),
    AttendanceActivityModel(
      id: 'ACT-003',
      studentName: 'Muhammad Rizky',
      className: 'Kelas VII B',
      status: AttendanceStatus.hadir,
      time: '07:45',
      timeLabel: 'Hari Ini',
      avatarAsset: 'assets/images/santri_rizky.png',
      isFemale: false,
    ),
  ];
}
