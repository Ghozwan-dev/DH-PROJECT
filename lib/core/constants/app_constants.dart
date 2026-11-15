/// Konstanta teks dan konfigurasi aplikasi Darul Hikmah
class AppConstants {
  AppConstants._();

  // Identitas Aplikasi (Sesuai Butir 2)
  static const String appName = 'Darul Hikmah';
  static const String appFullName = 'Pondok Pesantren Islam Darul Hikmah';
  static const String appLocation = 'Cellong Arjasa Kangean';
  static const String appTagline = 'Berilmu • Berakhlak • Berprestasi';

  // Asset paths
  static const String logoPath = 'assets/images/logo.png';

  // Rute Aplikasi
  static const String routeLogin = '/login';
  static const String routeRegister = '/register';
  static const String routeHomeAdmin = '/home-admin';
  static const String routeHomeGuru = '/home-guru';
  static const String routeStudentList = '/students';

  // Role Pengguna (Sesuai Butir 5: Hanya Admin & Guru)
  static const String roleAdmin = 'Admin';
  static const String roleGuru = 'Guru';

  // Kunci Penyimpanan Lokal (SharedPreferences / Secure Storage)
  static const String keyRememberMe = 'remember_me_preference';
  static const String keySavedUsername = 'saved_username';
  static const String keyAuthToken = 'auth_token';
  static const String keyUserRole = 'user_role';
}
