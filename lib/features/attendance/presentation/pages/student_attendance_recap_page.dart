import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../auth/data/models/user_model.dart';
import '../widgets/student_attendance_recap_view.dart';

/// Halaman Rekap Absensi Per Santri (Khusus Admin)
/// Dibatasi dengan RBAC: Guru tidak dapat membuka halaman ini
class StudentAttendanceRecapPage extends StatelessWidget {
  final UserModel currentUser;

  const StudentAttendanceRecapPage({
    Key? key,
    required this.currentUser,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Validasi Akses: Khusus Administrator
    if (!currentUser.isAdmin) {
      return Scaffold(
        backgroundColor: AppColors.dashboardBg,
        appBar: AppBar(
          title: const Text('Rekap Absensi Santri'),
          backgroundColor: Colors.white,
          foregroundColor: AppColors.textPrimary,
          elevation: 0.5,
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.lock_rounded, size: 64, color: AppColors.error),
                const SizedBox(height: 16),
                const Text(
                  'Akses Ditolak',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Halaman Rekap Absensi Santri hanya dapat diakses oleh Administrator Pondok.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 13.5, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('Kembali', style: TextStyle(color: Colors.white)),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.dashboardBg,
      appBar: AppBar(
        title: const Text('Rekap Absensi Santri'),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0.5,
        centerTitle: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: StudentAttendanceRecapView(currentUser: currentUser),
      ),
    );
  }
}
