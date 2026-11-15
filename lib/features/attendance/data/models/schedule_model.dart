import 'package:flutter/material.dart';

/// Model Jadwal Pelajaran Pondok Pesantren Islam Darul Hikmah (Sesuai Butir B & C)
/// Menyimpan informasi:
/// - Hari pelajaran (Senin - Ahad)
/// - Kelas (VII A - IX B, dst)
/// - Mata pelajaran (Fiqih, Al-Qur'an Hadits, Bahasa Arab, dll)
/// - Guru pengampu
/// - Nomor jam pelajaran (Jam Ke-1, 2, dll)
/// - Waktu mulai dan waktu selesai
class ScheduleModel {
  final String id;
  final String day;            // Contoh: 'Senin', 'Selasa', 'Rabu', dll
  final String className;      // Contoh: 'VII A', 'VIII B', dll
  final String subject;        // Contoh: 'Fiqih', 'Bahasa Arab', dll
  final String teacherName;    // Contoh: 'Ustadz Ahmad Fauzi'
  final String? teacherId;     // ID guru pengampu (opsional untuk relasi akun)
  final int periodNumber;      // Jam ke- (1, 2, 3, dst)
  final String startTime;      // Format 'HH:mm', contoh '07:30'
  final String endTime;        // Format 'HH:mm', contoh '08:15'
  final String? room;          // Ruang belajar, default 'Ruang Kelas $className'
  final String? notes;         // Catatan khusus

  const ScheduleModel({
    required this.id,
    required this.day,
    required this.className,
    required this.subject,
    required this.teacherName,
    this.teacherId,
    required this.periodNumber,
    required this.startTime,
    required this.endTime,
    this.room,
    this.notes,
  });

  /// Label Jam Pelajaran (contoh: 'Jam Ke-1')
  String get periodLabel => 'Jam Ke-$periodNumber';

  /// Rentang Waktu (contoh: '07:30 - 08:15 WIB')
  String get timeRange => '$startTime - $endTime WIB';

  /// Ruang belajar efektif
  String get effectiveRoom => room ?? 'Ruang Kelas $className';

  /// Konversi waktu 'HH:mm' ke jumlah menit dari pukul 00:00 untuk komparasi bentrok waktu
  static int parseTimeToMinutes(String timeStr) {
    try {
      final parts = timeStr.trim().split(':');
      if (parts.length >= 2) {
        final hours = int.parse(parts[0]);
        final minutes = int.parse(parts[1]);
        return hours * 60 + minutes;
      }
    } catch (_) {}
    return 0;
  }

  /// Menit mulai dari jam 00:00
  int get startMinutes => parseTimeToMinutes(startTime);

  /// Menit selesai dari jam 00:00
  int get endMinutes => parseTimeToMinutes(endTime);

  /// Durasi pelajaran dalam menit
  int get durationMinutes {
    final diff = endMinutes - startMinutes;
    return diff > 0 ? diff : 0;
  }

  /// Label durasi (contoh: '45 Menit')
  String get durationLabel => '$durationMinutes Menit';

  /// Memeriksa apakah rentang waktu dua jadwal bertabrakan / tumpang tindih
  bool isOverlappingTimeWith(ScheduleModel other) {
    if (day.toLowerCase().trim() != other.day.toLowerCase().trim()) {
      return false;
    }
    // Dua interval waktu [startA, endA] dan [startB, endB] tumpang tindih jika:
    // startA < endB DAN endA > startB
    return startMinutes < other.endMinutes && endMinutes > other.startMinutes;
  }

  /// Cek Bentrok Waktu Kelas:
  /// Kelas yang sama tidak boleh memiliki dua pelajaran pada waktu bersamaan
  bool isClassConflictWith(ScheduleModel other) {
    if (id == other.id) return false; // Bukan bentrok dengan diri sendiri saat edit
    if (className.toLowerCase().trim() != other.className.toLowerCase().trim()) return false;
    return isOverlappingTimeWith(other);
  }

  /// Cek Bentrok Waktu Guru:
  /// Guru yang sama tidak boleh mengajar dua kelas pada waktu bersamaan
  bool isTeacherConflictWith(ScheduleModel other) {
    if (id == other.id) return false; // Bukan bentrok dengan diri sendiri saat edit
    final t1 = teacherName.toLowerCase().trim();
    final t2 = other.teacherName.toLowerCase().trim();
    if (t1 != t2) return false;
    return isOverlappingTimeWith(other);
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'day': day,
      'className': className,
      'subject': subject,
      'teacherName': teacherName,
      'teacherId': teacherId,
      'periodNumber': periodNumber,
      'startTime': startTime,
      'endTime': endTime,
      'room': room,
      'notes': notes,
    };
  }

  Map<String, dynamic> toJson() => toMap();

  factory ScheduleModel.fromJson(Map<String, dynamic> json) => ScheduleModel.fromMap(json);

  factory ScheduleModel.fromMap(Map<String, dynamic> map) {
    return ScheduleModel(
      id: map['id']?.toString() ?? '',
      day: map['day']?.toString() ?? 'Senin',
      className: map['className']?.toString() ?? 'VII A',
      subject: map['subject']?.toString() ?? '',
      teacherName: map['teacherName']?.toString() ?? '',
      teacherId: map['teacherId']?.toString(),
      periodNumber: int.tryParse(map['periodNumber']?.toString() ?? '1') ?? 1,
      startTime: map['startTime']?.toString() ?? '07:30',
      endTime: map['endTime']?.toString() ?? '08:15',
      room: map['room']?.toString(),
      notes: map['notes']?.toString(),
    );
  }

  ScheduleModel copyWith({
    String? id,
    String? day,
    String? className,
    String? subject,
    String? teacherName,
    String? teacherId,
    int? periodNumber,
    String? startTime,
    String? endTime,
    String? room,
    String? notes,
  }) {
    return ScheduleModel(
      id: id ?? this.id,
      day: day ?? this.day,
      className: className ?? this.className,
      subject: subject ?? this.subject,
      teacherName: teacherName ?? this.teacherName,
      teacherId: teacherId ?? this.teacherId,
      periodNumber: periodNumber ?? this.periodNumber,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      room: room ?? this.room,
      notes: notes ?? this.notes,
    );
  }
}
