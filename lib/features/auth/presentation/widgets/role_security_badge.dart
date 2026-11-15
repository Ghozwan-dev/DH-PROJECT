import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

/// Badge / Informasi Hak Akses Pendaftaran (Sesuai Butir 5):
/// Menegaskan bahwa pendaftaran publik diperuntukkan bagi akun Guru,
/// sedangkan akun Administrator dikelola secara tertutup oleh pengelola sistem.
class RoleSecurityBadge extends StatelessWidget {
  const RoleSecurityBadge({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.primaryLight,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.lightGreenBorder, width: 1),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.verified_user_outlined,
            color: AppColors.primary,
            size: 20,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'Peran Pendaftaran: Guru',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryDark,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Pendaftaran publik khusus akun Guru. Akun Administrator dibuat melalui otorisasi khusus pengelola sistem.',
                  style: TextStyle(
                    fontSize: 11.5,
                    color: AppColors.textSecondary,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
