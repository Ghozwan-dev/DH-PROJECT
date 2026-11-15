import '../models/lesson_attendance_model.dart';

/// Data awal (mock seed) untuk Riwayat Absensi Pelajaran Santri Darul Hikmah
/// Dipisahkan dari repository agar siap beralih ke REST API NestJS
List<LessonAttendanceModel> getInitialMockLessonAttendance() {
  final today = DateTime.now();
  final todayStr =
      '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';

  final yesterday = today.subtract(const Duration(days: 1));
  final yesterdayStr =
      '${yesterday.year}-${yesterday.month.toString().padLeft(2, '0')}-${yesterday.day.toString().padLeft(2, '0')}';

  return [
    LessonAttendanceModel(
      id: 'ATT-001',
      scheduleId: 'SCH-001',
      date: todayStr,
      className: 'VII A',
      subject: 'Fiqih',
      teacherName: 'Ustadz Ahmad Fauzi',
      periodNumber: 1,
      startTime: '07:30',
      endTime: '08:15',
      items: const [
        StudentAttendanceItemModel(
          studentId: 'SNT-001',
          studentNis: '2024001',
          studentName: 'Ahmad Fauzi',
          avatarAsset: 'assets/images/santri_ahmad.png',
          status: LessonAttendanceStatus.hadir,
        ),
      ],
      createdAt: today.subtract(const Duration(hours: 1)),
      updatedAt: today.subtract(const Duration(hours: 1)),
      recordedBy: 'Ustadz Ahmad Fauzi',
    ),
    LessonAttendanceModel(
      id: 'ATT-002',
      scheduleId: 'SCH-002',
      date: todayStr,
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
          avatarAsset: 'assets/images/santri_rizky.png',
          status: LessonAttendanceStatus.hadir,
        ),
      ],
      createdAt: today.subtract(const Duration(minutes: 30)),
      updatedAt: today.subtract(const Duration(minutes: 30)),
      recordedBy: 'Ustadz Ahmad Fauzi',
    ),
    LessonAttendanceModel(
      id: 'ATT-003',
      scheduleId: 'SCH-003',
      date: yesterdayStr,
      className: 'VIII B',
      subject: 'Al-Qur\'an Hadits',
      teacherName: 'Ustadzah Halimah',
      periodNumber: 1,
      startTime: '07:30',
      endTime: '08:15',
      items: const [
        StudentAttendanceItemModel(
          studentId: 'SNT-004',
          studentNis: '2024004',
          studentName: 'Siti Aisyah',
          avatarAsset: 'assets/images/santri_aisyah.png',
          status: LessonAttendanceStatus.izin,
          note: 'Izin urusan keluarga',
        ),
      ],
      createdAt: yesterday.subtract(const Duration(hours: 2)),
      updatedAt: yesterday.subtract(const Duration(hours: 2)),
      recordedBy: 'Ustadzah Halimah',
    ),
    LessonAttendanceModel(
      id: 'ATT-004',
      scheduleId: 'SCH-004',
      date: yesterdayStr,
      className: 'IX A',
      subject: 'Akidah Akhlak',
      teacherName: 'Ustadz Mansyur Hidayat',
      periodNumber: 3,
      startTime: '09:15',
      endTime: '10:00',
      items: const [
        StudentAttendanceItemModel(
          studentId: 'SNT-005',
          studentNis: '2024005',
          studentName: 'Zaidan Al-Farisi',
          avatarAsset: 'assets/images/santri_putra_2.png',
          status: LessonAttendanceStatus.hadir,
        ),
      ],
      createdAt: yesterday.subtract(const Duration(hours: 1)),
      updatedAt: yesterday.subtract(const Duration(hours: 1)),
      recordedBy: 'Ustadz Mansyur Hidayat',
    ),
  ];
}
