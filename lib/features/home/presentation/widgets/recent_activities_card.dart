import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../data/models/attendance_models.dart';

/// Widget Kartu Aktivitas Terakhir (Sesuai Butir 6):
/// - Maksimal 3 data absensi terbaru di halaman depan
/// - Berisi: avatar santri, nama santri, status kehadiran, kelas, jam, dan keterangan waktu
/// - Indikator warna: Hijau (Hadir), Oranye (Izin), Merah (Alpha)
/// - Tombol "Lihat Semua >" untuk melihat riwayat aktivitas lengkap
class RecentActivitiesCard extends StatelessWidget {
  final List<AttendanceActivityModel> activities;
  final VoidCallback onViewAllTap;

  const RecentActivitiesCard({
    Key? key,
    required this.activities,
    required this.onViewAllTap,
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
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header: Judul Aktivitas Terakhir + Tombol Lihat Semua
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: const [
                    Icon(
                      Icons.history_toggle_off_rounded,
                      color: AppColors.primary,
                      size: 22,
                    ),
                    SizedBox(width: 8),
                    Text(
                      'Aktivitas Terakhir',
                      style: TextStyle(
                        fontSize: 15.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                        letterSpacing: -0.2,
                      ),
                    ),
                  ],
                ),
                InkWell(
                  onTap: onViewAllTap,
                  borderRadius: BorderRadius.circular(8),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Text(
                          'Lihat Semua',
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                        SizedBox(width: 2),
                        Icon(
                          Icons.chevron_right_rounded,
                          color: AppColors.primary,
                          size: 18,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Daftar Baris Aktivitas
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: activities.length,
              separatorBuilder: (_, __) => const Divider(
                height: 18,
                thickness: 0.8,
                color: Color(0xFFF1F5F9),
              ),
              itemBuilder: (context, index) {
                final item = activities[index];
                return _buildActivityRow(item);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityRow(AttendanceActivityModel item) {
    return Row(
      children: [
        // Avatar Santri dengan Badge Status Melayang di Sudut
        Stack(
          clipBehavior: Clip.none,
          children: [
            // Avatar Lingkaran
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: item.isFemale ? const Color(0xFFFCE7F3) : const Color(0xFFE2E8F0),
              ),
              child: ClipOval(
                child: item.avatarAsset != null
                    ? Image.asset(
                        item.avatarAsset!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _buildFallbackAvatar(item),
                      )
                    : _buildFallbackAvatar(item),
              ),
            ),

            // Badge Indikator Status di Sudut Bawah Kanan
            Positioned(
              right: -2,
              bottom: -2,
              child: Container(
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  color: item.status.color,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 1.5),
                ),
                child: Icon(
                  item.status == AttendanceStatus.hadir
                      ? Icons.check
                      : item.status == AttendanceStatus.izin
                          ? Icons.priority_high
                          : Icons.close,
                  color: Colors.white,
                  size: 10,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(width: 12),

        // Info Santri: Nama & Keterangan Status + Kelas
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                item.studentName,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 2),
              Row(
                children: [
                  Text(
                    item.status.label,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: item.status.color,
                    ),
                  ),
                  Text(
                    ' • ${item.className}',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w400,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        // Jam & Keterangan Waktu di Sisi Kanan
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              item.time,
              style: const TextStyle(
                fontSize: 13.5,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              item.timeLabel,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w400,
                color: AppColors.textHint,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildFallbackAvatar(AttendanceActivityModel item) {
    return Icon(
      item.isFemale ? Icons.face_3 : Icons.face,
      color: AppColors.primary,
      size: 26,
    );
  }
}
