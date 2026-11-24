import 'package:flutter_test/flutter_test.dart';
import 'package:darul_hikmah/features/auth/data/models/user_model.dart';
import 'package:darul_hikmah/features/settings/data/models/settings_models.dart';
import 'package:darul_hikmah/features/settings/data/services/settings_service.dart';

void main() {
  group('SettingsService & RBAC Tests', () {
    late SettingsService settingsService;
    late UserModel adminUser;
    late UserModel guruUser;

    setUp(() {
      settingsService = SettingsService();

      adminUser = UserModel(
        id: 'user_admin',
        fullName: 'Administrator Pondok',
        username: 'admin',
        email: 'admin@darulhikmah.id',
        phoneNumber: '08123456789',
        passwordHash: 'hash_admin',
        role: UserRole.admin,
        createdAt: DateTime.now(),
      );

      guruUser = UserModel(
        id: 'user_guru',
        fullName: 'Ustadz Ahmad Fauzi',
        username: 'ustadz_ahmad',
        email: 'ahmad@darulhikmah.id',
        phoneNumber: '08129876543',
        passwordHash: 'hash_guru',
        role: UserRole.guru,
        createdAt: DateTime.now(),
      );
    });

    test('1. Admin can get & update PesantrenSettings', () {
      final cur = settingsService.getPesantrenSettings(adminUser);
      expect(cur.namaPesantren, contains('Darul Hikmah'));

      final updated = cur.copyWith(namaPesantren: 'Pondok Pesantren Islam Darul Hikmah Cellong');
      final res = settingsService.updatePesantrenSettings(user: adminUser, newSettings: updated);
      expect(res.success, isTrue);
      expect(settingsService.getPesantrenSettings(adminUser).namaPesantren, equals('Pondok Pesantren Islam Darul Hikmah Cellong'));
    });

    test('2. Guru CANNOT access or update PesantrenSettings', () {
      expect(() => settingsService.getPesantrenSettings(guruUser), throwsStateError);

      final dummy = PesantrenSettingsModel.defaultSettings();
      final res = settingsService.updatePesantrenSettings(user: guruUser, newSettings: dummy);
      expect(res.success, isFalse);
      expect(res.message, contains('Akses Ditolak'));
    });

    test('3. Admin can get & update AttendanceSettings', () {
      final cur = settingsService.getAttendanceSettings(adminUser);
      expect(cur.jamMulaiKbm, equals('07:30'));

      final updated = cur.copyWith(jamMulaiKbm: '07:45', toleransiTerlambatMenit: 20);
      final res = settingsService.updateAttendanceSettings(user: adminUser, newSettings: updated);
      expect(res.success, isTrue);
      expect(settingsService.getAttendanceSettings(adminUser).toleransiTerlambatMenit, equals(20));
    });

    test('4. Guru CANNOT access or update AttendanceSettings', () {
      expect(() => settingsService.getAttendanceSettings(guruUser), throwsStateError);

      final dummy = AttendanceSettingsModel.defaultSettings();
      final res = settingsService.updateAttendanceSettings(user: guruUser, newSettings: dummy);
      expect(res.success, isFalse);
      expect(res.message, contains('Akses Ditolak'));
    });

    test('5. Both Admin and Guru can manage NotificationPreferences', () {
      final adminPref = settingsService.getNotificationPreferences(adminUser.id);
      expect(adminPref.sesiAbsensiBaru, isTrue);

      final guruPref = settingsService.getNotificationPreferences(guruUser.id);
      expect(guruPref.rekapMingguan, isTrue);

      final res = settingsService.updateNotificationPreferences(
        userId: guruUser.id,
        preferences: guruPref.copyWith(rekapMingguan: false),
      );
      expect(res.success, isTrue);
      expect(settingsService.getNotificationPreferences(guruUser.id).rekapMingguan, isFalse);
    });

    test('6. Password change validation logic', () {
      // Empty current password
      var res = settingsService.changePassword(
        currentPassword: '',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      );
      expect(res.success, isFalse);
      expect(res.message, contains('saat ini wajib diisi'));

      // New password too short (< 6)
      res = settingsService.changePassword(
        currentPassword: 'currentpassword',
        newPassword: '12345',
        confirmPassword: '12345',
      );
      expect(res.success, isFalse);
      expect(res.message, contains('minimal 6 karakter'));

      // Confirmation mismatch
      res = settingsService.changePassword(
        currentPassword: 'currentpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'differentpassword',
      );
      expect(res.success, isFalse);
      expect(res.message, contains('tidak cocok'));

      // New password identical to current
      res = settingsService.changePassword(
        currentPassword: 'samepassword',
        newPassword: 'samepassword',
        confirmPassword: 'samepassword',
      );
      expect(res.success, isFalse);
      expect(res.message, contains('tidak boleh sama'));

      // Valid change
      res = settingsService.changePassword(
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      );
      expect(res.success, isTrue);
      expect(res.message, contains('berhasil diperbarui'));
    });
  });
}
