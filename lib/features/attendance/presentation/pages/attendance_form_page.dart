import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../auth/data/models/user_model.dart';
import '../../data/models/schedule_model.dart';
import '../../data/models/lesson_attendance_model.dart';
import '../../data/services/lesson_attendance_service.dart';
import '../../../students/data/models/student_model.dart';

/// Halaman Pengisian dan Pengeditan Absensi Santri Per Mata Pelajaran (Sesuai Butir 3, 4, 5)
/// Dilengkapi dengan:
/// 1. Validasi Status Kehadiran Wajib (Mencegah simpan jika ada status kosong)
/// 2. Dialog Konfirmasi Penyimpanan dengan Ringkasan Total, Hadir, Izin, Sakit, Alfa
class AttendanceFormPage extends StatefulWidget {
  final UserModel currentUser;
  final ScheduleModel schedule;
  final DateTime? initialDate;
  final LessonAttendanceModel? existingAttendance;

  const AttendanceFormPage({
    Key? key,
    required this.currentUser,
    required this.schedule,
    this.initialDate,
    this.existingAttendance,
  }) : super(key: key);

  @override
  State<AttendanceFormPage> createState() => _AttendanceFormPageState();
}

class _AttendanceFormPageState extends State<AttendanceFormPage> {
  final _attendanceService = LessonAttendanceService();
  final ScrollController _scrollController = ScrollController();

  late DateTime _selectedDate;
  late String _dateString;
  bool _isEditing = false;
  bool _isSaving = false;
  bool _showValidationErrors = false;

  List<StudentModel> _classStudents = [];
  final Map<String, LessonAttendanceStatus?> _attendanceStatuses = {};
  final Map<String, String> _attendanceNotes = {};
  final Map<String, GlobalKey> _cardKeys = {};

  @override
  void initState() {
    super.initState();
    _selectedDate = widget.initialDate ?? DateTime.now();
    _updateDateString();
    _loadStudentsAndInitialData();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _updateDateString() {
    _dateString =
        '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}';
  }

  void _loadStudentsAndInitialData() {
    // 1. Ambil santri kelas sesuai jadwal
    _classStudents = _attendanceService.getStudentsForClass(widget.schedule.className);

    // 2. Cek apakah absensi pada jadwal dan tanggal ini sudah pernah dibuat
    final existing = widget.existingAttendance ??
        _attendanceService.findExistingAttendance(
          scheduleId: widget.schedule.id,
          date: _dateString,
        );

    _attendanceStatuses.clear();
    _attendanceNotes.clear();
    _cardKeys.clear();
    _showValidationErrors = false;

    for (final s in _classStudents) {
      _cardKeys[s.id] = GlobalKey();
    }

    if (existing != null) {
      _isEditing = true;
      for (final s in _classStudents) {
        final existingItem = existing.items.cast<StudentAttendanceItemModel?>().firstWhere(
              (it) => it?.studentId == s.id,
              orElse: () => null,
            );
        if (existingItem != null) {
          _attendanceStatuses[s.id] = existingItem.status;
          if (existingItem.note != null && existingItem.note!.isNotEmpty) {
            _attendanceNotes[s.id] = existingItem.note!;
          }
        } else {
          _attendanceStatuses[s.id] = null;
        }
      }
    } else {
      _isEditing = false;
      // Jangan menganggap status kosong sebagai Hadir atau Alfa secara otomatis
      for (final s in _classStudents) {
        _attendanceStatuses[s.id] = null;
      }
    }
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
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

    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
        _updateDateString();
        _loadStudentsAndInitialData();
      });
    }
  }

  void _markAllAs(LessonAttendanceStatus status) {
    setState(() {
      for (final s in _classStudents) {
        _attendanceStatuses[s.id] = status;
      }
      _showValidationErrors = false;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Semua santri ditandai "${status.label}"'),
        backgroundColor: status.color,
        duration: const Duration(seconds: 1),
      ),
    );
  }

  void _scrollToFirstUnassignedStudent() {
    final unassigned = _classStudents.where((s) => _attendanceStatuses[s.id] == null).toList();
    if (unassigned.isEmpty) return;

    final firstKey = _cardKeys[unassigned.first.id];
    if (firstKey?.currentContext != null) {
      Scrollable.ensureVisible(
        firstKey!.currentContext!,
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
        alignment: 0.15,
      );
    }
  }

  /// Validasi status kehadiran sebelum menampilkan dialog konfirmasi
  void _handleSavePressed() {
    if (_classStudents.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Tidak ada santri di kelas ini untuk diabsen.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    // 1. Periksa status setiap santri
    final unassigned = _classStudents.where((s) => _attendanceStatuses[s.id] == null).toList();
    final unassignedCount = unassigned.length;

    if (unassignedCount > 0) {
      // 2. Batalkan proses dan tampilkan pesan kesalahan
      setState(() {
        _showValidationErrors = true;
      });

      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text('Masih ada $unassignedCount santri yang belum memiliki status kehadiran.'),
              ),
            ],
          ),
          action: SnackBarAction(
            label: 'Tunjukkan',
            textColor: Colors.yellow,
            onPressed: _scrollToFirstUnassignedStudent,
          ),
          backgroundColor: AppColors.error,
          duration: const Duration(seconds: 4),
        ),
      );

      _scrollToFirstUnassignedStudent();
      return;
    }

    // 3. Seluruh santri lengkap, buka dialog konfirmasi
    setState(() {
      _showValidationErrors = false;
    });
    _showSaveConfirmationDialog();
  }

  /// Dialog Konfirmasi Penyimpanan Absensi (Sesuai Butir 1)
  Future<void> _showSaveConfirmationDialog() async {
    int hadir = 0, izin = 0, sakit = 0, alfa = 0;
    for (final s in _classStudents) {
      final st = _attendanceStatuses[s.id];
      if (st == LessonAttendanceStatus.hadir) hadir++;
      else if (st == LessonAttendanceStatus.izin) izin++;
      else if (st == LessonAttendanceStatus.sakit) sakit++;
      else if (st == LessonAttendanceStatus.alfa) alfa++;
    }

    final totalSantri = _classStudents.length;

    final confirmed = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        titlePadding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
        contentPadding: const EdgeInsets.symmetric(horizontal: 20),
        actionsPadding: const EdgeInsets.fromLTRB(20, 16, 20, 18),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.assignment_turned_in_rounded, color: AppColors.primary, size: 22),
            ),
            const SizedBox(width: 10),
            const Expanded(
              child: Text(
                'Konfirmasi Simpan',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Pastikan rincian kehadiran santri (${widget.schedule.subject} - Kelas ${widget.schedule.className}) sudah benar:',
              style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary, height: 1.35),
            ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'TOTAL SANTRI:',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                          letterSpacing: 0.5,
                        ),
                      ),
                      Text(
                        '$totalSantri',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 18, color: Color(0xFFE2E8F0)),
                  _buildConfirmRow('Hadir:', hadir, LessonAttendanceStatus.hadir),
                  const SizedBox(height: 8),
                  _buildConfirmRow('Izin:', izin, LessonAttendanceStatus.izin),
                  const SizedBox(height: 8),
                  _buildConfirmRow('Sakit:', sakit, LessonAttendanceStatus.sakit),
                  const SizedBox(height: 8),
                  _buildConfirmRow('Alfa:', alfa, LessonAttendanceStatus.alfa),
                ],
              ),
            ),
          ],
        ),
        actions: [
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Navigator.pop(ctx, false),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    side: const BorderSide(color: Color(0xFFCBD5E1)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text(
                    'Kembali',
                    style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(ctx, true),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text(
                    'Konfirmasi Simpan',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );

    if (confirmed == true) {
      _executeSaveAttendance();
    }
  }

  Widget _buildConfirmRow(String label, int count, LessonAttendanceStatus status) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(color: status.color, shape: BoxShape.circle),
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
            ),
          ],
        ),
        Text(
          '$count',
          style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: status.color),
        ),
      ],
    );
  }

  /// Eksekusi penyimpanan data absensi menggunakan mekanisme yang sudah ada
  Future<void> _executeSaveAttendance() async {
    setState(() {
      _isSaving = true;
    });

    try {
      final items = _classStudents.map((s) {
        return StudentAttendanceItemModel(
          studentId: s.id,
          studentNis: s.nis,
          studentName: s.fullName,
          avatarAsset: s.avatarAsset,
          status: _attendanceStatuses[s.id]!,
          note: _attendanceNotes[s.id],
        );
      }).toList();

      await _attendanceService.saveAttendance(
        user: widget.currentUser,
        schedule: widget.schedule,
        date: _dateString,
        items: items,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            _isEditing
                ? 'Absensi santri berhasil diperbarui!'
                : 'Absensi santri berhasil disimpan!',
          ),
          backgroundColor: AppColors.primary,
        ),
      );

      Navigator.pop(context, true);
    } on UnauthorizedAttendanceException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.message), backgroundColor: Colors.red),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal menyimpan absensi: $e'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isSaving = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Perhitungan ringkasan otomatis
    int hadir = 0, izin = 0, sakit = 0, alfa = 0, unassigned = 0;
    for (final s in _classStudents) {
      final st = _attendanceStatuses[s.id];
      if (st == null) {
        unassigned++;
      } else {
        switch (st) {
          case LessonAttendanceStatus.hadir:
            hadir++;
            break;
          case LessonAttendanceStatus.izin:
            izin++;
            break;
          case LessonAttendanceStatus.sakit:
            sakit++;
            break;
          case LessonAttendanceStatus.alfa:
            alfa++;
            break;
        }
      }
    }

    final formattedDisplayDate =
        '${_selectedDate.day.toString().padLeft(2, '0')}/${_selectedDate.month.toString().padLeft(2, '0')}/${_selectedDate.year}';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _isEditing ? 'Edit Absensi Santri' : 'Input Absensi Santri',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
              ),
            ),
            Text(
              '${widget.schedule.subject} • Kelas ${widget.schedule.className}',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              physics: const BouncingScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Info Jadwal Card
                  _buildScheduleInfoCard(formattedDisplayDate),

                  const SizedBox(height: 16),

                  // 2. Banner Peringatan jika Masih Ada Santri Belum Memiliki Status
                  if (_showValidationErrors && unassigned > 0) ...[
                    Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFFCA5A5)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.error_outline_rounded, color: AppColors.error, size: 20),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'Masih ada $unassigned santri yang belum memiliki status kehadiran.',
                              style: const TextStyle(
                                fontSize: 12.5,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF991B1B),
                              ),
                            ),
                          ),
                          TextButton(
                            onPressed: _scrollToFirstUnassignedStudent,
                            style: TextButton.styleFrom(
                              backgroundColor: AppColors.error,
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            child: const Text(
                              'Tunjukkan',
                              style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: Colors.white),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  // 3. Tombol Aksi Cepat & Header Daftar
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Text(
                            'Daftar Santri (${_classStudents.length})',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          if (unassigned > 0) ...[
                            const SizedBox(width: 8),
                            InkWell(
                              onTap: _scrollToFirstUnassignedStudent,
                              borderRadius: BorderRadius.circular(6),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFEE2E2),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: AppColors.error.withOpacity(0.3)),
                                ),
                                child: Text(
                                  '$unassigned Kosong',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.error,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      TextButton.icon(
                        onPressed: () => _markAllAs(LessonAttendanceStatus.hadir),
                        icon: const Icon(Icons.done_all_rounded, size: 16, color: AppColors.primary),
                        label: const Text(
                          'Semua Hadir',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                        style: TextButton.styleFrom(
                          backgroundColor: AppColors.primaryLight,
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 10),

                  // 4. Daftar Santri
                  if (_classStudents.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      child: const Center(
                        child: Text(
                          'Belum ada data santri pada kelas ini.',
                          style: TextStyle(color: AppColors.textSecondary),
                        ),
                      ),
                    )
                  else
                    ..._classStudents.map((s) => _buildStudentAttendanceCard(s)),

                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),

          // 5. Bottom Sticky Summary & Save Button
          _buildBottomActionPanel(hadir, izin, sakit, alfa, unassigned),
        ],
      ),
    );
  }

  Widget _buildScheduleInfoCard(String formattedDate) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.school_rounded, color: AppColors.primary, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.schedule.subject,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Guru: ${widget.schedule.teacherName}',
                      style: const TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  widget.schedule.className,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
          const Divider(height: 20, color: Color(0xFFF1F5F9)),
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: _pickDate,
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_month_rounded, size: 16, color: AppColors.primary),
                        const SizedBox(width: 6),
                        Text(
                          formattedDate,
                          style: const TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const Spacer(),
                        const Icon(Icons.arrow_drop_down, size: 18, color: AppColors.textSecondary),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.schedule_rounded, size: 16, color: Color(0xFF64748B)),
                    const SizedBox(width: 6),
                    Text(
                      '${widget.schedule.periodLabel} (${widget.schedule.timeRange})',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF475569),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStudentAttendanceCard(StudentModel student) {
    final currentStatus = _attendanceStatuses[student.id];
    final isUnassigned = currentStatus == null;
    final hasError = _showValidationErrors && isUnassigned;
    final currentNote = _attendanceNotes[student.id] ?? '';

    return Container(
      key: _cardKeys[student.id],
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: hasError ? const Color(0xFFFFF7F7) : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: hasError ? AppColors.error : AppColors.borderLight,
          width: hasError ? 1.8 : 1.0,
        ),
        boxShadow: [
          if (hasError)
            BoxShadow(
              color: AppColors.error.withOpacity(0.08),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Indikator peringatan jika belum diisi saat validasi aktif
          if (hasError) ...[
            Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFFEE2E2),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: const [
                  Icon(Icons.error_outline_rounded, size: 14, color: AppColors.error),
                  SizedBox(width: 5),
                  Text(
                    'Status kehadiran belum dipilih',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: AppColors.error,
                    ),
                  ),
                ],
              ),
            ),
          ],

          Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: student.avatarAsset != null
                    ? Image.asset(
                        student.avatarAsset!,
                        width: 38,
                        height: 38,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _buildAvatarFallback(student),
                      )
                    : _buildAvatarFallback(student),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      student.fullName,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      'NIS: ${student.nis} • ${student.gender.label}',
                      style: const TextStyle(
                        fontSize: 11.5,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              if (isUnassigned)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'Belum Diisi',
                    style: TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),

          // Pilihan Status (Hadir, Izin, Sakit, Alfa)
          Row(
            children: LessonAttendanceStatus.values.map((status) {
              final isSelected = currentStatus == status;
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2.5),
                  child: InkWell(
                    onTap: () {
                      setState(() {
                        if (isSelected) {
                          _attendanceStatuses[student.id] = null;
                        } else {
                          _attendanceStatuses[student.id] = status;
                        }
                      });
                    },
                    borderRadius: BorderRadius.circular(8),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      padding: const EdgeInsets.symmetric(vertical: 7),
                      decoration: BoxDecoration(
                        color: isSelected ? status.color : status.backgroundColor.withOpacity(0.4),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isSelected ? status.color : Colors.transparent,
                          width: 1.5,
                        ),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            status.shortCode,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: isSelected ? Colors.white : status.color,
                            ),
                          ),
                          const SizedBox(height: 1),
                          Text(
                            status.label,
                            style: TextStyle(
                              fontSize: 9.5,
                              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                              color: isSelected ? Colors.white : AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),

          // Kolom catatan keterangan jika Izin atau Sakit
          if (currentStatus != null && currentStatus != LessonAttendanceStatus.hadir) ...[
            const SizedBox(height: 8),
            Container(
              height: 36,
              padding: const EdgeInsets.symmetric(horizontal: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: TextField(
                controller: TextEditingController(text: currentNote)
                  ..selection = TextSelection.fromPosition(
                    TextPosition(offset: currentNote.length),
                  ),
                onChanged: (val) {
                  _attendanceNotes[student.id] = val;
                },
                style: const TextStyle(fontSize: 12),
                decoration: InputDecoration(
                  hintText: 'Keterangan ${currentStatus.label.toLowerCase()} (opsional)...',
                  hintStyle: const TextStyle(fontSize: 11.5, color: AppColors.textHint),
                  border: InputBorder.none,
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(vertical: 8),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildAvatarFallback(StudentModel student) {
    return Container(
      width: 38,
      height: 38,
      decoration: BoxDecoration(
        color: student.gender.backgroundColor,
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: Text(
        student.fullName.isNotEmpty ? student.fullName[0].toUpperCase() : 'S',
        style: TextStyle(
          color: student.gender.color,
          fontWeight: FontWeight.w700,
          fontSize: 14,
        ),
      ),
    );
  }

  Widget _buildBottomActionPanel(int hadir, int izin, int sakit, int alfa, int unassigned) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Color(0x0C000000),
            offset: Offset(0, -3),
            blurRadius: 10,
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Rekap status live
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildMiniBadge('H: $hadir', LessonAttendanceStatus.hadir),
                _buildMiniBadge('I: $izin', LessonAttendanceStatus.izin),
                _buildMiniBadge('S: $sakit', LessonAttendanceStatus.sakit),
                _buildMiniBadge('A: $alfa', LessonAttendanceStatus.alfa),
                if (unassigned > 0)
                  InkWell(
                    onTap: _scrollToFirstUnassignedStudent,
                    borderRadius: BorderRadius.circular(6),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEE2E2),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppColors.error.withOpacity(0.4)),
                      ),
                      child: Text(
                        'Kosong: $unassigned',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: AppColors.error,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 10),

            // Tombol Simpan Absensi
            SizedBox(
              width: double.infinity,
              height: 46,
              child: ElevatedButton(
                onPressed: _isSaving ? null : _handleSavePressed,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  elevation: 0,
                ),
                child: _isSaving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.save_rounded, size: 18, color: Colors.white),
                          const SizedBox(width: 8),
                          Text(
                            _isEditing ? 'Perbarui Absensi Santri' : 'Simpan Absensi Santri',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniBadge(String text, LessonAttendanceStatus status) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: status.backgroundColor,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: status.color,
        ),
      ),
    );
  }
}
