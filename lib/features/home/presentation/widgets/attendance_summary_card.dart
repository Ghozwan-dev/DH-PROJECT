import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../data/models/attendance_models.dart';

/// Widget Kartu Ringkasan Absensi (Sesuai Butir 5):
/// - Header kartu hijau tua dengan judul "Ringkasan Absensi"
/// - Filter tanggal interaktif (Hari Ini, Kemarin, Pekan Ini)
/// - 3 kolom horizontal: Hadir (hijau), Izin (oranye), Alpha (merah)
/// - Perhitungan terbarui otomatis sesuai filter yang dipilih
class AttendanceSummaryCard extends StatelessWidget {
  final AttendanceSummaryModel summary;
  final ValueChanged<AttendanceFilter> onFilterChanged;

  const AttendanceSummaryCard({
    Key? key,
    required this.summary,
    required this.onFilterChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0E000000),
              offset: Offset(0, 4),
              blurRadius: 14,
              spreadRadius: 0,
            ),
          ],
        ),
        child: Column(
          children: [
            // Header Kartu Hijau Tua dengan Filter
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Judul dengan Ikon Bar Chart
                  Row(
                    children: const [
                      Icon(Icons.bar_chart_rounded, color: Colors.white, size: 22),
                      SizedBox(width: 8),
                      Text(
                        'Ringkasan Absensi',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                          letterSpacing: -0.2,
                        ),
                      ),
                    ],
                  ),

                  // Pill Filter Tanggal (Dropdown)
                  PopupMenuButton<AttendanceFilter>(
                    initialValue: summary.filter,
                    offset: const Offset(0, 36),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    onSelected: onFilterChanged,
                    itemBuilder: (context) => AttendanceFilter.values.map((filter) {
                      final isSelected = filter == summary.filter;
                      return PopupMenuItem<AttendanceFilter>(
                        value: filter,
                        child: Row(
                          children: [
                            Text(
                              filter.label,
                              style: TextStyle(
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                color: isSelected ? AppColors.primary : AppColors.textPrimary,
                              ),
                            ),
                            if (isSelected) ...[
                              const Spacer(),
                              const Icon(Icons.check, color: AppColors.primary, size: 18),
                            ],
                          ],
                        ),
                      );
                    }).toList(),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.18),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.white.withOpacity(0.3), width: 0.8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            summary.filter.label,
                            style: const TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(
                            Icons.keyboard_arrow_down_rounded,
                            color: Colors.white,
                            size: 16,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // 3 Kolom Statistik Horizontal (Hadir, Izin, Alpha)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 18.0, horizontal: 8.0),
              child: Row(
                children: [
                  // 1. Hadir (Hijau)
                  Expanded(
                    child: _buildStatColumn(
                      icon: Icons.person_rounded,
                      iconColor: AppColors.attendancePresent,
                      circleBg: AppColors.attendancePresentBg,
                      count: summary.presentCount,
                      label: 'Hadir',
                      labelColor: AppColors.attendancePresent,
                    ),
                  ),

                  // Garis Pemisah Vertikal
                  Container(
                    width: 1,
                    height: 52,
                    color: AppColors.divider,
                  ),

                  // 2. Izin (Oranye)
                  Expanded(
                    child: _buildStatColumn(
                      icon: Icons.access_time_filled_rounded,
                      iconColor: AppColors.attendancePermission,
                      circleBg: AppColors.attendancePermissionBg,
                      count: summary.permissionCount,
                      label: 'Izin',
                      labelColor: AppColors.attendancePermission,
                    ),
                  ),

                  // Garis Pemisah Vertikal
                  Container(
                    width: 1,
                    height: 52,
                    color: AppColors.divider,
                  ),

                  // 3. Alpha (Merah)
                  Expanded(
                    child: _buildStatColumn(
                      icon: Icons.close_rounded,
                      iconColor: AppColors.attendanceAbsent,
                      circleBg: AppColors.attendanceAbsentBg,
                      count: summary.absentCount,
                      label: 'Alpha',
                      labelColor: AppColors.attendanceAbsent,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatColumn({
    required IconData icon,
    required Color iconColor,
    required Color circleBg,
    required int count,
    required String label,
    required Color labelColor,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Lingkaran Ikon
        Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: circleBg,
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: iconColor, size: 20),
        ),
        const SizedBox(height: 8),
        // Angka Statistik
        Text(
          count.toString(),
          style: AppTextStyles.summaryNumber,
        ),
        const SizedBox(height: 2),
        // Label Status
        Text(
          label,
          style: TextStyle(
            fontSize: 12.5,
            fontWeight: FontWeight.w700,
            color: labelColor,
          ),
        ),
      ],
    );
  }
}
