import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/feedback_banner.dart';
import '../../../auth/data/models/user_model.dart';
import '../../data/models/schedule_model.dart';
import '../../data/services/schedule_service.dart';
import 'schedule_form_page.dart';

/// Halaman Detail Jadwal Pelajaran Pondok Pesantren Islam Darul Hikmah (Sesuai Butir C.5, D, & E)
/// - Menampilkan rincian lengkap mata pelajaran, kelas, guru pengampu, hari, jam, dan waktu
/// - Hak Akses: Tombol Edit dan Hapus HANYA muncul untuk Admin
/// - Guru hanya memiliki izin membaca (read-only)
/// - Desain responsif single-column untuk Android & Web tanpa overflow
class ScheduleDetailPage extends StatefulWidget {
  final ScheduleModel schedule;
  final UserRole currentUserRole;

  const ScheduleDetailPage({
    Key? key,
    required this.schedule,
    required this.currentUserRole,
  }) : super(key: key);

  @override
  State<ScheduleDetailPage> createState() => _ScheduleDetailPageState();
}

class _ScheduleDetailPageState extends State<ScheduleDetailPage> {
  late ScheduleModel _currentSchedule;
  final _scheduleService = ScheduleService();

  @override
  void initState() {
    super.initState();
    _currentSchedule = widget.schedule;
  }

  bool get _isAdmin => widget.currentUserRole == UserRole.admin;

  void _navigateToEdit() async {
    final updated = await Navigator.push<ScheduleModel>(
      context,
      MaterialPageRoute(
        builder: (_) => ScheduleFormPage(schedule: _currentSchedule),
      ),
    );

    if (updated != null) {
      setState(() {
        _currentSchedule = updated;
      });
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
            Text('Hapus Jadwal', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          ],
        ),
        content: Text(
          'Apakah Anda yakin ingin menghapus jadwal mata pelajaran "${_currentSchedule.subject}" untuk kelas ${_currentSchedule.className} (${_currentSchedule.day}, ${_currentSchedule.periodLabel})?\n\nTindakan ini tidak dapat dibatalkan.',
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
              final success = _scheduleService.deleteSchedule(_currentSchedule.id);
              if (success) {
                FeedbackBanner.showSuccess(
                  context,
                  'Jadwal "${_currentSchedule.subject}" (${_currentSchedule.className}) berhasil dihapus.',
                );
                Navigator.pop(context, true); // Kembali ke list jadwal
              } else {
                FeedbackBanner.showError(
                  context,
                  'Gagal menghapus jadwal pelajaran.',
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              elevation: 0,
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
          'Detail Jadwal Pelajaran',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        centerTitle: false,
        actions: [
          if (_isAdmin) ...[
            IconButton(
              icon: const Icon(Icons.edit_outlined, color: AppColors.primary),
              tooltip: 'Edit Jadwal',
              onPressed: _navigateToEdit,
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline_rounded, color: AppColors.error),
              tooltip: 'Hapus Jadwal',
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
                // 1. Header Card Utama
                _buildHeaderCard(),

                const SizedBox(height: 16),

                // 2. Rincian Waktu & Jam Pelajaran
                _buildTimeScheduleCard(),

                const SizedBox(height: 16),

                // 3. Rincian Guru & Lokasi Ruang
                _buildTeacherAndRoomCard(),

                const SizedBox(height: 24),

                // 4. Tombol Aksi Bawah (Khusus Admin)
                if (_isAdmin) ...[
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _showDeleteConfirmation,
                          icon: const Icon(Icons.delete_outline_rounded, color: AppColors.error, size: 18),
                          label: const Text('Hapus Jadwal', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w700)),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.error),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: _navigateToEdit,
                          icon: const Icon(Icons.edit_outlined, color: Colors.white, size: 18),
                          label: const Text('Edit Jadwal', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.primary.withOpacity(0.2)),
                ),
                child: const Icon(
                  Icons.menu_book_rounded,
                  color: AppColors.primary,
                  size: 28,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3.5),
                          decoration: BoxDecoration(
                            color: AppColors.primaryLight,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'Kelas ${_currentSchedule.className}',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade100,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            _currentSchedule.day,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _currentSchedule.subject,
                      style: const TextStyle(
                        fontSize: 19,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                        height: 1.25,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(height: 1, color: AppColors.borderLight),
          const SizedBox(height: 14),
          Row(
            children: [
              const Icon(Icons.person_outline_rounded, size: 16, color: AppColors.textMuted),
              const SizedBox(width: 6),
              const Text(
                'Guru Pengampu: ',
                style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
              ),
              Expanded(
                child: Text(
                  _currentSchedule.teacherName,
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTimeScheduleCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.access_time_rounded, color: AppColors.primary, size: 20),
              SizedBox(width: 8),
              Text(
                'Waktu & Alokasi Pelajaran',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _buildInfoRow('Hari Pelajaran', _currentSchedule.day),
          _buildInfoRow('Nomor Jam Pelajaran', _currentSchedule.periodLabel),
          _buildInfoRow('Jam Mulai', '${_currentSchedule.startTime} WIB'),
          _buildInfoRow('Jam Selesai', '${_currentSchedule.endTime} WIB'),
          _buildInfoRow(
            'Durasi Pembelajaran',
            '${_currentSchedule.durationMinutes} Menit',
            isHighlighted: true,
          ),
        ],
      ),
    );
  }

  Widget _buildTeacherAndRoomCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.meeting_room_outlined, color: AppColors.primary, size: 20),
              SizedBox(width: 8),
              Text(
                'Tenaga Pengajar & Lokasi',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _buildInfoRow('Guru Pengampu', _currentSchedule.teacherName),
          _buildInfoRow('Kelas', 'Kelas ${_currentSchedule.className}'),
          _buildInfoRow('Ruangan Belajar', _currentSchedule.effectiveRoom),
          if (_currentSchedule.notes != null && _currentSchedule.notes!.isNotEmpty) ...[
            _buildInfoRow('Catatan Khusus', _currentSchedule.notes!),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {bool isHighlighted = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7.5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 140,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          const Text(' :  ', style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 13.5,
                fontWeight: isHighlighted ? FontWeight.w700 : FontWeight.w600,
                color: isHighlighted ? AppColors.primary : AppColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
