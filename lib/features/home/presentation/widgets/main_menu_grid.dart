import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../auth/data/models/user_model.dart';

/// Widget 4 Menu Utama dalam Satu Baris (Sesuai Butir 4 & 8):
/// 1. Data Santri (Ikon Kelompok Pengguna)
/// 2. Absensi (Ikon Kalender)
/// 3. Laporan (Ikon Grafik)
/// 4. Pengaturan (Ikon Gear)
class MainMenuGrid extends StatelessWidget {
  final UserRole userRole;
  final Function(String menuTitle, String featureCode) onMenuTap;

  const MainMenuGrid({
    Key? key,
    required this.userRole,
    required this.onMenuTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildMenuCard(
            title: 'Data Santri',
            icon: Icons.groups_rounded,
            featureCode: 'data_santri',
          ),
          const SizedBox(width: 10),
          _buildMenuCard(
            title: 'Absensi',
            icon: Icons.calendar_month_rounded,
            featureCode: 'absensi',
          ),
          const SizedBox(width: 10),
          _buildMenuCard(
            title: 'Laporan',
            icon: Icons.insert_chart_rounded,
            featureCode: 'laporan',
          ),
          const SizedBox(width: 10),
          _buildMenuCard(
            title: 'Pengaturan',
            icon: Icons.settings_rounded,
            featureCode: 'pengaturan',
            isRestrictedForGuru: false,
          ),
        ],
      ),
    );
  }

  Widget _buildMenuCard({
    required String title,
    required IconData icon,
    required String featureCode,
    bool isRestrictedForGuru = false,
  }) {
    return Expanded(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => onMenuTap(title, featureCode),
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 4),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x0C000000),
                  offset: Offset(0, 4),
                  blurRadius: 12,
                  spreadRadius: 0,
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Ikon Hijau Tua
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: isRestrictedForGuru
                        ? AppColors.divider
                        : AppColors.primaryLight.withOpacity(0.4),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    icon,
                    color: isRestrictedForGuru
                        ? AppColors.textHint
                        : AppColors.primary,
                    size: 26,
                  ),
                ),
                const SizedBox(height: 8),
                // Label Teks
                Text(
                  title,
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTextStyles.menuTitle.copyWith(
                    color: isRestrictedForGuru
                        ? AppColors.textMuted
                        : AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
