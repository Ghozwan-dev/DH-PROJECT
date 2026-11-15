import '../../domain/repositories/student_repository_interface.dart';
import '../datasources/mock_student_data.dart';
import '../models/student_model.dart';

/// Implementasi Mock Repository untuk Pengelolaan Data Santri
/// Beroperasi secara in-memory untuk tahap preview & pengembangan frontend.
/// Dapat diganti dengan ApiStudentRepository saat REST API NestJS siap.
class MockStudentRepository implements IStudentRepository {
  final List<StudentModel> _students;

  MockStudentRepository({List<StudentModel>? initialData})
      : _students = initialData ?? getInitialMockStudents();

  @override
  List<StudentModel> getStudents() {
    return List.unmodifiable(_students);
  }

  @override
  StudentModel? getStudentById(String id) {
    try {
      return _students.firstWhere((s) => s.id == id);
    } catch (_) {
      return null;
    }
  }

  @override
  StudentModel? getStudentByNis(String nis) {
    try {
      return _students.firstWhere((s) => s.nis.trim() == nis.trim());
    } catch (_) {
      return null;
    }
  }

  @override
  List<StudentModel> getStudentsByClass(String className) {
    final clean = className.trim().toLowerCase();
    return _students
        .where((s) => s.className.trim().toLowerCase() == clean && s.isActive)
        .toList();
  }

  @override
  int get totalCount => _students.length;

  @override
  int get maleCount => _students.where((s) => s.isMale).length;

  @override
  int get femaleCount => _students.where((s) => s.isFemale).length;

  @override
  int get activeCount => _students.where((s) => s.isActive).length;

  @override
  int get inactiveCount => _students.where((s) => !s.isActive).length;

  @override
  List<StudentModel> filterStudents({
    String? query,
    String? gradeFilter,
    SantriGender? genderFilter,
    SantriStatus? statusFilter,
  }) {
    return _students.where((s) {
      if (query != null && query.trim().isNotEmpty) {
        final q = query.trim().toLowerCase();
        final matchName = s.fullName.toLowerCase().contains(q);
        final matchNis = s.nis.toLowerCase().contains(q);
        if (!matchName && !matchNis) return false;
      }

      if (gradeFilter != null && gradeFilter != 'Semua' && gradeFilter.isNotEmpty) {
        final clean = gradeFilter.replaceAll('Kelas ', '').trim();
        final parts = s.className.split(' ');
        final santriGrade = parts.isNotEmpty ? parts[0] : s.className;
        if (santriGrade != clean) {
          return false;
        }
      }

      if (genderFilter != null) {
        if (s.gender != genderFilter) return false;
      }

      if (statusFilter != null) {
        if (s.status != statusFilter) return false;
      }

      return true;
    }).toList();
  }

  @override
  bool addStudent(StudentModel newStudent) {
    if (_students.any((s) => s.nis.trim() == newStudent.nis.trim())) {
      return false;
    }
    _students.insert(0, newStudent);
    return true;
  }

  @override
  bool updateStudent(StudentModel updatedStudent) {
    final index = _students.indexWhere((s) => s.id == updatedStudent.id);
    if (index == -1) return false;

    final duplicateNis = _students.any(
      (s) => s.id != updatedStudent.id && s.nis.trim() == updatedStudent.nis.trim(),
    );
    if (duplicateNis) return false;

    _students[index] = updatedStudent;
    return true;
  }

  @override
  bool updateStudentAvatar(String studentId, String avatarAsset) {
    final index = _students.indexWhere((s) => s.id == studentId);
    if (index == -1) return false;

    _students[index] = _students[index].copyWith(avatarAsset: avatarAsset);
    return true;
  }

  @override
  bool deleteStudent(String id) {
    final countBefore = _students.length;
    _students.removeWhere((s) => s.id == id);
    return _students.length < countBefore;
  }
}
