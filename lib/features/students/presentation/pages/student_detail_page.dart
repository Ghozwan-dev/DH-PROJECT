import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/feedback_banner.dart';
import '../../../auth/data/models/user_model.dart';
import '../../data/models/student_model.dart';
import '../../data/services/student_service.dart';
import '../widgets/student_avatar_picker_sheet.dart';
import 'student_form_page.dart';

/// Halaman Detail Santri Darul Hikmah (Sesuai Butir D & E):
/// - Menampilkan profil lengkap santri, akademik, asrama, dan kontak wali
/// - Hak Akses: Tombol Edit dan Hapus HANYA muncul untuk Admin
/// - Konfirmasi dialog penghapusan aman
class StudentDetailPage extends StatefulWidget {
  final StudentModel student;
  final UserRole currentUserRole;

  const StudentDetailPage({
    Key? key,
    required this.student,
    required this.currentUserRole,
  }) : super(key: key);

  @override
  State<StudentDetailPage> createState() => _StudentDetailPageState();
}

class _StudentDetailPageState extends State<StudentDetailPage> {
  late StudentModel _currentStudent;
  final _studentService = StudentService();

  @override
  void initState() {
    super.initState();
    _currentStudent = widget.student;
  }

  bool get _isAdmin => widget.currentUserRole == UserRole.admin;

  void _navigateToEdit() async {
    final updated = await Navigator.push<StudentModel>(
      context,
      MaterialPageRoute(
        builder: (_) => StudentFormPage(student: _currentStudent),
      ),
    );

    if (updated != null) {
      setState(() {
        _currentStudent = updated;
      });
    }
  }

  void _showChangeAvatarBottomSheet() {
    if (!_isAdmin) return; // Keamanan ganda: Hanya Admin

    final isMale = _currentStudent.isMale;
    StudentAvatarPickerSheet.show(
      context: context,
      isMale: isMale,
      currentAvatar: _currentStudent.avatarAsset,
      title: 'Ubah Foto Profil Santri (${isMale ? 'Putra' : 'Putri'})',
      onSelected: _applyAvatar,
    );
  }

  void _applyAvatar(String avatarPath) {
    final success = _studentService.updateStudentAvatar(_currentStudent.id, avatarPath);
    if (success) {
      setState(() {
        _currentStudent = _currentStudent.copyWith(avatarAsset: avatarPath);
      });
      FeedbackBanner.showSuccess(
        context,
        'Foto profil ${_currentStudent.fullName} berhasil diperbarui.',
      );
    }
  }

  void _showDeleteConfirmation() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: const [
            Icon(Icons.warning_amber_rounded, color: AppColors.error, size: 26),
            SizedBox(width: 10),
            Text('Hapus Data Santri'),
          ],
        ),
        content: Text(
          'Apakah Anda yakin ingin menghapus data santri "${_currentStudent.fullName}" (NIS: ${_currentStudent.nis})?\n\nTindakan ini tidak dapat dibatalkan.',
          style: const TextStyle(fontSize: 13.5, color: AppColors.textSecondary, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx); // Tutup dialog
              final success = _studentService.deleteStudent(_currentStudent.id);
              if (success) {
                FeedbackBanner.showSuccess(
                  context,
                  'Data santri "${_currentStudent.fullName}" berhasil dihapus.',
                );
                Navigator.pop(context, true); // Kembali ke daftar santri
              } else {
                FeedbackBanner.showError(
                  context,
                  'Gagal menghapus data santri.',
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Hapus', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.dashboardBg,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.primary, size: 20),
          tooltip: 'Kembali',
          onPressed: () => Navigator.pop(context, true),
        ),
        title: const Text(
          'Detail Santri',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        centerTitle: false,
        actions: [
          // Aksi Edit & Hapus KHUSUS Admin (Sesuai Butir D)
          if (_isAdmin) ...[
            IconButton(
              icon: const Icon(Icons.edit_outlined, color: AppColors.primary),
              tooltip: 'Edit Data Santri',
              onPressed: _navigateToEdit,
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline_rounded, color: AppColors.error),
              tooltip: 'Hapus Data Santri',
              onPressed: _showDeleteConfirmation,
            ),
          ],
        ],
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Kartu Profil Utama
                _buildProfileCard(),

                const SizedBox(height: 16),

                // 2. Bagian Informasi Akademik & Asrama
                _buildSectionCard(
                  title: 'Informasi Akademik & Asrama',
                  icon: Icons.school_rounded,
                  items: [
                    _buildInfoRow('Nomor Induk Santri (NIS)', _currentStudent.nis),
                    _buildInfoRow('Kelas', _currentStudent.className),
                    _buildInfoRow('Kamar Asrama', _currentStudent.room),
                    _buildInfoRow('Tanggal Masuk', _currentStudent.formattedEnrollmentDate),
                    _buildInfoRow(
                      'Status Keaktifan',
                      _currentStudent.status.label,
                      badgeColor: _currentStudent.status.color,
                      badgeBg: _currentStudent.status.backgroundColor,
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // 3. Bagian Data Pribadi Santri
                _buildSectionCard(
                  title: 'Data Pribadi Santri',
                  icon: Icons.badge_outlined,
                  items: [
                    _buildInfoRow(
                      'Jenis Kelamin',
                      _currentStudent.gender.label,
                      badgeColor: _currentStudent.gender.color,
                      badgeBg: _currentStudent.gender.backgroundColor,
                    ),
                    _buildInfoRow(
                      'Tempat, Tanggal Lahir',
                      '${_currentStudent.birthPlace}, ${_currentStudent.formattedBirthDate} (${_currentStudent.age} tahun)',
                    ),
                    _buildInfoRow('Alamat Domisili', _currentStudent.address),
                  ],
                ),

                const SizedBox(height: 16),

                // 4. Bagian Data Orang Tua / Wali
                _buildSectionCard(
                  title: 'Data Orang Tua / Wali',
                  icon: Icons.contact_phone_outlined,
                  items: [
                    _buildInfoRow('Nama Orang Tua / Wali', _currentStudent.parentName),
                    _buildInfoRow(
                      'Nomor Telepon Wali',
                      _currentStudent.parentPhone,
                      actionIcon: Icons.phone_in_talk_rounded,
                      onActionTap: () {
                        FeedbackBanner.showInfo(
                          context,
                          'Menghubungi wali santri: ${_currentStudent.parentPhone}',
                        );
                      },
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // Tombol Aksi Tambahan untuk Admin di Bagian Bawah
                if (_isAdmin)
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _showDeleteConfirmation,
                          icon: const Icon(Icons.delete_outline_rounded, color: AppColors.error),
                          label: const Text('Hapus Santri', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w600)),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.error),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: _navigateToEdit,
                          icon: const Icon(Icons.edit_rounded, color: Colors.white),
                          label: const Text('Edit Data', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                    ],
                  ),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProfileCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFF1F5F9), width: 1),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000),
            offset: Offset(0, 4),
            blurRadius: 14,
          ),
        ],
      ),
      child: Column(
        children: [
          // Foto / Avatar Santri Besar dengan Tombol Tambah/Ganti Foto (Khusus Admin)
          Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                width: 84,
                height: 84,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _currentStudent.gender.backgroundColor,
                  border: Border.all(color: _currentStudent.gender.color, width: 2.5),
                ),
                child: ClipOval(
                  child: _currentStudent.avatarAsset != null
                      ? Image.asset(
                          _currentStudent.avatarAsset!,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => _buildFallbackAvatar(),
                        )
                      : _buildFallbackAvatar(),
                ),
              ),
              // Tombol Tambah Foto Profil Khusus Admin (Sesuai Permintaan)
              if (_isAdmin)
                Positioned(
                  bottom: -2,
                  right: -2,
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: _showChangeAvatarBottomSheet,
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x33000000),
                              offset: Offset(0, 2),
                              blurRadius: 4,
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.camera_alt_rounded,
                          size: 15,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),

          // Nama Lengkap Santri
          Text(
            _currentStudent.fullName,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 19,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
              letterSpacing: -0.3,
            ),
          ),

          const SizedBox(height: 6),

          // Badge NIS & Status
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.dashboardBg,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.border),
                ),
                child: Text(
                  'NIS: ${_currentStudent.nis}',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(
                  color: _currentStudent.status.backgroundColor,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _currentStudent.status.color,
                      ),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      _currentStudent.status.label,
                      style: TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                        color: _currentStudent.status.color,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFallbackAvatar() {
    return Icon(
      _currentStudent.isFemale ? Icons.face_3_rounded : Icons.face_rounded,
      color: _currentStudent.gender.color,
      size: 48,
    );
  }

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required List<Widget> items,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF1F5F9), width: 1),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            offset: Offset(0, 2),
            blurRadius: 8,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 20, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                  letterSpacing: -0.2,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          const SizedBox(height: 8),
          ...items,
        ],
      ),
    );
  }

  Widget _buildInfoRow(
    String label,
    String value, {
    Color? badgeColor,
    Color? badgeBg,
    IconData? actionIcon,
    VoidCallback? onActionTap,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 130,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textMuted,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: badgeColor != null && badgeBg != null
                ? Align(
                    alignment: Alignment.centerLeft,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: badgeBg,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        value,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: badgeColor,
                        ),
                      ),
                    ),
                  )
                : Text(
                    value,
                    style: const TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
          ),
          if (actionIcon != null)
            InkWell(
              onTap: onActionTap,
              borderRadius: BorderRadius.circular(6),
              child: Padding(
                padding: const EdgeInsets.all(4.0),
                child: Icon(actionIcon, size: 18, color: AppColors.primary),
              ),
            ),
        ],
      ),
    );
  }
}
