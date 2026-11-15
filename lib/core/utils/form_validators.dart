/// Kumpulan validator form untuk Login & Register Darul Hikmah
class FormValidators {
  FormValidators._();

  /// Validasi field Nama Lengkap
  static String? validateFullName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Nama lengkap wajib diisi';
    }
    final trimmed = value.trim();
    if (trimmed.length < 3) {
      return 'Nama lengkap minimal 3 karakter';
    }
    // Hanya huruf, spasi, titik, koma, kutip (nama gelar santri/ustadz)
    final nameRegex = RegExp(r"^[a-zA-Z\s\.,'\-]+$");
    if (!nameRegex.hasMatch(trimmed)) {
      return 'Nama lengkap hanya boleh mengandung huruf';
    }
    return null;
  }

  /// Validasi field Username
  static String? validateUsername(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Username wajib diisi';
    }
    final trimmed = value.trim();
    if (trimmed.length < 4) {
      return 'Username minimal 4 karakter';
    }
    if (trimmed.contains(' ')) {
      return 'Username tidak boleh mengandung spasi';
    }
    final usernameRegex = RegExp(r'^[a-zA-Z0-9_\.]+$');
    if (!usernameRegex.hasMatch(trimmed)) {
      return 'Username hanya boleh berupa huruf, angka, dan titik/underscore';
    }
    return null;
  }

  /// Validasi Username atau Email (digunakan pada Halaman Login)
  static String? validateLoginIdentifier(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Username atau Email wajib diisi';
    }
    final trimmed = value.trim();
    if (trimmed.length < 3) {
      return 'Input terlalu pendek';
    }
    // Jika mengandung @, verifikasi sebagai email
    if (trimmed.contains('@')) {
      return validateEmail(trimmed, isOptional: false);
    }
    return null;
  }

  /// Validasi Email
  static String? validateEmail(String? value, {bool isOptional = false}) {
    if (value == null || value.trim().isEmpty) {
      if (isOptional) return null;
      return 'Email wajib diisi';
    }
    final trimmed = value.trim();
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$',
    );
    if (!emailRegex.hasMatch(trimmed)) {
      return 'Format email tidak valid (contoh: user@pesantren.id)';
    }
    return null;
  }

  /// Validasi Nomor HP
  static String? validatePhone(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Nomor HP wajib diisi';
    }
    final trimmed = value.trim().replaceAll(RegExp(r'[\s\-]'), '');
    if (!RegExp(r'^\+?[0-9]+$').hasMatch(trimmed)) {
      return 'Nomor HP hanya boleh berisi angka';
    }
    if (trimmed.length < 10) {
      return 'Nomor HP minimal 10 digit';
    }
    if (trimmed.length > 15) {
      return 'Nomor HP maksimal 15 digit';
    }
    return null;
  }

  /// Validasi Password
  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password wajib diisi';
    }
    if (value.length < 6) {
      return 'Password minimal 6 karakter';
    }
    return null;
  }

  /// Validasi Konfirmasi Password
  static String? validateConfirmPassword(String? value, String originalPassword) {
    if (value == null || value.isEmpty) {
      return 'Konfirmasi password wajib diisi';
    }
    if (value != originalPassword) {
      return 'Konfirmasi password tidak cocok';
    }
    return null;
  }
}
