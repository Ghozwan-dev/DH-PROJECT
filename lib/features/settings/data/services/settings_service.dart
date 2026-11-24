import '../../../auth/data/models/user_model.dart';
import '../models/settings_models.dart';

/// Hasil Operasi Pengaturan
class SettingsOperationResult {
  final bool success;
  final String message;

  const SettingsOperationResult({required this.success, required this.message});

  factory SettingsOperationResult.success([String message = 'Berhasil disimpan']) {
    return SettingsOperationResult(success: true, message: message);
  }

  factory SettingsOperationResult.failure(String message) {
    return SettingsOperationResult(success: false, message: message);
  }
}

/// Service Pengaturan Aplikasi Darul Hikmah
class SettingsService {
  static final SettingsService _instance = SettingsService._internal();
  factory SettingsService() => _instance;
  SettingsService._internal();

  PesantrenSettingsModel _pesantrenSettings = PesantrenSettingsModel.defaultSettings();
  AttendanceSettingsModel _attendanceSettings = AttendanceSettingsModel.defaultSettings();
  final Map<String, NotificationPreferencesModel> _userNotificationPreferences = {};

  PesantrenSettingsModel getPesantrenSettings(UserModel user) {
    if (!user.isAdmin) {
      throw StateError('Akses Ditolak: Hanya Admin yang dapat melihat pengaturan pesantren.');
    }
    return _pesantrenSettings;
  }

  SettingsOperationResult updatePesantrenSettings({
    required UserModel user,
    required PesantrenSettingsModel newSettings,
  }) {
    if (!user.isAdmin) {
      return SettingsOperationResult.failure('Akses Ditolak: Hanya Admin yang dapat mengubah pengaturan pesantren.');
    }
    if (newSettings.namaPesantren.trim().isEmpty) {
      return SettingsOperationResult.failure('Nama pesantren tidak boleh kosong.');
    }
    _pesantrenSettings = newSettings;
    return SettingsOperationResult.success('Pengaturan pesantren berhasil diperbarui.');
  }

  AttendanceSettingsModel getAttendanceSettings(UserModel user) {
    if (!user.isAdmin) {
      throw StateError('Akses Ditolak: Hanya Admin yang dapat melihat pengaturan absensi.');
    }
    return _attendanceSettings;
  }

  SettingsOperationResult updateAttendanceSettings({
    required UserModel user,
    required AttendanceSettingsModel newSettings,
  }) {
    if (!user.isAdmin) {
      return SettingsOperationResult.failure('Akses Ditolak: Hanya Admin yang dapat mengubah pengaturan absensi.');
    }
    if (newSettings.jamMulaiKbm.trim().isEmpty) {
      return SettingsOperationResult.failure('Jam mulai KBM wajib diisi.');
    }
    _attendanceSettings = newSettings;
    return SettingsOperationResult.success('Pengaturan absensi berhasil diperbarui.');
  }

  NotificationPreferencesModel getNotificationPreferences(String userId) {
    return _userNotificationPreferences[userId] ?? NotificationPreferencesModel.defaultPreferences();
  }

  SettingsOperationResult updateNotificationPreferences({
    required String userId,
    required NotificationPreferencesModel preferences,
  }) {
    _userNotificationPreferences[userId] = preferences;
    return SettingsOperationResult.success('Preferensi notifikasi berhasil disimpan.');
  }

  SettingsOperationResult changePassword({
    required String currentPassword,
    required String newPassword,
    required String confirmPassword,
  }) {
    if (currentPassword.trim().isEmpty) {
      return SettingsOperationResult.failure('Password saat ini wajib diisi.');
    }
    if (newPassword.length < 6) {
      return SettingsOperationResult.failure('Password baru minimal 6 karakter.');
    }
    if (newPassword != confirmPassword) {
      return SettingsOperationResult.failure('Konfirmasi password baru tidak cocok.');
    }
    if (currentPassword == newPassword) {
      return SettingsOperationResult.failure('Password baru tidak boleh sama dengan password saat ini.');
    }
    return SettingsOperationResult.success('Password berhasil diperbarui.');
  }
}
