import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../models/student_attendance_recap_model.dart';
import '../models/lesson_attendance_model.dart';

/// Halaman Detail Rekap Absensi Per Santri (Khusus Admin)
/// Menampilkan profil lengkap santri, agregasi kehadiran, dan riwayat log seluruh sesi
class StudentAttendanceRecapDetailPage extends StatelessWidget {
  final StudentAttendanceRecapModel recap;

  const StudentAttendanceRecapDetailPage({
    Key? key,
    required this.recap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final student = recap.student;

    return Scaffold(
      backgroundColor: AppColors.dashboardBg,
      appBar: AppBar(
        title: const Text('Detail Rekap Absensi'),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0.5,
        centerTitle: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. Kartu Profil Santri
            _buildStudentProfileCard(student),

            const SizedBox(height: 16),

            // 2. Kartu Ringkasan Metrik Kehadiran
            _buildRecapMetricCard(),

            const SizedBox(height: 20),

            // 3. Header Bagian Riwayat Log Sesi
            Row(
              children: [
                const Icon(
                  Icons.history_edu_rounded,
                  size: 20,
                  color: AppColors.primary,
                ),
                const SizedBox(width: 8),
                Text(
                  'Riwayat Kehadiran Sesi (${recap.sessionLogs.length})',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // 4. Daftar Sesi yang Diikuti Santri
            if (recap.sessionLogs.isEmpty)
              _buildEmptySessionCard()
            else
              ...recap.sessionLogs.map((log) => _buildSessionLogItem(log)),
          ],
        ),
      ),
    );
  }

  Widget _buildStudentProfileCard(dynamic student) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
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
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Avatar
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: student.gender.backgroundColor,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: student.gender.color.withOpacity(0.3)),
            ),
            alignment: Alignment.center,
            child: Text(
              student.fullName.isNotEmpty ? student.fullName[0].toUpperCase() : 'S',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: student.gender.color,
              ),
            ),
          ),

          const SizedBox(width: 14),

          // Detail Santri
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  student.fullName,
                  style: const TextStyle(
                    fontSize: 16.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE2E8F0),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'NIS: ${student.nis}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF334155),
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Kelas ${student.className}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '${student.gender.label} • Ruang: ${student.room}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecapMetricCard() {
    final indColor = Color(recap.indicatorColorHex);
    final indBg = Color(recap.indicatorBgHex);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 10,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Persentase Kehadiran',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        recap.formattedPercentage,
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w800,
                          color: indColor,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '(${recap.hadirCount}/${recap.totalMeetings} Pertemuan)',
                        style: const TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: indBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: indColor.withOpacity(0.3)),
                ),
                child: Text(
                  recap.totalMeetings == 0
                      ? 'Belum Ada Sesi'
                      : (recap.presencePercentage >= 90.0
                          ? 'Sangat Baik'
                          : (recap.presencePercentage >= 75.0 ? 'Cukup' : 'Perlu Perhatian')),
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: indColor,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          const SizedBox(height: 16),

          // 4 Kotak Status: Hadir, Izin, Sakit, Alfa
          Row(
            children: [
              Expanded(
                child: _buildStatusPillBox(
                  label: 'Hadir',
                  count: recap.hadirCount,
                  color: const Color(0xFF16A34A),
                  bgColor: const Color(0xFFDCFCE7),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildStatusPillBox(
                  label: 'Izin',
                  count: recap.izinCount,
                  color: const Color(0xFF0284C7),
                  bgColor: const Color(0xFFE0F2FE),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildStatusPillBox(
                  label: 'Sakit',
                  count: recap.sakitCount,
                  color: const Color(0xFFD97706),
                  bgColor: const Color(0xFFFEF3C7),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildStatusPillBox(
                  label: 'Alfa',
                  count: recap.alfaCount,
                  color: const Color(0xFFDC2626),
                  bgColor: const Color(0xFFFEE2E2),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatusPillBox({
    required String label,
    required int count,
    required Color color,
    required Color bgColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        children: [
          Text(
            '$count',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSessionLogItem(StudentAttendanceSessionLog log) {
    Color statusColor;
    Color statusBg;
    String statusLabel;

    switch (log.status) {
      case LessonAttendanceStatus.hadir:
        statusColor = const Color(0xFF16A34A);
        statusBg = const Color(0xFFDCFCE7);
        statusLabel = 'Hadir';
        break;
      case LessonAttendanceStatus.izin:
        statusColor = const Color(0xFF0284C7);
        statusBg = const Color(0xFFE0F2FE);
        statusLabel = 'Izin';
        break;
      case LessonAttendanceStatus.sakit:
        statusColor = const Color(0xFFD97706);
        statusBg = const Color(0xFFFEF3C7);
        statusLabel = 'Sakit';
        break;
      case LessonAttendanceStatus.alfa:
        statusColor = const Color(0xFFDC2626);
        statusBg = const Color(0xFFFEE2E2);
        statusLabel = 'Alfa';
        break;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  log.subject,
                  style: const TextStyle(
                    fontSize: 14.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  statusLabel,
                  style: TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w700,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.calendar_today_rounded, size: 12, color: AppColors.textSecondary),
              const SizedBox(width: 4),
              Text(
                log.formattedDate,
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(width: 8),
              const Text('•', style: TextStyle(color: AppColors.textSecondary)),
              const SizedBox(width: 8),
              const Icon(Icons.access_time_rounded, size: 12, color: AppColors.textSecondary),
              const SizedBox(width: 4),
              Text(
                'Jam Ke-${log.periodNumber} (${log.startTime} - ${log.endTime})',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.person_outline_rounded, size: 12, color: AppColors.textSecondary),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  'Guru: ${log.teacherName}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            ],
          ),
          if (log.note != null && log.note!.trim().isNotEmpty) ...[
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline_rounded, size: 13, color: AppColors.textSecondary),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Catatan: ${log.note}',
                      style: const TextStyle(
                        fontSize: 11.5,
                        fontStyle: FontStyle.italic,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildEmptySessionCard() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
      ),
      alignment: Alignment.center,
      child: Column(
        children: const [
          Icon(Icons.event_busy_rounded, size: 40, color: AppColors.textHint),
          SizedBox(height: 8),
          Text(
            'Belum ada sesi absensi yang tercatat untuk santri ini.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}
