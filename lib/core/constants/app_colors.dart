import 'package:flutter/material.dart';

/// Palet warna aplikasi Absensi Santri Pondok Pesantren Islam Darul Hikmah
/// Sesuai pedoman desain:
/// - Background putih
/// - Warna utama hijau tua sesuai logo Darul Hikmah
/// - Warna pendukung hijau muda dan abu-abu
class AppColors {
  AppColors._();

  // Warna Utama (Hijau Tua & Hijau Emerald)
  static const Color primary = Color(0xFF0E6838);
  static const Color primaryDark = Color(0xFF084B27);
  static const Color primaryEmerald = Color(0xFF0A5C36);
  static const Color primaryLight = Color(0xFFE8F5E9);
  static const Color primarySurface = Color(0xFFF0FDF4);

  // Aksen Emas & Kuning (Welcome Section Curves & Badges)
  static const Color goldAccent = Color(0xFFE5B842);
  static const Color goldAccentDark = Color(0xFFC89B2B);
  static const Color goldLight = Color(0xFFFEF9C3);

  // Warna Pendukung (Hijau Muda, Oranye, Biru, Abu-abu)
  static const Color accentGreen = Color(0xFF16A34A);
  static const Color lightGreenBorder = Color(0xFFA7F3D0);
  static const Color lightGreenBadge = Color(0xFFD1FAE5);
  static const Color blueLight = Color(0xFFE0F2FE);

  // Gender Santri
  static const Color genderMale = Color(0xFF0284C7);
  static const Color genderMaleBg = Color(0xFFE0F2FE);
  static const Color genderFemale = Color(0xFFDB2777);
  static const Color genderFemaleBg = Color(0xFFFCE7F3);

  // Status Santri
  static const Color statusActive = Color(0xFF16A34A);
  static const Color statusActiveBg = Color(0xFFDCFCE7);
  static const Color statusInactive = Color(0xFF6B7280);
  static const Color statusInactiveBg = Color(0xFFF3F4F6);

  // Status Kehadiran (Presensi)
  static const Color attendancePresent = Color(0xFF16A34A);
  static const Color attendancePresentBg = Color(0xFFDCFCE7);
  static const Color attendancePermission = Color(0xFFF59E0B);
  static const Color attendancePermissionBg = Color(0xFFFEF3C7);
  static const Color attendanceAbsent = Color(0xFFEF4444);
  static const Color attendanceAbsentBg = Color(0xFFFEE2E2);

  // Netral & Background Dashboard
  static const Color background = Color(0xFFFFFFFF);
  static const Color dashboardBg = Color(0xFFF8FAFC);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color cardShadow = Color(0x0F000000);
  static const Color inputBackground = Color(0xFFFFFFFF);

  static const Color textPrimary = Color(0xFF111827);   // Hitam charcoal teks utama
  static const Color textSecondary = Color(0xFF4B5563); // Abu-abu gelap teks pendukung
  static const Color textMuted = Color(0xFF6B7280);     // Abu-abu netral
  static const Color textHint = Color(0xFF9CA3AF);      // Abu-abu terang hint

  static const Color border = Color(0xFFE5E7EB);        // Garis batas input normal
  static const Color borderFocused = Color(0xFF0E6838); // Garis batas input aktif
  static const Color divider = Color(0xFFF3F4F6);       // Garis pemisah

  // Status & Notifikasi
  static const Color error = Color(0xFFDC2626);
  static const Color errorLight = Color(0xFFFEE2E2);
  static const Color errorText = Color(0xFF991B1B);

  static const Color success = Color(0xFF16A34A);
  static const Color successLight = Color(0xFFDCFCE7);
  static const Color successText = Color(0xFF166534);

  static const Color info = Color(0xFF0284C7);
  static const Color infoLight = Color(0xFFE0F2FE);
  static const Color infoText = Color(0xFF075985);
}
