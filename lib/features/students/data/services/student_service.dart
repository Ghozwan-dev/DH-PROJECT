import 'package:flutter/foundation.dart';
import '../models/student_model.dart';

/// Service untuk Pengelolaan Data Santri Pondok Pesantren Islam Darul Hikmah
/// - Menggunakan data dummy lokal yang bersifat stateful (in-memory CRUD)
/// - Siap diintegrasikan dengan database / REST API pada tahap berikutnya
class StudentService extends ChangeNotifier {
  static final StudentService _instance = StudentService._internal();
  factory StudentService() => _instance;

  StudentService._internal() {
    _seedInitialStudents();
  }

  final List<StudentModel> _students = [];

  void _seedInitialStudents() {
    _students.addAll([
      StudentModel(
        id: 'SNT-001',
        nis: '2024001',
        fullName: 'Ahmad Fauzi',
        gender: SantriGender.putra,
        className: 'VII A',
        room: 'Al-Fatih 01',
        birthPlace: 'Sumenep',
        birthDate: DateTime(2011, 4, 12),
        address: 'Dusun Pajenassem, Arjasa, Kangean, Sumenep',
        parentName: 'H. Muhammad Syukri',
        parentPhone: '081234567891',
        enrollmentDate: DateTime(2024, 7, 15),
        isActive: true,
        avatarAsset: 'assets/images/santri_ahmad.png',
      ),
      StudentModel(
        id: 'SNT-002',
        nis: '2024002',
        fullName: 'Siti Aisyah',
        gender: SantriGender.putri,
        className: 'VIII B',
        room: 'Khadijah 02',
        birthPlace: 'Surabaya',
        birthDate: DateTime(2010, 8, 23),
        address: 'Jl. Rungkut Asri No. 45, Rungkut, Surabaya',
        parentName: 'Drs. H. Ahmad Dahlan',
        parentPhone: '081987654322',
        enrollmentDate: DateTime(2023, 7, 10),
        isActive: true,
        avatarAsset: 'assets/images/santri_aisyah.png',
      ),
      StudentModel(
        id: 'SNT-003',
        nis: '2024003',
        fullName: 'Muhammad Rizky',
        gender: SantriGender.putra,
        className: 'VII B',
        room: 'Al-Fatih 03',
        birthPlace: 'Pamekasan',
        birthDate: DateTime(2011, 11, 5),
        address: 'Jl. Jokotole No. 18, Barurambat Kota, Pamekasan',
        parentName: 'Bambang Irawan',
        parentPhone: '081345678912',
        enrollmentDate: DateTime(2024, 7, 15),
        isActive: true,
        avatarAsset: 'assets/images/santri_rizky.png',
      ),
      StudentModel(
        id: 'SNT-004',
        nis: '2024004',
        fullName: 'Fatimah Zahra',
        gender: SantriGender.putri,
        className: 'VII A',
        room: 'Khadijah 01',
        birthPlace: 'Bangkalan',
        birthDate: DateTime(2011, 2, 19),
        address: 'Dusun Bancaran, Bangkalan, Madura',
        parentName: 'Ustadz Abdullah Said',
        parentPhone: '081223344556',
        enrollmentDate: DateTime(2024, 7, 15),
        isActive: true,
      ),
      StudentModel(
        id: 'SNT-005',
        nis: '2024005',
        fullName: 'Zaidan Al-Farisi',
        gender: SantriGender.putra,
        className: 'IX A',
        room: 'Umar bin Khattab 02',
        birthPlace: 'Sumenep',
        birthDate: DateTime(2009, 6, 14),
        address: 'Desa Duko, Kec. Arjasa, Kepulauan Kangean',
        parentName: 'K.H. Faruq Mansyur',
        parentPhone: '081556677889',
        enrollmentDate: DateTime(2022, 7, 12),
        isActive: true,
      ),
      StudentModel(
        id: 'SNT-006',
        nis: '2024006',
        fullName: 'Nabila Nur Azizah',
        gender: SantriGender.putri,
        className: 'VIII A',
        room: 'Aisyah 03',
        birthPlace: 'Sidoarjo',
        birthDate: DateTime(2010, 10, 30),
        address: 'Perum Gading Fajar 2 Blok C, Buduran, Sidoarjo',
        parentName: 'Ir. Agus Wahyudi',
        parentPhone: '081334455667',
        enrollmentDate: DateTime(2023, 7, 10),
        isActive: true,
      ),
      StudentModel(
        id: 'SNT-007',
        nis: '2024007',
        fullName: 'Bilal Habibi',
        gender: SantriGender.putra,
        className: 'VIII B',
        room: 'Abu Bakar 01',
        birthPlace: 'Sampang',
        birthDate: DateTime(2010, 3, 8),
        address: 'Jl. KH. Wahid Hasyim No. 10, Sampang',
        parentName: 'H. Hasan Basri',
        parentPhone: '081998877665',
        enrollmentDate: DateTime(2023, 7, 10),
        isActive: true,
      ),
      StudentModel(
        id: 'SNT-008',
        nis: '2024008',
        fullName: 'Maryam Salsabila',
        gender: SantriGender.putri,
        className: 'IX B',
        room: 'Fatimah 02',
        birthPlace: 'Malang',
        birthDate: DateTime(2009, 1, 17),
        address: 'Jl. Ijen No. 22, Klojen, Kota Malang',
        parentName: 'Dr. H. Rusdianto',
        parentPhone: '081776655443',
        enrollmentDate: DateTime(2022, 7, 12),
        isActive: true,
      ),
      StudentModel(
        id: 'SNT-009',
        nis: '2024009',
        fullName: 'Hamzah Asadullah',
        gender: SantriGender.putra,
        className: 'IX A',
        room: 'Umar bin Khattab 01',
        birthPlace: 'Sumenep',
        birthDate: DateTime(2009, 9, 25),
        address: 'Desa Paseraman, Kec. Arjasa, Kangean',
        parentName: 'M. Thohiruddin',
        parentPhone: '081665544332',
        enrollmentDate: DateTime(2022, 7, 12),
        isActive: false, // Nonaktif (contoh variasi status)
      ),
      StudentModel(
        id: 'SNT-010',
        nis: '2024010',
        fullName: 'Khadijah Al-Kubro',
        gender: SantriGender.putri,
        className: 'VII B',
        room: 'Khadijah 03',
        birthPlace: 'Gresik',
        birthDate: DateTime(2011, 7, 7),
        address: 'Jl. Panglima Sudirman No. 88, Kebomas, Gresik',
        parentName: 'H. Zainal Arifin',
        parentPhone: '081887766554',
        enrollmentDate: DateTime(2024, 7, 15),
        isActive: true,
      ),
      StudentModel(
        id: 'SNT-011',
        nis: '2024011',
        fullName: 'Umar Al-Faruq',
        gender: SantriGender.putra,
        className: 'VII A',
        room: 'Al-Fatih 02',
        birthPlace: 'Probolinggo',
        birthDate: DateTime(2011, 12, 1),
        address: 'Jl. Pahlawan No. 04, Kanigaran, Probolinggo',
        parentName: 'H. Syamsul Huda',
        parentPhone: '081445566778',
        enrollmentDate: DateTime(2024, 7, 15),
        isActive: true,
      ),
      StudentModel(
        id: 'SNT-012',
        nis: '2024012',
        fullName: 'Raihana Qanita',
        gender: SantriGender.putri,
        className: 'VIII A',
        room: 'Aisyah 01',
        birthPlace: 'Sumenep',
        birthDate: DateTime(2010, 5, 14),
        address: 'Desa Laok Jang-Jang, Arjasa, Kangean',
        parentName: 'H. Abdul Ghofur',
        parentPhone: '081332211445',
        enrollmentDate: DateTime(2023, 7, 10),
        isActive: false, // Nonaktif (contoh variasi status)
      ),
      StudentModel(
        id: 'SNT-013',
        nis: '2024013',
        fullName: 'Fadhil Mubarak',
        gender: SantriGender.putra,
        className: 'X A',
        room: 'Utsman bin Affan 01',
        birthPlace: 'Sumenep',
        birthDate: DateTime(2008, 8, 10),
        address: 'Desa Kolo-Kolo, Arjasa, Kangean',
        parentName: 'H. Anwar Sadat',
        parentPhone: '081234567813',
        enrollmentDate: DateTime(2024, 7, 15),
        isActive: true,
      ),
      StudentModel(
        id: 'SNT-014',
        nis: '2024014',
        fullName: 'Zahra An-Nisa',
        gender: SantriGender.putri,
        className: 'X B',
        room: 'Hafshah 01',
        birthPlace: 'Surabaya',
        birthDate: DateTime(2008, 3, 22),
        address: 'Jl. Kutisari Indah Barat No. 12, Surabaya',
        parentName: 'H. Mansur Hidayat',
        parentPhone: '081234567814',
        enrollmentDate: DateTime(2024, 7, 15),
        isActive: true,
      ),
      StudentModel(
        id: 'SNT-015',
        nis: '2024015',
        fullName: 'Rayhan Pratama',
        gender: SantriGender.putra,
        className: 'XI A',
        room: 'Utsman bin Affan 02',
        birthPlace: 'Pamekasan',
        birthDate: DateTime(2007, 11, 18),
        address: 'Jl. Trunojoyo No. 44, Pamekasan',
        parentName: 'Drs. H. Mulyadi',
        parentPhone: '081234567815',
        enrollmentDate: DateTime(2023, 7, 10),
        isActive: true,
      ),
      StudentModel(
        id: 'SNT-016',
        nis: '2024016',
        fullName: 'Afiqah Salma',
        gender: SantriGender.putri,
        className: 'XI B',
        room: 'Hafshah 02',
        birthPlace: 'Sumenep',
        birthDate: DateTime(2007, 6, 5),
        address: 'Desa Kalikatak, Arjasa, Kangean',
        parentName: 'H. Suhaimi',
        parentPhone: '081234567816',
        enrollmentDate: DateTime(2023, 7, 10),
        isActive: true,
      ),
      StudentModel(
        id: 'SNT-017',
        nis: '2024017',
        fullName: 'Lukman Al-Hakim',
        gender: SantriGender.putra,
        className: 'XII A',
        room: 'Ali bin Abi Thalib 01',
        birthPlace: 'Sampang',
        birthDate: DateTime(2006, 9, 12),
        address: 'Jl. Diponegoro No. 09, Sampang',
        parentName: 'K.H. Badruddin',
        parentPhone: '081234567817',
        enrollmentDate: DateTime(2022, 7, 12),
        isActive: true,
      ),
      StudentModel(
        id: 'SNT-018',
        nis: '2024018',
        fullName: 'Syifa Maulida',
        gender: SantriGender.putri,
        className: 'XII B',
        room: 'Zainab 01',
        birthPlace: 'Bangkalan',
        birthDate: DateTime(2006, 2, 28),
        address: 'Jl. Pemuda Kaffa No. 56, Bangkalan',
        parentName: 'H. Marzuki',
        parentPhone: '081234567818',
        enrollmentDate: DateTime(2022, 7, 12),
        isActive: true,
      ),
    ]);
  }

  // --- QUERY / READ ---
  List<StudentModel> getStudents() {
    return List.unmodifiable(_students);
  }

  StudentModel? getStudentById(String id) {
    try {
      return _students.firstWhere((s) => s.id == id);
    } catch (_) {
      return null;
    }
  }

  StudentModel? getStudentByNis(String nis) {
    try {
      return _students.firstWhere((s) => s.nis.trim() == nis.trim());
    } catch (_) {
      return null;
    }
  }

  int get totalCount => _students.length;
  int get maleCount => _students.where((s) => s.isMale).length;
  int get femaleCount => _students.where((s) => s.isFemale).length;
  int get activeCount => _students.where((s) => s.isActive).length;
  int get inactiveCount => _students.where((s) => !s.isActive).length;

  /// Pencarian dan penyaringan data santri
  List<StudentModel> filterStudents({
    String? query,
    String? gradeFilter,
    SantriGender? genderFilter,
    SantriStatus? statusFilter,
  }) {
    return _students.where((s) {
      // 1. Pencarian (Nama Lengkap atau NIS)
      if (query != null && query.trim().isNotEmpty) {
        final q = query.trim().toLowerCase();
        final matchName = s.fullName.toLowerCase().contains(q);
        final matchNis = s.nis.toLowerCase().contains(q);
        if (!matchName && !matchNis) return false;
      }

      // 2. Filter Kelas (Semua, VII, VIII, IX, X, XI, XII)
      if (gradeFilter != null && gradeFilter != 'Semua' && gradeFilter.isNotEmpty) {
        final clean = gradeFilter.replaceAll('Kelas ', '').trim();
        final parts = s.className.split(' ');
        final santriGrade = parts.isNotEmpty ? parts[0] : s.className;
        if (santriGrade != clean) {
          return false;
        }
      }

      // 3. Filter Jenis Kelamin (Putra, Putri)
      if (genderFilter != null) {
        if (s.gender != genderFilter) return false;
      }

      // 4. Filter Status Keaktifan (Aktif, Nonaktif)
      if (statusFilter != null) {
        if (s.status != statusFilter) return false;
      }

      return true;
    }).toList();
  }

  // --- MUTATION / CRUD (Khusus Hak Akses Admin) ---

  /// Menambah data santri baru
  /// Return true jika sukses, false jika NIS duplikat
  bool addStudent(StudentModel newStudent) {
    // Validasi NIS duplikat
    if (_students.any((s) => s.nis.trim() == newStudent.nis.trim())) {
      return false;
    }

    _students.insert(0, newStudent);
    notifyListeners();
    return true;
  }

  /// Memperbarui data santri yang sudah ada
  bool updateStudent(StudentModel updatedStudent) {
    final index = _students.indexWhere((s) => s.id == updatedStudent.id);
    if (index == -1) return false;

    // Pastikan NIS tidak bentrok dengan santri lain
    final duplicateNis = _students.any(
      (s) => s.id != updatedStudent.id && s.nis.trim() == updatedStudent.nis.trim(),
    );
    if (duplicateNis) return false;

    _students[index] = updatedStudent;
    notifyListeners();
    return true;
  }

  /// Memperbarui foto profil santri (Khusus Admin)
  bool updateStudentAvatar(String studentId, String avatarAsset) {
    final index = _students.indexWhere((s) => s.id == studentId);
    if (index == -1) return false;

    _students[index] = _students[index].copyWith(avatarAsset: avatarAsset);
    notifyListeners();
    return true;
  }

  /// Menghapus data santri
  bool deleteStudent(String id) {
    final countBefore = _students.length;
    _students.removeWhere((s) => s.id == id);
    final removed = _students.length < countBefore;
    if (removed) {
      notifyListeners();
    }
    return removed;
  }
}
