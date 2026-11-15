import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

/// Widget Kartu Ringkasan Jadwal Pelajaran (Sesuai Butir C.2 & H):
/// - Menampilkan 3 kartu ringkasan:
///   1. Total Jadwal
///   2. Total Kelas
///   3. Total Guru Pengampu
class ScheduleSummaryCards extends StatelessWidget {
  final int totalSchedules;
  final int totalClasses;
  final int totalTeachers;

  const ScheduleSummaryCards({
    Key? key,
    required this.totalSchedules,
    required this.totalClasses,
    required this.totalTeachers,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // 1. Total Jadwal
        Expanded(
          child: _buildMiniCard(
            title: 'Total Jadwal',
            count: totalSchedules,
            icon: Icons.calendar_month_rounded,
            color: AppColors.primary,
            bgColor: AppColors.primaryLight,
          ),
        ),
        const SizedBox(width: 10),

        // 2. Total Kelas
        Expanded(
          child: _buildMiniCard(
            title: 'Total Kelas',
            count: totalClasses,
            icon: Icons.school_rounded,
            color: const Color(0xFF0284C7),
            bgColor: const Color(0xFFE0F2FE),
          ),
        ),
        const SizedBox(width: 10),

        // 3. Total Guru Pengampu
        Expanded(
          child: _buildMiniCard(
            title: 'Total Guru',
            count: totalTeachers,
            icon: Icons.person_outline_rounded,
            color: const Color(0xFFD97706),
            bgColor: const Color(0xFFFEF3C7),
          ),
        ),
      ],
    );
  }

  Widget _buildMiniCard({
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
            blurRadius: 8,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(7),
            decoration: BoxDecoration(
              color: bgColor,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 16, color: color),
          ),
          const SizedBox(height: 8),
          Text(
            count.toString(),
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
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
    );
  }
}
