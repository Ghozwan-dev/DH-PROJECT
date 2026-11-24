import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../auth/data/models/user_model.dart';
import '../../data/models/lesson_attendance_model.dart';
import '../../data/services/lesson_attendance_service.dart';
import '../../data/services/schedule_service.dart';
import 'attendance_history_detail_page.dart';
import 'schedule_management_page.dart';

/// Halaman Submenu Riwayat Absensi Santri (Sesuai Butir 1, 2, 4, 5, 6)
/// Komponen:
/// - Header halaman Riwayat Absensi
/// - Ringkasan total sesi absensi & total santri tercatat
/// - Pencarian mata pelajaran atau nama guru
/// - Filter tanggal, filter kelas, filter mata pelajaran, dan filter guru (Admin)
/// - Daftar kartu riwayat (Mapel, Kelas, Guru, Tanggal, Jam, Total Santri, H, I, S, T, A)
/// - Tombol / aksi membuka detail riwayat
/// - Pembatasan Hak Akses:
///   * Admin: Melihat seluruh riwayat, semua filter aktif
///   * Guru Pengampu: Hanya melihat riwayat jadwal miliknya sendiri
class AttendanceHistoryPage extends StatefulWidget {
  final UserModel currentUser;

  const AttendanceHistoryPage({
    Key? key,
    required this.currentUser,
  }) : super(key: key);

  @override
  State<AttendanceHistoryPage> createState() => _AttendanceHistoryPageState();
}

class _AttendanceHistoryPageState extends State<AttendanceHistoryPage> {
  final _attendanceService = LessonAttendanceService();
  final _scheduleService = ScheduleService();

  final _searchController = TextEditingController();

  String _searchQuery = '';
  String? _selectedDate;
  String _selectedClass = 'Semua';
  String _selectedSubject = 'Semua';
  String _selectedTeacher = 'Semua';

  @override
  void initState() {
    super.initState();
    _attendanceService.addListener(_onServiceUpdate);
  }

  @override
  void dispose() {
    _attendanceService.removeListener(_onServiceUpdate);
    _searchController.dispose();
    super.dispose();
  }

  void _onServiceUpdate() {
    if (mounted) {
      setState(() {});
    }
  }

  bool get _isAdmin => widget.currentUser.isAdmin;

  void _resetFilters() {
    setState(() {
      _searchQuery = '';
      _selectedDate = null;
      _selectedClass = 'Semua';
      _selectedSubject = 'Semua';
      _selectedTeacher = 'Semua';
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

  void _navigateToDetail(LessonAttendanceModel record) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => AttendanceHistoryDetailPage(
          initialRecord: record,
          currentUser: widget.currentUser,
        ),
      ),
    );
  }

  Future<void> _confirmDeleteAttendance(LessonAttendanceModel record) async {
    if (!_isAdmin) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: const [
            Icon(Icons.warning_amber_rounded, color: AppColors.error, size: 24),
            SizedBox(width: 8),
            Text('Hapus Riwayat Absensi', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          ],
        ),
        content: Text(
          'Hapus rekaman absensi "${record.subject}" kelas ${record.className} pada tanggal ${record.formattedDate}?\n\nTindakan ini tidak dapat dibatalkan.',
          style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.35),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal', style: TextStyle(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
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

    if (confirm == true) {
      final success = await _attendanceService.deleteAttendance(
        user: widget.currentUser,
        attendanceId: record.id,
      );
      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Riwayat absensi berhasil dihapus.'),
            backgroundColor: AppColors.primary,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // 1. Ambil riwayat tersaring berdasarkan hak akses & filter
    // RBAC: Logika getFilteredHistory sudah mengunci non-admin hanya ke jadwal miliknya sendiri
    final historyList = _attendanceService.getFilteredHistory(
      user: widget.currentUser,
      dateFilter: _selectedDate,
      classFilter: _selectedClass,
      subjectFilter: _selectedSubject,
      teacherFilter: _isAdmin ? _selectedTeacher : null,
      searchQuery: _searchQuery,
    );

    // 2. Hitung Ringkasan Sesi & Santri yang Tercatat
    final totalSessions = historyList.length;
    final totalStudentsRecorded = historyList.fold<int>(0, (sum, rec) => sum + rec.totalStudents);
    final totalHadir = historyList.fold<int>(0, (sum, rec) => sum + rec.hadirCount);
    final totalIzin = historyList.fold<int>(0, (sum, rec) => sum + rec.izinCount);
    final totalSakit = historyList.fold<int>(0, (sum, rec) => sum + rec.sakitCount);
    final totalAlfa = historyList.fold<int>(0, (sum, rec) => sum + rec.alfaCount);

    final hasActiveFilter = _searchQuery.isNotEmpty ||
        _selectedDate != null ||
        _selectedClass != 'Semua' ||
        _selectedSubject != 'Semua' ||
        (_isAdmin && _selectedTeacher != 'Semua');

    return Scaffold(
      backgroundColor: AppColors.dashboardBg,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Riwayat Absensi Santri',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
              ),
            ),
            Text(
              _isAdmin
                  ? 'Administrator • Semua Riwayat'
                  : 'Guru: ${widget.currentUser.fullName}',
              style: const TextStyle(
                fontSize: 11.5,
                fontWeight: FontWeight.w500,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
        actions: [
          // Navigasi cepat ke Manajemen Jadwal / Input Absensi
          IconButton(
            icon: const Icon(Icons.calendar_month_rounded, color: AppColors.primary, size: 22),
            tooltip: 'Ke Jadwal Pelajaran',
            onPressed: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(
                  builder: (_) => ScheduleManagementPage(
                    currentUser: widget.currentUser,
                    userRole: widget.currentUser.role,
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final isWideScreen = constraints.maxWidth >= 720;

          return Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1000),
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: EdgeInsets.symmetric(
                  horizontal: isWideScreen ? 24 : 16,
                  vertical: 16,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1. Header Ringkasan Halaman
                    _buildHeaderSummaryBanner(totalSessions, totalStudentsRecorded),

                    const SizedBox(height: 14),

                    // 2. Baris Mini Stat Status (H, I, S, A)
                    _buildStatusMetricsBar(
                      hadir: totalHadir,
                      izin: totalIzin,
                      sakit: totalSakit,
                      alfa: totalAlfa,
                    ),

                    const SizedBox(height: 16),

                    // 3. Pencarian & Filter Bar
                    _buildSearchAndFilterBar(),

                    const SizedBox(height: 16),

                    // 4. Header Baris Hasil & Reset
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Daftar Riwayat Sesi ($totalSessions)',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        if (hasActiveFilter)
                          TextButton(
                            onPressed: _resetFilters,
                            style: TextButton.styleFrom(
                              padding: EdgeInsets.zero,
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                            child: const Text(
                              'Reset Filter',
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

                    // 5. Daftar Kartu Riwayat Absensi (atau Tampilan Kosong)
                    if (historyList.isEmpty)
                      _buildEmptyState(hasActiveFilter)
                    else
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: historyList.length,
                        itemBuilder: (ctx, idx) {
                          final rec = historyList[idx];
                          return _buildHistoryCard(rec);
                        },
                      ),

                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildHeaderSummaryBanner(int totalSessions, int totalStudents) {
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
      child: Row(
        children: [
          Expanded(
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.history_toggle_drop_down_rounded, color: Color(0xFF2563EB), size: 24),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '$totalSessions',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                        height: 1.1,
                      ),
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'Total Sesi Tersimpan',
                      style: TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Container(width: 1, height: 38, color: const Color(0xFFE2E8F0)),
          const SizedBox(width: 16),
          Expanded(
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFDCFCE7),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.groups_rounded, color: Color(0xFF16A34A), size: 24),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '$totalStudents',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                        height: 1.1,
                      ),
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'Santri Tercatat',
                      style: TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusMetricsBar({
    required int hadir,
    required int izin,
    required int sakit,
    required int alfa,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildMetricPill('Hadir: $hadir', const Color(0xFF16A34A), const Color(0xFFDCFCE7)),
          _buildMetricPill('Izin: $izin', const Color(0xFF0284C7), const Color(0xFFE0F2FE)),
          _buildMetricPill('Sakit: $sakit', const Color(0xFFD97706), const Color(0xFFFEF3C7)),
          _buildMetricPill('Alfa: $alfa', const Color(0xFFDC2626), const Color(0xFFFEE2E2)),
        ],
      ),
    );
  }

  Widget _buildMetricPill(String label, Color color, Color bgColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w800,
          color: color,
        ),
      ),
    );
  }

  Widget _buildSearchAndFilterBar() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Kotak Pencarian Real-Time (Mapel atau Guru)
          Container(
            height: 42,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                const Icon(Icons.search_rounded, size: 20, color: AppColors.textSecondary),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    onChanged: (val) {
                      setState(() {
                        _searchQuery = val;
                      });
                    },
                    style: const TextStyle(fontSize: 13),
                    decoration: const InputDecoration(
                      hintText: 'Cari mata pelajaran atau nama guru...',
                      hintStyle: TextStyle(fontSize: 12.5, color: AppColors.textHint),
                      border: InputBorder.none,
                      isDense: true,
                    ),
                  ),
                ),
                if (_searchQuery.isNotEmpty)
                  InkWell(
                    onTap: () {
                      _searchController.clear();
                      setState(() {
                        _searchQuery = '';
                      });
                    },
                    child: const Icon(Icons.close_rounded, size: 18, color: AppColors.textSecondary),
                  ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // 2. Filter Horisontal: Tanggal, Kelas, Mapel, Guru
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
                        color: _selectedDate != null ? AppColors.primary : const Color(0xFFCBD5E1),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.date_range_rounded,
                          size: 14,
                          color: _selectedDate != null ? AppColors.primary : AppColors.textSecondary,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          _selectedDate != null ? _selectedDate! : 'Pilih Tanggal',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: _selectedDate != null ? AppColors.primary : AppColors.textPrimary,
                          ),
                        ),
                        if (_selectedDate != null) ...[
                          const SizedBox(width: 4),
                          InkWell(
                            onTap: () {
                              setState(() {
                                _selectedDate = null;
                              });
                            },
                            child: const Icon(Icons.close, size: 14, color: AppColors.primary),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),

                const SizedBox(width: 8),

                // Filter Kelas
                _buildDropdownChip(
                  label: 'Kelas',
                  currentValue: _selectedClass,
                  options: ['Semua', ...ScheduleService.classOptions],
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedClass = val);
                  },
                ),

                const SizedBox(width: 8),

                // Filter Mata Pelajaran
                _buildDropdownChip(
                  label: 'Mapel',
                  currentValue: _selectedSubject,
                  options: ['Semua', ...ScheduleService.subjectOptions],
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedSubject = val);
                  },
                ),

                // Filter Guru (Hanya untuk Admin)
                if (_isAdmin) ...[
                  const SizedBox(width: 8),
                  _buildDropdownChip(
                    label: 'Guru',
                    currentValue: _selectedTeacher,
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
    required String currentValue,
    required List<String> options,
    required ValueChanged<String?> onChanged,
  }) {
    final isFiltered = currentValue != 'Semua';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: isFiltered ? AppColors.primaryLight : const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isFiltered ? AppColors.primary : const Color(0xFFCBD5E1),
        ),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: currentValue,
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
              child: Text(
                opt == 'Semua' ? '$label: Semua' : opt,
                style: const TextStyle(fontSize: 12),
              ),
            );
          }).toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }

  Widget _buildEmptyState(bool isFiltered) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.assignment_late_outlined,
              size: 32,
              color: Color(0xFF94A3B8),
            ),
          ),
          const SizedBox(height: 14),
          Text(
            isFiltered
                ? 'Tidak ada riwayat absensi yang cocok'
                : 'Belum ada riwayat absensi santri',
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 6),
          Text(
            isFiltered
                ? 'Silakan coba sesuaikan pencarian atau atur ulang filter Anda.'
                : 'Catatan kehadiran akan otomatis muncul setelah absensi sesi pelajaran disimpan.',
            style: const TextStyle(
              fontSize: 12.5,
              color: AppColors.textSecondary,
              height: 1.35,
            ),
            textAlign: TextAlign.center,
          ),
          if (isFiltered) ...[
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _resetFilters,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                elevation: 0,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text('Reset Filter', style: TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700)),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildHistoryCard(LessonAttendanceModel rec) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
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
      child: InkWell(
        onTap: () => _navigateToDetail(rec),
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Header Kartu: Nama Mapel & Badge Kelas
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      rec.subject,
                      style: const TextStyle(
                        fontSize: 15.5,
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
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 6),

              // 2. Metadata: Nama Guru, Tanggal, Jam Pelajaran, Total Santri
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

              // 3. Status Kehadiran (Hadir, Izin, Sakit, Terlambat: 0, Alfa) & Tombol Detail
              Row(
                children: [
                  _buildMiniPill('H: ${rec.hadirCount}', const Color(0xFF16A34A), const Color(0xFFDCFCE7)),
                  const SizedBox(width: 4),
                  _buildMiniPill('I: ${rec.izinCount}', const Color(0xFF0284C7), const Color(0xFFE0F2FE)),
                  const SizedBox(width: 4),
                  _buildMiniPill('S: ${rec.sakitCount}', const Color(0xFFD97706), const Color(0xFFFEF3C7)),
                  const SizedBox(width: 4),
                  _buildMiniPill('A: ${rec.alfaCount}', const Color(0xFFDC2626), const Color(0xFFFEE2E2)),
                  const SizedBox(width: 6),
                  Text(
                    '(${rec.totalStudents} Santri)',
                    style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                  ),
                  const Spacer(),

                  // Tombol Detail Riwayat
                  InkWell(
                    onTap: () => _navigateToDetail(rec),
                    borderRadius: BorderRadius.circular(6),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        children: const [
                          Icon(Icons.visibility_outlined, size: 13, color: AppColors.textPrimary),
                          SizedBox(width: 4),
                          Text(
                            'Detail',
                            style: TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Aksi Hapus Khusus Admin
                  if (_isAdmin) ...[
                    const SizedBox(width: 6),
                    InkWell(
                      onTap: () => _confirmDeleteAttendance(rec),
                      borderRadius: BorderRadius.circular(6),
                      child: Container(
                        padding: const EdgeInsets.all(5),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF2F2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Icon(Icons.delete_outline_rounded, size: 14, color: AppColors.error),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMiniPill(String text, Color color, Color bgColor) {
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
