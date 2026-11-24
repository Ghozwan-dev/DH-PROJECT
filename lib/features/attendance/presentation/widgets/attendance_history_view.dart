import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../auth/data/models/user_model.dart';
import '../../data/models/lesson_attendance_model.dart';
import '../../data/services/lesson_attendance_service.dart';
import '../../data/services/schedule_service.dart';
import '../pages/attendance_form_page.dart';
import '../pages/attendance_history_detail_page.dart';
import 'attendance_result_sheet.dart';

/// Tampilan Riwayat & Rekapitulasi Absensi Santri (Sesuai Butir 2 & 6)
class AttendanceHistoryView extends StatefulWidget {
  final UserModel currentUser;

  const AttendanceHistoryView({
    Key? key,
    required this.currentUser,
  }) : super(key: key);

  @override
  State<AttendanceHistoryView> createState() => _AttendanceHistoryViewState();
}

class _AttendanceHistoryViewState extends State<AttendanceHistoryView> {
  final _attendanceService = LessonAttendanceService();
  final _scheduleService = ScheduleService();

  String _selectedClass = 'Semua';
  String _selectedSubject = 'Semua';
  String _selectedTeacher = 'Semua';
  String? _selectedDate; // 'YYYY-MM-DD'
  String _searchQuery = '';

  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _resetFilters() {
    setState(() {
      _selectedClass = 'Semua';
      _selectedSubject = 'Semua';
      _selectedTeacher = 'Semua';
      _selectedDate = null;
      _searchQuery = '';
      _searchController.clear();
    });
  }

  Future<void> _pickDateFilter() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate != null ? (DateTime.tryParse(_selectedDate!) ?? now) : now,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.primary,
              onPrimary: Colors.white,
              onSurface: AppColors.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      final str =
          '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
      setState(() {
        _selectedDate = str;
      });
    }
  }

  Future<void> _navigateToEdit(LessonAttendanceModel record) async {
    final schedule = _scheduleService.getScheduleById(record.scheduleId);
    if (schedule == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Jadwal pelajaran untuk sesi ini tidak ditemukan.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    // RBAC: Periksa apakah Guru memiliki hak akses mengedit jadwal ini
    if (!widget.currentUser.isAdmin &&
        !_attendanceService.canManageSchedule(user: widget.currentUser, schedule: schedule)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Akses ditolak: Anda hanya dapat mengedit jadwal yang ditugaskan kepada Anda.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final date = DateTime.tryParse(record.date);
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => AttendanceFormPage(
          currentUser: widget.currentUser,
          schedule: schedule,
          initialDate: date,
          existingAttendance: record,
        ),
      ),
    );

    if (result == true) {
      setState(() {});
    }
  }

  Future<void> _confirmDeleteAttendance(LessonAttendanceModel record) async {
    // RBAC: Guru tidak boleh menghapus data absensi (Butir 2)
    if (!widget.currentUser.isAdmin) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Akses ditolak: Hanya Administrator yang dapat menghapus data absensi.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Hapus Data Absensi?'),
        content: Text(
          'Apakah Anda yakin ingin menghapus data absensi mata pelajaran "${record.subject}" kelas ${record.className} pada tanggal ${record.formattedDate}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal', style: TextStyle(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Hapus', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final success = await _attendanceService.deleteAttendance(
        user: widget.currentUser,
        attendanceId: record.id,
      );

      if (!mounted) return;
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Data absensi berhasil dihapus.'),
            backgroundColor: AppColors.primary,
          ),
        );
        setState(() {});
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isAdmin = widget.currentUser.isAdmin;

    // Ambil riwayat tersaring (Untuk Guru otomatis terkunci hanya ke jadwal miliknya sendiri di level repository)
    final historyList = _attendanceService.getFilteredHistory(
      user: widget.currentUser,
      dateFilter: _selectedDate,
      classFilter: _selectedClass,
      subjectFilter: _selectedSubject,
      teacherFilter: isAdmin ? _selectedTeacher : null,
      searchQuery: _searchQuery,
    );

    // Ambil rekapitulasi ringkasan
    final recap = _attendanceService.getSummaryRecap(
      user: widget.currentUser,
      dateFilter: _selectedDate,
      classFilter: _selectedClass,
      subjectFilter: _selectedSubject,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1. Rekapitulasi Statistik Kehadiran (Sesuai Butir 6)
        _buildRecapSummaryCard(recap),

        const SizedBox(height: 16),

        // 2. Bar Filter Riwayat (Tanggal, Kelas, Mapel, Guru)
        _buildFilterBar(isAdmin),

        const SizedBox(height: 16),

        // 3. Header Hasil Riwayat
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Riwayat Sesi Absensi (${historyList.length})',
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            if (_selectedDate != null ||
                _selectedClass != 'Semua' ||
                _selectedSubject != 'Semua' ||
                _selectedTeacher != 'Semua' ||
                _searchQuery.isNotEmpty)
              TextButton(
                onPressed: _resetFilters,
                style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: const Text(
                  'Reset',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
                ),
              ),
          ],
        ),

        const SizedBox(height: 10),

        // 4. Daftar Kartu Sesi Absensi
        if (historyList.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Column(
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.assignment_turned_in_outlined, size: 30, color: Colors.grey.shade400),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Belum ada riwayat absensi ditemukan',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Silakan isi absensi dari tab "Jadwal Pelajaran" terlebih dahulu.',
                  style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                ),
              ],
            ),
          )
        else
          ...historyList.map((rec) => _buildAttendanceSessionCard(rec, isAdmin)),
      ],
    );
  }

  Widget _buildRecapSummaryCard(Map<String, int> recap) {
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.analytics_rounded, color: AppColors.primary, size: 18),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Rekapitulasi Kehadiran',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              Text(
                '${recap['sessions'] ?? 0} Sesi Pelajaran',
                style: const TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // 4 Kolom Metrik: Hadir, Izin, Sakit, Alfa
          Row(
            children: [
              _buildMetricItem('Hadir', recap['hadir'] ?? 0, const Color(0xFF16A34A), const Color(0xFFDCFCE7)),
              const SizedBox(width: 6),
              _buildMetricItem('Izin', recap['izin'] ?? 0, const Color(0xFF0284C7), const Color(0xFFE0F2FE)),
              const SizedBox(width: 6),
              _buildMetricItem('Sakit', recap['sakit'] ?? 0, const Color(0xFFD97706), const Color(0xFFFEF3C7)),
              const SizedBox(width: 6),
              _buildMetricItem('Alfa', recap['alfa'] ?? 0, const Color(0xFFDC2626), const Color(0xFFFEE2E2)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricItem(String label, int count, Color color, Color bgColor) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
        decoration: BoxDecoration(
          color: bgColor.withOpacity(0.4),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: bgColor),
        ),
        child: Column(
          children: [
            Text(
              count.toString(),
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: color,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 9.5,
                fontWeight: FontWeight.w600,
                color: color,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterBar(bool isAdmin) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Kolom Pencarian
          Container(
            height: 40,
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: TextField(
              controller: _searchController,
              onChanged: (val) {
                setState(() {
                  _searchQuery = val;
                });
              },
              style: const TextStyle(fontSize: 12.5),
              decoration: InputDecoration(
                hintText: 'Cari mata pelajaran, kelas, atau guru...',
                hintStyle: const TextStyle(fontSize: 12, color: AppColors.textHint),
                prefixIcon: const Icon(Icons.search_rounded, size: 18, color: AppColors.textHint),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 16),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {
                            _searchQuery = '';
                          });
                        },
                      )
                    : null,
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
              ),
            ),
          ),

          const SizedBox(height: 10),

          // 2. Baris Filter: Tanggal & Dropdown
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            child: Row(
              children: [
                // Filter Tanggal
                InkWell(
                  onTap: _pickDateFilter,
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: _selectedDate != null ? AppColors.primaryLight : const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: _selectedDate != null ? AppColors.primary : const Color(0xFFE2E8F0),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.calendar_today_rounded,
                          size: 13,
                          color: _selectedDate != null ? AppColors.primary : AppColors.textSecondary,
                        ),
                        const SizedBox(width: 5),
                        Text(
                          _selectedDate != null
                              ? '${_selectedDate!.split('-')[2]}/${_selectedDate!.split('-')[1]}/${_selectedDate!.split('-')[0]}'
                              : 'Semua Tanggal',
                          style: TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                            color: _selectedDate != null ? AppColors.primary : AppColors.textSecondary,
                          ),
                        ),
                        if (_selectedDate != null) ...[
                          const SizedBox(width: 4),
                          GestureDetector(
                            onTap: () {
                              setState(() {
                                _selectedDate = null;
                              });
                            },
                            child: const Icon(Icons.close_rounded, size: 14, color: AppColors.primary),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),

                const SizedBox(width: 8),

                // Filter Kelas
                _buildDropdownChip(
                  label: 'Kelas: $_selectedClass',
                  value: _selectedClass,
                  options: ['Semua', ...ScheduleService.classOptions],
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedClass = val);
                  },
                ),

                const SizedBox(width: 8),

                // Filter Mata Pelajaran
                _buildDropdownChip(
                  label: 'Mapel: $_selectedSubject',
                  value: _selectedSubject,
                  options: ['Semua', ...ScheduleService.subjectOptions],
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedSubject = val);
                  },
                ),

                if (isAdmin) ...[
                  const SizedBox(width: 8),
                  // Filter Guru (Khusus Admin)
                  _buildDropdownChip(
                    label: 'Guru: $_selectedTeacher',
                    value: _selectedTeacher,
                    options: ['Semua', ...ScheduleService.teacherOptions],
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedTeacher = val);
                    },
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDropdownChip({
    required String label,
    required String value,
    required List<String> options,
    required ValueChanged<String?> onChanged,
  }) {
    final isFiltered = value != 'Semua';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: isFiltered ? AppColors.primaryLight : const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isFiltered ? AppColors.primary : const Color(0xFFE2E8F0),
        ),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          icon: Icon(
            Icons.arrow_drop_down,
            size: 16,
            color: isFiltered ? AppColors.primary : AppColors.textSecondary,
          ),
          style: TextStyle(
            fontSize: 11.5,
            fontWeight: FontWeight.w600,
            color: isFiltered ? AppColors.primary : AppColors.textSecondary,
          ),
          items: options.map((opt) {
            return DropdownMenuItem<String>(
              value: opt,
              child: Text(opt, style: const TextStyle(fontSize: 12)),
            );
          }).toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }

  void _showAttendanceResultModal(LessonAttendanceModel rec) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => AttendanceHistoryDetailPage(
          initialRecord: rec,
          currentUser: widget.currentUser,
        ),
      ),
    );
  }

  Widget _buildAttendanceSessionCard(LessonAttendanceModel rec, bool isAdmin) {
    return InkWell(
      onTap: () => _showAttendanceResultModal(rec),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: const [
          BoxShadow(
            color: Color(0x05000000),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Kartu
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  rec.subject,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  'Kelas ${rec.className}',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 6),

          // Metadata sesi
          Row(
            children: [
              const Icon(Icons.person_outline_rounded, size: 14, color: AppColors.textSecondary),
              const SizedBox(width: 4),
              Text(
                rec.teacherName,
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
              ),
              const SizedBox(width: 10),
              const Icon(Icons.calendar_month_outlined, size: 14, color: AppColors.textSecondary),
              const SizedBox(width: 4),
              Text(
                rec.formattedDate,
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
              const SizedBox(width: 10),
              const Icon(Icons.schedule_rounded, size: 14, color: AppColors.textSecondary),
              const SizedBox(width: 4),
              Text(
                'Jam Ke-${rec.periodNumber}',
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
            ],
          ),

          const Divider(height: 18, color: Color(0xFFF1F5F9)),

          // Breakdown Kehadiran
          Row(
            children: [
              _buildMiniStatusPill('H: ${rec.hadirCount}', const Color(0xFF16A34A), const Color(0xFFDCFCE7)),
              const SizedBox(width: 4),
              _buildMiniStatusPill('I: ${rec.izinCount}', const Color(0xFF0284C7), const Color(0xFFE0F2FE)),
              const SizedBox(width: 4),
              _buildMiniStatusPill('S: ${rec.sakitCount}', const Color(0xFFD97706), const Color(0xFFFEF3C7)),
              const SizedBox(width: 4),
              _buildMiniStatusPill('A: ${rec.alfaCount}', const Color(0xFFDC2626), const Color(0xFFFEE2E2)),
              const Spacer(),

              // Tombol Buka Detail Riwayat (Sesuai Butir 2)
              InkWell(
                onTap: () => _showAttendanceResultModal(rec),
                borderRadius: BorderRadius.circular(6),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.visibility_outlined, size: 13, color: AppColors.textPrimary),
                      SizedBox(width: 3),
                      Text(
                        'Detail',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                      ),
                    ],
                  ),
                ),
              ),

              // Tombol Hapus (KHUSUS ADMIN - Butir 2)
              if (isAdmin) ...[
                InkWell(
                  onTap: () => _confirmDeleteAttendance(rec),
                  borderRadius: BorderRadius.circular(6),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFFFECACA)),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.delete_outline_rounded, size: 13, color: Colors.red),
                        SizedBox(width: 3),
                        Text(
                          'Hapus',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.red),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ],
          ),
        ],
        ),
      ),
    );
  }

  Widget _buildMiniStatusPill(String text, Color color, Color bgColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        text,
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: color),
      ),
    );
  }
}
