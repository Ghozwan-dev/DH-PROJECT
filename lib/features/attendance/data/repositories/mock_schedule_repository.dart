import 'package:flutter/foundation.dart';
import '../../../auth/data/models/user_model.dart';
import '../../domain/repositories/schedule_repository_interface.dart';
import '../datasources/mock_schedule_data.dart';
import '../models/schedule_model.dart';
import '../services/schedule_service.dart';

/// Implementasi Mock Repository untuk Manajemen Jadwal Pelajaran
/// Beroperasi secara in-memory untuk tahap preview & pengembangan frontend.
/// Dapat diganti dengan ApiScheduleRepository saat REST API NestJS siap.
class MockScheduleRepository implements IScheduleRepository {
  final List<ScheduleModel> _schedules;

  MockScheduleRepository({List<ScheduleModel>? initialData})
      : _schedules = initialData ?? getInitialMockSchedules();

  @override
  List<ScheduleModel> getAllSchedules() {
    return List.unmodifiable(_schedules);
  }

  @override
  List<ScheduleModel> getSchedulesForUser(UserModel user) {
    if (user.isAdmin) {
      return getAllSchedules();
    }
    final teacherNameLower = user.fullName.toLowerCase().trim();
    return _schedules.where((s) {
      if (s.teacherId != null && s.teacherId == user.id) return true;
      final sTeacherLower = s.teacherName.toLowerCase().trim();
      return sTeacherLower == teacherNameLower ||
          sTeacherLower.contains(user.username.toLowerCase()) ||
          teacherNameLower.contains(sTeacherLower);
    }).toList();
  }

  @override
  ScheduleModel? getScheduleById(String id) {
    try {
      return _schedules.firstWhere((s) => s.id == id);
    } catch (_) {
      return null;
    }
  }

  @override
  int get totalSchedules => _schedules.length;

  @override
  int get totalClasses {
    final uniqueClasses = _schedules.map((s) => s.className.trim()).toSet();
    return uniqueClasses.length;
  }

  @override
  int get totalTeachers {
    final uniqueTeachers = _schedules.map((s) => s.teacherName.trim()).toSet();
    return uniqueTeachers.length;
  }

  @override
  List<ScheduleModel> filterSchedules({
    required List<ScheduleModel> sourceList,
    String? day,
    String? className,
    String? query,
  }) {
    return sourceList.where((s) {
      if (day != null && day.isNotEmpty && day != 'Semua') {
        if (s.day.toLowerCase().trim() != day.toLowerCase().trim()) {
          return false;
        }
      }

      if (className != null && className.isNotEmpty && className != 'Semua') {
        if (s.className.toLowerCase().trim() != className.toLowerCase().trim()) {
          return false;
        }
      }

      if (query != null && query.trim().isNotEmpty) {
        final q = query.trim().toLowerCase();
        final matchSubject = s.subject.toLowerCase().contains(q);
        final matchTeacher = s.teacherName.toLowerCase().contains(q);
        final matchClass = s.className.toLowerCase().contains(q);
        if (!matchSubject && !matchTeacher && !matchClass) {
          return false;
        }
      }

      return true;
    }).toList();
  }

  @override
  ScheduleValidationResult validateSchedule(ScheduleModel schedule, {String? excludeId}) {
    if (schedule.day.trim().isEmpty) {
      return ScheduleValidationResult.error('Hari pelajaran wajib dipilih.');
    }
    if (schedule.className.trim().isEmpty) {
      return ScheduleValidationResult.error('Kelas wajib dipilih.');
    }
    if (schedule.subject.trim().isEmpty) {
      return ScheduleValidationResult.error('Mata pelajaran wajib dipilih.');
    }
    if (schedule.teacherName.trim().isEmpty) {
      return ScheduleValidationResult.error('Guru pengampu wajib dipilih.');
    }
    if (schedule.startTime.trim().isEmpty) {
      return ScheduleValidationResult.error('Jam mulai pelajaran wajib diisi.');
    }
    if (schedule.endTime.trim().isEmpty) {
      return ScheduleValidationResult.error('Jam selesai pelajaran wajib diisi.');
    }

    if (schedule.endMinutes <= schedule.startMinutes) {
      return ScheduleValidationResult.error(
        'Jam selesai (${schedule.endTime}) harus lebih akhir dari jam mulai (${schedule.startTime}).',
      );
    }

    for (final other in _schedules) {
      if (other.id == schedule.id || (excludeId != null && other.id == excludeId)) {
        continue;
      }

      if (schedule.isClassConflictWith(other)) {
        return ScheduleValidationResult.error(
          'Bentrok Kelas: Kelas ${schedule.className} sudah memiliki jadwal "${other.subject}" pada hari ${other.day} pukul ${other.timeRange}.',
          other,
        );
      }

      if (schedule.isTeacherConflictWith(other)) {
        return ScheduleValidationResult.error(
          'Bentrok Guru: ${schedule.teacherName} sudah memiliki jadwal mengajar di Kelas ${other.className} ("${other.subject}") pada hari ${other.day} pukul ${other.timeRange}.',
          other,
        );
      }

      if (schedule.day == other.day &&
          schedule.className == other.className &&
          schedule.periodNumber == other.periodNumber) {
        return ScheduleValidationResult.error(
          'Duplikasi Jadwal: Kelas ${schedule.className} sudah memiliki jadwal Jam Ke-${schedule.periodNumber} pada hari ${schedule.day}.',
          other,
        );
      }
    }

    return ScheduleValidationResult.success();
  }

  @override
  ScheduleModel? addSchedule(ScheduleModel schedule) {
    final newId = schedule.id.startsWith('temp_')
        ? 'sch_${DateTime.now().millisecondsSinceEpoch}'
        : schedule.id;

    final scheduleToSave = schedule.copyWith(id: newId);
    final validation = validateSchedule(scheduleToSave);
    if (!validation.isValid) {
      debugPrint('Gagal menambah jadwal: ${validation.errorMessage}');
      return null;
    }

    _schedules.add(scheduleToSave);
    _sortSchedules();
    return scheduleToSave;
  }

  @override
  bool updateSchedule(ScheduleModel schedule) {
    final idx = _schedules.indexWhere((s) => s.id == schedule.id);
    if (idx == -1) return false;

    final validation = validateSchedule(schedule, excludeId: schedule.id);
    if (!validation.isValid) {
      debugPrint('Gagal memperbarui jadwal: ${validation.errorMessage}');
      return false;
    }

    _schedules[idx] = schedule;
    _sortSchedules();
    return true;
  }

  @override
  bool deleteSchedule(String id) {
    final initialCount = _schedules.length;
    _schedules.removeWhere((s) => s.id == id);
    return _schedules.length < initialCount;
  }

  void _sortSchedules() {
    const dayOrder = {
      'Senin': 1,
      'Selasa': 2,
      'Rabu': 3,
      'Kamis': 4,
      'Jumat': 5,
      'Sabtu': 6,
      'Ahad': 7,
    };

    _schedules.sort((a, b) {
      final dayComp = (dayOrder[a.day] ?? 99).compareTo(dayOrder[b.day] ?? 99);
      if (dayComp != 0) return dayComp;

      final classComp = a.className.compareTo(b.className);
      if (classComp != 0) return classComp;

      return a.periodNumber.compareTo(b.periodNumber);
    });
  }
}
