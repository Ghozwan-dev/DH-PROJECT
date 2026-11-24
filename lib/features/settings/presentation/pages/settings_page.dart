import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../auth/data/models/user_model.dart';
import '../../../auth/data/services/auth_service.dart';
import '../../data/models/settings_models.dart';
import '../../data/services/settings_service.dart';

/// Halaman Pengaturan Utama Darul Hikmah
class SettingsPage extends StatefulWidget {
  final UserModel currentUser;

  const SettingsPage({
    Key? key,
    required this.currentUser,
  }) : super(key: key);

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  final SettingsService _settingsService = SettingsService();
  late UserModel _user;

  @override
  void initState() {
    super.initState();
    _user = widget.currentUser;
  }

  void _showToast(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? AppColors.error : AppColors.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _confirmLogout() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: const [
            Icon(Icons.logout_rounded, color: AppColors.error),
            SizedBox(width: 8),
            Text('Konfirmasi Keluar', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          ],
        ),
        content: const Text(
          'Apakah Anda yakin ingin keluar dari akun sistem Darul Hikmah?',
          style: TextStyle(fontSize: 13, color: AppColors.textPrimary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              AuthService().logout();
              Navigator.of(context).pushNamedAndRemoveUntil(
                AppConstants.routeLogin,
                (route) => false,
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Keluar'),
          ),
        ],
      ),
    );
  }

  // ================= DETAIL PANELS =================

  void _openProfileDetail() {
    final nameCtrl = TextEditingController(text: _user.fullName);
    final phoneCtrl = TextEditingController(text: _user.phoneNumber);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
          padding: EdgeInsets.only(
            top: 20,
            left: 20,
            right: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Profil Saya', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  IconButton(icon: const Icon(Icons.close, size: 20), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const Divider(),
              const SizedBox(height: 8),
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(
                  labelText: 'Nama Lengkap *',
                  prefixIcon: Icon(Icons.person_outline_rounded, size: 18),
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: TextEditingController(text: _user.username),
                enabled: false,
                decoration: const InputDecoration(
                  labelText: 'Username',
                  prefixIcon: Icon(Icons.alternate_email_rounded, size: 18),
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: TextEditingController(text: _user.email ?? '-'),
                enabled: false,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  prefixIcon: Icon(Icons.mail_outline_rounded, size: 18),
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: phoneCtrl,
                decoration: const InputDecoration(
                  labelText: 'Nomor Kontak *',
                  prefixIcon: Icon(Icons.phone_outlined, size: 18),
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    final newName = nameCtrl.text.trim();
                    final newPhone = phoneCtrl.text.trim();
                    if (newName.isEmpty) {
                      _showToast('Nama lengkap tidak boleh kosong', isError: true);
                      return;
                    }
                    setState(() {
                      _user = _user.copyWith(fullName: newName, phoneNumber: newPhone);
                    });
                    Navigator.pop(ctx);
                    _showToast('Profil berhasil diperbarui');
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Simpan Perubahan'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _openSecurityDetail() {
    final curPassCtrl = TextEditingController();
    final newPassCtrl = TextEditingController();
    final confirmPassCtrl = TextEditingController();
    String? errorText;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
          padding: EdgeInsets.only(
            top: 20,
            left: 20,
            right: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Keamanan Akun & Ubah Password', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  IconButton(icon: const Icon(Icons.close, size: 20), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const Divider(),
              if (errorText != null) ...[
                Container(
                  padding: const EdgeInsets.all(8),
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: AppColors.error.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, color: AppColors.error, size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(errorText!, style: const TextStyle(fontSize: 12, color: AppColors.error)),
                      ),
                    ],
                  ),
                ),
              ],
              TextField(
                controller: curPassCtrl,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Password Saat Ini *',
                  prefixIcon: Icon(Icons.lock_outline_rounded, size: 18),
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: newPassCtrl,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Password Baru (min. 6 karakter) *',
                  prefixIcon: Icon(Icons.vpn_key_outlined, size: 18),
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: confirmPassCtrl,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Konfirmasi Password Baru *',
                  prefixIcon: Icon(Icons.check_circle_outline, size: 18),
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    final res = _settingsService.changePassword(
                      currentPassword: curPassCtrl.text,
                      newPassword: newPassCtrl.text,
                      confirmPassword: confirmPassCtrl.text,
                    );
                    if (!res.success) {
                      setModalState(() {
                        errorText = res.message;
                      });
                      return;
                    }
                    Navigator.pop(ctx);
                    _showToast(res.message);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Perbarui Password'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _openPesantrenSettings() {
    if (!_user.isAdmin) {
      _showToast('Akses ditolak: Menu khusus Administrator Pondok.', isError: true);
      return;
    }

    final cur = _settingsService.getPesantrenSettings(_user);
    final nameCtrl = TextEditingController(text: cur.namaPesantren);
    final addrCtrl = TextEditingController(text: cur.alamat);
    final phoneCtrl = TextEditingController(text: cur.telepon);
    final yearCtrl = TextEditingController(text: cur.tahunAjaran);
    String semester = cur.semester;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
          padding: EdgeInsets.only(
            top: 20,
            left: 20,
            right: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Pengaturan Pesantren', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  IconButton(icon: const Icon(Icons.close, size: 20), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const Divider(),
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(
                  labelText: 'Nama Pesantren *',
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: addrCtrl,
                decoration: const InputDecoration(
                  labelText: 'Alamat Pesantren',
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: phoneCtrl,
                decoration: const InputDecoration(
                  labelText: 'Nomor Kontak',
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: yearCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Tahun Ajaran',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: semester,
                      decoration: const InputDecoration(
                        labelText: 'Semester',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                      items: const [
                        DropdownMenuItem(value: 'Ganjil', child: Text('Ganjil')),
                        DropdownMenuItem(value: 'Genap', child: Text('Genap')),
                      ],
                      onChanged: (val) {
                        if (val != null) setModalState(() => semester = val);
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    final res = _settingsService.updatePesantrenSettings(
                      user: _user,
                      newSettings: cur.copyWith(
                        namaPesantren: nameCtrl.text.trim(),
                        alamat: addrCtrl.text.trim(),
                        telepon: phoneCtrl.text.trim(),
                        tahunAjaran: yearCtrl.text.trim(),
                        semester: semester,
                      ),
                    );
                    if (res.success) {
                      Navigator.pop(ctx);
                      _showToast(res.message);
                    } else {
                      _showToast(res.message, isError: true);
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Simpan Pengaturan'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _openAttendanceSettings() {
    if (!_user.isAdmin) {
      _showToast('Akses ditolak: Menu khusus Administrator Pondok.', isError: true);
      return;
    }

    final cur = _settingsService.getAttendanceSettings(_user);
    final startTimeCtrl = TextEditingController(text: cur.jamMulaiKbm);
    final endTimeCtrl = TextEditingController(text: cur.jamSelesaiKbm);
    final toleranceCtrl = TextEditingController(text: cur.toleransiTerlambatMenit.toString());
    final minPctCtrl = TextEditingController(text: cur.minimalKehadiranPersen.toString());
    bool autoAlfa = cur.notifikasiOtomatisAlfa;
    bool guruEdit = cur.guruBolehEditAbsensi;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
          padding: EdgeInsets.only(
            top: 20,
            left: 20,
            right: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Pengaturan Absensi KBM', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  IconButton(icon: const Icon(Icons.close, size: 20), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const Divider(),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: startTimeCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Jam Mulai KBM',
                        hintText: '07:30',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: endTimeCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Jam Selesai KBM',
                        hintText: '15:30',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: toleranceCtrl,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Toleransi Terlambat (menit)',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: minPctCtrl,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Min. Kehadiran Ujian (%)',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Notifikasi Otomatis Santri Alfa', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                subtitle: const Text('Kirim peringatan jika santri tidak hadir tanpa keterangan', style: TextStyle(fontSize: 11)),
                value: autoAlfa,
                activeColor: AppColors.primary,
                onChanged: (val) => setModalState(() => autoAlfa = val),
              ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Izin Guru Ubah Absensi', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                subtitle: const Text('Izinkan guru pengampu memperbarui status absensi yang telah tersimpan', style: TextStyle(fontSize: 11)),
                value: guruEdit,
                activeColor: AppColors.primary,
                onChanged: (val) => setModalState(() => guruEdit = val),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    final res = _settingsService.updateAttendanceSettings(
                      user: _user,
                      newSettings: cur.copyWith(
                        jamMulaiKbm: startTimeCtrl.text.trim(),
                        jamSelesaiKbm: endTimeCtrl.text.trim(),
                        toleransiTerlambatMenit: int.tryParse(toleranceCtrl.text) ?? 15,
                        minimalKehadiranPersen: int.tryParse(minPctCtrl.text) ?? 75,
                        notifikasiOtomatisAlfa: autoAlfa,
                        guruBolehEditAbsensi: guruEdit,
                      ),
                    );
                    if (res.success) {
                      Navigator.pop(ctx);
                      _showToast(res.message);
                    } else {
                      _showToast(res.message, isError: true);
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Simpan Pengaturan Absensi'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _openNotificationPreferences() {
    final cur = _settingsService.getNotificationPreferences(_user.id);
    bool sesiBaru = cur.sesiAbsensiBaru;
    bool rekap = cur.rekapMingguan;
    bool jadwal = cur.perubahanJadwal;
    bool pengumuman = cur.pengumumanPesantren;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
          padding: const EdgeInsets.all(20),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Preferensi Notifikasi', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  IconButton(icon: const Icon(Icons.close, size: 20), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const Divider(),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Sesi Absensi Masuk', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                subtitle: const Text('Pemberitahuan saat sesi absensi baru tercatat', style: TextStyle(fontSize: 11)),
                value: sesiBaru,
                activeColor: AppColors.primary,
                onChanged: (val) => setModalState(() => sesiBaru = val),
              ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Rekap Kehadiran Mingguan', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                subtitle: const Text('Ringkasan statistik kehadiran berkala', style: TextStyle(fontSize: 11)),
                value: rekap,
                activeColor: AppColors.primary,
                onChanged: (val) => setModalState(() => rekap = val),
              ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Perubahan Jadwal Pelajaran', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                subtitle: const Text('Pemberitahuan perubahan jam atau alokasi kelas', style: TextStyle(fontSize: 11)),
                value: jadwal,
                activeColor: AppColors.primary,
                onChanged: (val) => setModalState(() => jadwal = val),
              ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Pengumuman Penting Pesantren', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                subtitle: const Text('Informasi resmi bagian akademik pesantren', style: TextStyle(fontSize: 11)),
                value: pengumuman,
                activeColor: AppColors.primary,
                onChanged: (val) => setModalState(() => pengumuman = val),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    final res = _settingsService.updateNotificationPreferences(
                      userId: _user.id,
                      preferences: cur.copyWith(
                        sesiAbsensiBaru: sesiBaru,
                        rekapMingguan: rekap,
                        perubahanJadwal: jadwal,
                        pengumumanPesantren: pengumuman,
                      ),
                    );
                    Navigator.pop(ctx);
                    _showToast(res.message);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Simpan Preferensi'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ================= UI BUILD =================

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width > 700;

    return Scaffold(
      backgroundColor: AppColors.dashboardBg,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        scrolledUnderElevation: 1,
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: AppColors.textPrimary),
          tooltip: 'Kembali ke Beranda',
          onPressed: () => Navigator.pop(context),
        ),
        titleSpacing: 0,
        title: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              margin: const EdgeInsets.only(right: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFDCFCE7), width: 1),
              ),
              child: const Icon(
                Icons.settings_outlined,
                color: AppColors.primary,
                size: 20,
              ),
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: const [
                  Text(
                    'Pengaturan',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                      letterSpacing: -0.2,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: 3),
                  Text(
                    'Pondok Pesantren Islam Darul Hikmah',
                    style: TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF64748B),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(
            color: const Color(0xFFE2E8F0),
            height: 1.0,
          ),
        ),
      ),
      body: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 720),
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: EdgeInsets.symmetric(
              horizontal: isWide ? 24 : 16,
              vertical: 16,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Info Pengguna Card
                _buildUserProfileCard(),
                const SizedBox(height: 20),

                // 2. Kategori: AKUN
                _buildSectionHeader('AKUN'),
                _buildCardGroup([
                  _buildMenuItem(
                    icon: Icons.person_outline_rounded,
                    title: 'Profil Saya',
                    subtitle: 'Informasi identitas dan kontak akun',
                    onTap: _openProfileDetail,
                  ),
                  _buildMenuItem(
                    icon: Icons.lock_outline_rounded,
                    title: 'Keamanan Akun',
                    subtitle: 'Kelola kata sandi dan proteksi akun',
                    onTap: _openSecurityDetail,
                  ),
                  _buildMenuItem(
                    icon: Icons.notifications_none_rounded,
                    title: 'Notifikasi',
                    subtitle: 'Atur preferensi pemberitahuan sistem',
                    onTap: _openNotificationPreferences,
                    isLast: true,
                  ),
                ]),
                const SizedBox(height: 18),

                // 3. Kategori: SISTEM PESANTREN (Khusus Admin)
                if (_user.isAdmin) ...[
                  _buildSectionHeader('SISTEM PESANTREN (KHUSUS ADMIN)'),
                  _buildCardGroup([
                    _buildMenuItem(
                      icon: Icons.account_balance_outlined,
                      title: 'Pengaturan Pesantren',
                      subtitle: 'Konfigurasi nama, alamat, dan tahun ajaran',
                      onTap: _openPesantrenSettings,
                    ),
                    _buildMenuItem(
                      icon: Icons.tune_rounded,
                      title: 'Pengaturan Absensi',
                      subtitle: 'Jam KBM, toleransi keterlambatan, dan izin edit',
                      onTap: _openAttendanceSettings,
                      isLast: true,
                    ),
                  ]),
                  const SizedBox(height: 18),
                ],

                // 4. Kategori: SESI
                _buildSectionHeader('SESI'),
                _buildCardGroup([
                  _buildMenuItem(
                    icon: Icons.logout_rounded,
                    title: 'Keluar dari Akun',
                    subtitle: 'Akhiri sesi aktif pada perangkat ini',
                    onTap: _confirmLogout,
                    isDestructive: true,
                    isLast: true,
                  ),
                ]),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildUserProfileCard() {
    final initials = _user.fullName.isNotEmpty
        ? _user.fullName.trim().split(' ').map((w) => w.isNotEmpty ? w[0] : '').take(2).join()
        : 'DH';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.primary,
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Text(
              initials.toUpperCase(),
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w700,
                fontSize: 16,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _user.fullName,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '@${_user.username} • ${_user.email ?? _user.phoneNumber}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF64748B),
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: _user.isAdmin ? const Color(0xFFDCFCE7) : const Color(0xFFFEF3C7),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              _user.isAdmin ? 'Admin' : 'Guru',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: _user.isAdmin ? const Color(0xFF166534) : const Color(0xFF92400E),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
          color: Color(0xFF64748B),
        ),
      ),
    );
  }

  Widget _buildCardGroup(List<Widget> items) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Column(children: items),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    bool isDestructive = false,
    bool isLast = false,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: isLast
          ? const BorderRadius.vertical(bottom: Radius.circular(14))
          : BorderRadius.zero,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: isDestructive ? const Color(0xFFFEE2E2) : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    icon,
                    size: 18,
                    color: isDestructive ? AppColors.error : AppColors.primary,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w600,
                          color: isDestructive ? AppColors.error : AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        subtitle,
                        style: const TextStyle(
                          fontSize: 11.5,
                          color: Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(
                  Icons.arrow_forward_ios_rounded,
                  size: 14,
                  color: Color(0xFF94A3B8),
                ),
              ],
            ),
          ),
          if (!isLast)
            const Divider(height: 1, indent: 64, endIndent: 16, color: Color(0xFFF1F5F9)),
        ],
      ),
    );
  }
}
