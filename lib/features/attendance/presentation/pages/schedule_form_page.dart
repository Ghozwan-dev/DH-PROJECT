import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/feedback_banner.dart';
import '../../data/models/schedule_model.dart';
import '../../data/services/schedule_service.dart';

/// Halaman Formulir Tambah & Edit Jadwal Pelajaran (Sesuai Butir D & E)
/// Dilengkapi validasi ketat:
/// - Semua kolom wajib diisi
/// - Jam selesai harus setelah jam mulai
/// - Deteksi bentrok waktu kelas
/// - Deteksi bentrok waktu guru pengampu
/// - Pencegahan duplikasi jadwal
class ScheduleFormPage extends StatefulWidget {
  final ScheduleModel? schedule;

  const ScheduleFormPage({Key? key, this.schedule}) : super(key: key);

  @override
  State<ScheduleFormPage> createState() => _ScheduleFormPageState();
}

class _ScheduleFormPageState extends State<ScheduleFormPage> {
  final _formKey = GlobalKey<FormState>();
  final _scheduleService = ScheduleService();

  late String _selectedDay;
  late String _selectedClass;
  late String _selectedSubject;
  late String _selectedTeacher;
  late int _selectedPeriod;

  late TextEditingController _startTimeController;
  late TextEditingController _endTimeController;
  late TextEditingController _roomController;
  late TextEditingController _notesController;

  bool _isLoading = false;
  String? _conflictErrorMessage;

  bool get _isEditMode => widget.schedule != null;

  static const List<int> periodOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  @override
  void initState() {
    super.initState();
    final s = widget.schedule;

    _selectedDay = s?.day ?? ScheduleService.formDayOptions.first;
    _selectedClass = s?.className ?? ScheduleService.classOptions.first;
    _selectedSubject = s?.subject ?? ScheduleService.subjectOptions.first;
    _selectedTeacher = s?.teacherName ?? ScheduleService.teacherOptions.first;
    _selectedPeriod = s?.periodNumber ?? 1;

    _startTimeController = TextEditingController(text: s?.startTime ?? '07:30');
    _endTimeController = TextEditingController(text: s?.endTime ?? '08:15');
    _roomController = TextEditingController(text: s?.room ?? 'Ruang Kelas ${_selectedClass}');
    _notesController = TextEditingController(text: s?.notes ?? '');
  }

  @override
  void dispose() {
    _startTimeController.dispose();
    _endTimeController.dispose();
    _roomController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _selectTime(TextEditingController controller, String title) async {
    final current = controller.text.trim();
    int initialHour = 7;
    int initialMinute = 30;
    if (current.contains(':')) {
      final parts = current.split(':');
      if (parts.length >= 2) {
        initialHour = int.tryParse(parts[0]) ?? 7;
        initialMinute = int.tryParse(parts[1]) ?? 30;
      }
    }

    final picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay(hour: initialHour, minute: initialMinute),
      helpText: title,
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

    if (picked != null) {
      final formatted = '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}';
      setState(() {
        controller.text = formatted;
        _conflictErrorMessage = null; // Reset conflict notice saat waktu diubah
      });
    }
  }

  void _onClassChanged(String? newClass) {
    if (newClass == null) return;
    setState(() {
      _selectedClass = newClass;
      // Perbarui ruang otomatis jika belum diubah manual secara drastis
      if (_roomController.text.startsWith('Ruang Kelas ') || _roomController.text.isEmpty) {
        _roomController.text = 'Ruang Kelas $newClass';
      }
      _conflictErrorMessage = null;
    });
  }

  Future<void> _saveSchedule() async {
    setState(() {
      _conflictErrorMessage = null;
    });

    if (!_formKey.currentState!.validate()) {
      return;
    }

    final startStr = _startTimeController.text.trim();
    final endStr = _endTimeController.text.trim();

    // 1. Validasi jam selesai harus setelah jam mulai
    final startMin = ScheduleModel.parseTimeToMinutes(startStr);
    final endMin = ScheduleModel.parseTimeToMinutes(endStr);
    if (endMin <= startMin) {
      setState(() {
        _conflictErrorMessage = 'Waktu selesai ($endStr) harus setelah waktu mulai ($startStr). Durasi tidak boleh nol atau negatif.';
      });
      return;
    }

    // 2. Susun objek jadwal kandidat
    final candidateSchedule = ScheduleModel(
      id: widget.schedule?.id ?? 'temp_${DateTime.now().millisecondsSinceEpoch}',
      day: _selectedDay,
      className: _selectedClass,
      subject: _selectedSubject,
      teacherName: _selectedTeacher,
      teacherId: _getTeacherIdByName(_selectedTeacher),
      periodNumber: _selectedPeriod,
      startTime: startStr,
      endTime: endStr,
      room: _roomController.text.trim().isNotEmpty ? _roomController.text.trim() : null,
      notes: _notesController.text.trim().isNotEmpty ? _notesController.text.trim() : null,
    );

    // 3. Validasi bentrok menggunakan engine ScheduleService
    final validation = _scheduleService.validateSchedule(
      candidateSchedule,
      excludeScheduleId: widget.schedule?.id,
    );

    if (!validation.isValid) {
      setState(() {
        _conflictErrorMessage = validation.errorMessage;
      });
      return;
    }

    // 4. Simpan perubahan ke ScheduleService
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 300)); // Smooth feedback

    ScheduleModel resultSchedule;
    if (_isEditMode) {
      final success = _scheduleService.updateSchedule(candidateSchedule);
      if (!success) {
        setState(() {
          _isLoading = false;
          _conflictErrorMessage = 'Gagal memperbarui jadwal di sistem.';
        });
        return;
      }
      resultSchedule = candidateSchedule;
      if (mounted) {
        FeedbackBanner.showSuccess(
          context,
          'Jadwal "${candidateSchedule.subject}" (${candidateSchedule.className}) berhasil diperbarui.',
        );
      }
    } else {
      final created = _scheduleService.addSchedule(candidateSchedule);
      if (created == null) {
        setState(() {
          _isLoading = false;
          _conflictErrorMessage = 'Gagal menambahkan jadwal ke sistem.';
        });
        return;
      }
      resultSchedule = created;
      if (mounted) {
        FeedbackBanner.showSuccess(
          context,
          'Jadwal baru "${candidateSchedule.subject}" (${candidateSchedule.className}) berhasil ditambahkan.',
        );
      }
    }

    if (mounted) {
      Navigator.pop(context, resultSchedule);
    }
  }

  String _getTeacherIdByName(String name) {
    if (name.contains('Ahmad Fauzi')) return 'guru_001';
    if (name.contains('Halimah')) return 'guru_002';
    if (name.contains('Mansyur')) return 'guru_003';
    if (name.contains('Zulkifli')) return 'guru_004';
    if (name.contains('Nurul')) return 'guru_005';
    if (name.contains('Abdullah')) return 'guru_006';
    if (name.contains('Lukman')) return 'guru_007';
    return 'guru_${name.hashCode.abs() % 1000}';
  }

  @override
  Widget build(BuildContext context) {
    final title = _isEditMode ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran';

    return Scaffold(
      backgroundColor: AppColors.dashboardBg,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.primary, size: 20),
          tooltip: 'Kembali',
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        centerTitle: false,
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Banner Error Bentrok (Jika ada)
                  if (_conflictErrorMessage != null) ...[
                    _buildConflictBanner(_conflictErrorMessage!),
                    const SizedBox(height: 16),
                  ],

                  // 1. Form Section: Hari & Kelas
                  _buildSectionCard(
                    title: 'Waktu & Kelas',
                    icon: Icons.calendar_month_outlined,
                    children: [
                      _buildDropdownField<String>(
                        label: 'Hari Pelajaran *',
                        value: _selectedDay,
                        items: ScheduleService.formDayOptions,
                        onChanged: (val) {
                          if (val != null) setState(() { _selectedDay = val; _conflictErrorMessage = null; });
                        },
                      ),
                      const SizedBox(height: 14),
                      _buildDropdownField<String>(
                        label: 'Kelas *',
                        value: _selectedClass,
                        items: ScheduleService.classOptions,
                        onChanged: _onClassChanged,
                      ),
                      const SizedBox(height: 14),
                      _buildDropdownField<int>(
                        label: 'Nomor Jam Pelajaran *',
                        value: _selectedPeriod,
                        items: periodOptions,
                        itemLabel: (p) => 'Jam Ke-$p',
                        onChanged: (val) {
                          if (val != null) setState(() => _selectedPeriod = val);
                        },
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // 2. Form Section: Mata Pelajaran & Tenaga Pendidik
                  _buildSectionCard(
                    title: 'Mata Pelajaran & Guru',
                    icon: Icons.school_outlined,
                    children: [
                      _buildDropdownField<String>(
                        label: 'Mata Pelajaran *',
                        value: _selectedSubject,
                        items: ScheduleService.subjectOptions,
                        onChanged: (val) {
                          if (val != null) setState(() { _selectedSubject = val; _conflictErrorMessage = null; });
                        },
                      ),
                      const SizedBox(height: 14),
                      _buildDropdownField<String>(
                        label: 'Guru Pengampu *',
                        value: _selectedTeacher,
                        items: ScheduleService.teacherOptions,
                        onChanged: (val) {
                          if (val != null) setState(() { _selectedTeacher = val; _conflictErrorMessage = null; });
                        },
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // 3. Form Section: Alokasi Waktu (Jam Mulai - Selesai)
                  _buildSectionCard(
                    title: 'Alokasi Waktu Belajar',
                    icon: Icons.access_time_rounded,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: _buildTimeInputField(
                              label: 'Jam Mulai *',
                              controller: _startTimeController,
                              titlePicker: 'Pilih Jam Mulai',
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _buildTimeInputField(
                              label: 'Jam Selesai *',
                              controller: _endTimeController,
                              titlePicker: 'Pilih Jam Selesai',
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        '* Format jam 24 jam (contoh: 07:30, 08:15). Ketuk untuk memilih jam.',
                        style: TextStyle(
                          fontSize: 11.5,
                          color: Colors.grey.shade600,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // 4. Form Section: Ruangan & Catatan
                  _buildSectionCard(
                    title: 'Informasi Tambahan',
                    icon: Icons.info_outline_rounded,
                    children: [
                      _buildTextInputField(
                        label: 'Ruangan Belajar',
                        controller: _roomController,
                        hint: 'Contoh: Ruang Kelas VII A',
                      ),
                      const SizedBox(height: 14),
                      _buildTextInputField(
                        label: 'Catatan Khusus (Opsional)',
                        controller: _notesController,
                        hint: 'Contoh: Membawa buku catatan Fiqih',
                        maxLines: 2,
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // 5. Tombol Aksi Bawah: Batal & Simpan
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _isLoading ? null : () => Navigator.pop(context),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.border),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: const Text(
                            'Batal',
                            style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _saveSchedule,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                                )
                              : Text(
                                  _isEditMode ? 'Simpan Perubahan' : 'Tambah Jadwal',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 14.5,
                                  ),
                                ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildConflictBanner(String error) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFDE8E8),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.error.withOpacity(0.4)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.error_outline_rounded, color: AppColors.error, size: 22),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Bentrok / Kesalahan Jadwal:',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.error,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  error,
                  style: const TextStyle(
                    fontSize: 12.5,
                    color: Color(0xFF7A1C1C),
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: AppColors.primary, size: 20),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ...children,
        ],
      ),
    );
  }

  Widget _buildDropdownField<T>({
    required String label,
    required T value,
    required List<T> items,
    required ValueChanged<T?> onChanged,
    String Function(T)? itemLabel,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 6),
        DropdownButtonFormField<T>(
          value: items.contains(value) ? value : items.first,
          items: items.map((item) {
            final text = itemLabel != null ? itemLabel(item) : item.toString();
            return DropdownMenuItem<T>(
              value: item,
              child: Text(
                text,
                style: const TextStyle(fontSize: 13.5, color: AppColors.textPrimary),
              ),
            );
          }).toList(),
          onChanged: onChanged,
          isExpanded: true,
          decoration: InputDecoration(
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
            ),
            filled: true,
            fillColor: Colors.grey.shade50,
          ),
        ),
      ],
    );
  }

  Widget _buildTimeInputField({
    required String label,
    required TextEditingController controller,
    required String titlePicker,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          readOnly: true,
          onTap: () => _selectTime(controller, titlePicker),
          validator: (v) {
            if (v == null || v.trim().isEmpty) return 'Wajib diisi';
            if (!v.contains(':')) return 'Format HH:mm';
            return null;
          },
          decoration: InputDecoration(
            prefixIcon: const Icon(Icons.access_time, size: 18, color: AppColors.primary),
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
            ),
            filled: true,
            fillColor: Colors.grey.shade50,
          ),
        ),
      ],
    );
  }

  Widget _buildTextInputField({
    required String label,
    required TextEditingController controller,
    required String hint,
    int maxLines = 1,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          maxLines: maxLines,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
            ),
            filled: true,
            fillColor: Colors.grey.shade50,
          ),
        ),
      ],
    );
  }
}
