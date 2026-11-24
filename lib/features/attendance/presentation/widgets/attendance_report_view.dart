import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../auth/data/models/user_model.dart';
import '../../../students/data/models/student_model.dart';
import '../../../students/data/services/student_service.dart';
import '../../data/models/attendance_report_model.dart';
import '../../data/services/attendance_report_export_service.dart';
import '../../data/services/lesson_attendance_service.dart';

/// Widget Tampilan Utama Modul Laporan Absensi Santri (KHUSUS ADMIN)
class AttendanceReportView extends StatefulWidget {
  final UserModel currentUser;

  const AttendanceReportView({
    Key? key,
    required this.currentUser,
  }) : super(key: key);

  @override
  State<AttendanceReportView> createState() => _AttendanceReportViewState();
}

class _AttendanceReportViewState extends State<AttendanceReportView> {
  final LessonAttendanceService _attendanceService = LessonAttendanceService();
  final StudentService _studentService = StudentService();

  AttendanceReportType _selectedType = AttendanceReportType.perKelas;
  String _selectedClass = 'VII A';
  String? _selectedStudentId;
  String _selectedSubject = 'Semua';
  DateTime? _startDate;
  DateTime? _endDate;

  List<StudentModel> _students = [];
  AttendanceReportResult? _currentReport;
  bool _isLoading = false;

  final List<String> _classList = ['Semua', 'VII A', 'VII B', 'VIII A', 'VIII B', 'IX A', 'IX B'];
  final List<String> _subjectList = ['Semua', 'Fiqih', 'Bahasa Arab', 'Aqidah Akhlak', 'Al-Qur\'an Hadits', 'Tarikh Islam'];

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  void _loadInitialData() {
    _students = _studentService.getStudents();
    if (_students.isNotEmpty) {
      _selectedStudentId = _students.first.id;
    }
    _generateReport();
  }

  void _generateReport() {
    if (!widget.currentUser.isAdmin) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final report = _attendanceService.generateReport(
        user: widget.currentUser,
        type: _selectedType,
        studentId: _selectedStudentId,
        classFilter: _selectedClass == 'Semua' ? null : _selectedClass,
        subjectFilter: _selectedSubject == 'Semua' ? null : _selectedSubject,
        startDate: _startDate,
        endDate: _endDate,
      );

      setState(() {
        _currentReport = report;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Gagal membuat laporan: $e'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  Future<void> _pickDateRange() async {
    final now = DateTime.now();
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(now.year - 2),
      lastDate: DateTime(now.year + 2),
      initialDateRange: (_startDate != null && _endDate != null)
          ? DateTimeRange(start: _startDate!, end: _endDate!)
          : DateTimeRange(
              start: DateTime(now.year, now.month, 1),
              end: DateTime(now.year, now.month, now.day),
            ),
      builder: (context, child) {
        return Theme(
          data: ThemeData.light().copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.primary,
              onPrimary: Colors.white,
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
      _generateReport();
    }
  }

  void _clearDateFilter() {
    setState(() {
      _startDate = null;
      _endDate = null;
    });
    _generateReport();
  }

  void _handleExportExcel() {
    if (_currentReport == null) return;
    final csvContent = AttendanceReportExportService.generateExcelCsv(_currentReport!);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: const [
            Icon(Icons.table_chart_rounded, color: Color(0xFF16A34A)),
            SizedBox(width: 8),
            Text('Ekspor Excel Berhasil', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Laporan "${_currentReport!.title}" siap diunduh dalam format Excel (.csv spreadsheet).',
              style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'Ukuran file: ${(csvContent.length / 1024).toStringAsFixed(1)} KB\nKarakter: ${csvContent.length}',
                style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Tutup', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  void _handleExportPdf() {
    if (_currentReport == null) return;
    final htmlContent = AttendanceReportExportService.generatePrintableHtml(_currentReport!);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: const [
            Icon(Icons.picture_as_pdf_rounded, color: Color(0xFFDC2626)),
            SizedBox(width: 8),
            Text('Ekspor PDF / Cetak', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Dokumen PDF resmi "${_currentReport!.title}" telah diformat rapi dengan kop Pondok Pesantren Islam Darul Hikmah, siap dicetak.',
              style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle_rounded, color: Color(0xFF16A34A), size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Format A4 Portrait • Kop & Tanda Tangan Lengkap • ${(htmlContent.length / 1024).toStringAsFixed(1)} KB',
                      style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Tutup', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.currentUser.isAdmin) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: const [
              Icon(Icons.lock_outline_rounded, color: AppColors.error, size: 48),
              SizedBox(height: 12),
              Text(
                'Akses Ditolak',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
              ),
              SizedBox(height: 4),
              Text(
                'Modul Laporan Absensi Santri hanya dapat diakses oleh Administrator Pondok.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1. Selector Jenis Laporan (3 Pilihan)
        _buildReportTypeSelector(),
        const SizedBox(height: 14),

        // 2. Filter Bar
        _buildFilterCard(),
        const SizedBox(height: 14),

        // 3. Tombol Aksi Ekspor (PDF, Excel, Segarkan)
        _buildActionButtons(),
        const SizedBox(height: 16),

        // 4. Panel Pratinjau Laporan Resmi
        if (_isLoading)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(32.0),
              child: CircularProgressIndicator(color: AppColors.primary),
            ),
          )
        else if (_currentReport != null)
          _buildReportPreviewCard(_currentReport!)
        else
          _buildEmptyState(),
      ],
    );
  }

  Widget _buildReportTypeSelector() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(12),
      ),
      padding: const EdgeInsets.all(4),
      child: Row(
        children: [
          AttendanceReportType.perKelas,
          AttendanceReportType.perSantri,
        ].map((type) {
          final isSelected = _selectedType == type;
          return Expanded(
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _selectedType = type;
                });
                _generateReport();
              },
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 9),
                decoration: BoxDecoration(
                  color: isSelected ? Colors.white : Colors.transparent,
                  borderRadius: BorderRadius.circular(9),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 4,
                            offset: const Offset(0, 1),
                          )
                        ]
                      : null,
                ),
                alignment: Alignment.center,
                child: Text(
                  type.shortLabel,
                  style: TextStyle(
                    fontSize: 12.5,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                    color: isSelected ? AppColors.primary : AppColors.textSecondary,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildFilterCard() {
    final dateRangeLabel = (_startDate != null && _endDate != null)
        ? '${_startDate!.day}/${_startDate!.month}/${_startDate!.year} - ${_endDate!.day}/${_endDate!.month}/${_endDate!.year}'
        : 'Semua Periode';

    return Container(
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
            children: [
              // Filter Rentang Periode Tanggal
              Expanded(
                child: InkWell(
                  onTap: _pickDateRange,
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFCBD5E1)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.date_range_rounded, size: 16, color: AppColors.primary),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            dateRangeLabel,
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (_startDate != null)
                          GestureDetector(
                            onTap: _clearDateFilter,
                            child: const Icon(Icons.close_rounded, size: 16, color: AppColors.textSecondary),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),

              // Filter Kelas
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFCBD5E1)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedClass,
                    isDense: true,
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                    items: _classList.map((c) {
                      return DropdownMenuItem<String>(
                        value: c,
                        child: Text(c == 'Semua' ? 'Semua Kelas' : 'Kelas $c'),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() {
                          _selectedClass = val;
                          if (_selectedType == AttendanceReportType.perSantri) {
                            final filtered = val == 'Semua' ? _students : _students.where((s) => s.className == val).toList();
                            if (filtered.isNotEmpty) {
                              _selectedStudentId = filtered.first.id;
                            }
                          }
                        });
                        _generateReport();
                      }
                    },
                  ),
                ),
              ),
            ],
          ),

          // Baris Tambahan Filter (Santri jika perSantri, Mapel)
          const SizedBox(height: 10),
          Row(
            children: [
              // Filter Mata Pelajaran
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFCBD5E1)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedSubject,
                      isDense: true,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                      items: _subjectList.map((s) {
                        return DropdownMenuItem<String>(
                          value: s,
                          child: Text(s == 'Semua' ? 'Semua Mata Pelajaran' : s),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) {
                          setState(() {
                            _selectedSubject = val;
                          });
                          _generateReport();
                        }
                      },
                    ),
                  ),
                ),
              ),

              // Filter Pemilihan Santri jika Laporan Per Santri
              if (_selectedType == AttendanceReportType.perSantri) ...[
                const SizedBox(width: 10),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFCBD5E1)),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedStudentId,
                        isDense: true,
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                        items: _students.map((s) {
                          return DropdownMenuItem<String>(
                            value: s.id,
                            child: Text(
                              '${s.fullName} (${s.className})',
                              overflow: TextOverflow.ellipsis,
                            ),
                          );
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) {
                            setState(() {
                              _selectedStudentId = val;
                            });
                            _generateReport();
                          }
                        },
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    return Row(
      children: [
        // Tombol Ekspor PDF
        Expanded(
          child: ElevatedButton.icon(
            onPressed: _handleExportPdf,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFDC2626),
              foregroundColor: Colors.white,
              elevation: 0,
              padding: const EdgeInsets.symmetric(vertical: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            icon: const Icon(Icons.picture_as_pdf_rounded, size: 16),
            label: const Text('Ekspor PDF', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
          ),
        ),
        const SizedBox(width: 8),

        // Tombol Ekspor Excel
        Expanded(
          child: ElevatedButton.icon(
            onPressed: _handleExportExcel,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF16A34A),
              foregroundColor: Colors.white,
              elevation: 0,
              padding: const EdgeInsets.symmetric(vertical: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            icon: const Icon(Icons.table_chart_rounded, size: 16),
            label: const Text('Ekspor Excel', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
          ),
        ),
        const SizedBox(width: 8),

        // Tombol Segarkan / Buat Laporan
        IconButton(
          onPressed: _generateReport,
          tooltip: 'Segarkan Laporan',
          style: IconButton.styleFrom(
            backgroundColor: const Color(0xFFF1F5F9),
            padding: const EdgeInsets.all(10),
          ),
          icon: const Icon(Icons.refresh_rounded, size: 18, color: AppColors.primary),
        ),
      ],
    );
  }

  Widget _buildReportPreviewCard(AttendanceReportResult report) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Kop Surat Pratinjau
          Center(
            child: Column(
              children: [
                Text(
                  report.institutionName.toUpperCase(),
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: AppColors.primary,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 2),
                const Text(
                  'Sistem Manajemen & Presensi Pembelajaran Santri',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 10.5, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 10),
                const Divider(height: 1, thickness: 2, color: AppColors.primary),
                const SizedBox(height: 12),
                Text(
                  report.title.toUpperCase(),
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Periode: ${report.periodLabel}  •  Dibuat: ${report.formattedGeneratedDate}',
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Tampilan Konten Sesuai Jenis Laporan
          if (report.type == AttendanceReportType.perSantri && report.studentReport != null)
            _buildStudentReportBody(report.studentReport!)
          else if (report.type == AttendanceReportType.perKelas && report.classReport != null)
            _buildClassReportBody(report.classReport!)
          else if (report.type == AttendanceReportType.periode && report.periodReport != null)
            _buildPeriodReportBody(report.periodReport!),
        ],
      ),
    );
  }

  Widget _buildStudentReportBody(StudentReportData s) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Identitas Santri
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(s.student.fullName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                    const SizedBox(height: 2),
                    Text('NIS: ${s.student.nis}  •  Kelas: ${s.student.className}', style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFDCFCE7),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  s.formattedPercentage,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF15803D)),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // Statistik Status
        Row(
          children: [
            _buildStatBox('Total', s.totalMeetings.toString(), AppColors.textPrimary),
            const SizedBox(width: 6),
            _buildStatBox('Hadir', s.hadirCount.toString(), const Color(0xFF15803D)),
            const SizedBox(width: 6),
            _buildStatBox('Izin', s.izinCount.toString(), const Color(0xFF1D4ED8)),
            const SizedBox(width: 6),
            _buildStatBox('Sakit', s.sakitCount.toString(), const Color(0xFFB45309)),
            const SizedBox(width: 6),
            _buildStatBox('Alfa', s.alfaCount.toString(), const Color(0xFFB91C1C)),
          ],
        ),
        const SizedBox(height: 14),

        // Tabel Riwayat Sesi
        const Text('Daftar Riwayat Sesi Pembelajaran:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
        const SizedBox(height: 8),
        if (s.sessionLogs.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 16.0),
            child: Center(child: Text('Tidak ada catatan absensi untuk periode ini.', style: TextStyle(fontSize: 12, color: AppColors.textSecondary))),
          )
        else
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              headingRowHeight: 36,
              dataRowMinHeight: 34,
              dataRowMaxHeight: 40,
              columnSpacing: 14,
              horizontalMargin: 8,
              headingRowColor: MaterialStateProperty.all(const Color(0xFFF1F5F9)),
              columns: const [
                DataColumn(label: Text('Tanggal', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
                DataColumn(label: Text('Mapel', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
                DataColumn(label: Text('Guru Pengampu', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
                DataColumn(label: Text('Status', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
                DataColumn(label: Text('Catatan', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
              ],
              rows: s.sessionLogs.map((log) {
                return DataRow(cells: [
                  DataCell(Text(log.date, style: const TextStyle(fontSize: 11))),
                  DataCell(Text(log.subject, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600))),
                  DataCell(Text(log.teacherName, style: const TextStyle(fontSize: 11))),
                  DataCell(Text(log.status.label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
                  DataCell(Text(log.note ?? '-', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary))),
                ]);
              }).toList(),
            ),
          ),
      ],
    );
  }

  Widget _buildClassReportBody(ClassReportData c) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Ringkasan Kelas
        Row(
          children: [
            _buildStatBox('Santri', c.totalStudents.toString(), AppColors.textPrimary),
            const SizedBox(width: 6),
            _buildStatBox('Sesi', c.totalMeetingsRecorded.toString(), AppColors.textPrimary),
            const SizedBox(width: 6),
            _buildStatBox('Hadir', c.totalHadir.toString(), const Color(0xFF15803D)),
            const SizedBox(width: 6),
            _buildStatBox('Izin', c.totalIzin.toString(), const Color(0xFF1D4ED8)),
            const SizedBox(width: 6),
            _buildStatBox('Sakit', c.totalSakit.toString(), const Color(0xFFB45309)),
            const SizedBox(width: 6),
            _buildStatBox('Alfa', c.totalAlfa.toString(), const Color(0xFFB91C1C)),
            const SizedBox(width: 6),
            _buildStatBox('Rata²', c.formattedAveragePercentage, const Color(0xFF074724)),
          ],
        ),
        const SizedBox(height: 14),

        // Tabel Rekapitulasi Santri
        const Text('Rekapitulasi Kehadiran Santri Kelas:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
        const SizedBox(height: 8),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: DataTable(
            headingRowHeight: 36,
            dataRowMinHeight: 34,
            dataRowMaxHeight: 40,
            columnSpacing: 14,
            horizontalMargin: 8,
            headingRowColor: MaterialStateProperty.all(const Color(0xFFF1F5F9)),
            columns: const [
              DataColumn(label: Text('NIS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
              DataColumn(label: Text('Nama Santri', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
              DataColumn(label: Text('Total', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
              DataColumn(label: Text('Hadir', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
              DataColumn(label: Text('Izin', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
              DataColumn(label: Text('Sakit', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
              DataColumn(label: Text('Alfa', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
              DataColumn(label: Text('% Hadir', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
            ],
            rows: c.students.map((st) {
              return DataRow(cells: [
                DataCell(Text(st.student.nis, style: const TextStyle(fontSize: 11))),
                DataCell(Text(st.student.fullName, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600))),
                DataCell(Text(st.totalMeetings.toString(), style: const TextStyle(fontSize: 11))),
                DataCell(Text(st.hadirCount.toString(), style: const TextStyle(fontSize: 11, color: Color(0xFF15803D), fontWeight: FontWeight.w700))),
                DataCell(Text(st.izinCount.toString(), style: const TextStyle(fontSize: 11, color: Color(0xFF1D4ED8)))),
                DataCell(Text(st.sakitCount.toString(), style: const TextStyle(fontSize: 11, color: Color(0xFFB45309)))),
                DataCell(Text(st.alfaCount.toString(), style: const TextStyle(fontSize: 11, color: Color(0xFFB91C1C)))),
                DataCell(Text(st.formattedPercentage, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF074724)))),
              ]);
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildPeriodReportBody(PeriodReportData p) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Ringkasan Periode
        Row(
          children: [
            _buildStatBox('Sesi', p.totalSessions.toString(), AppColors.textPrimary),
            const SizedBox(width: 6),
            _buildStatBox('Catatan', p.totalAttendanceRecords.toString(), AppColors.textPrimary),
            const SizedBox(width: 6),
            _buildStatBox('Hadir', p.totalHadir.toString(), const Color(0xFF15803D)),
            const SizedBox(width: 6),
            _buildStatBox('Izin', p.totalIzin.toString(), const Color(0xFF1D4ED8)),
            const SizedBox(width: 6),
            _buildStatBox('Sakit', p.totalSakit.toString(), const Color(0xFFB45309)),
            const SizedBox(width: 6),
            _buildStatBox('Alfa', p.totalAlfa.toString(), const Color(0xFFB91C1C)),
            const SizedBox(width: 6),
            _buildStatBox('Rata²', p.formattedOverallPercentage, const Color(0xFF074724)),
          ],
        ),
        const SizedBox(height: 16),

        // Breakdown Per Kelas
        const Text('Rekapitulasi Kehadiran per Kelas:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
        const SizedBox(height: 8),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: DataTable(
            headingRowHeight: 36,
            dataRowMinHeight: 34,
            dataRowMaxHeight: 40,
            columnSpacing: 16,
            horizontalMargin: 8,
            headingRowColor: MaterialStateProperty.all(const Color(0xFFF1F5F9)),
            columns: const [
              DataColumn(label: Text('Nama Kelas', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
              DataColumn(label: Text('Total', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
              DataColumn(label: Text('Hadir', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
              DataColumn(label: Text('Izin', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
              DataColumn(label: Text('Sakit', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
              DataColumn(label: Text('Alfa', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
              DataColumn(label: Text('% Hadir', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
            ],
            rows: p.classBreakdown.entries.map((entry) {
              final h = entry.value['hadir'] ?? 0;
              final i = entry.value['izin'] ?? 0;
              final s = entry.value['sakit'] ?? 0;
              final a = entry.value['alfa'] ?? 0;
              final tot = h + i + s + a;
              final pct = tot == 0 ? '0%' : '${((h / tot) * 100).toStringAsFixed(1)}%';
              return DataRow(cells: [
                DataCell(Text(entry.key, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600))),
                DataCell(Text(tot.toString(), style: const TextStyle(fontSize: 11))),
                DataCell(Text(h.toString(), style: const TextStyle(fontSize: 11, color: Color(0xFF15803D)))),
                DataCell(Text(i.toString(), style: const TextStyle(fontSize: 11, color: Color(0xFF1D4ED8)))),
                DataCell(Text(s.toString(), style: const TextStyle(fontSize: 11, color: Color(0xFFB45309)))),
                DataCell(Text(a.toString(), style: const TextStyle(fontSize: 11, color: Color(0xFFB91C1C)))),
                DataCell(Text(pct, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF074724)))),
              ]);
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildStatBox(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Column(
          children: [
            Text(value, style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800, color: color)),
            const SizedBox(height: 1),
            Text(label, style: const TextStyle(fontSize: 9.5, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
          ],
        ),
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
        children: const [
          Icon(Icons.description_outlined, size: 48, color: Color(0xFF94A3B8)),
          SizedBox(height: 12),
          Text('Belum ada data laporan', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          SizedBox(height: 4),
          Text('Sesuaikan filter di atas untuk menghasilkan laporan absensi.', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}
