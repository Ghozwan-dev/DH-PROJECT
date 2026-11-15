import '../../data/models/user_model.dart';
import '../../data/services/auth_service.dart';

/// Kontrak Repository untuk Autentikasi Pengguna
/// Memisahkan logika autentikasi untuk kesiapan REST API NestJS & JWT
abstract class IAuthRepository {
  UserModel? get currentUser;
  bool get rememberMeEnabled;
  String? get savedUsername;

  Future<AuthResult> login({
    required String identifier,
    required String password,
    bool rememberMe = false,
  });

  Future<AuthResult> register({
    required String fullName,
    String? username,
    required String email,
    required String phoneNumber,
    required String password,
  });

  Future<bool> isUsernameAvailable(String username);
  Future<bool> requestPasswordReset(String identifier);
  Future<void> logout();
}
