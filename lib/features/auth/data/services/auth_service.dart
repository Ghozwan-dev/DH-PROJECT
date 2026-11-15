import 'dart:async';
import 'package:flutter/foundation.dart';
import '../../../../core/utils/password_hasher.dart';
import '../models/user_model.dart';

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
/// Memenuhi ketentuan teknis Butir 5 dan 6:
/// - Hak akses dikontrol ketat oleh backend (hanya role Guru yang diizinkan lewat registrasi publik)
/// - Akun Admin dibuat melalui mekanisme internal pengelola
/// - Password disimpan dalam bentuk hash SHA-256 tersalt, bukan teks biasa
/// - Siap diintegrasikan dengan REST API backend
class AuthService {
  // Singleton pattern
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal() {
    _initializeSeedAccounts();
  }

  /// URL Base API Backend (Dapat diganti sesuai konfigurasi server produksi)
  static String apiBaseUrl = 'https://api.darulhikmah.ponpes.id/v1';

  // Database pengguna lokal tersimulasi (in-memory & ready for backend swap)
  final List<UserModel> _userDatabase = [];
  UserModel? _currentUser;
  bool _rememberMeEnabled = false;
  String? _savedUsername;

  UserModel? get currentUser => _currentUser;
  bool get rememberMeEnabled => _rememberMeEnabled;
  String? get savedUsername => _savedUsername;

  /// Inisialisasi akun demo terenkripsi untuk pengujian lokal:
  /// - Admin: username 'admin', password 'admin123'
  /// - Guru: username 'ustadz_ahmad', password 'guru123'
  void _initializeSeedAccounts() {
    if (_userDatabase.isEmpty) {
      // 1. Akun Admin (Dibuat melalui pengelola sistem, BUKAN registrasi publik)
      _userDatabase.add(
        UserModel(
          id: 'adm_001',
          fullName: 'Administrator Pondok',
          username: 'admin',
          email: 'admin@darulhikmah.ponpes.id',
          phoneNumber: '081234567890',
          passwordHash: PasswordHasher.hashPassword('admin123'),
          role: UserRole.admin,
          createdAt: DateTime(2026, 1, 1),
        ),
      );

      // 2. Akun Guru terdaftar
      _userDatabase.add(
        UserModel(
          id: 'guru_001',
          fullName: 'Ustadz Ahmad Fauzi',
          username: 'ustadz_ahmad',
          email: 'ahmad.fauzi@darulhikmah.ponpes.id',
          phoneNumber: '081987654321',
          passwordHash: PasswordHasher.hashPassword('guru123'),
          role: UserRole.guru,
          createdAt: DateTime(2026, 2, 1),
        ),
      );
    }
  }

  /// Memeriksa ketersediaan username (Cegah Username Duplikat - Butir 4)
  Future<bool> isUsernameAvailable(String username) async {
    final cleanUsername = username.trim().toLowerCase();
    // Simulasikan latensi jaringan
    await Future.delayed(const Duration(milliseconds: 200));
    final exists = _userDatabase.any(
      (u) => u.username.toLowerCase() == cleanUsername,
    );
    return !exists;
  }

  /// Fungsi Login Pengguna (Butir 3)
  /// Menerima username atau email serta password
  Future<AuthResult> login({
    required String identifier,
    required String password,
    bool rememberMe = false,
  }) async {
    try {
      final cleanId = identifier.trim().toLowerCase();

      // Simulasikan panggilan API jaringan
      await Future.delayed(const Duration(milliseconds: 800));

      // Cari berdasarkan username, email, atau nomor HP
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

      // Verifikasi Hash Password
      final isPasswordValid = PasswordHasher.verifyPassword(
        password,
        matchedUser.passwordHash,
      );

      if (!isPasswordValid) {
        return AuthResult.failure('Password yang Anda masukkan salah.');
      }

      // Berhasil login
      _currentUser = matchedUser;
      _rememberMeEnabled = rememberMe;
      _savedUsername = rememberMe ? matchedUser.username : null;

      // Generate token session simulasi
      final token = 'jwt_${matchedUser.id}_${DateTime.now().millisecondsSinceEpoch}';

      debugPrint('Login sukses: ${matchedUser.fullName} (${matchedUser.role.label})');
      return AuthResult.success(matchedUser, token);
    } catch (e) {
      debugPrint('Error login: $e');
      return AuthResult.failure('Terjadi kesalahan koneksi server. Silakan coba lagi.');
    }
  }

  /// Fungsi Registrasi Pengguna Baru (Butir 4 & 5)
  /// PERHATIAN KEAMANAN: Registrasi publik HANYA untuk akun Guru.
  /// Backend mengunci hak akses ke Guru secara absolut.
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

      // Simulasikan panggilan API jaringan
      await Future.delayed(const Duration(milliseconds: 900));

      // 1. Validasi cegah duplikasi email
      final emailExists = _userDatabase.any(
        (u) => u.email != null && u.email!.toLowerCase() == cleanEmail.toLowerCase(),
      );
      if (emailExists) {
        return AuthResult.failure('Email "$cleanEmail" sudah digunakan oleh akun lain.');
      }

      // 2. Validasi duplikasi nomor HP
      final phoneExists = _userDatabase.any(
        (u) => u.phoneNumber.replaceAll(RegExp(r'[\s\-]'), '') == cleanPhone.replaceAll(RegExp(r'[\s\-]'), ''),
      );
      if (phoneExists) {
        return AuthResult.failure('Nomor HP "$cleanPhone" sudah terdaftar.');
      }

      // 3. Enkripsi password menggunakan hash SHA-256 bersalt
      final passwordHash = PasswordHasher.hashPassword(password);

      // 4. KUNCI HAK AKSES KE GURU (Sesuai Butir 5: Akun Admin DILARANG dibuat lewat publik)
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

  /// Request Lupa Password
  Future<bool> requestPasswordReset(String identifier) async {
    await Future.delayed(const Duration(milliseconds: 600));
    final cleanId = identifier.trim().toLowerCase();
    return _userDatabase.any(
      (u) =>
          u.username.toLowerCase() == cleanId ||
          (u.email != null && u.email!.toLowerCase() == cleanId),
    );
  }

  /// Logout
  Future<void> logout() async {
    _currentUser = null;
    if (!_rememberMeEnabled) {
      _savedUsername = null;
    }
  }
}
