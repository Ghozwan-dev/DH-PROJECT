import '../../../students/data/models/student_model.dart';
import 'lesson_attendance_model.dart';

/// Model Agregasi Rekap Absensi per Santri (Khusus Admin)
/// Mengagregasi seluruh sesi absensi yang pernah tercatat untuk satu orang santri.
class StudentAttendanceRecapModel {
  final StudentModel student;
  final int totalMeetings;
  final int hadirCount;
  final int izinCount;
  final int sakitCount;
  final int alfaCount;
  final double presencePercentage;
  final List<StudentAttendanceSessionLog> sessionLogs;

  const StudentAttendanceRecapModel({
    required this.student,
    required this.totalMeetings,
    required this.hadirCount,
    required this.izinCount,
    required this.sakitCount,
    required this.alfaCount,
    required this.presencePercentage,
    required this.sessionLogs,
  });

  /// Format teks persentase kehadiran (misal: "100%", "92.5%", "0%")
  String get formattedPercentage {
    if (totalMeetings == 0) return '0%';
    if (presencePercentage % 1 == 0) {
      return '${presencePercentage.toInt()}%';
    }
    return '${presencePercentage.toStringAsFixed(1)}%';
  }

  /// Warna indikator persentase kehadiran
  /// >= 90%: Hijau, 75% - 89%: Kuning/Amber, < 75%: Merah
  int get indicatorColorHex {
    if (totalMeetings == 0) return 0xFF94A3B8; // Abu-abu
    if (presencePercentage >= 90.0) return 0xFF16A34A; // Hijau
    if (presencePercentage >= 75.0) return 0xFFD97706; // Amber
    return 0xFFDC2626; // Merah
  }

  int get indicatorBgHex {
    if (totalMeetings == 0) return 0xFFF1F5F9;
    if (presencePercentage >= 90.0) return 0xFFDCFCE7;
    if (presencePercentage >= 75.0) return 0xFFFEF3C7;
    return 0xFFFEE2E2;
  }
}

/// Catatan log riwayat sesi absensi yang diikuti oleh seorang santri
class StudentAttendanceSessionLog {
  final String attendanceId;
  final String date;
  final String subject;
  final String className;
  final String teacherName;
  final int periodNumber;
  final String startTime;
  final String endTime;
  final LessonAttendanceStatus status;
  final String? note;

  const StudentAttendanceSessionLog({
    required this.attendanceId,
    required this.date,
    required this.subject,
    required this.className,
    required this.teacherName,
    required this.periodNumber,
    required this.startTime,
    required this.endTime,
    required this.status,
    this.note,
  });

  /// Format tanggal Indonesia ringkas (DD/MM/YYYY)
  String get formattedDate {
    try {
      final parts = date.split('-');
      if (parts.length == 3) {
        return '${parts[2]}/${parts[1]}/${parts[0]}';
      }
    } catch (_) {}
    return date;
  }
}
