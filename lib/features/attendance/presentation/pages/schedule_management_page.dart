import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/feedback_banner.dart';
import '../../../auth/data/models/user_model.dart';
import '../../data/models/schedule_model.dart';
import '../../data/services/schedule_service.dart';
import '../widgets/schedule_card.dart';
import '../widgets/schedule_filter.dart';
import '../widgets/schedule_summary_card.dart';
import 'schedule_detail_page.dart';
import 'schedule_form_page.dart';
import 'attendance_form_page.dart';
import '../../data/services/lesson_attendance_service.dart';

/// Halaman Manajemen Jadwal Pelajaran Pondok Pesantren Islam Darul Hikmah (Sesuai Butir C, D, E, G, I)
/// - Admin: Melihat seluruh jadwal, menambah, mengedit, dan menghapus jadwal
/// - Guru: Hanya melihat jadwal yang ditugaskan kepadanya (read-only)
/// - Ringkasan statistik, filter hari, filter kelas, dan pencarian real-time
/// - Responsif di Android (1 kolom vertikal bebas overflow) dan Web (tampilan lebar optimal)
class ScheduleManagementPage extends StatefulWidget {
  final UserModel? currentUser;
  final UserRole? userRole;
  final int initialTabIndex;

  const ScheduleManagementPage({
    Key? key,
    this.currentUser,
    this.userRole,
    this.initialTabIndex = 0,
  }) : super(key: key);

  @override
  State<ScheduleManagementPage> createState() => _ScheduleManagementPageState();
}

class _ScheduleManagementPageState extends State<ScheduleManagementPage> {
  final _scheduleService = ScheduleService();
  final _attendanceService = LessonAttendanceService();
  final _searchController = TextEditingController();

  String _searchQuery = '';
  String _selectedDay = 'Semua';
  String _selectedClass = 'Semua';

  @override
  void initState() {
    super.initState();
    _scheduleService.addListener(_onServiceUpdate);
  }

  @override
  void dispose() {
    _scheduleService.removeListener(_onServiceUpdate);
    _searchController.dispose();
    super.dispose();
  }

  void _onServiceUpdate() {
    if (mounted) {
      setState(() {});
    }
  }

  UserRole get _role {
    if (widget.currentUser != null) return widget.currentUser!.role;
    if (widget.userRole != null) return widget.userRole!;
    return UserRole.admin;
  }

  bool get _isAdmin => _role == UserRole.admin;

  UserModel? get _user => widget.currentUser;

  void _navigateToAddSchedule() async {
    final result = await Navigator.push<ScheduleModel>(
      context,
      MaterialPageRoute(
        builder: (_) => const ScheduleFormPage(),
      ),
    );

    if (result != null) {
      setState(() {});
    }
  }

  void _navigateToDetail(ScheduleModel schedule) async {
    final result = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (_) => ScheduleDetailPage(
          schedule: schedule,
          currentUserRole: _role,
        ),
      ),
    );

    if (result == true) {
      setState(() {});
    }
  }

  void _navigateToEdit(ScheduleModel schedule) async {
    final result = await Navigator.push<ScheduleModel>(
      context,
      MaterialPageRoute(
        builder: (_) => ScheduleFormPage(schedule: schedule),
      ),
    );

    if (result != null) {
      setState(() {});
    }
  }

  void _confirmDeleteSchedule(ScheduleModel schedule) {
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
          'Apakah Anda yakin ingin menghapus jadwal "${schedule.subject}" kelas ${schedule.className} (${schedule.day}, ${schedule.periodLabel})?\n\nTindakan ini tidak dapat dibatalkan.',
          style: const TextStyle(fontSize: 13.5, color: AppColors.textSecondary, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              final success = _scheduleService.deleteSchedule(schedule.id);
              if (success) {
                FeedbackBanner.showSuccess(
                  context,
                  'Jadwal "${schedule.subject}" (${schedule.className}) berhasil dihapus.',
                );
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

  Future<void> _navigateToAttendance(ScheduleModel schedule) async {
    // Validasi Hak Akses Guru (Sesuai Butir 2 & 5)
    if (!_isAdmin && !_attendanceService.canManageSchedule(user: _user, schedule: schedule)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Akses ditolak: Anda hanya dapat mengisi absensi pada jadwal yang ditugaskan kepada Anda.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => AttendanceFormPage(
          currentUser: _user,
          schedule: schedule,
        ),
      ),
    );

    if (result == true && mounted) {
      setState(() {});
    }
  }

  void _resetFilters() {
    setState(() {
      _searchQuery = '';
      _selectedDay = 'Semua';
      _selectedClass = 'Semua';
      _searchController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    // Ambil data jadwal tersaring sesuai hak akses (Admin: semua, Guru: hanya tugasnya)
    final filteredSchedules = _scheduleService.filterSchedules(
      user: _user,
      query: _searchQuery,
      dayFilter: _selectedDay,
      classFilter: _selectedClass,
    );

    final totalSchedules = _scheduleService.getTotalSchedules(_user);
    final totalClasses = _scheduleService.getTotalClasses(_user);
    final totalTeachers = _scheduleService.getTotalTeachers(_user);

    return Scaffold(
      backgroundColor: AppColors.dashboardBg,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.primary, size: 20),
          tooltip: 'Kembali ke Dashboard',
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          _currentTabIndex == 0
              ? (_isAdmin ? 'Manajemen Jadwal & Absensi' : 'Jadwal Mengajar Santri')
              : (_currentTabIndex == 1 ? 'Riwayat Absensi Santri' : 'Rekap Absensi Santri'),
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
            letterSpacing: -0.2,
          ),
        ),
        centerTitle: false,
        actions: [
          // Tombol Tambah Jadwal KHUSUS Admin pada Tab Jadwal (Sesuai Permintaan & Butir C & E)
          if (_isAdmin && _currentTabIndex == 0)
            Padding(
              padding: const EdgeInsets.only(right: 12.0),
              child: ElevatedButton.icon(
                onPressed: _navigateToAddSchedule,
                icon: const Icon(Icons.add_rounded, size: 18, color: Colors.white),
                label: const Text(
                  'Tambah',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                ),
              ),
            ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final isWideScreen = constraints.maxWidth >= 720;

          return Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1100),
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: EdgeInsets.symmetric(
                  horizontal: isWideScreen ? 24 : 16,
                  vertical: 16,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1. Header Profil Guru (Khusus Guru Pengampu; untuk Admin ditiadakan sesuai instruksi)
                    if (!_isAdmin) ...[
                      _buildTeacherProfileHeader(),
                      const SizedBox(height: 14),
                    ],


                      // 3. Ringkasan Statistik Jadwal
                      ScheduleSummaryCards(
                        totalSchedules: totalSchedules,
                        totalClasses: totalClasses,
                        totalTeachers: totalTeachers,
                      ),

                      const SizedBox(height: 16),

                      // 4. Bilah Pencarian & Filter Jadwal
                      ScheduleFilterBar(
                        searchController: _searchController,
                        selectedDay: _selectedDay,
                        selectedClass: _selectedClass,
                        dayOptions: ScheduleService.dayOptions,
                        classOptions: ['Semua', ...ScheduleService.classOptions],
                        onSearchChanged: (val) {
                          setState(() {
                            _searchQuery = val;
                          });
                        },
                        onDayChanged: (val) {
                          setState(() {
                            _selectedDay = val;
                          });
                        },
                        onClassChanged: (val) {
                          setState(() {
                            _selectedClass = val;
                          });
                        },
                      ),

                      const SizedBox(height: 16),

                      // 5. Daftar Kartu Jadwal Pelajaran Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Daftar Jadwal (${filteredSchedules.length})',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          if (_searchQuery.isNotEmpty || _selectedDay != 'Semua' || _selectedClass != 'Semua')
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

                      // 5. Daftar Kartu Jadwal Pelajaran
                      if (filteredSchedules.isEmpty)
                        _buildEmptyState()
                      else if (isWideScreen)
                        _buildWideScheduleGrid(filteredSchedules)
                      else
                        _buildMobileScheduleList(filteredSchedules),

                      const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTeacherProfileHeader() {
    final teacherName = _user?.fullName ?? _user?.name ?? 'Ustadz Pengajar';
    final initials = teacherName.isNotEmpty
        ? teacherName.split(' ').where((e) => e.isNotEmpty).map((e) => e[0]).take(2).join()
        : 'GP';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
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
      child: Row(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: AppColors.primaryLight,
            child: Text(
              initials,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        teacherName,
                        style: const TextStyle(
                          fontSize: 15.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                          letterSpacing: -0.2,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE0F2FE),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'Guru Pengampu',
                        style: TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF0284C7),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                const Text(
                  'Jadwal pelajaran & pengisian absensi santri yang ditugaskan kepada Anda',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.search_off_rounded, size: 32, color: Colors.grey.shade400),
          ),
          const SizedBox(height: 16),
          const Text(
            'Tidak ada jadwal ditemukan',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMobileScheduleList(List<ScheduleModel> schedules) {
    return Column(
      children: schedules.map((schedule) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: ScheduleCard(
            schedule: schedule,
            isAdmin: _isAdmin,
            onTap: () => _navigateToDetail(schedule),
            onEdit: _isAdmin ? () => _navigateToEdit(schedule) : null,
            onDelete: _isAdmin ? () => _confirmDeleteSchedule(schedule) : null,
            onTakeAttendance: () => _navigateToAttendance(schedule),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildWideScheduleGrid(List<ScheduleModel> schedules) {
    return Wrap(
      spacing: 16,
      runSpacing: 16,
      children: schedules.map((schedule) {
        return SizedBox(
          width: 520,
          child: ScheduleCard(
            schedule: schedule,
            isAdmin: _isAdmin,
            onTap: () => _navigateToDetail(schedule),
            onEdit: _isAdmin ? () => _navigateToEdit(schedule) : null,
            onDelete: _isAdmin ? () => _confirmDeleteSchedule(schedule) : null,
            onTakeAttendance: () => _navigateToAttendance(schedule),
          ),
        );
      }).toList(),
    );
  }
}
