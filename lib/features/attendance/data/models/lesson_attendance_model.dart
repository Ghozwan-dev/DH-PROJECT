import 'package:flutter/material.dart';

/// Status Kehadiran Santri:
/// - Hadir (H)
/// - Izin (I)
/// - Sakit (S)
/// - Alfa (A)
enum LessonAttendanceStatus {
  hadir('Hadir', 'H', Color(0xFF16A34A), Color(0xFFDCFCE7)),
  izin('Izin', 'I', Color(0xFF0284C7), Color(0xFFE0F2FE)),
  sakit('Sakit', 'S', Color(0xFFD97706), Color(0xFFFEF3C7)),
  alfa('Alfa', 'A', Color(0xFFDC2626), Color(0xFFFEE2E2));

  final String label;
  final String shortCode;
  final Color color;
  final Color backgroundColor;

  const LessonAttendanceStatus(
    this.label,
    this.shortCode,
    this.color,
    this.backgroundColor,
  );

  static LessonAttendanceStatus fromString(String? val) {
    if (val == null) return LessonAttendanceStatus.hadir;
    final lower = val.toLowerCase().trim();
    switch (lower) {
      case 'h':
      case 'hadir':
        return LessonAttendanceStatus.hadir;
      case 'i':
      case 'izin':
        return LessonAttendanceStatus.izin;
      case 's':
      case 'sakit':
        return LessonAttendanceStatus.sakit;
      case 'a':
      case 'alfa':
      case 'alpha':
        return LessonAttendanceStatus.alfa;
      default:
        return LessonAttendanceStatus.hadir;
    }
  }
}

/// Item Absensi Per Santri dalam Satu Sesi Pelajaran
class StudentAttendanceItemModel {
  final String studentId;
  final String studentNis;
  final String studentName;
  final String? avatarAsset;
  final LessonAttendanceStatus status;
  final String? note;

  const StudentAttendanceItemModel({
    required this.studentId,
    required this.studentNis,
    required this.studentName,
    this.avatarAsset,
    this.status = LessonAttendanceStatus.hadir,
    this.note,
  });

  StudentAttendanceItemModel copyWith({
    String? studentId,
    String? studentNis,
    String? studentName,
    String? avatarAsset,
    LessonAttendanceStatus? status,
    String? note,
  }) {
    return StudentAttendanceItemModel(
      studentId: studentId ?? this.studentId,
      studentNis: studentNis ?? this.studentNis,
      studentName: studentName ?? this.studentName,
      avatarAsset: avatarAsset ?? this.avatarAsset,
      status: status ?? this.status,
      note: note ?? this.note,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'studentId': studentId,
      'studentNis': studentNis,
      'studentName': studentName,
      'avatarAsset': avatarAsset,
      'status': status.name,
      'note': note,
    };
  }

  Map<String, dynamic> toJson() => toMap();

  factory StudentAttendanceItemModel.fromJson(Map<String, dynamic> json) =>
      StudentAttendanceItemModel.fromMap(json);

  factory StudentAttendanceItemModel.fromMap(Map<String, dynamic> map) {
    return StudentAttendanceItemModel(
      studentId: map['studentId']?.toString() ?? '',
      studentNis: map['studentNis']?.toString() ?? '',
      studentName: map['studentName']?.toString() ?? '',
      avatarAsset: map['avatarAsset']?.toString(),
      status: LessonAttendanceStatus.fromString(map['status']?.toString()),
      note: map['note']?.toString(),
    );
  }
}

/// Model Sesi Absensi Pelajaran (Berdasarkan Jadwal dan Tanggal)
class LessonAttendanceModel {
  final String id;
  final String scheduleId;
  final String date; // Format: 'YYYY-MM-DD'
  final String className;
  final String subject;
  final String teacherName;
  final String? teacherId;
  final int periodNumber;
  final String startTime;
  final String endTime;
  final List<StudentAttendanceItemModel> items;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String recordedBy; // Role atau nama pencatat

  const LessonAttendanceModel({
    required this.id,
    required this.scheduleId,
    required this.date,
    required this.className,
    required this.subject,
    required this.teacherName,
    this.teacherId,
    required this.periodNumber,
    required this.startTime,
    required this.endTime,
    required this.items,
    required this.createdAt,
    required this.updatedAt,
    required this.recordedBy,
  });

  int get totalStudents => items.length;
  int get hadirCount => items.where((i) => i.status == LessonAttendanceStatus.hadir).length;
  int get izinCount => items.where((i) => i.status == LessonAttendanceStatus.izin).length;
  int get sakitCount => items.where((i) => i.status == LessonAttendanceStatus.sakit).length;
  int get terlambatCount => 0; // Sesuai spesifikasi metrik (Terlambat: 0)
  int get alfaCount => items.where((i) => i.status == LessonAttendanceStatus.alfa).length;

  double get attendancePercentage {
    if (totalStudents == 0) return 0.0;
    return (hadirCount / totalStudents) * 100;
  }

  String get formattedDate {
    try {
      final parts = date.split('-');
      if (parts.length == 3) {
        return '${parts[2]}/${parts[1]}/${parts[0]}';
      }
    } catch (_) {}
    return date;
  }

  LessonAttendanceModel copyWith({
    String? id,
    String? scheduleId,
    String? date,
    String? className,
    String? subject,
    String? teacherName,
    String? teacherId,
    int? periodNumber,
    String? startTime,
    String? endTime,
    List<StudentAttendanceItemModel>? items,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? recordedBy,
  }) {
    return LessonAttendanceModel(
      id: id ?? this.id,
      scheduleId: scheduleId ?? this.scheduleId,
      date: date ?? this.date,
      className: className ?? this.className,
      subject: subject ?? this.subject,
      teacherName: teacherName ?? this.teacherName,
      teacherId: teacherId ?? this.teacherId,
      periodNumber: periodNumber ?? this.periodNumber,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      items: items ?? this.items,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      recordedBy: recordedBy ?? this.recordedBy,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'scheduleId': scheduleId,
      'date': date,
      'className': className,
      'subject': subject,
      'teacherName': teacherName,
      'teacherId': teacherId,
      'periodNumber': periodNumber,
      'startTime': startTime,
      'endTime': endTime,
      'items': items.map((i) => i.toMap()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'recordedBy': recordedBy,
    };
  }

  Map<String, dynamic> toJson() => toMap();

  factory LessonAttendanceModel.fromJson(Map<String, dynamic> json) =>
      LessonAttendanceModel.fromMap(json);

  factory LessonAttendanceModel.fromMap(Map<String, dynamic> map) {
    return LessonAttendanceModel(
      id: map['id']?.toString() ?? '',
      scheduleId: map['scheduleId']?.toString() ?? '',
      date: map['date']?.toString() ?? '',
      className: map['className']?.toString() ?? '',
      subject: map['subject']?.toString() ?? '',
      teacherName: map['teacherName']?.toString() ?? '',
      teacherId: map['teacherId']?.toString(),
      periodNumber: int.tryParse(map['periodNumber']?.toString() ?? '1') ?? 1,
      startTime: map['startTime']?.toString() ?? '',
      endTime: map['endTime']?.toString() ?? '',
      items: (map['items'] as List<dynamic>?)
              ?.map((item) => StudentAttendanceItemModel.fromMap(item as Map<String, dynamic>))
              .toList() ??
          [],
      createdAt: DateTime.tryParse(map['createdAt']?.toString() ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(map['updatedAt']?.toString() ?? '') ?? DateTime.now(),
      recordedBy: map['recordedBy']?.toString() ?? '',
    );
  }
}
