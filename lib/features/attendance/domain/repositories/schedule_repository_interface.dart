import '../../../auth/data/models/user_model.dart';
import '../../data/models/schedule_model.dart';
import '../../data/services/schedule_service.dart';

/// Kontrak Repository untuk Manajemen Jadwal Pelajaran
/// Memisahkan akses data jadwal dari UI dan Business Logic untuk kesiapan REST API NestJS
abstract class IScheduleRepository {
  List<ScheduleModel> getAllSchedules();
  List<ScheduleModel> getSchedulesForUser(UserModel user);
  ScheduleModel? getScheduleById(String id);

  List<ScheduleModel> filterSchedules({
    required List<ScheduleModel> sourceList,
    String? day,
    String? className,
    String? query,
  });

  ScheduleValidationResult validateSchedule(ScheduleModel schedule, {String? excludeId});

  ScheduleModel? addSchedule(ScheduleModel schedule);
  bool updateSchedule(ScheduleModel schedule);
  bool deleteSchedule(String id);

  int get totalSchedules;
  int get totalClasses;
  int get totalTeachers;
}
