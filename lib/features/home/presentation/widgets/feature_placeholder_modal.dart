import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../auth/data/models/user_model.dart';

/// Modal dialog / bottom sheet untuk navigasi menu & kontrol hak akses (Sesuai Butir 8 & 10)
class FeaturePlaceholderModal {
  static void show(
    BuildContext context, {
    required String title,
    required String featureCode,
    required UserRole userRole,
  }) {
    final isRestricted = userRole == UserRole.guru && featureCode == 'pengaturan';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle bar atas
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 18),

            // Header status hak akses
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: isRestricted ? AppColors.errorLight : AppColors.primaryLight,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isRestricted ? Icons.lock_outline_rounded : Icons.check_circle_outline_rounded,
                    color: isRestricted ? AppColors.error : AppColors.primary,
                    size: 26,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        isRestricted
                            ? 'Akses Terbatas: Khusus Administrator'
                            : 'Hak Akses: ${userRole.label}',
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                          color: isRestricted ? AppColors.error : AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Deskripsi fitur
            Text(
              isRestricted
                  ? 'Mohon maaf, pengaturan administrasi sistem pesantren dan pengelolaan akun hanya dapat diakses oleh Administrator. Akun Guru tidak memiliki kewenangan di bagian ini (Sesuai Butir 8 Hak Akses).'
                  : _getFeatureDescription(featureCode, userRole),
              style: const TextStyle(
                fontSize: 13.5,
                color: AppColors.textSecondary,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 24),

            // Tombol Tutup
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                style: ElevatedButton.styleFrom(
                  backgroundColor: isRestricted ? AppColors.textPrimary : AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text(
                  'Mengerti',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  static String _getFeatureDescription(String code, UserRole role) {
    switch (code) {
      case 'data_santri':
        return role == UserRole.admin
            ? 'Menu Data Santri memungkinkan Administrator mengelola seluruh basis data santri Pondok Pesantren Islam Darul Hikmah secara menyeluruh.'
            : 'Menu Data Santri menampilkan daftar santri pada rombel / kelas yang Anda bina.';
      case 'absensi':
        return role == UserRole.admin
            ? 'Menu Absensi Santri memungkinkan pencatatan dan monitoring kehadiran seluruh santri per asrama dan kelas.'
            : 'Menu Absensi Guru memungkinkan penginputan presensi harian santri untuk kelas Anda.';
      case 'laporan':
        return role == UserRole.admin
            ? 'Laporan absensi komprehensif pesantren harian, mingguan, dan bulanan serta rekapitulasi per kelas.'
            : 'Laporan kehadiran santri pada kelas yang diampu untuk keperluan evaluasi belajar.';
      case 'pengaturan':
        return 'Pengaturan sistem absensi, manajemen akun pengguna, dan konfigurasi master data pondok.';
      default:
        return 'Modul ini siap dikembangkan pada tahapan berikutnya.';
    }
  }
}
