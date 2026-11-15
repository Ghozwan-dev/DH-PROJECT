import '../../data/models/student_model.dart';

/// Kontrak Repository untuk Pengelolaan Data Santri
/// Memisahkan akses data dari UI dan Service untuk kesiapan integrasi REST API NestJS
abstract class IStudentRepository {
  List<StudentModel> getStudents();
  StudentModel? getStudentById(String id);
  StudentModel? getStudentByNis(String nis);
  List<StudentModel> getStudentsByClass(String className);

  List<StudentModel> filterStudents({
    String? query,
    String? gradeFilter,
    SantriGender? genderFilter,
    SantriStatus? statusFilter,
  });

  bool addStudent(StudentModel newStudent);
  bool updateStudent(StudentModel updatedStudent);
  bool updateStudentAvatar(String studentId, String avatarAsset);
  bool deleteStudent(String id);

  int get totalCount;
  int get maleCount;
  int get femaleCount;
  int get activeCount;
  int get inactiveCount;
}
