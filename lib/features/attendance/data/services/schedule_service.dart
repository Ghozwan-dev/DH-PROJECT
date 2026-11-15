import 'package:flutter/foundation.dart';
import '../../../auth/data/models/user_model.dart';
import '../models/schedule_model.dart';

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

/// Service Pengelolaan Jadwal Pelajaran Pondok Pesantren Islam Darul Hikmah (Sesuai Butir A, B, C, D, E, F)
/// - Menggunakan data dummy lokal in-memory (stateful singleton)
/// - Siap diintegrasikan dengan database backend / API REST
/// - Dilengkapi mekanisme deteksi bentrok waktu mengajar guru dan bentrok waktu kelas
class ScheduleService extends ChangeNotifier {
  static final ScheduleService _instance = ScheduleService._internal();
  factory ScheduleService() => _instance;
  ScheduleService._internal() {
    _seedDummyData();
  }

  final List<ScheduleModel> _schedules = [];

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

  // Inisialisasi Data Dummy (Sesuai Butir F: Minimal Kelas VII A - IX B, variasi guru, hari, jam)
  void _seedDummyData() {
    _schedules.clear();
    _schedules.addAll([
      // SENIN
      const ScheduleModel(
        id: 'SCH-001',
        day: 'Senin',
        className: 'VII A',
        subject: 'Al-Qur\'an Hadits',
        teacherName: 'Ustadz Ahmad Fauzi',
        teacherId: 'guru_001',
        periodNumber: 1,
        startTime: '07:30',
        endTime: '08:15',
        room: 'Ruang Kelas VII A',
        notes: 'Hafalan Surat An-Naba',
      ),
      const ScheduleModel(
        id: 'SCH-002',
        day: 'Senin',
        className: 'VII A',
        subject: 'Fiqih',
        teacherName: 'Ustadz Mansyur Hidayat',
        periodNumber: 2,
        startTime: '08:15',
        endTime: '09:00',
        room: 'Ruang Kelas VII A',
        notes: 'Bab Thaharah dan Wudhu',
      ),
      const ScheduleModel(
        id: 'SCH-003',
        day: 'Senin',
        className: 'VII B',
        subject: 'Bahasa Arab',
        teacherName: 'Ustadz Zulkifli',
        periodNumber: 1,
        startTime: '07:30',
        endTime: '08:15',
        room: 'Ruang Kelas VII B',
        notes: 'Kosakata Dasar Pesantren',
      ),
      const ScheduleModel(
        id: 'SCH-004',
        day: 'Senin',
        className: 'VII B',
        subject: 'Al-Qur\'an Hadits',
        teacherName: 'Ustadz Ahmad Fauzi',
        teacherId: 'guru_001',
        periodNumber: 2,
        startTime: '08:15',
        endTime: '09:00',
        room: 'Ruang Kelas VII B',
        notes: 'Pelajaran Tajwid Dasar',
      ),
      const ScheduleModel(
        id: 'SCH-005',
        day: 'Senin',
        className: 'VIII A',
        subject: 'Nahwu Shorof',
        teacherName: 'Ustadz Abdullah Said',
        periodNumber: 1,
        startTime: '07:30',
        endTime: '08:15',
        room: 'Ruang Kelas VIII A',
        notes: 'Kitab Al-Jurumiyah',
      ),
      const ScheduleModel(
        id: 'SCH-006',
        day: 'Senin',
        className: 'VIII B',
        subject: 'Akidah Akhlak',
        teacherName: 'Ustadzah Halimah',
        periodNumber: 1,
        startTime: '07:30',
        endTime: '08:15',
        room: 'Ruang Kelas VIII B',
        notes: 'Adab terhadap Guru dan Orang Tua',
      ),
      const ScheduleModel(
        id: 'SCH-007',
        day: 'Senin',
        className: 'IX A',
        subject: 'Matematika',
        teacherName: 'Ustadzah Nurul Azizah',
        periodNumber: 3,
        startTime: '09:15',
        endTime: '10:00',
        room: 'Ruang Kelas IX A',
        notes: 'Persamaan Linear Dua Variabel',
      ),
      const ScheduleModel(
        id: 'SCH-008',
        day: 'Senin',
        className: 'IX B',
        subject: 'Bahasa Inggris',
        teacherName: 'Ustadz Lukman Hakim',
        periodNumber: 3,
        startTime: '09:15',
        endTime: '10:00',
        room: 'Ruang Kelas IX B',
        notes: 'Grammar and Reading Comprehension',
      ),

      // SELASA
      const ScheduleModel(
        id: 'SCH-009',
        day: 'Selasa',
        className: 'VII A',
        subject: 'Tahfidz Al-Qur\'an',
        teacherName: 'Ustadz Ahmad Fauzi',
        teacherId: 'guru_001',
        periodNumber: 1,
        startTime: '07:30',
        endTime: '08:15',
        room: 'Masjid Pesantren Lt. 1',
        notes: 'Setoran Juz 30',
      ),
      const ScheduleModel(
        id: 'SCH-010',
        day: 'Selasa',
        className: 'VII B',
        subject: 'Fiqih',
        teacherName: 'Ustadz Mansyur Hidayat',
        periodNumber: 1,
        startTime: '07:30',
        endTime: '08:15',
        room: 'Ruang Kelas VII B',
        notes: 'Syarat dan Rukun Sholat',
      ),
      const ScheduleModel(
        id: 'SCH-011',
        day: 'Selasa',
        className: 'VIII A',
        subject: 'Bahasa Arab',
        teacherName: 'Ustadz Zulkifli',
        periodNumber: 2,
        startTime: '08:15',
        endTime: '09:00',
        room: 'Ruang Kelas VIII A',
        notes: 'Muhadatsah (Percakapan Harian)',
      ),
      const ScheduleModel(
        id: 'SCH-012',
        day: 'Selasa',
        className: 'VIII B',
        subject: 'Sejarah Kebudayaan Islam (SKI)',
        teacherName: 'Ustadzah Halimah',
        periodNumber: 2,
        startTime: '08:15',
        endTime: '09:00',
        room: 'Ruang Kelas VIII B',
        notes: 'Masa Kekhalifahan Abbasiyah',
      ),
      const ScheduleModel(
        id: 'SCH-013',
        day: 'Selasa',
        className: 'IX A',
        subject: 'IPA Terpadu',
        teacherName: 'Ustadzah Nurul Azizah',
        periodNumber: 4,
        startTime: '10:00',
        endTime: '10:45',
        room: 'Laboratorium IPA',
        notes: 'Praktikum Sistem Pencernaan',
      ),

      // RABU
      const ScheduleModel(
        id: 'SCH-014',
        day: 'Rabu',
        className: 'VII A',
        subject: 'Matematika',
        teacherName: 'Ustadzah Nurul Azizah',
        periodNumber: 1,
        startTime: '07:30',
        endTime: '08:15',
        room: 'Ruang Kelas VII A',
        notes: 'Bilangan Bulat dan Pecahan',
      ),
      const ScheduleModel(
        id: 'SCH-015',
        day: 'Rabu',
        className: 'VIII A',
        subject: 'Al-Qur\'an Hadits',
        teacherName: 'Ustadz Ahmad Fauzi',
        teacherId: 'guru_001',
        periodNumber: 2,
        startTime: '08:15',
        endTime: '09:00',
        room: 'Ruang Kelas VIII A',
        notes: 'Hadits Menuntut Ilmu',
      ),
      const ScheduleModel(
        id: 'SCH-016',
        day: 'Rabu',
        className: 'IX B',
        subject: 'Nahwu Shorof',
        teacherName: 'Ustadz Abdullah Said',
        periodNumber: 3,
        startTime: '09:15',
        endTime: '10:00',
        room: 'Ruang Kelas IX B',
        notes: 'I\'rab Fi\'il Mudhari\'',
      ),

      // KAMIS
      const ScheduleModel(
        id: 'SCH-017',
        day: 'Kamis',
        className: 'VII B',
        subject: 'Tahfidz Al-Qur\'an',
        teacherName: 'Ustadz Ahmad Fauzi',
        teacherId: 'guru_001',
        periodNumber: 1,
        startTime: '07:30',
        endTime: '08:15',
        room: 'Masjid Pesantren Lt. 1',
        notes: 'Muroja\'ah Surat An-Nazi\'at',
      ),
      const ScheduleModel(
        id: 'SCH-018',
        day: 'Kamis',
        className: 'VIII B',
        subject: 'Bahasa Inggris',
        teacherName: 'Ustadz Lukman Hakim',
        periodNumber: 2,
        startTime: '08:15',
        endTime: '09:00',
        room: 'Ruang Kelas VIII B',
        notes: 'Simple Past Tense',
      ),

      // SABTU
      const ScheduleModel(
        id: 'SCH-019',
        day: 'Sabtu',
        className: 'IX A',
        subject: 'Akidah Akhlak',
        teacherName: 'Ustadzah Halimah',
        periodNumber: 1,
        startTime: '07:30',
        endTime: '08:15',
        room: 'Ruang Kelas IX A',
        notes: 'Konsep Tawakal dan Sabar',
      ),
      const ScheduleModel(
        id: 'SCH-020',
        day: 'Sabtu',
        className: 'IX B',
        subject: 'Fiqih',
        teacherName: 'Ustadz Mansyur Hidayat',
        periodNumber: 2,
        startTime: '08:15',
        endTime: '09:00',
        room: 'Ruang Kelas IX B',
        notes: 'Hukum Muamalah Islam',
      ),
    ]);
  }

  // --- QUERY / READ METHODS ---

  /// Mendapatkan seluruh jadwal pelajaran
  List<ScheduleModel> getAllSchedules() {
    return List.unmodifiable(_schedules);
  }

  /// Mendapatkan jadwal sesuai hak akses pengguna (Butir B.3 & E)
  /// - Admin: Melihat seluruh jadwal pelajaran
  /// - Guru: Hanya melihat jadwal yang ditugaskan kepadanya
  List<ScheduleModel> getSchedulesForUser(UserModel user) {
    if (user.isAdmin) {
      return getAllSchedules();
    }
    // Filter khusus guru pengampu (berdasarkan nama guru atau username/id)
    final teacherNameLower = user.fullName.toLowerCase().trim();
    return _schedules.where((s) {
      if (s.teacherId != null && s.teacherId == user.id) return true;
      final sTeacherLower = s.teacherName.toLowerCase().trim();
      return sTeacherLower == teacherNameLower ||
          sTeacherLower.contains(user.username.toLowerCase()) ||
          teacherNameLower.contains(sTeacherLower);
    }).toList();
  }

  /// Mengambil data jadwal berdasarkan ID
  ScheduleModel? getScheduleById(String id) {
    try {
      return _schedules.firstWhere((s) => s.id == id);
    } catch (_) {
      return null;
    }
  }

  /// Ringkasan Total Jadwal
  int get totalSchedules => _schedules.length;

  /// Ringkasan Total Kelas Unik
  int get totalClasses {
    final uniqueClasses = _schedules.map((s) => s.className.trim()).toSet();
    return uniqueClasses.length;
  }

  /// Ringkasan Total Guru Pengampu Unik
  int get totalTeachers {
    final uniqueTeachers = _schedules.map((s) => s.teacherName.trim()).toSet();
    return uniqueTeachers.length;
  }

  /// Penyaringan dan Pencarian Jadwal (Butir C.3)
  /// - Filter berdasarkan Hari
  /// - Filter berdasarkan Kelas
  /// - Pencarian berdasarkan Mata Pelajaran atau Nama Guru Pengampu
  List<ScheduleModel> filterSchedules({
    required List<ScheduleModel> sourceList,
    String? day,
    String? className,
    String? query,
  }) {
    return sourceList.where((s) {
      // 1. Filter Hari
      if (day != null && day.isNotEmpty && day != 'Semua') {
        if (s.day.toLowerCase().trim() != day.toLowerCase().trim()) {
          return false;
        }
      }

      // 2. Filter Kelas
      if (className != null && className.isNotEmpty && className != 'Semua') {
        if (s.className.toLowerCase().trim() != className.toLowerCase().trim()) {
          return false;
        }
      }

      // 3. Pencarian (Mata Pelajaran atau Nama Guru)
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

  // --- VALIDATION ENGINE (Butir D & Aturan Penugasan Guru) ---

  /// Validasi menyeluruh terhadap integritas jadwal:
  /// 1. Semua kolom wajib diisi.
  /// 2. Jam selesai harus setelah jam mulai.
  /// 3. Bentrok Kelas: Kelas yang sama tidak boleh memiliki 2 pelajaran pada waktu bersamaan.
  /// 4. Bentrok Guru: Guru yang sama tidak boleh mengajar 2 kelas pada waktu bersamaan.
  /// 5. Cegah duplikasi persis jadwal.
  ScheduleValidationResult validateSchedule(ScheduleModel schedule, {String? excludeId}) {
    // 1. Validasi Kelengkapan Kolom Wajib
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

    // 2. Validasi Jam Selesai Harus Setelah Jam Mulai
    if (schedule.endMinutes <= schedule.startMinutes) {
      return ScheduleValidationResult.error('Jam selesai (${schedule.endTime}) harus lebih akhir dari jam mulai (${schedule.startTime}).');
    }

    // Periksa terhadap seluruh jadwal lain yang aktif
    for (final other in _schedules) {
      // Lewati diri sendiri jika dalam mode edit
      if (other.id == schedule.id || (excludeId != null && other.id == excludeId)) {
        continue;
      }

      // 3. Aturan Bentrok Jadwal Kelas (Butir D & Aturan 7)
      if (schedule.isClassConflictWith(other)) {
        return ScheduleValidationResult.error(
          'Bentrok Kelas: Kelas ${schedule.className} sudah memiliki jadwal "${other.subject}" pada hari ${other.day} pukul ${other.timeRange}.',
          other,
        );
      }

      // 4. Aturan Bentrok Jadwal Guru (Butir D & Aturan 6)
      if (schedule.isTeacherConflictWith(other)) {
        return ScheduleValidationResult.error(
          'Bentrok Guru: ${schedule.teacherName} sudah memiliki jadwal mengajar di Kelas ${other.className} ("${other.subject}") pada hari ${other.day} pukul ${other.timeRange}.',
          other,
        );
      }

      // 5. Duplikasi Persis (Hari, Kelas, Jam Ke-)
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

  // --- CRUD / MUTATION METHODS ---

  /// Tambah Jadwal Baru (Khusus Admin - Butir E)
  ScheduleModel? addSchedule(ScheduleModel schedule) {
    // Generate ID baru jika masih temporary
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
    // Urutkan jadwal: Hari -> Kelas -> Jam Ke-
    _sortSchedules();
    notifyListeners();
    return scheduleToSave;
  }

  /// Perbarui Jadwal yang Ada (Khusus Admin - Butir E)
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
    notifyListeners();
    return true;
  }

  /// Hapus Jadwal (Khusus Admin - Butir E)
  bool deleteSchedule(String id) {
    final initialCount = _schedules.length;
    _schedules.removeWhere((s) => s.id == id);
    final deleted = _schedules.length < initialCount;
    if (deleted) {
      notifyListeners();
    }
    return deleted;
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
