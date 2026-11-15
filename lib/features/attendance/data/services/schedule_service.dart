import 'package:flutter/foundation.dart';
import '../../../auth/data/models/user_model.dart';
import '../../domain/repositories/schedule_repository_interface.dart';
import '../models/schedule_model.dart';
import '../repositories/mock_schedule_repository.dart';

/// Hasil validasi formulir jadwal pelajaran (Sesuai Butir D & Aturan Penugasan Guru)
class ScheduleValidationResult {
  final bool isValid;
  final String? errorMessage;
  final ScheduleModel? conflictingSchedule;

  const ScheduleValidationResult({
    required this.isValid,
    this.errorMessage,
    this.conflictingSchedule,
  });

  factory ScheduleValidationResult.success() => const ScheduleValidationResult(isValid: true);
  factory ScheduleValidationResult.error(String message, [ScheduleModel? conflict]) =>
      ScheduleValidationResult(isValid: false, errorMessage: message, conflictingSchedule: conflict);
}

/// Service Pengelolaan Jadwal Pelajaran Pondok Pesantren Islam Darul Hikmah
/// - Menggunakan Repository Pattern (IScheduleRepository)
/// - Menjaga reaktivitas UI dengan ChangeNotifier
/// - Siap diintegrasikan dengan database backend NestJS & PostgreSQL via REST API
class ScheduleService extends ChangeNotifier {
  static final ScheduleService _instance = ScheduleService._internal();
  factory ScheduleService() => _instance;

  IScheduleRepository _repository;

  ScheduleService._internal([IScheduleRepository? repository])
      : _repository = repository ?? MockScheduleRepository();

  /// Mengganti implementasi repository (misal: beralih dari Mock ke REST API)
  void setRepository(IScheduleRepository repository) {
    _repository = repository;
    notifyListeners();
  }

  // Daftar Pilihan Statis untuk Dropdown & Filter
  static const List<String> dayOptions = [
    'Semua',
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
    'Ahad',
  ];

  static const List<String> formDayOptions = [
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
    'Ahad',
  ];

  static const List<String> classOptions = [
    'VII A',
    'VII B',
    'VIII A',
    'VIII B',
    'IX A',
    'IX B',
    'X A',
    'X B',
    'XI A',
    'XI B',
    'XII A',
    'XII B',
  ];

  static const List<String> subjectOptions = [
    'Al-Qur\'an Hadits',
    'Fiqih',
    'Bahasa Arab',
    'Akidah Akhlak',
    'Sejarah Kebudayaan Islam (SKI)',
    'Nahwu Shorof',
    'Tahfidz Al-Qur\'an',
    'Matematika',
    'Bahasa Inggris',
    'IPA Terpadu',
    'Bahasa Indonesia',
  ];

  static const List<String> teacherOptions = [
    'Ustadz Ahmad Fauzi',
    'Ustadzah Halimah',
    'Ustadz Mansyur Hidayat',
    'Ustadz Zulkifli',
    'Ustadzah Nurul Azizah',
    'Ustadz Abdullah Said',
    'Ustadz Lukman Hakim',
  ];

  // --- QUERY / READ METHODS ---

  /// Mendapatkan seluruh jadwal pelajaran
  List<ScheduleModel> getAllSchedules() => _repository.getAllSchedules();

  /// Mendapatkan jadwal sesuai hak akses pengguna
  List<ScheduleModel> getSchedulesForUser(UserModel user) =>
      _repository.getSchedulesForUser(user);

  /// Mengambil data jadwal berdasarkan ID
  ScheduleModel? getScheduleById(String id) => _repository.getScheduleById(id);

  /// Ringkasan Total Jadwal
  int get totalSchedules => _repository.totalSchedules;

  /// Ringkasan Total Kelas Unik
  int get totalClasses => _repository.totalClasses;

  /// Ringkasan Total Guru Pengampu Unik
  int get totalTeachers => _repository.totalTeachers;

  /// Penyaringan dan Pencarian Jadwal
  List<ScheduleModel> filterSchedules({
    required List<ScheduleModel> sourceList,
    String? day,
    String? className,
    String? query,
  }) {
    return _repository.filterSchedules(
      sourceList: sourceList,
      day: day,
      className: className,
      query: query,
    );
  }

  // --- VALIDATION ENGINE ---
  ScheduleValidationResult validateSchedule(ScheduleModel schedule, {String? excludeId}) {
    return _repository.validateSchedule(schedule, excludeId: excludeId);
  }

  // --- CRUD / MUTATION METHODS ---

  /// Tambah Jadwal Baru (Khusus Admin)
  ScheduleModel? addSchedule(ScheduleModel schedule) {
    final result = _repository.addSchedule(schedule);
    if (result != null) {
      notifyListeners();
    }
    return result;
  }

  /// Perbarui Jadwal yang Ada (Khusus Admin)
  bool updateSchedule(ScheduleModel schedule) {
    final success = _repository.updateSchedule(schedule);
    if (success) {
      notifyListeners();
    }
    return success;
  }

  /// Hapus Jadwal (Khusus Admin)
  bool deleteSchedule(String id) {
    final success = _repository.deleteSchedule(id);
    if (success) {
      notifyListeners();
    }
    return success;
  }
}
