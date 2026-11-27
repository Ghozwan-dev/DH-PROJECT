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
  Map<String, dynamic> toMap() {
    return {
      'presentCount': presentCount,
      'permissionCount': permissionCount,
      'absentCount': absentCount,
      'filter': filter.name,
    };
  }

  Map<String, dynamic> toJson() => toMap();

  factory AttendanceSummaryModel.fromJson(Map<String, dynamic> json) => AttendanceSummaryModel.fromMap(json);

  factory AttendanceSummaryModel.fromMap(Map<String, dynamic> map) {
    return AttendanceSummaryModel(
      presentCount: int.tryParse(map['presentCount']?.toString() ?? '0') ?? 0,
      permissionCount: int.tryParse(map['permissionCount']?.toString() ?? '0') ?? 0,
      absentCount: int.tryParse(map['absentCount']?.toString() ?? '0') ?? 0,
      filter: AttendanceFilter.values.firstWhere(
        (f) => f.name == map['filter']?.toString(),
        orElse: () => AttendanceFilter.today,
      ),
    );
  }
}

/// Model Pengajar Hari Ini (Butir 6)
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

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'studentName': studentName,
      'className': className,
      'status': status.name,
      'time': time,
      'timeLabel': timeLabel,
      'avatarAsset': avatarAsset,
      'isFemale': isFemale,
    };
  }

  Map<String, dynamic> toJson() => toMap();

  factory AttendanceActivityModel.fromJson(Map<String, dynamic> json) => AttendanceActivityModel.fromMap(json);

  factory AttendanceActivityModel.fromMap(Map<String, dynamic> map) {
    return AttendanceActivityModel(
      id: map['id']?.toString() ?? '',
      studentName: map['studentName']?.toString() ?? '',
      className: map['className']?.toString() ?? '',
      status: AttendanceStatus.values.firstWhere(
        (s) => s.name == map['status']?.toString(),
        orElse: () => AttendanceStatus.hadir,
      ),
      time: map['time']?.toString() ?? '',
      timeLabel: map['timeLabel']?.toString() ?? 'Hari Ini',
      avatarAsset: map['avatarAsset']?.toString(),
      isFemale: map['isFemale'] as bool? ?? false,
    );
  }
}
