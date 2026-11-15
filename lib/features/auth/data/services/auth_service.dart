import 'dart:async';
import '../../domain/repositories/auth_repository_interface.dart';
import '../models/user_model.dart';
import '../repositories/mock_auth_repository.dart';

/// Hasil operasi autentikasi
class AuthResult {
  final bool success;
  final UserModel? user;
  final String? errorMessage;
  final String? token;

  const AuthResult._({
    required this.success,
    this.user,
    this.errorMessage,
    this.token,
  });

  factory AuthResult.success(UserModel user, String token) {
    return AuthResult._(
      success: true,
      user: user,
      token: token,
    );
  }

  factory AuthResult.failure(String errorMessage) {
    return AuthResult._(
      success: false,
      errorMessage: errorMessage,
    );
  }
}

/// Service Autentikasi Aplikasi Darul Hikmah
/// - Menggunakan Repository Pattern (IAuthRepository)
/// - Menjembatani autentikasi lokal & REST API NestJS di masa mendatang
class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;

  IAuthRepository _repository;

  AuthService._internal([IAuthRepository? repository])
      : _repository = repository ?? MockAuthRepository();

  /// Mengganti implementasi repository (misal: beralih dari Mock ke REST API)
  void setRepository(IAuthRepository repository) {
    _repository = repository;
  }

  /// URL Base API Backend
  static String apiBaseUrl = 'https://api.darulhikmah.ponpes.id/v1';

  UserModel? get currentUser => _repository.currentUser;
  bool get rememberMeEnabled => _repository.rememberMeEnabled;
  String? get savedUsername => _repository.savedUsername;

  /// Memeriksa ketersediaan username
  Future<bool> isUsernameAvailable(String username) =>
      _repository.isUsernameAvailable(username);

  /// Fungsi Login Pengguna
  Future<AuthResult> login({
    required String identifier,
    required String password,
    bool rememberMe = false,
  }) =>
      _repository.login(
        identifier: identifier,
        password: password,
        rememberMe: rememberMe,
      );

  /// Fungsi Registrasi Pengguna Baru (Khusus Guru)
  Future<AuthResult> register({
    required String fullName,
    String? username,
    required String email,
    required String phoneNumber,
    required String password,
  }) =>
      _repository.register(
        fullName: fullName,
        username: username,
        email: email,
        phoneNumber: phoneNumber,
        password: password,
      );

  /// Request Lupa Password
  Future<bool> requestPasswordReset(String identifier) =>
      _repository.requestPasswordReset(identifier);

  /// Logout
  Future<void> logout() => _repository.logout();
}
