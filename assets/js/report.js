    // ========================================================
    // MODUL LAPORAN ABSENSI SANTRI (KHUSUS ADMIN)
    // ========================================================
    let currentReportType = 'perKelas'; // 'perKelas' | 'perSantri' | 'periode'

    // Buka Halaman Laporan Absensi Santri (Khusus Admin)
    function openAttendanceReportPage() {
      if (!currentLoggedInUser || currentLoggedInUser.role !== 'Admin') {
        currentLoggedInUser = mockUsers[0];
        updateHomeDisplayForRole('Admin');
      }

      // Pastikan shell aktif jika dibuka langsung
      const pageLogin = document.getElementById('pageLogin');
      if (typeof showOnlyScreenPage === 'function') {
        showOnlyScreenPage('pageAttendanceReport');
      } else {
        document.querySelectorAll('.screen-page').forEach(function(p) {
          if (p.id === 'pageAttendanceReport') p.classList.add('active');
          else p.classList.remove('active');
        });
      }

      if (typeof syncActiveNav === 'function') syncActiveNav('report');
      initReportStudents();
      renderAttendanceReport();
    }

    // Kembali dari Halaman Laporan Absensi Santri
    function backFromAttendanceReport() {
      if (typeof navigateToHome === 'function') {
        navigateToHome(currentLoggedInUser);
      } else {
        document.querySelectorAll('.screen-page').forEach(function(p) {
          if (p.id === 'pageHome') p.classList.add('active');
          else p.classList.remove('active');
        });
        if (typeof syncActiveNav === 'function') syncActiveNav('home');
      }
    }

    function handleDashboardReportClick() {
      if (currentLoggedInUser && currentLoggedInUser.role !== 'Admin') {
        showToast('Beralih ke mode Admin untuk membuka modul Laporan Absensi...', 'info');
        switchHomeRole('Admin');
      }
      openAttendanceReportPage();
    }

    function setReportType(type) {
      if (type !== 'perSantri') {
        type = 'perKelas';
      }
      currentReportType = type;
      const bKelas = document.getElementById('repTypeKelasBtn');
      const bSantri = document.getElementById('repTypeSantriBtn');
      const studentWrap = document.getElementById('repFilterStudentWrap');

      [bKelas, bSantri].forEach(b => {
        if (b) {
          b.style.background = 'transparent';
          b.style.color = 'var(--text-secondary)';
          b.style.fontWeight = '600';
          b.style.boxShadow = 'none';
        }
      });

      const activeBtn = type === 'perSantri' ? bSantri : bKelas;
      if (activeBtn) {
        activeBtn.style.background = '#FFFFFF';
        activeBtn.style.color = 'var(--primary)';
        activeBtn.style.fontWeight = '700';
        activeBtn.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
      }

      if (studentWrap) {
        studentWrap.style.display = type === 'perSantri' ? 'block' : 'none';
      }

      renderAttendanceReport();
    }

    function initReportStudents() {
      const select = document.getElementById('repFilterStudent');
      if (!select) return;
      const classVal = (document.getElementById('repFilterClass') ? document.getElementById('repFilterClass').value : 'Semua');
      let stList = mockStudents;
      if (classVal && classVal !== 'Semua') {
        stList = mockStudents.filter(s => s.className.toLowerCase() === classVal.toLowerCase());
      }
      select.innerHTML = stList.map(s => `<option value="${s.id}">${s.fullName} (${s.className} - ${s.nis})</option>`).join('');
    }

    function onReportClassChanged() {
      initReportStudents();
      renderAttendanceReport();
    }

    function resetReportFilters() {
      const sDate = document.getElementById('repFilterStartDate');
      const eDate = document.getElementById('repFilterEndDate');
      const cFilter = document.getElementById('repFilterClass');
      const subFilter = document.getElementById('repFilterSubject');

      if (sDate) sDate.value = '';
      if (eDate) eDate.value = '';
      if (cFilter) cFilter.value = 'VII A';
      if (subFilter) subFilter.value = 'Semua';

      initReportStudents();
      renderAttendanceReport();
      showToast('Filter laporan direset ke awal.', 'success');
    }

    function computeReportData() {
      const sDateVal = document.getElementById('repFilterStartDate') ? document.getElementById('repFilterStartDate').value : '';
      const eDateVal = document.getElementById('repFilterEndDate') ? document.getElementById('repFilterEndDate').value : '';
      const classVal = document.getElementById('repFilterClass') ? document.getElementById('repFilterClass').value : 'VII A';
      const subVal = document.getElementById('repFilterSubject') ? document.getElementById('repFilterSubject').value : 'Semua';
      const studentIdVal = document.getElementById('repFilterStudent') ? document.getElementById('repFilterStudent').value : '';

      // Filter sessions
      let filteredSessions = [...mockAttendanceRecords];
      if (sDateVal) {
        filteredSessions = filteredSessions.filter(s => s.date >= sDateVal);
      }
      if (eDateVal) {
        filteredSessions = filteredSessions.filter(s => s.date <= eDateVal);
      }
      if (subVal && subVal !== 'Semua') {
        filteredSessions = filteredSessions.filter(s => s.subject.toLowerCase() === subVal.toLowerCase());
      }
      filteredSessions.sort((a, b) => b.date.localeCompare(a.date));

      let periodLabel = 'Semua Periode Tercatat';
      if (sDateVal && eDateVal) {
        periodLabel = formatIndoDate(sDateVal) + ' - ' + formatIndoDate(eDateVal);
      } else if (sDateVal) {
        periodLabel = 'Sejak ' + formatIndoDate(sDateVal);
      } else if (eDateVal) {
        periodLabel = 'Hingga ' + formatIndoDate(eDateVal);
      }

      const generatedDate = formatIndoDate(new Date().toISOString().split('T')[0]);

      return {
        type: currentReportType,
        periodLabel,
        generatedDate,
        classVal,
        subVal,
        studentIdVal,
        filteredSessions
      };
    }

    function renderAttendanceReport() {
      const container = document.getElementById('reportPaperContainer');
      if (!container) return;

      const data = computeReportData();
      const { type, periodLabel, generatedDate, classVal, subVal, studentIdVal, filteredSessions } = data;

      let title = '';
      let bodyHtml = '';

      if (type === 'perSantri') {
        let student = mockStudents.find(s => s.id === studentIdVal);
        if (!student) {
          student = (classVal !== 'Semua' ? mockStudents.find(s => s.className.toLowerCase() === classVal.toLowerCase()) : mockStudents[0]) || mockStudents[0];
        }
        title = 'LAPORAN KEHADIRAN SANTRI: ' + (student ? student.fullName.toUpperCase() : '-');

        let hadir = 0, izin = 0, sakit = 0, alfa = 0;
        const logs = [];

        filteredSessions.forEach(session => {
          const item = (session.items || []).find(it => it.studentId === student.id || it.studentNis === student.nis);
          if (item) {
            if (item.status === 'hadir') hadir++;
            else if (item.status === 'izin') izin++;
            else if (item.status === 'sakit') sakit++;
            else if (item.status === 'alfa') alfa++;

            logs.push({
              date: session.date,
              subject: session.subject,
              periodNumber: session.periodNumber,
              teacherName: session.teacherName,
              status: item.status,
              note: item.note || '-'
            });
          }
        });

        const total = hadir + izin + sakit + alfa;
        const pct = total === 0 ? '0%' : (Math.round((hadir / total) * 1000) / 10) + '%';

        bodyHtml = `
          <!-- Identitas Santri -->
          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:12px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:14px; font-weight:800; color:var(--text-main);">${student.fullName}</div>
              <div style="font-size:11.5px; color:var(--text-secondary); margin-top:2px;">NIS: ${student.nis} &bull; Kelas: ${student.className}</div>
            </div>
            <div style="background:#DCFCE7; color:#15803D; font-size:14px; font-weight:800; padding:4px 10px; border-radius:6px;">${pct}</div>
          </div>

          <!-- Metrik 5 Kotak -->
          <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:6px; margin-bottom:14px;">
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:8px 4px; text-align:center;">
              <div style="font-size:14px; font-weight:800; color:var(--text-main);">${total}</div>
              <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Total</div>
            </div>
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:8px 4px; text-align:center;">
              <div style="font-size:14px; font-weight:800; color:#15803D;">${hadir}</div>
              <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Hadir</div>
            </div>
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:8px 4px; text-align:center;">
              <div style="font-size:14px; font-weight:800; color:#1D4ED8;">${izin}</div>
              <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Izin</div>
            </div>
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:8px 4px; text-align:center;">
              <div style="font-size:14px; font-weight:800; color:#B45309;">${sakit}</div>
              <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Sakit</div>
            </div>
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:8px 4px; text-align:center;">
              <div style="font-size:14px; font-weight:800; color:#B91C1C;">${alfa}</div>
              <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Alfa</div>
            </div>
          </div>

          <!-- Rincian Sesi -->
          <div style="font-size:12px; font-weight:700; color:var(--text-main); margin-bottom:8px;">Rincian Riwayat Pembelajaran (${logs.length} Pertemuan)</div>
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:11px;">
              <thead>
                <tr style="background:#074724; color:white;">
                  <th style="padding:6px 8px; text-align:left;">Tanggal</th>
                  <th style="padding:6px 8px; text-align:left;">Mata Pelajaran</th>
                  <th style="padding:6px 8px; text-align:left;">Guru</th>
                  <th style="padding:6px 8px; text-align:center;">Status</th>
                  <th style="padding:6px 8px; text-align:left;">Catatan</th>
                </tr>
              </thead>
              <tbody>
                ${logs.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding:14px; color:#94A3B8;">Tidak ada data sesi absensi pada periode ini.</td></tr>' : logs.map((l, i) => `
                  <tr style="background:${i % 2 === 0 ? '#FFFFFF' : '#F8FAFC'}; border-bottom:1px solid #E2E8F0;">
                    <td style="padding:6px 8px;">${formatIndoDate(l.date)}</td>
                    <td style="padding:6px 8px; font-weight:700;">${l.subject}</td>
                    <td style="padding:6px 8px;">${l.teacherName}</td>
                    <td style="padding:6px 8px; text-align:center;"><span style="display:inline-block; padding:2px 6px; border-radius:4px; font-weight:700; font-size:10px; background:${l.status === 'hadir' ? '#DCFCE7' : (l.status === 'izin' ? '#DBEAFE' : (l.status === 'sakit' ? '#FEF3C7' : '#FEE2E2'))}; color:${l.status === 'hadir' ? '#15803D' : (l.status === 'izin' ? '#1D4ED8' : (l.status === 'sakit' ? '#B45309' : '#B91C1C'))};">${l.status.toUpperCase()}</span></td>
                    <td style="padding:6px 8px; color:var(--text-muted);">${l.note}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else {
        const targetClass = classVal === 'Semua' ? 'VII A' : classVal;
        title = 'LAPORAN REKAPITULASI KEHADIRAN KELAS ' + targetClass.toUpperCase();
        const students = mockStudents.filter(s => s.className.toLowerCase() === targetClass.toLowerCase());

        let totalHadir = 0, totalIzin = 0, totalSakit = 0, totalAlfa = 0, totalClassMeetings = 0;
        const stRows = students.map((st, i) => {
          let sH = 0, sI = 0, sS = 0, sA = 0;
          filteredSessions.forEach(session => {
            const item = (session.items || []).find(it => it.studentId === st.id || it.studentNis === st.nis);
            if (item) {
              if (item.status === 'hadir') sH++;
              else if (item.status === 'izin') sI++;
              else if (item.status === 'sakit') sS++;
              else if (item.status === 'alfa') sA++;
            }
          });
          const tot = sH + sI + sS + sA;
          const pct = tot === 0 ? '0%' : (Math.round((sH / tot) * 1000) / 10) + '%';
          totalHadir += sH;
          totalIzin += sI;
          totalSakit += sS;
          totalAlfa += sA;
          totalClassMeetings += tot;

          return {
            student: st,
            total: tot,
            hadir: sH,
            izin: sI,
            sakit: sS,
            alfa: sA,
            pct: pct
          };
        });

        const avgPct = totalClassMeetings === 0 ? '0%' : (Math.round((totalHadir / totalClassMeetings) * 1000) / 10) + '%';

        bodyHtml = `
          <!-- Metrik 5 Kotak -->
          <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:6px; margin-bottom:14px;">
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:8px 4px; text-align:center;">
              <div style="font-size:14px; font-weight:800; color:var(--text-main);">${students.length}</div>
              <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Santri</div>
            </div>
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:8px 4px; text-align:center;">
              <div style="font-size:14px; font-weight:800; color:#15803D;">${totalHadir}</div>
              <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Hadir</div>
            </div>
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:8px 4px; text-align:center;">
              <div style="font-size:14px; font-weight:800; color:#1D4ED8;">${totalIzin}</div>
              <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Izin</div>
            </div>
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:8px 4px; text-align:center;">
              <div style="font-size:14px; font-weight:800; color:#B45309;">${totalSakit}</div>
              <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Sakit</div>
            </div>
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:8px 4px; text-align:center;">
              <div style="font-size:14px; font-weight:800; color:var(--primary);">${avgPct}</div>
              <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Rata²</div>
            </div>
          </div>

          <!-- Tabel Rekapitulasi Santri Kelas -->
          <div style="font-size:12px; font-weight:700; color:var(--text-main); margin-bottom:8px;">Daftar Rekapitulasi Santri Kelas ${targetClass}</div>
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:11px;">
              <thead>
                <tr style="background:#074724; color:white;">
                  <th style="padding:6px 8px; text-align:left;">NIS</th>
                  <th style="padding:6px 8px; text-align:left;">Nama Santri</th>
                  <th style="padding:6px 8px; text-align:center;">Total</th>
                  <th style="padding:6px 8px; text-align:center;">Hadir</th>
                  <th style="padding:6px 8px; text-align:center;">Izin</th>
                  <th style="padding:6px 8px; text-align:center;">Sakit</th>
                  <th style="padding:6px 8px; text-align:center;">Alfa</th>
                  <th style="padding:6px 8px; text-align:center;">% Hadir</th>
                </tr>
              </thead>
              <tbody>
                ${stRows.map((r, i) => `
                  <tr style="background:${i % 2 === 0 ? '#FFFFFF' : '#F8FAFC'}; border-bottom:1px solid #E2E8F0;">
                    <td style="padding:6px 8px;">${r.student.nis}</td>
                    <td style="padding:6px 8px; font-weight:700;">${r.student.fullName}</td>
                    <td style="padding:6px 8px; text-align:center;">${r.total}</td>
                    <td style="padding:6px 8px; text-align:center; color:#15803D; font-weight:700;">${r.hadir}</td>
                    <td style="padding:6px 8px; text-align:center; color:#1D4ED8;">${r.izin}</td>
                    <td style="padding:6px 8px; text-align:center; color:#B45309;">${r.sakit}</td>
                    <td style="padding:6px 8px; text-align:center; color:#B91C1C;">${r.alfa}</td>
                    <td style="padding:6px 8px; text-align:center; font-weight:800; color:#074724;">${r.pct}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }

      container.innerHTML = `
        <!-- Kop Surat -->
        <div style="text-align:center; border-bottom:3px double #074724; padding-bottom:10px; margin-bottom:14px;">
          <div style="font-size:15px; font-weight:800; color:#074724; letter-spacing:0.5px;">PONDOK PESANTREN ISLAM DARUL HIKMAH</div>
          <div style="font-size:10.5px; color:#64748B; margin-top:2px;">Sistem Manajemen &amp; Presensi Pembelajaran Santri</div>
        </div>

        <!-- Judul & Meta -->
        <div style="text-align:center; margin-bottom:14px;">
          <div style="font-size:13.5px; font-weight:800; color:var(--text-main);">${title}</div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Periode: <strong>${periodLabel}</strong> &bull; Dibuat: <strong>${generatedDate}</strong></div>
        </div>

        ${bodyHtml}

        <!-- Tanda Tangan -->
        <div style="margin-top:24px; display:flex; justify-content:space-between; font-size:10.5px; color:#475569; padding-top:14px; border-top:1px dashed #CBD5E1;">
          <div style="text-align:center; width:130px;">
            <div>Mengetahui,</div>
            <div style="margin-top:40px; border-bottom:1px solid #64748B; font-weight:700;">K.H. Abdullah Syafi'i</div>
            <div style="font-size:9.5px; color:#94A3B8;">Pimpinan Pondok</div>
          </div>
          <div style="text-align:center; width:130px;">
            <div>Bogor, ${generatedDate}</div>
            <div style="margin-top:40px; border-bottom:1px solid #64748B; font-weight:700;">${currentLoggedInUser ? currentLoggedInUser.fullName : 'Administrator'}</div>
            <div style="font-size:9.5px; color:#94A3B8;">Bagian Akademik</div>
          </div>
        </div>
      `;
    }

    function exportReportExcel() {
      const isAdmin = currentLoggedInUser && currentLoggedInUser.role === 'Admin';
      if (!isAdmin) {
        showToast('Akses ditolak: Hanya Admin yang dapat mengekspor laporan.', 'error');
        return;
      }

      const data = computeReportData();
      const { type, periodLabel, generatedDate, classVal, subVal, studentIdVal, filteredSessions } = data;

      let csv = '﻿';
      csv += '"PONDOK PESANTREN ISLAM DARUL HIKMAH"\n';
      csv += '"LAPORAN ABSENSI SANTRI"\n';
      csv += `"Periode: ${periodLabel}"\n`;
      csv += `"Tanggal Cetak: ${generatedDate}"\n\n`;

      if (type === 'perSantri') {
        let student = mockStudents.find(s => s.id === studentIdVal) || mockStudents[0];
        csv += '"DATA SANTRI"\n';
        csv += `"Nama Santri","${student.fullName}"\n`;
        csv += `"NIS","'${student.nis}"\n`;
        csv += `"Kelas","${student.className}"\n\n`;

        csv += '"No","Tanggal","Mata Pelajaran","Guru Pengampu","Status","Catatan"\n';
        let idx = 1;
        filteredSessions.forEach(session => {
          const item = (session.items || []).find(it => it.studentId === student.id || it.studentNis === student.nis);
          if (item) {
            csv += `"${idx++}","${session.date}","${session.subject}","${session.teacherName}","${item.status.toUpperCase()}","${item.note || '-'}"\n`;
          }
        });
      } else {
        const targetClass = classVal === 'Semua' ? 'VII A' : classVal;
        const students = mockStudents.filter(s => s.className.toLowerCase() === targetClass.toLowerCase());
        csv += `"REKAPITULASI KELAS ${targetClass}"\n\n`;
        csv += '"No","NIS","Nama Santri","Total Pertemuan","Hadir","Izin","Sakit","Alfa","Persentase"\n';

        students.forEach((st, i) => {
          let sH = 0, sI = 0, sS = 0, sA = 0;
          filteredSessions.forEach(session => {
            const item = (session.items || []).find(it => it.studentId === st.id || it.studentNis === st.nis);
            if (item) {
              if (item.status === 'hadir') sH++;
              else if (item.status === 'izin') sI++;
              else if (item.status === 'sakit') sS++;
              else if (item.status === 'alfa') sA++;
            }
          });
          const tot = sH + sI + sS + sA;
          const pct = tot === 0 ? '0%' : (Math.round((sH / tot) * 1000) / 10) + '%';
          csv += `"${i + 1}","'${st.nis}","${st.fullName}","${tot}","${sH}","${sI}","${sS}","${sA}","${pct}"\n`;
        });
      }

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Laporan_Absensi_Darul_Hikmah_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Laporan Excel (.csv spreadsheet) berhasil diunduh.', 'success');
    }

    function exportReportPdf() {
      const isAdmin = currentLoggedInUser && currentLoggedInUser.role === 'Admin';
      if (!isAdmin) {
        showToast('Akses ditolak: Hanya Admin yang dapat mengekspor laporan.', 'error');
        return;
      }

      const container = document.getElementById('reportPaperContainer');
      if (!container) return;

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        showToast('Pop-up terblokir di peramban Anda. Pratinjau tetap tersedia di layar.', 'error');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cetak Laporan Absensi - Darul Hikmah</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 20px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #074724; color: white; padding: 6px 8px; text-align: left; }
            td { padding: 6px 8px; border: 1px solid #cbd5e1; }
            tr:nth-child(even) { background: #f8fafc; }
          </style>
        </head>
        <body>
          ${container.innerHTML}
        </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        try { printWindow.print(); } catch(e) {}
      }, 300);
      showToast('Pratinjau PDF cetak dibuka.', 'success');
    }

  