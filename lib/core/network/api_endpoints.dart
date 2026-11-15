/// Definisi Endpoint REST API Terpusat
/// Menyesuaikan dengan route controller NestJS mendatang
class ApiEndpoints {
  ApiEndpoints._();

  // Base URL (dapat dialihkan ke environment variable / staging / production)
  static const String defaultBaseUrl = 'https://api.darulhikmah.ponpes.id/api/v1';

  // Auth Controller Endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String profile = '/auth/profile';
  static const String refreshToken = '/auth/refresh-token';
  static const String checkUsername = '/auth/check-username';

  // Student Controller Endpoints
  static const String students = '/students';
  static String studentById(String id) => '/students/$id';
  static const String studentClasses = '/students/classes';

  // Schedule Controller Endpoints
  static const String schedules = '/schedules';
  static String scheduleById(String id) => '/schedules/$id';
  static const String scheduleDays = '/schedules/days';
  static const String scheduleSubjects = '/schedules/subjects';

  // Attendance Controller Endpoints
  static const String lessonAttendance = '/attendance/lessons';
  static String lessonAttendanceById(String id) => '/attendance/lessons/$id';
  static const String attendanceSummary = '/attendance/summary';
  static const String recentActivities = '/attendance/recent-activities';
}
