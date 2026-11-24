/// Model Konfigurasi Pengaturan Pesantren (Khusus Admin)
class PesantrenSettingsModel {
  final String namaPesantren;
  final String alamat;
  final String telepon;
  final String email;
  final String tahunAjaran;
  final String semester;
  final String pimpinan;

  const PesantrenSettingsModel({
    required this.namaPesantren,
    required this.alamat,
    required this.telepon,
    required this.email,
    required this.tahunAjaran,
    required this.semester,
    required this.pimpinan,
  });

  factory PesantrenSettingsModel.defaultSettings() {
    return const PesantrenSettingsModel(
      namaPesantren: 'Pondok Pesantren Islam Darul Hikmah',
      alamat: 'Cellong, Arjasa, Kepulauan Kangean, Sumenep, Jawa Timur',
      telepon: '+62 812-3456-7890',
      email: 'sekretariat@darulhikmah.ponpes.id',
      tahunAjaran: '2024/2025',
      semester: 'Ganjil',
      pimpinan: "K.H. Abdullah Syafi'i",
    );
  }

  PesantrenSettingsModel copyWith({
    String? namaPesantren,
    String? alamat,
    String? telepon,
    String? email,
    String? tahunAjaran,
    String? semester,
    String? pimpinan,
  }) {
    return PesantrenSettingsModel(
      namaPesantren: namaPesantren ?? this.namaPesantren,
      alamat: alamat ?? this.alamat,
      telepon: telepon ?? this.telepon,
      email: email ?? this.email,
      tahunAjaran: tahunAjaran ?? this.tahunAjaran,
      semester: semester ?? this.semester,
      pimpinan: pimpinan ?? this.pimpinan,
    );
  }
}

/// Model Konfigurasi Pengaturan Absensi (Khusus Admin)
class AttendanceSettingsModel {
  final String jamMulaiKbm;
  final String jamSelesaiKbm;
  final int toleransiTerlambatMenit;
  final int minimalKehadiranPersen;
  final bool notifikasiOtomatisAlfa;
  final bool guruBolehEditAbsensi;

  const AttendanceSettingsModel({
    required this.jamMulaiKbm,
    required this.jamSelesaiKbm,
    required this.toleransiTerlambatMenit,
    required this.minimalKehadiranPersen,
    required this.notifikasiOtomatisAlfa,
    required this.guruBolehEditAbsensi,
  });

  factory AttendanceSettingsModel.defaultSettings() {
    return const AttendanceSettingsModel(
      jamMulaiKbm: '07:30',
      jamSelesaiKbm: '15:30',
      toleransiTerlambatMenit: 15,
      minimalKehadiranPersen: 75,
      notifikasiOtomatisAlfa: true,
      guruBolehEditAbsensi: true,
    );
  }

  AttendanceSettingsModel copyWith({
    String? jamMulaiKbm,
    String? jamSelesaiKbm,
    int? toleransiTerlambatMenit,
    int? minimalKehadiranPersen,
    bool? notifikasiOtomatisAlfa,
    bool? guruBolehEditAbsensi,
  }) {
    return AttendanceSettingsModel(
      jamMulaiKbm: jamMulaiKbm ?? this.jamMulaiKbm,
      jamSelesaiKbm: jamSelesaiKbm ?? this.jamSelesaiKbm,
      toleransiTerlambatMenit: toleransiTerlambatMenit ?? this.toleransiTerlambatMenit,
      minimalKehadiranPersen: minimalKehadiranPersen ?? this.minimalKehadiranPersen,
      notifikasiOtomatisAlfa: notifikasiOtomatisAlfa ?? this.notifikasiOtomatisAlfa,
      guruBolehEditAbsensi: guruBolehEditAbsensi ?? this.guruBolehEditAbsensi,
    );
  }
}

/// Model Preferensi Notifikasi Pengguna (Admin & Guru)
class NotificationPreferencesModel {
  final bool sesiAbsensiBaru;
  final bool rekapMingguan;
  final bool perubahanJadwal;
  final bool pengumumanPesantren;

  const NotificationPreferencesModel({
    required this.sesiAbsensiBaru,
    required this.rekapMingguan,
    required this.perubahanJadwal,
    required this.pengumumanPesantren,
  });

  factory NotificationPreferencesModel.defaultPreferences() {
    return const NotificationPreferencesModel(
      sesiAbsensiBaru: true,
      rekapMingguan: true,
      perubahanJadwal: true,
      pengumumanPesantren: true,
    );
  }

  NotificationPreferencesModel copyWith({
    bool? sesiAbsensiBaru,
    bool? rekapMingguan,
    bool? perubahanJadwal,
    bool? pengumumanPesantren,
  }) {
    return NotificationPreferencesModel(
      sesiAbsensiBaru: sesiAbsensiBaru ?? this.sesiAbsensiBaru,
      rekapMingguan: rekapMingguan ?? this.rekapMingguan,
      perubahanJadwal: perubahanJadwal ?? this.perubahanJadwal,
      pengumumanPesantren: pengumumanPesantren ?? this.pengumumanPesantren,
    );
  }
}
