import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../auth/data/models/user_model.dart';
import '../../data/models/student_model.dart';
import '../../data/services/student_service.dart';
import '../widgets/student_card.dart';
import '../widgets/student_filter.dart';
import '../widgets/student_search_bar.dart';
import 'student_detail_page.dart';
import 'student_form_page.dart';

/// Halaman Daftar Santri Darul Hikmah (Sesuai Butir C & D):
/// - Header dengan judul, deskripsi, dan total santri
/// - Ringkasan: Total, Putra, Putri
/// - Pencarian (Nama / NIS) & Filter (Kelas & Gender)
/// - Desain responsif: 1 kolom di Android/Mobile, multi-kolom di Web
/// - Hak Akses: Admin memiliki tombol Tambah Santri, Guru hanya melihat data
class StudentListPage extends StatefulWidget {
  final UserRole currentUserRole;

  const StudentListPage({
    Key? key,
    required this.currentUserRole,
  }) : super(key: key);

  @override
  State<StudentListPage> createState() => _StudentListPageState();
}

class _StudentListPageState extends State<StudentListPage> {
  final _studentService = StudentService();
  final _searchController = TextEditingController();

  String _searchQuery = '';
  String _selectedGrade = 'Semua';
  SantriGender? _selectedGender;

  @override
  void initState() {
    super.initState();
    _studentService.addListener(_onServiceUpdate);
  }

  @override
  void dispose() {
    _studentService.removeListener(_onServiceUpdate);
    _searchController.dispose();
    super.dispose();
  }

  void _onServiceUpdate() {
    if (mounted) {
      setState(() {});
    }
  }

  bool get _isAdmin => widget.currentUserRole == UserRole.admin;

  void _navigateToDetail(StudentModel student) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => StudentDetailPage(
          student: student,
          currentUserRole: widget.currentUserRole,
        ),
      ),
    );

    if (result == true) {
      setState(() {});
    }
  }

  void _navigateToAddStudent() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => const StudentFormPage(),
      ),
    );

    if (result == true) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    final filteredStudents = _studentService.filterStudents(
      query: _searchQuery,
      gradeFilter: _selectedGrade,
      genderFilter: _selectedGender,
    );

    return Scaffold(
      backgroundColor: AppColors.dashboardBg,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.primary, size: 20),
          tooltip: 'Kembali ke Beranda',
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Data Santri',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
            letterSpacing: -0.2,
          ),
        ),
        centerTitle: false,
        actions: [
          // Tombol Tambah Santri Khusus Role Admin (Sesuai Butir D)
          if (_isAdmin)
            Padding(
              padding: const EdgeInsets.only(right: 12.0),
              child: ElevatedButton.icon(
                onPressed: _navigateToAddStudent,
                icon: const Icon(Icons.add_rounded, size: 18, color: Colors.white),
                label: const Text(
                  'Tambah',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final isWideScreen = constraints.maxWidth >= 700;

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
                    // 1. Header Informasi Halaman
                    _buildPageHeader(),

                    const SizedBox(height: 16),

                    // 2. Tiga Kartu Ringkasan (Total, Putra, Putri)
                    _buildSummarySection(),

                    const SizedBox(height: 16),

                    // 3. Pencarian & Filter
                    StudentSearchBar(
                      controller: _searchController,
                      onChanged: (val) => setState(() => _searchQuery = val),
                      onClear: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                      },
                    ),

                    const SizedBox(height: 12),

                    StudentFilterBar(
                      selectedGrade: _selectedGrade,
                      selectedGender: _selectedGender,
                      onGradeChanged: (val) => setState(() => _selectedGrade = val),
                      onGenderChanged: (val) => setState(() => _selectedGender = val),
                    ),

                    const SizedBox(height: 18),

                    // Keterangan Hasil Pencarian
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Daftar Santri (${filteredStudents.length})',
                          style: const TextStyle(
                            fontSize: 14.5,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        if (_searchQuery.isNotEmpty || _selectedGrade != 'Semua' || _selectedGender != null)
                          TextButton(
                            onPressed: () {
                              _searchController.clear();
                              setState(() {
                                _searchQuery = '';
                                _selectedGrade = 'Semua';
                                _selectedGender = null;
                              });
                            },
                            style: TextButton.styleFrom(
                              padding: EdgeInsets.zero,
                              minimumSize: const Size(50, 30),
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                            child: const Text(
                              'Reset Filter',
                              style: TextStyle(fontSize: 12, color: AppColors.error),
                            ),
                          ),
                      ],
                    ),

                    const SizedBox(height: 10),

                    // 5. Daftar Kartu Santri (Responsif Web vs Mobile)
                    if (filteredStudents.isEmpty)
                      _buildEmptyState()
                    else if (isWideScreen)
                      _buildGridView(filteredStudents, constraints.maxWidth)
                    else
                      _buildListView(filteredStudents),

                    const SizedBox(height: 60), // Spasi aman untuk FAB
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildPageHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF1F5F9), width: 1),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.people_alt_rounded, color: AppColors.primary, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Basis Data Santri',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  _isAdmin
                      ? 'Kelola data seluruh santri, kamar asrama, dan perwalian pondok.'
                      : 'Melihat data dan informasi santri Pondok Pesantren Islam Darul Hikmah.',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummarySection() {
    final total = _studentService.totalCount;
    final male = _studentService.maleCount;
    final female = _studentService.femaleCount;

    return Row(
      children: [
        Expanded(
          child: _buildMiniStatCard(
            title: 'Total Santri',
            count: total,
            icon: Icons.groups_rounded,
            color: AppColors.primary,
            bgColor: AppColors.primaryLight,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _buildMiniStatCard(
            title: 'Santri Putra',
            count: male,
            icon: Icons.male_rounded,
            color: AppColors.genderMale,
            bgColor: AppColors.genderMaleBg,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _buildMiniStatCard(
            title: 'Santri Putri',
            count: female,
            icon: Icons.female_rounded,
            color: AppColors.genderFemale,
            bgColor: AppColors.genderFemaleBg,
          ),
        ),
      ],
    );
  }

  Widget _buildMiniStatCard({
    required String title,
    required int count,
    required IconData icon,
    required Color color,
    required Color bgColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFF1F5F9), width: 1),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            offset: Offset(0, 2),
            blurRadius: 6,
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: bgColor,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  count.toString(),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                    height: 1.1,
                  ),
                ),
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildListView(List<StudentModel> list) {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: list.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final item = list[index];
        return StudentCard(
          student: item,
          onTap: () => _navigateToDetail(item),
        );
      },
    );
  }

  Widget _buildGridView(List<StudentModel> list, double maxWidth) {
    final crossAxisCount = maxWidth >= 950 ? 3 : 2;

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        mainAxisExtent: 115,
      ),
      itemCount: list.length,
      itemBuilder: (context, index) {
        final item = list[index];
        return StudentCard(
          student: item,
          onTap: () => _navigateToDetail(item),
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 20),
      alignment: Alignment.center,
      child: Column(
        children: const [
          Icon(Icons.search_off_rounded, size: 54, color: AppColors.textHint),
          SizedBox(height: 12),
          Text(
            'Santri Tidak Ditemukan',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          SizedBox(height: 4),
          Text(
            'Tidak ada data santri yang sesuai dengan kata kunci atau filter saat ini.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 13, color: AppColors.textMuted),
          ),
        ],
      ),
    );
  }
}
