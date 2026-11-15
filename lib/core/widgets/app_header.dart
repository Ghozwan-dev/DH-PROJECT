import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_constants.dart';
import '../constants/app_text_styles.dart';

/// Widget Header Identitas Aplikasi Darul Hikmah (Sesuai Butir 2):
/// - Logo asli di bagian atas
/// - Bentuk & rasio logo terjaga tanpa ornamen berlebih
/// - Nama: Darul Hikmah
/// - Tagline: Berilmu • Berakhlak • Berprestasi
class AppHeader extends StatelessWidget {
  final double logoSize;
  final bool compact;

  const AppHeader({
    Key? key,
    this.logoSize = 96.0,
    this.compact = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Logo Asli Darul Hikmah (Menjaga bentuk medali utuh dengan latar transparan)
        Hero(
          tag: 'app_logo_hero',
          child: SizedBox(
            width: logoSize,
            height: logoSize,
            child: Image.asset(
              AppConstants.logoPath,
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) {
                // Fallback visual jika asset belum dimuat
                return Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.primary, width: 2),
                  ),
                  child: const Icon(
                    Icons.school_outlined,
                    size: 40,
                    color: AppColors.primary,
                  ),
                );
              },
            ),
          ),
        ),
        SizedBox(height: compact ? 10 : 14),

        // Nama Aplikasi
        const Text(
          AppConstants.appName,
          textAlign: TextAlign.center,
          style: AppTextStyles.brandTitle,
        ),
        const SizedBox(height: 4),

        // Tagline Resmi
        const Text(
          AppConstants.appTagline,
          textAlign: TextAlign.center,
          style: AppTextStyles.brandTagline,
        ),
      ],
    );
  }
}
