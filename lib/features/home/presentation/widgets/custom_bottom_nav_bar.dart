import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

/// Widget Navigasi Bawah Aplikasi Darul Hikmah (Sesuai Butir 7):
/// 1. Beranda
/// 2. Absensi
/// 3. Laporan
/// 4. Pengaturan
/// - Background putih, shadow lembut di bagian atas
/// - Ikon abu-abu saat tidak aktif, hijau saat aktif dengan aksen kapsul & underline
class CustomBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTabSelected;

  const CustomBottomNavBar({
    Key? key,
    required this.currentIndex,
    required this.onTabSelected,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Color(0x0C000000),
            offset: Offset(0, -3),
            blurRadius: 10,
            spreadRadius: 0,
          ),
        ],
      ),
      padding: const EdgeInsets.only(top: 8, bottom: 8),
      child: SafeArea(
        top: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildNavItem(
              index: 0,
              label: 'Beranda',
              icon: Icons.home_rounded,
            ),
            _buildNavItem(
              index: 1,
              label: 'Absensi',
              icon: Icons.calendar_month_rounded,
            ),
            _buildNavItem(
              index: 2,
              label: 'Laporan',
              icon: Icons.description_rounded,
            ),
            _buildNavItem(
              index: 3,
              label: 'Pengaturan',
              icon: Icons.settings_rounded,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required String label,
    required IconData icon,
  }) {
    final isActive = currentIndex == index;

    return Expanded(
      child: InkWell(
        onTap: () => onTabSelected(index),
        splashColor: Colors.transparent,
        highlightColor: Colors.transparent,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Ikon Aktif dengan Kapsul Hijau vs Ikon Pasif Abu-Abu
            if (isActive)
              Container(
                width: 52,
                height: 28,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(
                  Icons.home_rounded,
                  color: Colors.white,
                  size: 20,
                ),
              )
            else
              Container(
                height: 28,
                alignment: Alignment.center,
                child: Icon(
                  icon,
                  color: const Color(0xFF64748B),
                  size: 24,
                ),
              ),

            const SizedBox(height: 3),

            // Label Menu
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                color: isActive ? AppColors.primary : const Color(0xFF64748B),
              ),
            ),

            const SizedBox(height: 3),

            // Indikator Garis Bawah untuk Tab Aktif (Sesuai Referensi)
            Container(
              width: 32,
              height: 2.5,
              decoration: BoxDecoration(
                color: isActive ? AppColors.primary : Colors.transparent,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
