import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../auth/data/models/user_model.dart';
import '../../data/models/lesson_attendance_model.dart';
import '../../data/services/lesson_attendance_service.dart';
import '../../data/services/schedule_service.dart';
import 'attendance_form_page.dart';

/// Halaman Detail Riwayat Absensi Santri (Sesuai Butir 3)
/// Menampilkan:
/// - Informasi mata pelajaran, nama guru, kelas, tanggal dan jam pertemuan
/// - Ringkasan kehadiran sesi (Hadir, Izin, Sakit, Terlambat: 0, Alfa)
/// - Daftar seluruh santri dengan NIS, status kehadiran, dan catatan khusus
/// - Tombol Edit Absensi (jika berwenang)
class AttendanceHistoryDetailPage extends StatefulWidget {
  final LessonAttendanceModel initialRecord;
  final UserModel currentUser;

  const AttendanceHistoryDetailPage({
    Key? key,
    required this.initialRecord,
    required this.currentUser,
  }) : super(key: key);

  @override
  State<AttendanceHistoryDetailPage> createState() => _AttendanceHistoryDetailPageState();
}

class _AttendanceHistoryDetailPageState extends State<AttendanceHistoryDetailPage> {
  final _attendanceService = LessonAttendanceService();
  final _scheduleService = ScheduleService();

  late LessonAttendanceModel _record;

  @override
  void initState() {
    super.initState();
    _record = widget.initialRecord;
    _attendanceService.addListener(_onServiceUpdate);
  }

  @override
  void dispose() {
    _attendanceService.removeListener(_onServiceUpdate);
    super.dispose();
  }

  void _onServiceUpdate() {
    if (!mounted) return;
    // Cari data terbaru dari service untuk sesi ini
    final updated = _attendanceService.findExistingAttendance(
      scheduleId: _record.scheduleId,
      date: _record.date,
    );
    if (updated != null) {
      setState(() {
        _record = updated;
      });
    }
  }

  bool get _canEdit {
    if (widget.currentUser.isAdmin) return true;
    final schedule = _scheduleService.getScheduleById(_record.scheduleId);
    if (schedule == null) return false;
    return _attendanceService.canManageSchedule(
      user: widget.currentUser,
      schedule: schedule,
    );
  }

  Future<void> _navigateToEdit() async {
    final schedule = _scheduleService.getScheduleById(_record.scheduleId);
    if (schedule == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Jadwal pelajaran untuk sesi ini tidak ditemukan.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (!_canEdit) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Akses ditolak: Anda hanya dapat mengedit jadwal yang ditugaskan kepada Anda.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final date = DateTime.tryParse(_record.date);
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => AttendanceFormPage(
          currentUser: widget.currentUser,
          schedule: schedule,
          initialDate: date,
          existingAttendance: _record,
        ),
      ),
    );

    if (result == true && mounted) {
      final refreshed = _attendanceService.findExistingAttendance(
        scheduleId: _record.scheduleId,
        date: _record.date,
      );
      if (refreshed != null) {
        setState(() {
          _record = refreshed;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Detail Riwayat Absensi',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
              ),
            ),
            Text(
              '${_record.subject} • Kelas ${_record.className}',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
        actions: [
          if (_canEdit)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: TextButton.icon(
                onPressed: _navigateToEdit,
                icon: const Icon(Icons.edit_note_rounded, size: 20, color: AppColors.primary),
                label: const Text(
                  'Edit',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
                style: TextButton.styleFrom(
                  backgroundColor: AppColors.primaryLight,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Kartu Informasi Sesi Pelajaran
            _buildSessionInfoCard(),

            const SizedBox(height: 14),

            // 2. Kartu Ringkasan Metrik Kehadiran Sesi
            _buildMetricsSummaryCard(),

            const SizedBox(height: 18),

            // 3. Header Daftar Santri
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Daftar Kehadiran Santri (${_record.totalStudents})',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                Text(
                  'Dicatat oleh: ${_record.recordedBy}',
                  style: const TextStyle(
                    fontSize: 11.5,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 10),

            // 4. Daftar Santri
            if (_record.items.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 30),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: const Center(
                  child: Text(
                    'Tidak ada data santri dalam sesi ini.',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                  ),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _record.items.length,
                itemBuilder: (ctx, idx) {
                  final item = _record.items[idx];
                  return _buildStudentItemCard(item, idx + 1);
                },
              ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSessionInfoCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.school_rounded, color: AppColors.primary, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _record.subject,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Guru: ${_record.teacherName}',
                      style: const TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'Kelas ${_record.className}',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
          const Divider(height: 20, color: Color(0xFFF1F5F9)),
          Row(
            children: [
              Expanded(
                child: Row(
                  children: [
                    const Icon(Icons.calendar_month_rounded, size: 16, color: AppColors.primary),
                    const SizedBox(width: 6),
                    Text(
                      _record.formattedDate,
                      style: const TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
              Row(
                children: [
                  const Icon(Icons.schedule_rounded, size: 16, color: AppColors.textSecondary),
                  const SizedBox(width: 6),
                  Text(
                    'Jam Ke-${_record.periodNumber} (${_record.startTime} - ${_record.endTime})',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF475569),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricsSummaryCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStatItem('Hadir', _record.hadirCount, const Color(0xFF16A34A), const Color(0xFFDCFCE7)),
          _buildStatDivider(),
          _buildStatItem('Izin', _record.izinCount, const Color(0xFF0284C7), const Color(0xFFE0F2FE)),
          _buildStatDivider(),
          _buildStatItem('Sakit', _record.sakitCount, const Color(0xFFD97706), const Color(0xFFFEF3C7)),
          _buildStatDivider(),
          _buildStatItem('Alfa', _record.alfaCount, const Color(0xFFDC2626), const Color(0xFFFEE2E2)),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, int count, Color color, Color bgColor) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            '$count',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildStatDivider() {
    return Container(
      width: 1,
      height: 26,
      color: const Color(0xFFE2E8F0),
    );
  }

  Widget _buildStudentItemCard(StudentAttendanceItemModel item, int index) {
    Color statusColor;
    Color statusBgColor;

    switch (item.status) {
      case LessonAttendanceStatus.hadir:
        statusColor = const Color(0xFF16A34A);
        statusBgColor = const Color(0xFFDCFCE7);
        break;
      case LessonAttendanceStatus.izin:
        statusColor = const Color(0xFF0284C7);
        statusBgColor = const Color(0xFFE0F2FE);
        break;
      case LessonAttendanceStatus.sakit:
        statusColor = const Color(0xFFD97706);
        statusBgColor = const Color(0xFFFEF3C7);
        break;
      case LessonAttendanceStatus.alfa:
        statusColor = const Color(0xFFDC2626);
        statusBgColor = const Color(0xFFFEE2E2);
        break;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Nomor urut
              Container(
                width: 24,
                height: 24,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  '$index',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
              const SizedBox(width: 10),

              // Avatar
              Container(
                width: 36,
                height: 36,
                decoration: const BoxDecoration(
                  color: AppColors.primaryLight,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    item.studentName.isNotEmpty ? item.studentName[0].toUpperCase() : 'S',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),

              // Nama dan NIS
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.studentName,
                      style: const TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 1),
                    Text(
                      'NIS: ${item.studentNis}',
                      style: const TextStyle(
                        fontSize: 11.5,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),

              // Badge Status
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusBgColor,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  item.status.label,
                  style: TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w700,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),

          // Catatan khusus jika tersedia
          if (item.note != null && item.note!.trim().isNotEmpty) ...[
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.notes_rounded, size: 14, color: AppColors.textSecondary),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Catatan: ${item.note}',
                      style: const TextStyle(
                        fontSize: 11.5,
                        fontStyle: FontStyle.italic,
                        color: Color(0xFF475569),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
