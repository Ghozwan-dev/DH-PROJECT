import 'package:flutter/material.dart';
import 'app_colors.dart';

/// Tipografi modern, bersih, dan mudah dibaca untuk aplikasi Darul Hikmah
class AppTextStyles {
  AppTextStyles._();

  // Header Brand
  static const TextStyle brandTitle = TextStyle(
    fontSize: 26,
    fontWeight: FontWeight.w700,
    color: AppColors.primary,
    letterSpacing: -0.3,
    height: 1.2,
  );

  static const TextStyle brandTagline = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w500,
    color: AppColors.textMuted,
    letterSpacing: 0.2,
    height: 1.4,
  );

  // Judul Halaman
  static const TextStyle pageTitle = TextStyle(
    fontSize: 22,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimary,
    letterSpacing: -0.2,
    height: 1.3,
  );

  static const TextStyle pageSubtitle = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.textMuted,
    height: 1.4,
  );

  // Form Label & Input
  static const TextStyle label = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
  );

  static const TextStyle inputText = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w400,
    color: AppColors.textPrimary,
  );

  static const TextStyle inputHint = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.textHint,
  );

  // Tombol
  static const TextStyle buttonText = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: Colors.white,
    letterSpacing: 0.3,
  );

  // Link & Teks Aksi
  static const TextStyle link = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w600,
    color: AppColors.primary,
  );

  static const TextStyle footerPrompt = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.textMuted,
  );

  static const TextStyle footerAction = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w700,
    color: AppColors.primary,
  );

  // Tipografi Homepage Modern Islamic Dashboard
  static const TextStyle homeHeaderTitle = TextStyle(
    fontSize: 14.5,
    fontWeight: FontWeight.w700,
    color: Colors.white,
    letterSpacing: -0.2,
  );

  static const TextStyle homeHeaderSubtitle = TextStyle(
    fontSize: 12.5,
    fontWeight: FontWeight.w600,
    color: Color(0xFFD1FAE5),
    letterSpacing: 0.1,
  );

  static const TextStyle welcomeGreeting = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    color: Colors.white,
    letterSpacing: 0.1,
  );

  static const TextStyle welcomeTitle = TextStyle(
    fontSize: 21,
    fontWeight: FontWeight.w800,
    color: Colors.white,
    letterSpacing: -0.3,
    height: 1.2,
  );

  static const TextStyle welcomeSubtitle = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: Color(0xFFE2E8F0),
    height: 1.35,
  );

  static const TextStyle menuTitle = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  static const TextStyle summaryNumber = TextStyle(
    fontSize: 22,
    fontWeight: FontWeight.w800,
    color: AppColors.textPrimary,
  );

  // Pesan Status / Validasi
  static const TextStyle error = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.error,
  );

  static const TextStyle badgeText = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w600,
    color: AppColors.primary,
  );
}
