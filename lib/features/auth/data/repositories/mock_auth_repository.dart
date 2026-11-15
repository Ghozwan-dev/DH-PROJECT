import 'dart:async';
import 'package:flutter/foundation.dart';
import '../../../../core/utils/password_hasher.dart';
import '../../domain/repositories/auth_repository_interface.dart';
import '../datasources/mock_auth_data.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

/// Implementasi Mock Repository untuk Autentikasi Pengguna
/// Beroperasi secara in-memory untuk tahap preview & pengembangan frontend.
/// Dapat diganti dengan ApiAuthRepository saat REST API NestJS siap.
class MockAuthRepository implements IAuthRepository {
  final List<UserModel> _userDatabase;
  UserModel? _currentUser;
  bool _rememberMeEnabled = false;
  String? _savedUsername;

  MockAuthRepository({List<UserModel>? initialUsers})
      : _userDatabase = initialUsers ?? getInitialMockUsers();

  @override
  UserModel? get currentUser => _currentUser;

  @override
  bool get rememberMeEnabled => _rememberMeEnabled;

  @override
  String? get savedUsername => _savedUsername;

  @override
  Future<bool> isUsernameAvailable(String username) async {
    final cleanUsername = username.trim().toLowerCase();
    await Future.delayed(const Duration(milliseconds: 200));
    final exists = _userDatabase.any(
      (u) => u.username.toLowerCase() == cleanUsername,
    );
    return !exists;
  }

  @override
  Future<AuthResult> login({
    required String identifier,
    required String password,
    bool rememberMe = false,
  }) async {
    try {
      final cleanId = identifier.trim().toLowerCase();
      await Future.delayed(const Duration(milliseconds: 800));

      final userIndex = _userDatabase.indexWhere(
        (u) =>
            u.username.toLowerCase() == cleanId ||
            (u.email != null && u.email!.toLowerCase() == cleanId) ||
            u.phoneNumber.replaceAll(RegExp(r'[\s\-]'), '') == cleanId,
      );

      if (userIndex == -1) {
        return AuthResult.failure('Akun tidak ditemukan. Periksa kembali username atau email Anda.');
      }

      final matchedUser = _userDatabase[userIndex];

      final isPasswordValid = PasswordHasher.verifyPassword(
        password,
        matchedUser.passwordHash,
      );

      if (!isPasswordValid) {
        return AuthResult.failure('Password yang Anda masukkan salah.');
      }

      _currentUser = matchedUser;
      _rememberMeEnabled = rememberMe;
      _savedUsername = rememberMe ? matchedUser.username : null;

      final token = 'jwt_${matchedUser.id}_${DateTime.now().millisecondsSinceEpoch}';
      debugPrint('Login sukses: ${matchedUser.fullName} (${matchedUser.role.label})');
      return AuthResult.success(matchedUser, token);
    } catch (e) {
      debugPrint('Error login: $e');
      return AuthResult.failure('Terjadi kesalahan koneksi server. Silakan coba lagi.');
    }
  }

  @override
  Future<AuthResult> register({
    required String fullName,
    String? username,
    required String email,
    required String phoneNumber,
    required String password,
  }) async {
    try {
      final cleanEmail = email.trim();
      final cleanUsername = (username != null && username.trim().isNotEmpty)
          ? username.trim().toLowerCase()
          : cleanEmail.split('@')[0].toLowerCase();
      final cleanFullName = fullName.trim();
      final cleanPhone = phoneNumber.trim();

      await Future.delayed(const Duration(milliseconds: 900));

      final emailExists = _userDatabase.any(
        (u) => u.email != null && u.email!.toLowerCase() == cleanEmail.toLowerCase(),
      );
      if (emailExists) {
        return AuthResult.failure('Email "$cleanEmail" sudah digunakan oleh akun lain.');
      }

      final phoneExists = _userDatabase.any(
        (u) => u.phoneNumber.replaceAll(RegExp(r'[\s\-]'), '') == cleanPhone.replaceAll(RegExp(r'[\s\-]'), ''),
      );
      if (phoneExists) {
        return AuthResult.failure('Nomor HP "$cleanPhone" sudah terdaftar.');
      }

      final passwordHash = PasswordHasher.hashPassword(password);
      const userRole = UserRole.guru;

      final newUser = UserModel(
        id: 'usr_${DateTime.now().millisecondsSinceEpoch}',
        fullName: cleanFullName,
        username: cleanUsername,
        email: cleanEmail,
        phoneNumber: cleanPhone,
        passwordHash: passwordHash,
        role: userRole,
        createdAt: DateTime.now(),
      );

      _userDatabase.add(newUser);
      debugPrint('Registrasi sukses: ${newUser.fullName} berhasil didaftarkan sebagai ${newUser.role.label}');
      return AuthResult.success(
        newUser,
        'jwt_${newUser.id}_${DateTime.now().millisecondsSinceEpoch}',
      );
    } catch (e) {
      debugPrint('Error registrasi: $e');
      return AuthResult.failure('Pendaftaran gagal. Terjadi kesalahan pada server.');
    }
  }

  @override
  Future<bool> requestPasswordReset(String identifier) async {
    await Future.delayed(const Duration(milliseconds: 600));
    final cleanId = identifier.trim().toLowerCase();
    return _userDatabase.any(
      (u) =>
          u.username.toLowerCase() == cleanId ||
          (u.email != null && u.email!.toLowerCase() == cleanId),
    );
  }

  @override
  Future<void> logout() async {
    _currentUser = null;
    if (!_rememberMeEnabled) {
      _savedUsername = null;
    }
  }
}
