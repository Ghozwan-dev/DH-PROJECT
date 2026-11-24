import '../../../students/data/models/student_model.dart';
import 'student_attendance_recap_model.dart';

/// Tipe Laporan Absensi Santri yang didukung
enum AttendanceReportType {
  perSantri,
  perKelas,
  periode,
}

extension AttendanceReportTypeExtension on AttendanceReportType {
  String get label {
    switch (this) {
      case AttendanceReportType.perSantri:
        return 'Laporan Per Santri';
      case AttendanceReportType.perKelas:
        return 'Laporan Per Kelas';
      case AttendanceReportType.periode:
        return 'Laporan Berdasarkan Periode';
    }
  }

  String get shortLabel {
    switch (this) {
      case AttendanceReportType.perSantri:
        return 'Per Santri';
      case AttendanceReportType.perKelas:
        return 'Per Kelas';
      case AttendanceReportType.periode:
        return 'Periode';
    }
  }
}

/// Data Laporan Khusus Per Santri
class StudentReportData {
  final StudentModel student;
  final int totalMeetings;
  final int hadirCount;
  final int izinCount;
  final int sakitCount;
  final int alfaCount;
  final double presencePercentage;
  final List<StudentAttendanceSessionLog> sessionLogs;

  const StudentReportData({
    required this.student,
    required this.totalMeetings,
    required this.hadirCount,
    required this.izinCount,
    required this.sakitCount,
    required this.alfaCount,
    required this.presencePercentage,
    required this.sessionLogs,
  });

  String get formattedPercentage {
    if (totalMeetings == 0) return '0%';
    if (presencePercentage % 1 == 0) {
      return '${presencePercentage.toInt()}%';
    }
    return '${presencePercentage.toStringAsFixed(1)}%';
  }
}

/// Data Laporan Khusus Per Kelas
class ClassReportData {
  final String className;
  final List<StudentReportData> students;
  final int totalStudents;
  final int totalMeetingsRecorded;
  final int totalHadir;
  final int totalIzin;
  final int totalSakit;
  final int totalAlfa;
  final double classAveragePercentage;

  const ClassReportData({
    required this.className,
    required this.students,
    required this.totalStudents,
    required this.totalMeetingsRecorded,
    required this.totalHadir,
    required this.totalIzin,
    required this.totalSakit,
    required this.totalAlfa,
    required this.classAveragePercentage,
  });

  String get formattedAveragePercentage {
    if (totalMeetingsRecorded == 0 || totalStudents == 0) return '0%';
    if (classAveragePercentage % 1 == 0) {
      return '${classAveragePercentage.toInt()}%';
    }
    return '${classAveragePercentage.toStringAsFixed(1)}%';
  }
}

/// Data Laporan Berdasarkan Periode
class PeriodReportData {
  final DateTime startDate;
  final DateTime endDate;
  final int totalSessions;
  final int totalAttendanceRecords;
  final int totalHadir;
  final int totalIzin;
  final int totalSakit;
  final int totalAlfa;
  final double overallPercentage;
  final Map<String, Map<String, int>> classBreakdown;
  final Map<String, Map<String, int>> subjectBreakdown;

  const PeriodReportData({
    required this.startDate,
    required this.endDate,
    required this.totalSessions,
    required this.totalAttendanceRecords,
    required this.totalHadir,
    required this.totalIzin,
    required this.totalSakit,
    required this.totalAlfa,
    required this.overallPercentage,
    required this.classBreakdown,
    required this.subjectBreakdown,
  });

  String get formattedOverallPercentage {
    if (totalAttendanceRecords == 0) return '0%';
    if (overallPercentage % 1 == 0) {
      return '${overallPercentage.toInt()}%';
    }
    return '${overallPercentage.toStringAsFixed(1)}%';
  }
}

/// Hasil Komprehensif Laporan Absensi Santri (Siap Pratinjau & Ekspor)
class AttendanceReportResult {
  final AttendanceReportType type;
  final String institutionName;
  final String title;
  final String periodLabel;
  final DateTime generatedAt;
  final String generatedBy;
  final String? classFilter;
  final String? subjectFilter;
  final StudentReportData? studentReport;
  final ClassReportData? classReport;
  final PeriodReportData? periodReport;

  const AttendanceReportResult({
    required this.type,
    this.institutionName = 'Pondok Pesantren Islam Darul Hikmah',
    required this.title,
    required this.periodLabel,
    required this.generatedAt,
    this.generatedBy = 'Administrator Pondok',
    this.classFilter,
    this.subjectFilter,
    this.studentReport,
    this.classReport,
    this.periodReport,
  });

  /// Format tanggal pembuatan laporan (contoh: "18 November 2026")
  String get formattedGeneratedDate {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    final d = generatedAt.day;
    final m = months[generatedAt.month - 1];
    final y = generatedAt.year;
    return '$d $m $y';
  }
}
