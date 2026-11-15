import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/custom_text_field.dart';
import '../../../../core/widgets/feedback_banner.dart';
import '../../data/models/student_model.dart';
import '../../data/services/student_service.dart';

/// Halaman Formulir Tambah & Edit Santri (Sesuai Butir F):
/// - Validasi NIS, Nama, Gender, Kelas, Kamar, dan Tanggal Masuk
/// - Penanganan tambah santri baru atau pembaruan santri eksisting
class StudentFormPage extends StatefulWidget {
  final StudentModel? student;

  const StudentFormPage({Key? key, this.student}) : super(key: key);

  @override
  State<StudentFormPage> createState() => _StudentFormPageState();
}

class _StudentFormPageState extends State<StudentFormPage> {
  final _formKey = GlobalKey<FormState>();
  final _studentService = StudentService();

  late TextEditingController _nisController;
  late TextEditingController _nameController;
  late TextEditingController _roomController;
  late TextEditingController _birthPlaceController;
  late TextEditingController _addressController;
  late TextEditingController _parentNameController;
  late TextEditingController _parentPhoneController;

  late SantriGender _selectedGender;
  late String _selectedClass;
  DateTime? _birthDate;
  late DateTime _enrollmentDate;
  late bool _isActive;
  String? _selectedAvatar;

  bool _isLoading = false;

  bool get _isEditMode => widget.student != null;

  static const List<String> classOptions = [
    'VII A',
    'VII B',
    'VIII A',
    'VIII B',
    'IX A',
    'IX B',
    'X A',
    'X B',
    'XI A',
    'XI B',
    'XII A',
    'XII B',
  ];

  @override
  void initState() {
    super.initState();
    final s = widget.student;

    _nisController = TextEditingController(text: s?.nis ?? '');
    _nameController = TextEditingController(text: s?.fullName ?? '');
    _roomController = TextEditingController(text: s?.room ?? '');
    _birthPlaceController = TextEditingController(text: s?.birthPlace ?? '');
    _addressController = TextEditingController(text: s?.address ?? '');
    _parentNameController = TextEditingController(text: s?.parentName ?? '');
    _parentPhoneController = TextEditingController(text: s?.parentPhone ?? '');

    _selectedGender = s?.gender ?? SantriGender.putra;
    _selectedClass = s?.className ?? classOptions.first;
    _birthDate = s?.birthDate;
    _enrollmentDate = s?.enrollmentDate ?? DateTime.now();
    _isActive = s?.isActive ?? true;
    _selectedAvatar = s?.avatarAsset ?? (_selectedGender == SantriGender.putra ? 'assets/images/santri_ahmad.png' : 'assets/images/santri_aisyah.png');
  }

  @override
  void dispose() {
    _nisController.dispose();
    _nameController.dispose();
    _roomController.dispose();
    _birthPlaceController.dispose();
    _addressController.dispose();
    _parentNameController.dispose();
    _parentPhoneController.dispose();
    super.dispose();
  }

  Future<void> _pickBirthDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _birthDate ?? DateTime(2010, 8, 17),
      firstDate: DateTime(1945),
      lastDate: DateTime.now(),
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
      setState(() {
        _birthDate = picked;
      });
    }
  }

  Future<void> _pickEnrollmentDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _enrollmentDate,
      firstDate: DateTime(2015),
      lastDate: DateTime.now().add(const Duration(days: 365)),
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
      setState(() {
        _enrollmentDate = picked;
      });
    }
  }

  void _handleSave() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final newStudent = StudentModel(
      id: widget.student?.id ?? 'SNT-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      nis: _nisController.text.trim(),
      fullName: _nameController.text.trim(),
      gender: _selectedGender,
      className: _selectedClass,
      room: _roomController.text.trim(),
      birthPlace: _birthPlaceController.text.trim().isEmpty ? (widget.student?.birthPlace ?? 'Sumenep') : _birthPlaceController.text.trim(),
      birthDate: _birthDate ?? (widget.student?.birthDate ?? DateTime(2010, 8, 17)),
      address: _addressController.text.trim().isEmpty ? (widget.student?.address ?? 'Kangean, Sumenep') : _addressController.text.trim(),
      parentName: _parentNameController.text.trim().isEmpty ? (widget.student?.parentName ?? 'Wali Santri') : _parentNameController.text.trim(),
      parentPhone: _parentPhoneController.text.trim().isEmpty ? (widget.student?.parentPhone ?? '081234567890') : _parentPhoneController.text.trim(),
      enrollmentDate: _enrollmentDate,
      isActive: _isActive,
      avatarAsset: _selectedAvatar,
    );

    bool success;
    if (_isEditMode) {
      success = _studentService.updateStudent(newStudent);
    } else {
      success = _studentService.addStudent(newStudent);
    }

    setState(() {
      _isLoading = false;
    });

    if (success) {
      FeedbackBanner.showSuccess(
        context,
        _isEditMode
            ? 'Data santri "${newStudent.fullName}" berhasil diperbarui.'
            : 'Santri "${newStudent.fullName}" berhasil ditambahkan.',
      );
      Navigator.pop(context, newStudent);
    } else {
      FeedbackBanner.showError(
        context,
        'Gagal menyimpan data santri. NIS "${newStudent.nis}" sudah terdaftar.',
      );
    }
  }

  void _showPickAvatarBottomSheet() {
    final isMale = _selectedGender == SantriGender.putra;
    final malePresets = [
      'assets/images/santri_ahmad.png',
      'assets/images/santri_rizky.png',
      'assets/images/santri_putra_2.png',
      'assets/images/santri_putra_3.png',
    ];
    final femalePresets = [
      'assets/images/santri_aisyah.png',
      'assets/images/santri_putri_2.png',
      'assets/images/santri_putri_3.png',
    ];
    final presets = isMale ? malePresets : femalePresets;

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Pilih Foto Profil Santri (${isMale ? 'Putra' : 'Putri'})',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, size: 20),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Pilih dari pilihan foto avatar santri ${isMale ? 'putra' : 'putri'}:',
                  style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  children: presets.map((path) {
                    final isCurrent = _selectedAvatar == path;
                    return InkWell(
                      onTap: () {
                        setState(() {
                          _selectedAvatar = path;
                        });
                        Navigator.pop(ctx);
                      },
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        width: 68,
                        height: 68,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isCurrent ? AppColors.primary : Colors.grey.shade300,
                            width: isCurrent ? 3 : 1.5,
                          ),
                          boxShadow: [
                            if (isCurrent)
                              BoxShadow(
                                color: AppColors.primary.withOpacity(0.3),
                                blurRadius: 8,
                              ),
                          ],
                        ),
                        child: ClipOval(
                          child: Image.asset(
                            path,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => const Icon(Icons.person, color: AppColors.primary),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 20),
                const Divider(),
                const SizedBox(height: 10),
                OutlinedButton.icon(
                  onPressed: () {
                    final altPath = isMale ? 'assets/images/santri_rizky.png' : 'assets/images/santri_putri_2.png';
                    setState(() {
                      _selectedAvatar = altPath;
                    });
                    Navigator.pop(ctx);
                  },
                  icon: const Icon(Icons.photo_library_outlined, size: 18, color: AppColors.primary),
                  label: const Text(
                    'Pilih dari Galeri Perangkat',
                    style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.primary),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    minimumSize: const Size.fromHeight(44),
                  ),
                ),
                const SizedBox(height: 10),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
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
          _isEditMode ? 'Edit Data Santri' : 'Tambah Santri Baru',
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
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Foto Profil Santri (Khusus Admin)
                  Center(
                    child: Column(
                      children: [
                        Stack(
                          clipBehavior: Clip.none,
                          children: [
                            Container(
                              width: 84,
                              height: 84,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: _selectedGender.backgroundColor,
                                border: Border.all(color: _selectedGender.color, width: 2.5),
                              ),
                              child: ClipOval(
                                child: _selectedAvatar != null
                                    ? Image.asset(
                                        _selectedAvatar!,
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, __, ___) => const Icon(Icons.person, color: AppColors.primary, size: 40),
                                      )
                                    : const Icon(Icons.person, color: AppColors.primary, size: 40),
                              ),
                            ),
                            Positioned(
                              bottom: -2,
                              right: -2,
                              child: InkWell(
                                onTap: _showPickAvatarBottomSheet,
                                borderRadius: BorderRadius.circular(20),
                                child: Container(
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary,
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.white, width: 2),
                                    boxShadow: const [
                                      BoxShadow(color: Color(0x33000000), blurRadius: 4, offset: Offset(0, 2)),
                                    ],
                                  ),
                                  child: const Icon(Icons.camera_alt_rounded, size: 15, color: Colors.white),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        TextButton.icon(
                          onPressed: _showPickAvatarBottomSheet,
                          icon: const Icon(Icons.add_a_photo_outlined, size: 15, color: AppColors.primary),
                          label: const Text(
                            'Pilih / Ganti Foto Profil',
                            style: TextStyle(color: AppColors.primary, fontSize: 12.5, fontWeight: FontWeight.w700),
                          ),
                        ),
                        const SizedBox(height: 10),
                      ],
                    ),
                  ),

                  // Section 1: Data Identitas & Akademik
                  _buildFormCard(
                    title: 'Identitas & Akademik Santri',
                    icon: Icons.badge_outlined,
                    children: [
                      // NIS
                      const Text('Nomor Induk Santri (NIS) *', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      CustomTextField(
                        controller: _nisController,
                        hintText: 'Contoh: 2024015',
                        prefixIcon: Icons.pin_outlined,
                        keyboardType: TextInputType.number,
                        validator: (val) {
                          if (val == null || val.trim().isEmpty) return 'NIS wajib diisi';
                          if (val.trim().length < 4) return 'NIS minimal 4 digit angka';
                          return null;
                        },
                      ),
                      const SizedBox(height: 14),

                      // Nama Lengkap
                      const Text('Nama Lengkap Santri *', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      CustomTextField(
                        controller: _nameController,
                        hintText: 'Masukkan nama lengkap santri',
                        prefixIcon: Icons.person_outline,
                        textCapitalization: TextCapitalization.words,
                        validator: (val) {
                          if (val == null || val.trim().isEmpty) return 'Nama santri wajib diisi';
                          if (val.trim().length < 3) return 'Nama minimal 3 karakter';
                          return null;
                        },
                      ),
                      const SizedBox(height: 14),

                      // Jenis Kelamin
                      const Text('Jenis Kelamin *', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: _buildGenderRadio(SantriGender.putra, 'Santri Putra (L)'),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _buildGenderRadio(SantriGender.putri, 'Santri Putri (P)'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),

                      // Kelas & Kamar
                      const Text('Kelas *', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border, width: 1.2),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _selectedClass,
                            isExpanded: true,
                            icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.primary),
                            items: classOptions.map((c) {
                              return DropdownMenuItem(value: c, child: Text('Kelas $c', style: const TextStyle(fontSize: 14)));
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) setState(() => _selectedClass = val);
                            },
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),

                      const Text('Kamar Asrama *', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      CustomTextField(
                        controller: _roomController,
                        hintText: 'Contoh: Al-Fatih 01',
                        prefixIcon: Icons.meeting_room_outlined,
                        validator: (val) {
                          if (val == null || val.trim().isEmpty) return 'Kamar wajib diisi';
                          return null;
                        },
                      ),
                      const SizedBox(height: 14),

                      // Tanggal Masuk
                      const Text('Tanggal Masuk Pondok *', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      InkWell(
                        onTap: _pickEnrollmentDate,
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.border, width: 1.2),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.calendar_today_outlined, size: 18, color: AppColors.primary),
                              const SizedBox(width: 12),
                              Text(
                                '${_enrollmentDate.day.toString().padLeft(2, '0')}-${_enrollmentDate.month.toString().padLeft(2, '0')}-${_enrollmentDate.year}',
                                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                              ),
                              const Spacer(),
                              const Icon(Icons.edit_calendar_rounded, size: 18, color: AppColors.textMuted),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Section 2: Data Pribadi & Wali
                  _buildFormCard(
                    title: 'Data Pribadi & Orang Tua/Wali',
                    icon: Icons.person_search_outlined,
                    children: [
                      // Tempat Lahir & Tanggal Lahir (Layout 1 Kolom Responsif)
                      const Text('Tempat Lahir', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      CustomTextField(
                        controller: _birthPlaceController,
                        hintText: 'Kota kelahiran (Contoh: Sumenep)',
                        prefixIcon: Icons.location_city_outlined,
                      ),
                      const SizedBox(height: 14),

                      const Text('Tanggal Lahir', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      InkWell(
                        onTap: _pickBirthDate,
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.border, width: 1.2),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.cake_outlined, size: 18, color: AppColors.primary),
                              const SizedBox(width: 12),
                              Text(
                                _birthDate == null
                                    ? '17/08/1945'
                                    : '${_birthDate!.day.toString().padLeft(2, '0')}/${_birthDate!.month.toString().padLeft(2, '0')}/${_birthDate!.year}',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: _birthDate == null ? FontWeight.w500 : FontWeight.w600,
                                  color: _birthDate == null ? AppColors.textHint : AppColors.textPrimary,
                                ),
                              ),
                              const Spacer(),
                              const Icon(Icons.edit_calendar_rounded, size: 18, color: AppColors.textMuted),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Alamat
                      const Text('Alamat Lengkap Asal', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      CustomTextField(
                        controller: _addressController,
                        hintText: 'Alamat lengkap desa/kecamatan/kota',
                        prefixIcon: Icons.home_outlined,
                      ),
                      const SizedBox(height: 14),

                      // Nama Wali
                      const Text('Nama Orang Tua / Wali', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      CustomTextField(
                        controller: _parentNameController,
                        hintText: 'Nama lengkap orang tua/wali santri',
                        prefixIcon: Icons.family_restroom_outlined,
                      ),
                      const SizedBox(height: 14),

                      // Nomor Telepon Wali
                      const Text('Nomor Telepon / WhatsApp Wali', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      CustomTextField(
                        controller: _parentPhoneController,
                        hintText: 'Contoh: 081234567890',
                        prefixIcon: Icons.phone_outlined,
                        keyboardType: TextInputType.phone,
                      ),
                      const SizedBox(height: 14),

                      // Switch Status Keaktifan
                      InkWell(
                        onTap: () => setState(() => _isActive = !_isActive),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: AppColors.dashboardBg,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('Status Santri Aktif', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700)),
                                    const SizedBox(height: 2),
                                    Text(
                                      _isActive ? 'Santri sedang aktif menempuh pendidikan' : 'Santri tidak aktif / cuti / mutasi',
                                      style: TextStyle(
                                        fontSize: 11.5,
                                        color: _isActive ? AppColors.primary : AppColors.error,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Switch(
                                value: _isActive,
                                activeColor: AppColors.primary,
                                onChanged: (val) => setState(() => _isActive = val),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // Tombol Simpan
                  CustomButton(
                    text: _isEditMode ? 'Perbarui Data Santri' : 'Simpan Santri Baru',
                    isLoading: _isLoading,
                    onPressed: _handleSave,
                  ),

                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildGenderRadio(SantriGender gender, String label) {
    final isSelected = _selectedGender == gender;
    return InkWell(
      onTap: () => setState(() => _selectedGender = gender),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: isSelected ? gender.backgroundColor : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? gender.color : AppColors.border,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              gender == SantriGender.putra ? Icons.male_rounded : Icons.female_rounded,
              color: isSelected ? gender.color : AppColors.textMuted,
              size: 20,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 12.5,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? gender.color : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFormCard({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 20, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                  letterSpacing: -0.2,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          const SizedBox(height: 14),
          ...children,
        ],
      ),
    );
  }
}
