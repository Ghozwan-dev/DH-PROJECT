import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../auth/data/models/user_model.dart';
import '../../../auth/data/services/auth_service.dart';
import '../../data/models/attendance_models.dart';
import '../../data/services/attendance_service.dart';
import '../widgets/attendance_summary_card.dart';
import '../widgets/custom_bottom_nav_bar.dart';
import '../widgets/feature_placeholder_modal.dart';
import '../widgets/home_header.dart';
import '../widgets/main_menu_grid.dart';
import '../widgets/recent_activities_card.dart';
import '../widgets/welcome_hero_banner.dart';
import '../../../students/presentation/pages/student_list_page.dart';
import '../../../attendance/presentation/pages/schedule_management_page.dart';
import '../../../attendance/presentation/widgets/attendance_menu_sheet.dart';

/// Halaman Utama (Homepage) Aplikasi Absensi Darul Hikmah (Sesuai Butir 1-11):
/// - Mendukung tampilan untuk Peran Admin dan Guru
/// - Desain, tata letak, warna, dan komponen presisi sesuai gambar referensi
class HomePage extends StatefulWidget {
  final UserModel currentUser;

  const HomePage({
    Key? key,
    required this.currentUser,
  }) : super(key: key);

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late UserModel _user;
  final _attendanceService = AttendanceService();
  final _authService = AuthService();

  AttendanceFilter _currentFilter = AttendanceFilter.today;
  int _currentBottomNavIndex = 0;

  @override
  void initState() {
    super.initState();
    _user = widget.currentUser;
  }

  void _handleRoleChange(UserRole newRole) {
    if (_user.role == newRole) return;
    setState(() {
      _user = UserModel(
        id: _user.id,
        fullName: newRole == UserRole.admin ? 'Administrator Pondok' : 'Ustadz Ahmad Fauzi',
        username: newRole == UserRole.admin ? 'admin' : 'ustadz_ahmad',
        email: newRole == UserRole.admin
            ? 'admin@darulhikmah.ponpes.id'
            : 'ahmad.fauzi@darulhikmah.ponpes.id',
        phoneNumber: _user.phoneNumber,
        passwordHash: _user.passwordHash,
        role: newRole,
        createdAt: _user.createdAt,
      );
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Beralih ke mode tampilan: ${newRole.label}'),
        backgroundColor: AppColors.primary,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _handleLogout() {
    _authService.logout();
    Navigator.of(context).pushNamedAndRemoveUntil(
      AppConstants.routeLogin,
      (route) => false,
    );
  }

  void _handleMenuTap(String title, String featureCode) {
    if (featureCode == 'data_santri') {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => StudentListPage(currentUserRole: _user.role),
        ),
      );
      return;
    }

    if (featureCode == 'absensi') {
      AttendanceMenuSheet.show(context, currentUser: _user);
      return;
    }

    FeaturePlaceholderModal.show(
      context,
      title: title,
      featureCode: featureCode,
      userRole: _user.role,
    );
  }

  void _handleViewAllActivities() {
    final allActivities = _attendanceService.getRecentActivities(
      role: _user.role,
      limit: 10,
    );

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(context).size.height * 0.72,
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Riwayat Aktivitas Absensi',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const Divider(),
            Expanded(
              child: ListView.separated(
                itemCount: allActivities.length,
                separatorBuilder: (_, __) => const Divider(height: 16),
                itemBuilder: (_, index) {
                  final act = allActivities[index];
                  return ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: CircleAvatar(
                      backgroundColor: act.status.backgroundColor,
                      child: Icon(
                        act.status == AttendanceStatus.hadir
                            ? Icons.check
                            : act.status == AttendanceStatus.izin
                                ? Icons.priority_high
                                : Icons.close,
                        color: act.status.color,
                        size: 20,
                      ),
                    ),
                    title: Text(
                      act.studentName,
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    subtitle: Text('${act.status.label} • ${act.className}'),
                    trailing: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          act.time,
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                        Text(
                          act.timeLabel,
                          style: const TextStyle(fontSize: 11, color: AppColors.textHint),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleBottomNavSelected(int index) {
    if (index == 0) {
      setState(() {
        _currentBottomNavIndex = 0;
      });
      return;
    }

    // Navigasi tab selain Beranda
    final labels = ['Beranda', 'Absensi', 'Laporan', 'Pengaturan'];
    final codes = ['beranda', 'absensi', 'laporan', 'pengaturan'];
    _handleMenuTap(labels[index], codes[index]);
  }

  @override
  Widget build(BuildContext context) {
    final summary = _attendanceService.getSummary(
      role: _user.role,
      filter: _currentFilter,
    );
    final activities = _attendanceService.getRecentActivities(
      role: _user.role,
      limit: 3,
    );

    return Scaffold(
      backgroundColor: AppColors.dashboardBg,
      body: SafeArea(
        top: false, // Membiarkan header hijau menyentuh status bar
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Area Atas Berlatar Belakang Hijau Tua (Header + Welcome Banner)
                    Container(
                      color: const Color(0xFF074724),
                      child: SafeArea(
                        bottom: false,
                        child: Column(
                          children: [
                            // 2. Header Aplikasi: Logo, Nama, Tulisan Pesantren, Profil & Dropdown Role
                            HomeHeader(
                              currentUser: _user,
                              onRoleChanged: _handleRoleChange,
                              onLogout: _handleLogout,
                            ),
                          ],
                        ),
                      ),
                    ),

                    // 3. Welcome Section dengan Gedung Pesantren & Lengkungan Emas
                    const WelcomeHeroBanner(),

                    const SizedBox(height: 16),

                    // 4. Menu Utama (4 Menu dalam Satu Baris)
                    MainMenuGrid(
                      userRole: _user.role,
                      onMenuTap: _handleMenuTap,
                    ),

                    const SizedBox(height: 18),

                    // 5. Ringkasan Absensi (Hadir, Izin, Alpha)
                    AttendanceSummaryCard(
                      summary: summary,
                      onFilterChanged: (newFilter) {
                        setState(() {
                          _currentFilter = newFilter;
                        });
                      },
                    ),

                    const SizedBox(height: 18),

                    // 6. Aktivitas Terakhir (Maks 3 Baris)
                    RecentActivitiesCard(
                      activities: activities,
                      onViewAllTap: _handleViewAllActivities,
                    ),

                    const SizedBox(height: 28),
                  ],
                ),
              ),
            ),

            // 7. Bottom Navigation Bar Tetap di Bawah
            CustomBottomNavBar(
              currentIndex: _currentBottomNavIndex,
              onTabSelected: _handleBottomNavSelected,
            ),
          ],
        ),
      ),
    );
  }
}
