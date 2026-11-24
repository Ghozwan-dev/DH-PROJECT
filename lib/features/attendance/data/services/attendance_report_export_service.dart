import '../models/attendance_report_model.dart';

/// Layanan Ekspor Laporan Absensi Santri ke format Excel (CSV terstruktur) dan Dokumen Cetak/PDF
class AttendanceReportExportService {
  /// Menghasilkan format spreadsheet CSV ber-BOM UTF-8 yang kompatibel dengan Microsoft Excel
  static String generateExcelCsv(AttendanceReportResult report) {
    final buffer = StringBuffer();
    // Tambahkan UTF-8 BOM agar terbaca sempurna di Microsoft Excel
    buffer.write('\uFEFF');

    // Header Identitas Laporan
    buffer.writeln('"${report.institutionName}"');
    buffer.writeln('"${report.title.toUpperCase()}"');
    buffer.writeln('"Periode: ${report.periodLabel}"');
    buffer.writeln('"Tanggal Cetak: ${report.formattedGeneratedDate}"');
    buffer.writeln('"Dicetak Oleh: ${report.generatedBy}"');
    buffer.writeln('');

    switch (report.type) {
      case AttendanceReportType.perSantri:
        final s = report.studentReport;
        if (s != null) {
          buffer.writeln('"DATA SANTRI"');
          buffer.writeln('"Nama Santri","${s.student.fullName}"');
          buffer.writeln('"NIS","\'${s.student.nis}"');
          buffer.writeln('"Kelas","${s.student.className}"');
          buffer.writeln('"Total Sesi Pertemuan","${s.totalMeetings}"');
          buffer.writeln('"Jumlah Hadir","${s.hadirCount}"');
          buffer.writeln('"Jumlah Izin","${s.izinCount}"');
          buffer.writeln('"Jumlah Sakit","${s.sakitCount}"');
          buffer.writeln('"Jumlah Alfa","${s.alfaCount}"');
          buffer.writeln('"Persentase Kehadiran","${s.formattedPercentage}"');
          buffer.writeln('');

          buffer.writeln('"RINCIAN RIWAYAT SESI ABSENSI"');
          buffer.writeln('"No","Tanggal","Jam Ke-","Mata Pelajaran","Guru Pengampu","Status Kehadiran","Catatan"');
          for (var i = 0; i < s.sessionLogs.length; i++) {
            final log = s.sessionLogs[i];
            buffer.writeln(
              '"${i + 1}","${log.date}","${log.periodNumber}","${log.subject}","${log.teacherName}","${log.status.label}","${log.note ?? '-'}"',
            );
          }
        }
        break;

      case AttendanceReportType.perKelas:
        final c = report.classReport;
        if (c != null) {
          buffer.writeln('"RINGKASAN STATISTIK KELAS ${c.className}"');
          buffer.writeln('"Total Santri","${c.totalStudents}"');
          buffer.writeln('"Total Sesi Tercatat","${c.totalMeetingsRecorded}"');
          buffer.writeln('"Total Hadir","${c.totalHadir}"');
          buffer.writeln('"Total Izin","${c.totalIzin}"');
          buffer.writeln('"Total Sakit","${c.totalSakit}"');
          buffer.writeln('"Total Alfa","${c.totalAlfa}"');
          buffer.writeln('"Rata-rata Kehadiran Kelas","${c.formattedAveragePercentage}"');
          buffer.writeln('');

          buffer.writeln('"DAFTAR REKAPITULASI KEHADIRAN SANTRI"');
          buffer.writeln('"No","NIS","Nama Santri","Total Pertemuan","Hadir","Izin","Sakit","Alfa","Persentase Kehadiran"');
          for (var i = 0; i < c.students.length; i++) {
            final st = c.students[i];
            buffer.writeln(
              '"${i + 1}","\'${st.student.nis}","${st.student.fullName}","${st.totalMeetings}","${st.hadirCount}","${st.izinCount}","${st.sakitCount}","${st.alfaCount}","${st.formattedPercentage}"',
            );
          }
        }
        break;

      case AttendanceReportType.periode:
        final p = report.periodReport;
        if (p != null) {
          buffer.writeln('"RINGKASAN UMUM PERIODE"');
          buffer.writeln('"Total Sesi Pertemuan","${p.totalSessions}"');
          buffer.writeln('"Total Catatan Santri","${p.totalAttendanceRecords}"');
          buffer.writeln('"Total Hadir","${p.totalHadir}"');
          buffer.writeln('"Total Izin","${p.totalIzin}"');
          buffer.writeln('"Total Sakit","${p.totalSakit}"');
          buffer.writeln('"Total Alfa","${p.totalAlfa}"');
          buffer.writeln('"Persentase Kehadiran Keseluruhan","${p.formattedOverallPercentage}"');
          buffer.writeln('');

          buffer.writeln('"REKAPITULASI KEHADIRAN BERDASARKAN KELAS"');
          buffer.writeln('"Nama Kelas","Total Sesi","Hadir","Izin","Sakit","Alfa","Persentase"');
          p.classBreakdown.forEach((className, data) {
            final hadir = data['hadir'] ?? 0;
            final izin = data['izin'] ?? 0;
            final sakit = data['sakit'] ?? 0;
            final alfa = data['alfa'] ?? 0;
            final total = hadir + izin + sakit + alfa;
            final pct = total == 0 ? '0%' : '${((hadir / total) * 100).toStringAsFixed(1)}%';
            buffer.writeln('"$className","$total","$hadir","$izin","$sakit","$alfa","$pct"');
          });
          buffer.writeln('');

          buffer.writeln('"REKAPITULASI KEHADIRAN BERDASARKAN MATA PELAJARAN"');
          buffer.writeln('"Mata Pelajaran","Total Catatan","Hadir","Izin","Sakit","Alfa","Persentase"');
          p.subjectBreakdown.forEach((subject, data) {
            final hadir = data['hadir'] ?? 0;
            final izin = data['izin'] ?? 0;
            final sakit = data['sakit'] ?? 0;
            final alfa = data['alfa'] ?? 0;
            final total = hadir + izin + sakit + alfa;
            final pct = total == 0 ? '0%' : '${((hadir / total) * 100).toStringAsFixed(1)}%';
            buffer.writeln('"$subject","$total","$hadir","$izin","$sakit","$alfa","$pct"');
          });
        }
        break;
    }

    return buffer.toString();
  }

  /// Menghasilkan format dokumen HTML siap cetak / PDF dengan kop resmi Darul Hikmah
  static String generatePrintableHtml(AttendanceReportResult report) {
    final buffer = StringBuffer();
    buffer.writeln('<!DOCTYPE html>');
    buffer.writeln('<html lang="id">');
    buffer.writeln('<head>');
    buffer.writeln('  <meta charset="UTF-8">');
    buffer.writeln('  <title>${report.title} - ${report.institutionName}</title>');
    buffer.writeln('  <style>');
    buffer.writeln('    @page { size: A4 portrait; margin: 15mm 15mm 20mm 15mm; }');
    buffer.writeln('    body { font-family: "Segoe UI", Arial, sans-serif; color: #1e293b; margin: 0; padding: 20px; font-size: 12px; line-height: 1.4; }');
    buffer.writeln('    .kop-header { text-align: center; border-bottom: 3px double #074724; padding-bottom: 12px; margin-bottom: 20px; }');
    buffer.writeln('    .kop-inst { font-size: 18px; font-weight: 800; color: #074724; text-transform: uppercase; letter-spacing: 0.5px; }');
    buffer.writeln('    .kop-sub { font-size: 11px; color: #475569; margin-top: 3px; }');
    buffer.writeln('    .doc-title { text-align: center; margin: 15px 0 10px; font-size: 15px; font-weight: 800; color: #0f172a; text-transform: uppercase; }');
    buffer.writeln('    .doc-meta { font-size: 11px; color: #475569; margin-bottom: 15px; text-align: center; }');
    buffer.writeln('    .info-grid { display: flex; justify-content: space-between; margin-bottom: 15px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 6px; }');
    buffer.writeln('    .info-col { flex: 1; }');
    buffer.writeln('    .info-row { margin-bottom: 4px; font-size: 11.5px; }');
    buffer.writeln('    .info-label { font-weight: 600; color: #64748b; width: 140px; display: inline-block; }');
    buffer.writeln('    .stat-cards { display: flex; gap: 8px; margin-bottom: 15px; }');
    buffer.writeln('    .stat-box { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px; text-align: center; }');
    buffer.writeln('    .stat-val { font-size: 15px; font-weight: 800; color: #074724; }');
    buffer.writeln('    .stat-lbl { font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-top: 2px; }');
    buffer.writeln('    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }');
    buffer.writeln('    th { background: #074724; color: white; padding: 7px 8px; font-weight: 700; text-align: left; border: 1px solid #074724; }');
    buffer.writeln('    td { padding: 6px 8px; border: 1px solid #cbd5e1; }');
    buffer.writeln('    tr:nth-child(even) { background-color: #f8fafc; }');
    buffer.writeln('    .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10px; }');
    buffer.writeln('    .badge-hadir { background: #dcfce7; color: #15803d; }');
    buffer.writeln('    .badge-izin { background: #dbeafe; color: #1d4ed8; }');
    buffer.writeln('    .badge-sakit { background: #fef3c7; color: #b45309; }');
    buffer.writeln('    .badge-alfa { background: #fee2e2; color: #b91c1c; }');
    buffer.writeln('    .sig-area { margin-top: 35px; display: flex; justify-content: space-between; page-break-inside: avoid; }');
    buffer.writeln('    .sig-box { width: 220px; text-align: center; }');
    buffer.writeln('    .sig-line { margin-top: 60px; border-bottom: 1px solid #1e293b; font-weight: 700; }');
    buffer.writeln('  </style>');
    buffer.writeln('</head>');
    buffer.writeln('<body>');

    // KOP
    buffer.writeln('  <div class="kop-header">');
    buffer.writeln('    <div class="kop-inst">${report.institutionName}</div>');
    buffer.writeln('    <div class="kop-sub">Sistem Manajemen & Presensi Pembelajaran Santri</div>');
    buffer.writeln('  </div>');

    // Judul & Meta
    buffer.writeln('  <div class="doc-title">${report.title}</div>');
    buffer.writeln('  <div class="doc-meta">Periode: <strong>${report.periodLabel}</strong> &bull; Dicetak: <strong>${report.formattedGeneratedDate}</strong></div>');

    switch (report.type) {
      case AttendanceReportType.perSantri:
        final s = report.studentReport;
        if (s != null) {
          buffer.writeln('  <div class="info-grid">');
          buffer.writeln('    <div class="info-col">');
          buffer.writeln('      <div class="info-row"><span class="info-label">Nama Santri:</span> <strong>${s.student.fullName}</strong></div>');
          buffer.writeln('      <div class="info-row"><span class="info-label">NIS:</span> ${s.student.nis}</div>');
          buffer.writeln('      <div class="info-row"><span class="info-label">Kelas:</span> ${s.student.className}</div>');
          buffer.writeln('    </div>');
          buffer.writeln('    <div class="info-col">');
          buffer.writeln('      <div class="info-row"><span class="info-label">Total Pertemuan:</span> ${s.totalMeetings} Sesi</div>');
          buffer.writeln('      <div class="info-row"><span class="info-label">Persentase Kehadiran:</span> <strong>${s.formattedPercentage}</strong></div>');
          buffer.writeln('    </div>');
          buffer.writeln('  </div>');

          buffer.writeln('  <div class="stat-cards">');
          buffer.writeln('    <div class="stat-box"><div class="stat-val" style="color:#15803d;">${s.hadirCount}</div><div class="stat-lbl">Hadir</div></div>');
          buffer.writeln('    <div class="stat-box"><div class="stat-val" style="color:#1d4ed8;">${s.izinCount}</div><div class="stat-lbl">Izin</div></div>');
          buffer.writeln('    <div class="stat-box"><div class="stat-val" style="color:#b45309;">${s.sakitCount}</div><div class="stat-lbl">Sakit</div></div>');
          buffer.writeln('    <div class="stat-box"><div class="stat-val" style="color:#b91c1c;">${s.alfaCount}</div><div class="stat-lbl">Alfa</div></div>');
          buffer.writeln('    <div class="stat-box"><div class="stat-val" style="color:#074724;">${s.formattedPercentage}</div><div class="stat-lbl">Kehadiran</div></div>');
          buffer.writeln('  </div>');

          buffer.writeln('  <table>');
          buffer.writeln('    <thead>');
          buffer.writeln('      <tr>');
          buffer.writeln('        <th style="width:30px; text-align:center;">No</th>');
          buffer.writeln('        <th style="width:75px;">Tanggal</th>');
          buffer.writeln('        <th style="width:55px;">Jam Ke-</th>');
          buffer.writeln('        <th>Mata Pelajaran</th>');
          buffer.writeln('        <th>Guru Pengampu</th>');
          buffer.writeln('        <th style="width:70px; text-align:center;">Status</th>');
          buffer.writeln('        <th>Catatan</th>');
          buffer.writeln('      </tr>');
          buffer.writeln('    </thead>');
          buffer.writeln('    <tbody>');
          for (var i = 0; i < s.sessionLogs.length; i++) {
            final log = s.sessionLogs[i];
            final statusBadge = '<span class="badge badge-${log.status.name}">${log.status.label}</span>';
            buffer.writeln('      <tr>');
            buffer.writeln('        <td style="text-align:center;">${i + 1}</td>');
            buffer.writeln('        <td>${log.date}</td>');
            buffer.writeln('        <td>Jam ${log.periodNumber}</td>');
            buffer.writeln('        <td><strong>${log.subject}</strong></td>');
            buffer.writeln('        <td>${log.teacherName}</td>');
            buffer.writeln('        <td style="text-align:center;">$statusBadge</td>');
            buffer.writeln('        <td>${log.note ?? '-'}</td>');
            buffer.writeln('      </tr>');
          }
          buffer.writeln('    </tbody>');
          buffer.writeln('  </table>');
        }
        break;

      case AttendanceReportType.perKelas:
        final c = report.classReport;
        if (c != null) {
          buffer.writeln('  <div class="stat-cards">');
          buffer.writeln('    <div class="stat-box"><div class="stat-val">${c.totalStudents}</div><div class="stat-lbl">Santri</div></div>');
          buffer.writeln('    <div class="stat-box"><div class="stat-val">${c.totalMeetingsRecorded}</div><div class="stat-lbl">Total Sesi</div></div>');
          buffer.writeln('    <div class="stat-box"><div class="stat-val" style="color:#15803d;">${c.totalHadir}</div><div class="stat-lbl">Hadir</div></div>');
          buffer.writeln('    <div class="stat-box"><div class="stat-val" style="color:#1d4ed8;">${c.totalIzin}</div><div class="stat-lbl">Izin</div></div>');
          buffer.writeln('    <div class="stat-box"><div class="stat-val" style="color:#b45309;">${c.totalSakit}</div><div class="stat-lbl">Sakit</div></div>');
          buffer.writeln('    <div class="stat-box"><div class="stat-val" style="color:#b91c1c;">${c.totalAlfa}</div><div class="stat-lbl">Alfa</div></div>');
          buffer.writeln('    <div class="stat-box"><div class="stat-val" style="color:#074724;">${c.formattedAveragePercentage}</div><div class="stat-lbl">Rata-rata</div></div>');
          buffer.writeln('  </div>');

          buffer.writeln('  <table>');
          buffer.writeln('    <thead>');
          buffer.writeln('      <tr>');
          buffer.writeln('        <th style="width:30px; text-align:center;">No</th>');
          buffer.writeln('        <th style="width:80px;">NIS</th>');
          buffer.writeln('        <th>Nama Santri</th>');
          buffer.writeln('        <th style="width:50px; text-align:center;">Total</th>');
          buffer.writeln('        <th style="width:45px; text-align:center;">Hadir</th>');
          buffer.writeln('        <th style="width:45px; text-align:center;">Izin</th>');
          buffer.writeln('        <th style="width:45px; text-align:center;">Sakit</th>');
          buffer.writeln('        <th style="width:45px; text-align:center;">Alfa</th>');
          buffer.writeln('        <th style="width:75px; text-align:center;">% Kehadiran</th>');
          buffer.writeln('      </tr>');
          buffer.writeln('    </thead>');
          buffer.writeln('    <tbody>');
          for (var i = 0; i < c.students.length; i++) {
            final st = c.students[i];
            buffer.writeln('      <tr>');
            buffer.writeln('        <td style="text-align:center;">${i + 1}</td>');
            buffer.writeln('        <td>${st.student.nis}</td>');
            buffer.writeln('        <td><strong>${st.student.fullName}</strong></td>');
            buffer.writeln('        <td style="text-align:center;">${st.totalMeetings}</td>');
            buffer.writeln('        <td style="text-align:center;">${st.hadirCount}</td>');
            buffer.writeln('        <td style="text-align:center;">${st.izinCount}</td>');
            buffer.writeln('        <td style="text-align:center;">${st.sakitCount}</td>');
            buffer.writeln('        <td style="text-align:center;">${st.alfaCount}</td>');
            buffer.writeln('        <td style="text-align:center; font-weight:700;">${st.formattedPercentage}</td>');
            buffer.writeln('      </tr>');
          }
          buffer.writeln('    </tbody>');
          buffer.writeln('  </table>');
        }
        break;

      case AttendanceReportType.periode:
        final p = report.periodReport;
        if (p != null) {
          buffer.writeln('  <div class="stat-cards">');
          buffer.writeln('    <div class="stat-box"><div class="stat-val">${p.totalSessions}</div><div class="stat-lbl">Sesi Pertemuan</div></div>');
          buffer.writeln('    <div class="stat-box"><div class="stat-val">${p.totalAttendanceRecords}</div><div class="stat-lbl">Total Catatan</div></div>');
          buffer.writeln('    <div class="stat-box"><div class="stat-val" style="color:#15803d;">${p.totalHadir}</div><div class="stat-lbl">Hadir</div></div>');
          buffer.writeln('    <div class="stat-box"><div class="stat-val" style="color:#1d4ed8;">${p.totalIzin}</div><div class="stat-lbl">Izin</div></div>');
          buffer.writeln('    <div class="stat-box"><div class="stat-val" style="color:#b45309;">${p.totalSakit}</div><div class="stat-lbl">Sakit</div></div>');
          buffer.writeln('    <div class="stat-box"><div class="stat-val" style="color:#b91c1c;">${p.totalAlfa}</div><div class="stat-lbl">Alfa</div></div>');
          buffer.writeln('    <div class="stat-box"><div class="stat-val" style="color:#074724;">${p.formattedOverallPercentage}</div><div class="stat-lbl">Kehadiran</div></div>');
          buffer.writeln('  </div>');

          buffer.writeln('  <h4 style="margin: 20px 0 6px 0; color:#074724;">Rekapitulasi Kehadiran per Kelas</h4>');
          buffer.writeln('  <table>');
          buffer.writeln('    <thead>');
          buffer.writeln('      <tr>');
          buffer.writeln('        <th>Nama Kelas</th>');
          buffer.writeln('        <th style="width:70px; text-align:center;">Total Sesi</th>');
          buffer.writeln('        <th style="width:60px; text-align:center;">Hadir</th>');
          buffer.writeln('        <th style="width:60px; text-align:center;">Izin</th>');
          buffer.writeln('        <th style="width:60px; text-align:center;">Sakit</th>');
          buffer.writeln('        <th style="width:60px; text-align:center;">Alfa</th>');
          buffer.writeln('        <th style="width:85px; text-align:center;">% Hadir</th>');
          buffer.writeln('      </tr>');
          buffer.writeln('    </thead>');
          buffer.writeln('    <tbody>');
          p.classBreakdown.forEach((className, data) {
            final hadir = data['hadir'] ?? 0;
            final izin = data['izin'] ?? 0;
            final sakit = data['sakit'] ?? 0;
            final alfa = data['alfa'] ?? 0;
            final total = hadir + izin + sakit + alfa;
            final pct = total == 0 ? '0%' : '${((hadir / total) * 100).toStringAsFixed(1)}%';
            buffer.writeln('      <tr>');
            buffer.writeln('        <td><strong>$className</strong></td>');
            buffer.writeln('        <td style="text-align:center;">$total</td>');
            buffer.writeln('        <td style="text-align:center;">$hadir</td>');
            buffer.writeln('        <td style="text-align:center;">$izin</td>');
            buffer.writeln('        <td style="text-align:center;">$sakit</td>');
            buffer.writeln('        <td style="text-align:center;">$alfa</td>');
            buffer.writeln('        <td style="text-align:center; font-weight:700;">$pct</td>');
            buffer.writeln('      </tr>');
          });
          buffer.writeln('    </tbody>');
          buffer.writeln('  </table>');
        }
        break;
    }

    // Tanda Tangan
    buffer.writeln('  <div class="sig-area">');
    buffer.writeln('    <div class="sig-box">');
    buffer.writeln('      <div>Mengetahui,</div>');
    buffer.writeln('      <div>Pimpinan Pondok Pesantren</div>');
    buffer.writeln('      <div class="sig-line">K.H. Abdullah Syafi\'i</div>');
    buffer.writeln('    </div>');
    buffer.writeln('    <div class="sig-box">');
    buffer.writeln('      <div>Bogor, ${report.formattedGeneratedDate}</div>');
    buffer.writeln('      <div>Bagian Akademik & Kesiswaan</div>');
    buffer.writeln('      <div class="sig-line">${report.generatedBy}</div>');
    buffer.writeln('    </div>');
    buffer.writeln('  </div>');

    buffer.writeln('</body>');
    buffer.writeln('</html>');

    return buffer.toString();
  }
}
