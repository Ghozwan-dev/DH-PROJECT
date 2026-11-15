import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

/// Pilihan filter tanggal untuk Ringkasan Absensi
enum AttendanceFilter {
  today('Hari Ini'),
  yesterday('Kemarin'),
  thisWeek('Pekan Ini');

  final String label;
  const AttendanceFilter(this.label);
}

/// Status presensi santri (Butir 5 & 6)
enum AttendanceStatus {
  hadir('Hadir', AppColors.attendancePresent, AppColors.attendancePresentBg),
  izin('Izin', AppColors.attendancePermission, AppColors.attendancePermissionBg),
  alpha('Alpha', AppColors.attendanceAbsent, AppColors.attendanceAbsentBg);

  final String label;
  final Color color;
  final Color backgroundColor;
  const AttendanceStatus(this.label, this.color, this.backgroundColor);
}

/// Model Ringkasan Absensi (Butir 5)
class AttendanceSummaryModel {
  final int presentCount;    // Hadir
  final int permissionCount; // Izin
  final int absentCount;     // Alpha
  final AttendanceFilter filter;

  const AttendanceSummaryModel({
    required this.presentCount,
    required this.permissionCount,
    required this.absentCount,
    this.filter = AttendanceFilter.today,
  });

  int get total => presentCount + permissionCount + absentCount;

  AttendanceSummaryModel copyWith({
    int? presentCount,
    int? permissionCount,
    int? absentCount,
    AttendanceFilter? filter,
  }) {
    return AttendanceSummaryModel(
      presentCount: presentCount ?? this.presentCount,
      permissionCount: permissionCount ?? this.permissionCount,
      absentCount: absentCount ?? this.absentCount,
      filter: filter ?? this.filter,
    );
  }
}

/// Model Aktivitas Terakhir (Butir 6)
class AttendanceActivityModel {
  final String id;
  final String studentName;
  final String className;
  final AttendanceStatus status;
  final String time;
  final String timeLabel;
  final String? avatarAsset;
  final bool isFemale;

  const AttendanceActivityModel({
    required this.id,
    required this.studentName,
    required this.className,
    required this.status,
    required this.time,
    this.timeLabel = 'Hari Ini',
    this.avatarAsset,
    this.isFemale = false,
  });
}
