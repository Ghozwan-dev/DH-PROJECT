import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../auth/data/models/user_model.dart';
import '../../data/models/student_attendance_recap_model.dart';
import '../../data/services/lesson_attendance_service.dart';
import '../pages/student_attendance_recap_detail_page.dart';

/// Tampilan Rekap Absensi Per Santri (Khusus Admin)
/// Mengagregasi data absensi seluruh santri dari sumber absensi yang sama secara real-time.
class StudentAttendanceRecapView extends StatefulWidget {
  final UserModel currentUser;

  const StudentAttendanceRecapView({
    Key? key,
    required this.currentUser,
  }) : super(key: key);

  @override
  State<StudentAttendanceRecapView> createState() => _StudentAttendanceRecapViewState();
}

class _StudentAttendanceRecapViewState extends State<StudentAttendanceRecapView> {
  final _attendanceService = LessonAttendanceService();
  final _searchController = TextEditingController();

  String _selectedClass = 'Semua';
  DateTime? _startDate;
  DateTime? _endDate;

  final List<String> _classOptions = [
    'Semua',
    'VII A',
    'VII B',
    'VIII A',
    'VIII B',
    'IX A',
    'IX B',
  ];

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() => setState(() {}));
    _attendanceService.addListener(_onDataChanged);
  }

  void _onDataChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _searchController.dispose();
    _attendanceService.removeListener(_onDataChanged);
    super.dispose();
  }

  Future<void> _selectDateRange() async {
    final now = DateTime.now();
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2025, 1, 1),
      lastDate: DateTime(2030, 12, 31),
      initialDateRange: _startDate != null && _endDate != null
          ? DateTimeRange(start: _startDate!, end: _endDate!)
          : null,
      builder: (context, child) {
        return Theme(
          data: ThemeData.light().copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.primary,
              onPrimary: Colors.white,
              surface: Colors.white,
              onSurface: AppColors.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _startDate = picked.start;
        _endDate = picked.end;
      });
    }
  }

  void _resetFilters() {
    setState(() {
      _searchController.clear();
      _selectedClass = 'Semua';
      _startDate = null;
      _endDate = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    // 1. ATURAN AKSES: Khusus Administrator Pondok
    if (!widget.currentUser.isAdmin) {
      return Container(
        padding: const EdgeInsets.all(24),
        alignment: Alignment.center,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            Icon(Icons.gpp_bad_rounded, size: 56, color: AppColors.error),
            SizedBox(height: 12),
            Text(
              'Akses Terbatas',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
              ),
            ),
            SizedBox(height: 6),
            Text(
              'Rekap absensi santri hanya dapat diakses oleh Administrator Pondok.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
          ],
        ),
      );
    }

    // 2. Ambil data rekap dari service
    final recapList = _attendanceService.getStudentRecapList(
      user: widget.currentUser,
      classFilter: _selectedClass,
      searchQuery: _searchController.text,
      startDate: _startDate,
      endDate: _endDate,
    );

    // Hitung ringkasan global
    final totalStudents = recapList.length;
    final totalAllMeetings = recapList.fold<int>(0, (sum, r) => sum + r.totalMeetings);
    final totalAllHadir = recapList.fold<int>(0, (sum, r) => sum + r.hadirCount);
    final avgPercentage = totalAllMeetings == 0 ? 0.0 : ((totalAllHadir / totalAllMeetings) * 100.0);

    final hasActiveFilter = _searchController.text.trim().isNotEmpty ||
        _selectedClass != 'Semua' ||
        _startDate != null ||
        _endDate != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // 1. Ringkasan Global Metrik Rekap
        _buildSummaryHeader(
          totalStudents: totalStudents,
          totalMeetings: totalAllMeetings,
          avgPercentage: avgPercentage,
        ),

        const SizedBox(height: 14),

        // 2. Filter & Pencarian
        _buildFilterBar(),

        const SizedBox(height: 12),

        // 3. Status Bar Hasil
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Daftar Santri ($totalStudents)',
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            if (hasActiveFilter)
              GestureDetector(
                onTap: _resetFilters,
                child: const Text(
                  'Reset Filter',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
              ),
          ],
        ),

        const SizedBox(height: 10),

        // 4. Daftar Kartu Rekap Santri
        if (recapList.isEmpty)
          _buildEmptyState()
        else
          ...recapList.map((recap) => _buildStudentRecapCard(recap)),
      ],
    );
  }

  Widget _buildSummaryHeader({
    required int totalStudents,
    required int totalMeetings,
    required double avgPercentage,
  }) {
    final formattedAvg = totalMeetings == 0
        ? '0%'
        : (avgPercentage % 1 == 0 ? '${avgPercentage.toInt()}%' : '${avgPercentage.toStringAsFixed(1)}%');

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 10,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: _buildMetricTile(
              label: 'Santri Terdata',
              value: '$totalStudents',
              color: AppColors.primary,
            ),
          ),
          Container(width: 1, height: 36, color: const Color(0xFFF1F5F9)),
          Expanded(
            child: _buildMetricTile(
              label: 'Total Sesi Santri',
              value: '$totalMeetings',
              color: const Color(0xFF0284C7),
            ),
          ),
          Container(width: 1, height: 36, color: const Color(0xFFF1F5F9)),
          Expanded(
            child: _buildMetricTile(
              label: 'Rata-rata Kehadiran',
              value: formattedAvg,
              color: avgPercentage >= 85.0 ? const Color(0xFF16A34A) : const Color(0xFFD97706),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricTile({
    required String label,
    required String value,
    required Color color,
  }) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: color,
          ),
        ),
        const SizedBox(height: 3),
        Text(
          label,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildFilterBar() {
    final hasDateFilter = _startDate != null && _endDate != null;
    String dateRangeLabel = 'Semua Tanggal';
    if (hasDateFilter) {
      final s = _startDate!;
      final e = _endDate!;
      dateRangeLabel = '${s.day}/${s.month} - ${e.day}/${e.month}/${e.year}';
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        children: [
          // Baris 1: Pencarian Nama atau NIS
          Container(
            height: 42,
            padding: const EdgeInsets.symmetric(horizontal: 10),
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
                    decoration: const InputDecoration(
                      hintText: 'Cari nama santri atau NIS...',
                      hintStyle: TextStyle(fontSize: 12.5, color: AppColors.textHint),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.zero,
                    ),
                    style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
                  ),
                ),
                if (_searchController.text.isNotEmpty)
                  GestureDetector(
                    onTap: () => _searchController.clear(),
                    child: const Icon(Icons.close_rounded, size: 16, color: AppColors.textSecondary),
                  ),
              ],
            ),
          ),

          const SizedBox(height: 10),

          // Baris 2: Filter Kelas & Filter Periode Tanggal
          Row(
            children: [
              // Filter Kelas
              Expanded(
                flex: 4,
                child: Container(
                  height: 38,
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedClass,
                      isDense: true,
                      icon: const Icon(Icons.arrow_drop_down, color: AppColors.textSecondary),
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                      items: _classOptions.map((c) => DropdownMenuItem(value: c, child: Text(c == 'Semua' ? 'Kelas: Semua' : 'Kelas $c'))).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _selectedClass = val);
                      },
                    ),
                  ),
                ),
              ),

              const SizedBox(width: 8),

              // Filter Periode Tanggal
              Expanded(
                flex: 5,
                child: InkWell(
                  onTap: _selectDateRange,
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    height: 38,
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    decoration: BoxDecoration(
                      color: hasDateFilter ? AppColors.primaryLight : const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: hasDateFilter ? AppColors.primary : const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.date_range_rounded,
                          size: 14,
                          color: hasDateFilter ? AppColors.primary : AppColors.textSecondary,
                        ),
                        const SizedBox(width: 5),
                        Flexible(
                          child: Text(
                            dateRangeLabel,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: hasDateFilter ? FontWeight.w700 : FontWeight.w600,
                              color: hasDateFilter ? AppColors.primary : AppColors.textSecondary,
                            ),
                          ),
                        ),
                        if (hasDateFilter) ...[
                          const SizedBox(width: 4),
                          GestureDetector(
                            onTap: () {
                              setState(() {
                                _startDate = null;
                                _endDate = null;
                              });
                            },
                            child: const Icon(Icons.close_rounded, size: 14, color: AppColors.primary),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStudentRecapCard(StudentAttendanceRecapModel recap) {
    final student = recap.student;
    final indColor = Color(recap.indicatorColorHex);
    final indBg = Color(recap.indicatorBgHex);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => StudentAttendanceRecapDetailPage(recap: recap),
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Baris Atas: Avatar, Identitas, dan Persentase Badge
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Avatar Inisial
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: student.gender.backgroundColor,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        student.fullName.isNotEmpty ? student.fullName[0].toUpperCase() : 'S',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          color: student.gender.color,
                        ),
                      ),
                    ),

                    const SizedBox(width: 10),

                    // Nama, NIS, Kelas
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            student.fullName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 14.5,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              Text(
                                'NIS: ${student.nis}',
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                              const SizedBox(width: 6),
                              const Text('•', style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 11)),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                decoration: BoxDecoration(
                                  color: AppColors.primaryLight,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  'Kelas ${student.className}',
                                  style: const TextStyle(
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    // Badge Persentase
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: indBg,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        recap.formattedPercentage,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: indColor,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 10),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                const SizedBox(height: 10),

                // Baris Bawah: Total Sesi & 4 Pills Status (H, I, S, A)
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${recap.totalMeetings} Sesi Tercatat',
                      style: const TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    Row(
                      children: [
                        _buildStatusMiniPill('H: ${recap.hadirCount}', const Color(0xFF16A34A), const Color(0xFFDCFCE7)),
                        const SizedBox(width: 4),
                        _buildStatusMiniPill('I: ${recap.izinCount}', const Color(0xFF0284C7), const Color(0xFFE0F2FE)),
                        const SizedBox(width: 4),
                        _buildStatusMiniPill('S: ${recap.sakitCount}', const Color(0xFFD97706), const Color(0xFFFEF3C7)),
                        const SizedBox(width: 4),
                        _buildStatusMiniPill('A: ${recap.alfaCount}', const Color(0xFFDC2626), const Color(0xFFFEE2E2)),
                        const SizedBox(width: 6),
                        const Icon(
                          Icons.arrow_forward_ios_rounded,
                          size: 12,
                          color: Color(0xFF94A3B8),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusMiniPill(String label, Color color, Color bgColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10.5,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(36),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
      ),
      alignment: Alignment.center,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: const [
          Icon(Icons.search_off_rounded, size: 48, color: AppColors.textHint),
          SizedBox(height: 12),
          Text(
            'Tidak Ada Santri Ditemukan',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          SizedBox(height: 6),
          Text(
            'Coba sesuaikan kata kunci pencarian, filter kelas, atau rentang tanggal.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}
