import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../data/models/schedule_model.dart';

/// Kartu Jadwal Pelajaran (Sesuai Butir C.4 & H):
/// - Desain konsisten dengan Modul Data Santri
/// - Menampilkan: Mata Pelajaran, Kelas, Guru Pengampu, Hari, Jam Pelajaran, Waktu Mulai & Selesai
/// - Aksi: Klik buka detail, tombol Edit & Hapus (Khusus Admin)
class ScheduleCard extends StatelessWidget {
  final ScheduleModel schedule;
  final bool isAdmin;
  final VoidCallback onTap;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  const ScheduleCard({
    Key? key,
    required this.schedule,
    required this.isAdmin,
    required this.onTap,
    this.onEdit,
    this.onDelete,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFF1F5F9), width: 1.2),
            boxShadow: const [
              BoxShadow(
                color: Color(0x08000000),
                offset: Offset(0, 3),
                blurRadius: 10,
                spreadRadius: 0,
              ),
            ],
          ),
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Baris Atas: Hari & Jam Ke- Pill, Kelas Tag, dan Action Buttons jika Admin
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Badge Hari & Jam Pelajaran
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.primary.withOpacity(0.2), width: 1),
                    ),
                    child: Text(
                      '${schedule.day} • ${schedule.periodLabel}',
                      style: const TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                      ),
                    ),
                  ),

                  const SizedBox(width: 8),

                  // Badge Kelas
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE0F2FE),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.school_rounded, size: 12, color: Color(0xFF0284C7)),
                        const SizedBox(width: 4),
                        Text(
                          schedule.className,
                          style: const TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF0284C7),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const Spacer(),

                  // Aksi Admin: Tombol Edit & Hapus (Sesuai Butir C.5 & E)
                  if (isAdmin) ...[
                    InkWell(
                      onTap: onEdit,
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.edit_outlined,
                          size: 15,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    InkWell(
                      onTap: onDelete,
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEE2E2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.delete_outline_rounded,
                          size: 15,
                          color: AppColors.error,
                        ),
                      ),
                    ),
                  ] else ...[
                    // Ikon Panah untuk Guru / View-only
                    const Icon(
                      Icons.chevron_right_rounded,
                      color: AppColors.textHint,
                      size: 20,
                    ),
                  ],
                ],
              ),

              const SizedBox(height: 10),

              // Baris Judul Mata Pelajaran
              Text(
                schedule.subject,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 15.5,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                  letterSpacing: -0.2,
                ),
              ),

              const SizedBox(height: 8),

              // Baris Informasi: Guru Pengampu & Rentang Waktu
              Row(
                children: [
                  // Guru Pengampu
                  Expanded(
                    child: Row(
                      children: [
                        const Icon(
                          Icons.person_pin_rounded,
                          size: 14,
                          color: AppColors.textSecondary,
                        ),
                        const SizedBox(width: 5),
                        Expanded(
                          child: Text(
                            schedule.teacherName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w500,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Waktu Pelajaran (Mulai - Selesai)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFFE2E8F0), width: 1),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.access_time_rounded,
                          size: 13,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          schedule.timeRange,
                          style: const TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
