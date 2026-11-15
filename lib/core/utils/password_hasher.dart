import 'dart:convert';
import 'package:crypto/crypto.dart';

/// Utilitas enkripsi & hashing password (Sesuai Ketentuan Teknis Butir 6:
/// "Jangan menyimpan password dalam bentuk teks biasa")
class PasswordHasher {
  PasswordHasher._();

  // Garam (salt) statis aplikasi untuk menambah keamanan hash lokal
  static const String _defaultSalt = 'DarulHikmah_AbsensiSantri_2026_SecureSalt#@!';

  /// Menghasilkan hash SHA-256 dari plaintext password dengan salt
  static String hashPassword(String password, {String? salt}) {
    final activeSalt = salt ?? _defaultSalt;
    final saltedBytes = utf8.encode('$activeSalt$password$activeSalt');
    final digest = sha256.convert(saltedBytes);
    return digest.toString();
  }

  /// Memverifikasi kecocokan password plaintext terhadap hash yang tersimpan
  static bool verifyPassword(String plaintext, String storedHash, {String? salt}) {
    final computedHash = hashPassword(plaintext, salt: salt);
    return computedHash == storedHash;
  }
}
