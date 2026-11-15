import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../data/models/student_model.dart';

/// Kartu Santri Reusable (Sesuai Butir C.5):
/// - Menampilkan Foto/avatar, Nama Lengkap, NIS, Jenis Kelamin, Kelas, Kamar, dan Status
/// - Desain rounded card profesional dengan feedback sentuhan
class StudentCard extends StatelessWidget {
  final StudentModel student;
  final VoidCallback onTap;

  const StudentCard({
    Key? key,
    required this.student,
    required this.onTap,
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
            border: Border.all(color: const Color(0xFFF1F5F9), width: 1),
            boxShadow: const [
              BoxShadow(
                color: Color(0x0A000000),
                offset: Offset(0, 3),
                blurRadius: 10,
                spreadRadius: 0,
              ),
            ],
          ),
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Avatar Santri dengan Indikator Gender Melingkar
              _buildAvatar(),

              const SizedBox(width: 14),

              // Informasi Utama Santri
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Baris Nama Santri
                    Text(
                      student.fullName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                        letterSpacing: -0.2,
                      ),
                    ),

                    const SizedBox(height: 4),

                    // NIS & Gender Pill
                    Row(
                      children: [
                        Text(
                          'NIS: ${student.nis}',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textMuted,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                          decoration: BoxDecoration(
                            color: student.gender.backgroundColor,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            student.gender.label,
                            style: TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w700,
                              color: student.gender.color,
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 8),

                    // Baris Kelas & Kamar
                    Row(
                      children: [
                        // Kelas
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Image.asset(
                              'assets/images/ic_graduation_cap.png',
                              width: 17,
                              height: 12,
                              fit: BoxFit.contain,
                              color: Colors.black,
                              errorBuilder: (_, __, ___) => const Icon(
                                Icons.school,
                                size: 13,
                                color: Colors.black,
                              ),
                            ),
                            const SizedBox(width: 5),
                            Text(
                              student.className,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(width: 14),

                        // Kamar Asrama
                        Expanded(
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.meeting_room_outlined,
                                size: 14,
                                color: AppColors.textMuted,
                              ),
                              const SizedBox(width: 4),
                              Flexible(
                                child: Text(
                                  student.room,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: AppColors.textSecondary,
                                  ),
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

              const SizedBox(width: 8),

              // Panah Navigasi Kanan
              const Icon(
                Icons.chevron_right_rounded,
                color: AppColors.textHint,
                size: 22,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAvatar() {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: student.gender.backgroundColor,
        border: Border.all(color: student.gender.color.withOpacity(0.3), width: 1.5),
      ),
      child: ClipOval(
        child: student.avatarAsset != null
            ? Image.asset(
                student.avatarAsset!,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => _buildFallbackIcon(),
              )
            : _buildFallbackIcon(),
      ),
    );
  }

  Widget _buildFallbackIcon() {
    return Icon(
      student.isFemale ? Icons.face_3_rounded : Icons.face_rounded,
      color: student.gender.color,
      size: 28,
    );
  }

  Widget _buildStatusBadge() {
    final status = student.status;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
      decoration: BoxDecoration(
        color: status.backgroundColor,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        status.label,
        style: TextStyle(
          fontSize: 10.5,
          fontWeight: FontWeight.w700,
          color: status.color,
        ),
      ),
    );
  }
}
