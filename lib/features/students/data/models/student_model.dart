import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

/// Jenis kelamin santri
enum SantriGender {
  putra('Putra', 'L', AppColors.genderMale, AppColors.genderMaleBg),
  putri('Putri', 'P', AppColors.genderFemale, AppColors.genderFemaleBg);

  final String label;
  final String shortCode;
  final Color color;
  final Color backgroundColor;

  const SantriGender(this.label, this.shortCode, this.color, this.backgroundColor);

  static SantriGender fromString(String? val) {
    if (val == null) return SantriGender.putra;
    final lower = val.toLowerCase().trim();
    if (lower == 'putri' || lower == 'p' || lower == 'perempuan' || lower == 'female') {
      return SantriGender.putri;
    }
    return SantriGender.putra;
  }
}

/// Status keaktifan santri
enum SantriStatus {
  aktif('Aktif', AppColors.statusActive, AppColors.statusActiveBg),
  nonaktif('Nonaktif', AppColors.statusInactive, AppColors.statusInactiveBg);

  final String label;
  final Color color;
  final Color backgroundColor;

  const SantriStatus(this.label, this.color, this.backgroundColor);
}

/// Model Data Santri Pondok Pesantren Islam Darul Hikmah
class StudentModel {
  final String id;
  final String nis;
  final String fullName;
  final SantriGender gender;
  final String className;
  final String room;
  final String birthPlace;
  final DateTime birthDate;
  final String address;
  final String parentName;
  final String parentPhone;
  final DateTime enrollmentDate;
  final bool isActive;
  final String? avatarAsset;

  const StudentModel({
    required this.id,
    required this.nis,
    required this.fullName,
    required this.gender,
    required this.className,
    required this.room,
    required this.birthPlace,
    required this.birthDate,
    required this.address,
    required this.parentName,
    required this.parentPhone,
    required this.enrollmentDate,
    this.isActive = true,
    this.avatarAsset,
  });

  SantriStatus get status => isActive ? SantriStatus.aktif : SantriStatus.nonaktif;

  bool get isMale => gender == SantriGender.putra;
  bool get isFemale => gender == SantriGender.putri;

  String get grade {
    final upper = className.toUpperCase().trim();
    if (upper.startsWith('VII') && !upper.startsWith('VIII')) return 'Kelas VII';
    if (upper.startsWith('VIII')) return 'Kelas VIII';
    if (upper.startsWith('IX')) return 'Kelas IX';
    return className;
  }

  String get formattedBirthDate {
    return '${birthDate.day.toString().padLeft(2, '0')}-${birthDate.month.toString().padLeft(2, '0')}-${birthDate.year}';
  }

  String get formattedEnrollmentDate {
    return '${enrollmentDate.day.toString().padLeft(2, '0')}-${enrollmentDate.month.toString().padLeft(2, '0')}-${enrollmentDate.year}';
  }

  int get age {
    final now = DateTime.now();
    int age = now.year - birthDate.year;
    if (now.month < birthDate.month || (now.month == birthDate.month && now.day < birthDate.day)) {
      age--;
    }
    return age;
  }

  StudentModel copyWith({
    String? id,
    String? nis,
    String? fullName,
    SantriGender? gender,
    String? className,
    String? room,
    String? birthPlace,
    DateTime? birthDate,
    String? address,
    String? parentName,
    String? parentPhone,
    DateTime? enrollmentDate,
    bool? isActive,
    String? avatarAsset,
  }) {
    return StudentModel(
      id: id ?? this.id,
      nis: nis ?? this.nis,
      fullName: fullName ?? this.fullName,
      gender: gender ?? this.gender,
      className: className ?? this.className,
      room: room ?? this.room,
      birthPlace: birthPlace ?? this.birthPlace,
      birthDate: birthDate ?? this.birthDate,
      address: address ?? this.address,
      parentName: parentName ?? this.parentName,
      parentPhone: parentPhone ?? this.parentPhone,
      enrollmentDate: enrollmentDate ?? this.enrollmentDate,
      isActive: isActive ?? this.isActive,
      avatarAsset: avatarAsset ?? this.avatarAsset,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'nis': nis,
      'fullName': fullName,
      'gender': gender.label,
      'className': className,
      'room': room,
      'birthPlace': birthPlace,
      'birthDate': birthDate.toIso8601String(),
      'address': address,
      'parentName': parentName,
      'parentPhone': parentPhone,
      'enrollmentDate': enrollmentDate.toIso8601String(),
      'isActive': isActive,
      'avatarAsset': avatarAsset,
    };
  }

  Map<String, dynamic> toJson() => toMap();

  factory StudentModel.fromJson(Map<String, dynamic> json) => StudentModel.fromMap(json);

  factory StudentModel.fromMap(Map<String, dynamic> map) {
    return StudentModel(
      id: map['id']?.toString() ?? '',
      nis: map['nis']?.toString() ?? '',
      fullName: map['fullName']?.toString() ?? '',
      gender: SantriGender.fromString(map['gender']?.toString()),
      className: map['className']?.toString() ?? '',
      room: map['room']?.toString() ?? '',
      birthPlace: map['birthPlace']?.toString() ?? '',
      birthDate: DateTime.tryParse(map['birthDate']?.toString() ?? '') ?? DateTime(2011, 1, 1),
      address: map['address']?.toString() ?? '',
      parentName: map['parentName']?.toString() ?? '',
      parentPhone: map['parentPhone']?.toString() ?? '',
      enrollmentDate: DateTime.tryParse(map['enrollmentDate']?.toString() ?? '') ?? DateTime(2023, 7, 15),
      isActive: map['isActive'] as bool? ?? true,
      avatarAsset: map['avatarAsset']?.toString(),
    );
  }
}
