import 'package:flutter/foundation.dart';
import '../../domain/repositories/student_repository_interface.dart';
import '../models/student_model.dart';
import '../repositories/mock_student_repository.dart';

/// Service untuk Pengelolaan Data Santri Pondok Pesantren Islam Darul Hikmah
/// - Menggunakan Repository Pattern (IStudentRepository)
/// - Menjaga reaktivitas UI dengan ChangeNotifier
/// - Siap diintegrasikan dengan database / REST API NestJS pada tahap berikutnya
class StudentService extends ChangeNotifier {
  static final StudentService _instance = StudentService._internal();
  factory StudentService() => _instance;

  IStudentRepository _repository;

  StudentService._internal([IStudentRepository? repository])
      : _repository = repository ?? MockStudentRepository();

  /// Mengganti implementasi repository (misal: beralih dari Mock ke REST API)
  void setRepository(IStudentRepository repository) {
    _repository = repository;
    notifyListeners();
  }

  // --- QUERY / READ ---
  List<StudentModel> getStudents() => _repository.getStudents();

  StudentModel? getStudentById(String id) => _repository.getStudentById(id);

  StudentModel? getStudentByNis(String nis) => _repository.getStudentByNis(nis);

  int get totalCount => _repository.totalCount;
  int get maleCount => _repository.maleCount;
  int get femaleCount => _repository.femaleCount;
  int get activeCount => _repository.activeCount;
  int get inactiveCount => _repository.inactiveCount;

  /// Pencarian dan penyaringan data santri
  List<StudentModel> filterStudents({
    String? query,
    String? gradeFilter,
    SantriGender? genderFilter,
    SantriStatus? statusFilter,
  }) {
    return _repository.filterStudents(
      query: query,
      gradeFilter: gradeFilter,
      genderFilter: genderFilter,
      statusFilter: statusFilter,
    );
  }

  /// Mengambil santri aktif berdasarkan nama kelas (misal: 'VII A')
  List<StudentModel> getStudentsByClass(String className) {
    return _repository.getStudentsByClass(className);
  }

  // --- MUTATION / CRUD (Khusus Hak Akses Admin) ---

  /// Menambah data santri baru
  /// Return true jika sukses, false jika NIS duplikat
  bool addStudent(StudentModel newStudent) {
    final success = _repository.addStudent(newStudent);
    if (success) {
      notifyListeners();
    }
    return success;
  }

  /// Memperbarui data santri yang sudah ada
  bool updateStudent(StudentModel updatedStudent) {
    final success = _repository.updateStudent(updatedStudent);
    if (success) {
      notifyListeners();
    }
    return success;
  }

  /// Memperbarui foto profil santri (Khusus Admin)
  bool updateStudentAvatar(String studentId, String avatarAsset) {
    final success = _repository.updateStudentAvatar(studentId, avatarAsset);
    if (success) {
      notifyListeners();
    }
    return success;
  }

  /// Menghapus data santri
  bool deleteStudent(String id) {
    final success = _repository.deleteStudent(id);
    if (success) {
      notifyListeners();
    }
    return success;
  }
}
