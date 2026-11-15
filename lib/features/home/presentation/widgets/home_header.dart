import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../auth/data/models/user_model.dart';

/// Widget Header Aplikasi Darul Hikmah (Sesuai Butir 2 & 8):
/// - Logo Darul Hikmah di sebelah kiri.
/// - Nama Darul Hikmah & tulisan Pondok Pesantren.
/// - Foto profil pengguna.
/// - Dropdown role pengguna (Admin/Guru) dengan fungsi Logout.
class HomeHeader extends StatelessWidget {
  final UserModel currentUser;
  final ValueChanged<UserRole> onRoleChanged;
  final VoidCallback onLogout;

  const HomeHeader({
    Key? key,
    required this.currentUser,
    required this.onRoleChanged,
    required this.onLogout,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 10.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Bagian Kiri: Logo + Nama Aplikasi
          Row(
            children: [
              // Logo Darul Hikmah (Menggunakan aset logo resmi)
              SizedBox(
                width: 44,
                height: 44,
                child: Image.asset(
                  AppConstants.logoPath,
                  fit: BoxFit.contain,
                  errorBuilder: (_, __, ___) => Container(
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                    ),
                    child: const Icon(Icons.school, color: AppColors.primary, size: 24),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: const [
                  Text(
                    'Pondok Pesantren Islam',
                    style: AppTextStyles.homeHeaderTitle,
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Darul Hikmah',
                    style: AppTextStyles.homeHeaderSubtitle,
                  ),
                ],
              ),
            ],
          ),

          // Bagian Kanan: Foto Profil & Dropdown Role Pengguna
          PopupMenuButton<String>(
            tooltip: 'Profil & Role Pengguna',
            offset: const Offset(0, 48),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            onSelected: (value) {
              if (value == 'switch_admin') {
                onRoleChanged(UserRole.admin);
              } else if (value == 'switch_guru') {
                onRoleChanged(UserRole.guru);
              } else if (value == 'logout') {
                _showLogoutConfirmDialog(context);
              }
            },
            itemBuilder: (context) => [
              // Header identitas pengguna yang sedang login
              PopupMenuItem<String>(
                enabled: false,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      currentUser.fullName,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      currentUser.email ?? currentUser.username,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textMuted,
                      ),
                    ),
                    const Divider(height: 16),
                  ],
                ),
              ),
              // Pilihan Role Admin
              PopupMenuItem<String>(
                value: 'switch_admin',
                child: Row(
                  children: [
                    Icon(
                      Icons.admin_panel_settings_rounded,
                      color: currentUser.isAdmin ? AppColors.primary : AppColors.textMuted,
                      size: 20,
                    ),
                    const SizedBox(width: 10),
                    Text(
                      'Mode: Admin',
                      style: TextStyle(
                        fontWeight: currentUser.isAdmin ? FontWeight.w700 : FontWeight.w500,
                        color: currentUser.isAdmin ? AppColors.primary : AppColors.textPrimary,
                      ),
                    ),
                    if (currentUser.isAdmin) ...[
                      const Spacer(),
                      const Icon(Icons.check, color: AppColors.primary, size: 18),
                    ],
                  ],
                ),
              ),
              // Pilihan Role Guru
              PopupMenuItem<String>(
                value: 'switch_guru',
                child: Row(
                  children: [
                    Icon(
                      Icons.person_rounded,
                      color: currentUser.isGuru ? AppColors.primary : AppColors.textMuted,
                      size: 20,
                    ),
                    const SizedBox(width: 10),
                    Text(
                      'Mode: Guru',
                      style: TextStyle(
                        fontWeight: currentUser.isGuru ? FontWeight.w700 : FontWeight.w500,
                        color: currentUser.isGuru ? AppColors.primary : AppColors.textPrimary,
                      ),
                    ),
                    if (currentUser.isGuru) ...[
                      const Spacer(),
                      const Icon(Icons.check, color: AppColors.primary, size: 18),
                    ],
                  ],
                ),
              ),
              const PopupMenuDivider(),
              // Pilihan Logout
              const PopupMenuItem<String>(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(Icons.logout_rounded, color: AppColors.error, size: 20),
                    SizedBox(width: 10),
                    Text(
                      'Keluar (Logout)',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: AppColors.error,
                      ),
                    ),
                  ],
                ),
              ),
            ],
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.18),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white.withOpacity(0.35), width: 1),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Foto Profil Bulat Pengguna
                  Container(
                    width: 26,
                    height: 26,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withOpacity(0.9),
                    ),
                    child: const Icon(
                      Icons.person,
                      color: AppColors.primaryDark,
                      size: 18,
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Label Role (Admin/Guru)
                  Text(
                    currentUser.role.label,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(
                    Icons.keyboard_arrow_down_rounded,
                    color: Colors.white,
                    size: 18,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showLogoutConfirmDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Konfirmasi Logout'),
        content: const Text('Apakah Anda yakin ingin keluar dari akun ini?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              onLogout();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Keluar', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
