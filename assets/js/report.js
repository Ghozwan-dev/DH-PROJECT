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

    // ========================================================
    // STATE KUSTOMISASI & EDIT LAPORAN ABSENSI SANTRI
    // ========================================================
    let reportCustomOverrides = {
      kopTitle: 'PONDOK PESANTREN ISLAM DARUL HIKMAH',
      kopSubtitle: 'Sistem Manajemen & Presensi Pembelajaran Santri',
      reportTitle: '',
      periodLabel: '',
      generatedDate: '',
      signerLeftTitle: 'Mengetahui,',
      signerLeftName: "K.H. Abdullah Syafi'i",
      signerLeftRole: 'Pimpinan Pondok',
      signerRightCity: 'Bogor',
      signerRightName: 'Administrator Pondok',
      signerRightRole: 'Bagian Akademik',
      themeColor: '#074724',
      showSummaryMetrics: true,
      showSignatures: true,
      studentOverrides: {} // { [studentId]: { hadir: number, izin: number, sakit: number, alfa: number } }
    };
    let isDirectReportEditMode = false;
    let currentEditReportTab = 'kop';

    function renderAttendanceReport() {
      const container = document.getElementById('reportPaperContainer');
      if (!container) return;

      const data = computeReportData();
      const { type, periodLabel, generatedDate, classVal, subVal, studentIdVal, filteredSessions } = data;

      const theme = reportCustomOverrides.themeColor || '#074724';
      const kopTitle = reportCustomOverrides.kopTitle || 'PONDOK PESANTREN ISLAM DARUL HIKMAH';
      const kopSubtitle = reportCustomOverrides.kopSubtitle || 'Sistem Manajemen & Presensi Pembelajaran Santri';
      const dispPeriod = reportCustomOverrides.periodLabel || periodLabel;
      const dispDate = reportCustomOverrides.generatedDate || generatedDate;

      let title = '';
      let bodyHtml = '';

      if (type === 'perSantri') {
        let student = mockStudents.find(s => s.id === studentIdVal);
        if (!student) {
          student = (classVal !== 'Semua' ? mockStudents.find(s => s.className.toLowerCase() === classVal.toLowerCase()) : mockStudents[0]) || mockStudents[0];
        }
        const defaultTitle = 'LAPORAN KEHADIRAN SANTRI: ' + (student ? student.fullName.toUpperCase() : '-');
        title = reportCustomOverrides.reportTitle || defaultTitle;

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

        if (reportCustomOverrides.studentOverrides && reportCustomOverrides.studentOverrides[student.id]) {
          const ov = reportCustomOverrides.studentOverrides[student.id];
          if (ov.hadir !== undefined) hadir = ov.hadir;
          if (ov.izin !== undefined) izin = ov.izin;
          if (ov.sakit !== undefined) sakit = ov.sakit;
          if (ov.alfa !== undefined) alfa = ov.alfa;
        }

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
          ${reportCustomOverrides.showSummaryMetrics !== false ? `
          <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:6px; margin-bottom:14px;">
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:8px 4px; text-align:center;">
              <div style="font-size:14px; font-weight:800; color:var(--text-main);">${total}</div>
              <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Total</div>
            </div>
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:8px 4px; text-align:center;">
              ${isDirectReportEditMode ? `
                <input type="number" min="0" value="${hadir}" onchange="updateDirectStudentNumber('${student.id}', 'hadir', this.value)" style="width:50px; text-align:center; font-size:14px; font-weight:800; color:#15803D; border:1px solid #86EFAC; border-radius:4px; padding:2px; background:#F0FDF4;">
              ` : `
                <div style="font-size:14px; font-weight:800; color:#15803D;">${hadir}</div>
              `}
              <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Hadir</div>
            </div>
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:8px 4px; text-align:center;">
              ${isDirectReportEditMode ? `
                <input type="number" min="0" value="${izin}" onchange="updateDirectStudentNumber('${student.id}', 'izin', this.value)" style="width:50px; text-align:center; font-size:14px; font-weight:800; color:#1D4ED8; border:1px solid #93C5FD; border-radius:4px; padding:2px; background:#EFF6FF;">
              ` : `
                <div style="font-size:14px; font-weight:800; color:#1D4ED8;">${izin}</div>
              `}
              <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Izin</div>
            </div>
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:8px 4px; text-align:center;">
              ${isDirectReportEditMode ? `
                <input type="number" min="0" value="${sakit}" onchange="updateDirectStudentNumber('${student.id}', 'sakit', this.value)" style="width:50px; text-align:center; font-size:14px; font-weight:800; color:#B45309; border:1px solid #FCD34D; border-radius:4px; padding:2px; background:#FEF3C7;">
              ` : `
                <div style="font-size:14px; font-weight:800; color:#B45309;">${sakit}</div>
              `}
              <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Sakit</div>
            </div>
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:8px 4px; text-align:center;">
              ${isDirectReportEditMode ? `
                <input type="number" min="0" value="${alfa}" onchange="updateDirectStudentNumber('${student.id}', 'alfa', this.value)" style="width:50px; text-align:center; font-size:14px; font-weight:800; color:#B91C1C; border:1px solid #FCA5A5; border-radius:4px; padding:2px; background:#FEF2F2;">
              ` : `
                <div style="font-size:14px; font-weight:800; color:#B91C1C;">${alfa}</div>
              `}
              <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Alfa</div>
            </div>
          </div>` : ''}

          <!-- Rincian Sesi -->
          <div style="font-size:12px; font-weight:700; color:var(--text-main); margin-bottom:8px;">Rincian Riwayat Pembelajaran (${logs.length} Pertemuan)</div>
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:11px;">
              <thead>
                <tr style="background:${theme}; color:white;">
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
        const defaultTitle = 'LAPORAN REKAPITULASI KEHADIRAN KELAS ' + targetClass.toUpperCase();
        title = reportCustomOverrides.reportTitle || defaultTitle;
        const students = mockStudents.filter(s => s.className.toLowerCase() === targetClass.toLowerCase());

        let totalHadir = 0, totalIzin = 0, totalSakit = 0, totalAlfa = 0, totalClassMeetings = 0;
        const stRows = students.map((st, i) => {
          let sH = 0, sI = 0, sS = 0, sA = 0;
          if (reportCustomOverrides.studentOverrides && reportCustomOverrides.studentOverrides[st.id]) {
            const ov = reportCustomOverrides.studentOverrides[st.id];
            sH = ov.hadir !== undefined ? ov.hadir : 0;
            sI = ov.izin !== undefined ? ov.izin : 0;
            sS = ov.sakit !== undefined ? ov.sakit : 0;
            sA = ov.alfa !== undefined ? ov.alfa : 0;
          } else {
            filteredSessions.forEach(session => {
              const item = (session.items || []).find(it => it.studentId === st.id || it.studentNis === st.nis);
              if (item) {
                if (item.status === 'hadir') sH++;
                else if (item.status === 'izin') sI++;
                else if (item.status === 'sakit') sS++;
                else if (item.status === 'alfa') sA++;
              }
            });
          }

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
          ${reportCustomOverrides.showSummaryMetrics !== false ? `
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
              <div style="font-size:14px; font-weight:800; color:${theme};">${avgPct}</div>
              <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Rata²</div>
            </div>
          </div>` : ''}

          <!-- Tabel Rekapitulasi Santri Kelas -->
          <div style="font-size:12px; font-weight:700; color:var(--text-main); margin-bottom:8px;">Daftar Rekapitulasi Santri Kelas ${targetClass}</div>
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:11px;">
              <thead>
                <tr style="background:${theme}; color:white;">
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
                    <td style="padding:6px 8px; text-align:center; font-weight:700;">${r.total}</td>
                    <td style="padding:4px 6px; text-align:center; color:#15803D; font-weight:700;">
                      ${isDirectReportEditMode ? `
                        <input type="number" min="0" value="${r.hadir}" onchange="updateDirectStudentNumber('${r.student.id}', 'hadir', this.value)" style="width:48px; text-align:center; font-weight:700; color:#15803D; border:1px solid #86EFAC; border-radius:4px; padding:3px; background:#F0FDF4;">
                      ` : r.hadir}
                    </td>
                    <td style="padding:4px 6px; text-align:center; color:#1D4ED8;">
                      ${isDirectReportEditMode ? `
                        <input type="number" min="0" value="${r.izin}" onchange="updateDirectStudentNumber('${r.student.id}', 'izin', this.value)" style="width:48px; text-align:center; font-weight:700; color:#1D4ED8; border:1px solid #93C5FD; border-radius:4px; padding:3px; background:#EFF6FF;">
                      ` : r.izin}
                    </td>
                    <td style="padding:4px 6px; text-align:center; color:#B45309;">
                      ${isDirectReportEditMode ? `
                        <input type="number" min="0" value="${r.sakit}" onchange="updateDirectStudentNumber('${r.student.id}', 'sakit', this.value)" style="width:48px; text-align:center; font-weight:700; color:#B45309; border:1px solid #FCD34D; border-radius:4px; padding:3px; background:#FEF3C7;">
                      ` : r.sakit}
                    </td>
                    <td style="padding:4px 6px; text-align:center; color:#B91C1C;">
                      ${isDirectReportEditMode ? `
                        <input type="number" min="0" value="${r.alfa}" onchange="updateDirectStudentNumber('${r.student.id}', 'alfa', this.value)" style="width:48px; text-align:center; font-weight:700; color:#B91C1C; border:1px solid #FCA5A5; border-radius:4px; padding:3px; background:#FEF2F2;">
                      ` : r.alfa}
                    </td>
                    <td style="padding:6px 8px; text-align:center; font-weight:800; color:${theme};">${r.pct}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }

      container.innerHTML = `
        <div style="flex:1 0 auto; display:flex; flex-direction:column;">
          <!-- Kop Surat -->
          <div style="text-align:center; border-bottom:3px double ${theme}; padding-bottom:10px; margin-bottom:14px; position:relative;">
            ${isDirectReportEditMode ? `
              <div contenteditable="true" onblur="reportCustomOverrides.kopTitle = this.innerText.trim();" style="font-size:15px; font-weight:800; color:${theme}; letter-spacing:0.5px; border:1px dashed #86EFAC; padding:2px 6px; border-radius:4px; outline:none;" title="Klik untuk edit nama lembaga">${kopTitle}</div>
              <div contenteditable="true" onblur="reportCustomOverrides.kopSubtitle = this.innerText.trim();" style="font-size:10.5px; color:#64748B; margin-top:2px; border:1px dashed #86EFAC; padding:2px 6px; border-radius:4px; outline:none;" title="Klik untuk edit subjudul kop">${kopSubtitle}</div>
            ` : `
              <div style="font-size:15px; font-weight:800; color:${theme}; letter-spacing:0.5px;">${kopTitle}</div>
              <div style="font-size:10.5px; color:#64748B; margin-top:2px;">${kopSubtitle}</div>
            `}
          </div>

          <!-- Judul & Meta -->
          <div style="text-align:center; margin-bottom:14px;">
            ${isDirectReportEditMode ? `
              <div contenteditable="true" onblur="reportCustomOverrides.reportTitle = this.innerText.trim();" style="font-size:13.5px; font-weight:800; color:var(--text-main); border:1px dashed #CBD5E1; padding:2px 6px; border-radius:4px; outline:none;" title="Klik untuk edit judul">${title}</div>
              <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">
                Periode: <strong contenteditable="true" onblur="reportCustomOverrides.periodLabel = this.innerText.trim();" style="border:1px dashed #CBD5E1; padding:1px 4px; border-radius:3px;">${dispPeriod}</strong> &bull; 
                Dibuat: <strong contenteditable="true" onblur="reportCustomOverrides.generatedDate = this.innerText.trim();" style="border:1px dashed #CBD5E1; padding:1px 4px; border-radius:3px;">${dispDate}</strong>
              </div>
            ` : `
              <div style="font-size:13.5px; font-weight:800; color:var(--text-main);">${title}</div>
              <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Periode: <strong>${dispPeriod}</strong> &bull; Dibuat: <strong>${dispDate}</strong></div>
            `}
          </div>

          ${bodyHtml}
        </div>

        <!-- Tanda Tangan -->
        ${reportCustomOverrides.showSignatures !== false ? `
        <div style="margin-top:auto; padding-top:28px; display:flex; justify-content:space-between; font-size:10.5px; color:#475569; border-top:1px dashed #CBD5E1;">
          <div style="text-align:center; width:140px;">
            <div ${isDirectReportEditMode ? `contenteditable="true" onblur="reportCustomOverrides.signerLeftTitle = this.innerText.trim();" style="border:1px dashed #CBD5E1; border-radius:3px; padding:1px;"` : ''}>${reportCustomOverrides.signerLeftTitle || 'Mengetahui,'}</div>
            <div style="margin-top:40px; border-bottom:1px solid #64748B; font-weight:700;" ${isDirectReportEditMode ? `contenteditable="true" onblur="reportCustomOverrides.signerLeftName = this.innerText.trim();" style="border:1px dashed #CBD5E1; border-radius:3px; padding:1px;"` : ''}>${reportCustomOverrides.signerLeftName || "K.H. Abdullah Syafi'i"}</div>
            <div style="font-size:9.5px; color:#94A3B8;" ${isDirectReportEditMode ? `contenteditable="true" onblur="reportCustomOverrides.signerLeftRole = this.innerText.trim();" style="border:1px dashed #CBD5E1; border-radius:3px; padding:1px;"` : ''}>${reportCustomOverrides.signerLeftRole || 'Pimpinan Pondok'}</div>
          </div>
          <div style="text-align:center; width:140px;">
            <div ${isDirectReportEditMode ? `contenteditable="true" onblur="reportCustomOverrides.signerRightCity = this.innerText.split(',')[0].trim();" style="border:1px dashed #CBD5E1; border-radius:3px; padding:1px;"` : ''}>${reportCustomOverrides.signerRightCity || 'Bogor'}, ${dispDate}</div>
            <div style="margin-top:40px; border-bottom:1px solid #64748B; font-weight:700;" ${isDirectReportEditMode ? `contenteditable="true" onblur="reportCustomOverrides.signerRightName = this.innerText.trim();" style="border:1px dashed #CBD5E1; border-radius:3px; padding:1px;"` : ''}>${reportCustomOverrides.signerRightName || (currentLoggedInUser ? currentLoggedInUser.fullName : 'Administrator Pondok')}</div>
            <div style="font-size:9.5px; color:#94A3B8;" ${isDirectReportEditMode ? `contenteditable="true" onblur="reportCustomOverrides.signerRightRole = this.innerText.trim();" style="border:1px dashed #CBD5E1; border-radius:3px; padding:1px;"` : ''}>${reportCustomOverrides.signerRightRole || 'Bagian Akademik'}</div>
          </div>
        </div>` : ''}
      `;
    }

    // ========================================================
    // MODAL EDIT LAPORAN (INTERACTIVE CONFIGURATOR)
    // ========================================================
    function openEditReportModal() {
      const modal = document.getElementById('editReportModal');
      if (!modal) return;
      currentEditReportTab = 'kop';
      switchEditReportTab('kop');
      modal.style.display = 'flex';
    }

    function closeEditReportModal() {
      const modal = document.getElementById('editReportModal');
      if (modal) modal.style.display = 'none';
    }

    function switchEditReportTab(tabKey) {
      currentEditReportTab = tabKey;
      const tabs = ['kop', 'data', 'sign', 'style'];
      tabs.forEach(t => {
        const btn = document.getElementById('tabBtnReport' + t.charAt(0).toUpperCase() + t.slice(1));
        if (btn) {
          if (t === tabKey) {
            btn.style.background = '#0E6838';
            btn.style.color = '#FFF';
            btn.style.fontWeight = '700';
          } else {
            btn.style.background = 'transparent';
            btn.style.color = 'var(--text-secondary)';
            btn.style.fontWeight = '600';
          }
        }
      });
      renderEditReportModalContent();
    }

    function renderEditReportModalContent() {
      const body = document.getElementById('editReportModalContent');
      if (!body) return;

      const data = computeReportData();
      const { type, periodLabel, generatedDate, classVal } = data;
      const targetClass = classVal === 'Semua' ? 'VII A' : classVal;
      const defaultTitle = type === 'perSantri' ? 'LAPORAN KEHADIRAN SANTRI' : ('LAPORAN REKAPITULASI KEHADIRAN KELAS ' + targetClass.toUpperCase());

      if (currentEditReportTab === 'kop') {
        body.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div>
              <label style="display:block; font-size:12px; font-weight:700; color:var(--text-main); margin-bottom:4px;">Nama Lembaga / Kop Surat</label>
              <input type="text" id="editRepKopTitle" value="${reportCustomOverrides.kopTitle || 'PONDOK PESANTREN ISLAM DARUL HIKMAH'}" style="width:100%; height:38px; border:1px solid #CBD5E1; border-radius:8px; padding:0 12px; font-size:12.5px; box-sizing:border-box;">
            </div>
            <div>
              <label style="display:block; font-size:12px; font-weight:700; color:var(--text-main); margin-bottom:4px;">Subjudul Kop Lembaga</label>
              <input type="text" id="editRepKopSubtitle" value="${reportCustomOverrides.kopSubtitle || 'Sistem Manajemen & Presensi Pembelajaran Santri'}" style="width:100%; height:38px; border:1px solid #CBD5E1; border-radius:8px; padding:0 12px; font-size:12.5px; box-sizing:border-box;">
            </div>
            <div>
              <label style="display:block; font-size:12px; font-weight:700; color:var(--text-main); margin-bottom:4px;">Judul Laporan</label>
              <input type="text" id="editRepTitle" value="${reportCustomOverrides.reportTitle || ''}" placeholder="${defaultTitle} (Otomatis jika kosong)" style="width:100%; height:38px; border:1px solid #CBD5E1; border-radius:8px; padding:0 12px; font-size:12.5px; box-sizing:border-box;">
              <div style="font-size:11px; color:#64748B; margin-top:3px;">Kosongkan bila ingin menggunakan judul otomatis sesuai kelas/santri.</div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div>
                <label style="display:block; font-size:12px; font-weight:700; color:var(--text-main); margin-bottom:4px;">Teks Periode</label>
                <input type="text" id="editRepPeriod" value="${reportCustomOverrides.periodLabel || periodLabel}" style="width:100%; height:38px; border:1px solid #CBD5E1; border-radius:8px; padding:0 12px; font-size:12.5px; box-sizing:border-box;">
              </div>
              <div>
                <label style="display:block; font-size:12px; font-weight:700; color:var(--text-main); margin-bottom:4px;">Tanggal Cetak / Dibuat</label>
                <input type="text" id="editRepDate" value="${reportCustomOverrides.generatedDate || generatedDate}" style="width:100%; height:38px; border:1px solid #CBD5E1; border-radius:8px; padding:0 12px; font-size:12.5px; box-sizing:border-box;">
              </div>
            </div>
          </div>
        `;
      } else if (currentEditReportTab === 'data') {
        const students = type === 'perSantri' ? 
          (mockStudents.filter(s => s.id === data.studentIdVal).length ? mockStudents.filter(s => s.id === data.studentIdVal) : [mockStudents[0]]) :
          mockStudents.filter(s => s.className.toLowerCase() === targetClass.toLowerCase());

        body.innerHTML = `
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <div style="font-size:12px; font-weight:700; color:var(--text-main);">Sesuaikan Angka Presensi Santri:</div>
              <button type="button" onclick="setAllStudentsPresent()" style="background:#DCFCE7; border:1px solid #86EFAC; color:#15803D; font-size:11px; font-weight:700; padding:4px 10px; border-radius:6px; cursor:pointer;">+ Set Semua Hadir Sempurna</button>
            </div>
            <div style="max-height:360px; overflow-y:auto; border:1px solid #E2E8F0; border-radius:8px;">
              <table style="width:100%; border-collapse:collapse; font-size:11.5px;">
                <thead style="background:#F1F5F9; position:sticky; top:0; z-index:2;">
                  <tr>
                    <th style="padding:7px 8px; text-align:left;">Nama Santri</th>
                    <th style="padding:7px 6px; text-align:center; color:#15803D;">Hadir</th>
                    <th style="padding:7px 6px; text-align:center; color:#1D4ED8;">Izin</th>
                    <th style="padding:7px 6px; text-align:center; color:#B45309;">Sakit</th>
                    <th style="padding:7px 6px; text-align:center; color:#B91C1C;">Alfa</th>
                    <th style="padding:7px 6px; text-align:center;">Total</th>
                    <th style="padding:7px 6px; text-align:center;">%</th>
                  </tr>
                </thead>
                <tbody>
                  ${students.map(st => {
                    let sH = 0, sI = 0, sS = 0, sA = 0;
                    if (reportCustomOverrides.studentOverrides && reportCustomOverrides.studentOverrides[st.id]) {
                      const ov = reportCustomOverrides.studentOverrides[st.id];
                      sH = ov.hadir !== undefined ? ov.hadir : 0;
                      sI = ov.izin !== undefined ? ov.izin : 0;
                      sS = ov.sakit !== undefined ? ov.sakit : 0;
                      sA = ov.alfa !== undefined ? ov.alfa : 0;
                    } else {
                      data.filteredSessions.forEach(session => {
                        const item = (session.items || []).find(it => it.studentId === st.id || it.studentNis === st.nis);
                        if (item) {
                          if (item.status === 'hadir') sH++;
                          else if (item.status === 'izin') sI++;
                          else if (item.status === 'sakit') sS++;
                          else if (item.status === 'alfa') sA++;
                        }
                      });
                    }
                    const tot = sH + sI + sS + sA;
                    const pct = tot === 0 ? '0%' : (Math.round((sH / tot) * 1000) / 10) + '%';

                    return `
                      <tr style="border-bottom:1px solid #E2E8F0;" id="rowModalSt_${st.id}">
                        <td style="padding:7px 8px;">
                          <div style="font-weight:700; color:var(--text-main);">${st.fullName}</div>
                          <div style="font-size:10px; color:#64748B;">NIS: ${st.nis}</div>
                        </td>
                        <td style="padding:4px; text-align:center;">
                          <input type="number" min="0" value="${sH}" oninput="recalcModalStudentRow('${st.id}')" id="modalStH_${st.id}" style="width:42px; height:28px; text-align:center; font-weight:700; color:#15803D; border:1px solid #86EFAC; border-radius:4px; background:#F0FDF4;">
                        </td>
                        <td style="padding:4px; text-align:center;">
                          <input type="number" min="0" value="${sI}" oninput="recalcModalStudentRow('${st.id}')" id="modalStI_${st.id}" style="width:42px; height:28px; text-align:center; font-weight:700; color:#1D4ED8; border:1px solid #93C5FD; border-radius:4px; background:#EFF6FF;">
                        </td>
                        <td style="padding:4px; text-align:center;">
                          <input type="number" min="0" value="${sS}" oninput="recalcModalStudentRow('${st.id}')" id="modalStS_${st.id}" style="width:42px; height:28px; text-align:center; font-weight:700; color:#B45309; border:1px solid #FCD34D; border-radius:4px; background:#FEF3C7;">
                        </td>
                        <td style="padding:4px; text-align:center;">
                          <input type="number" min="0" value="${sA}" oninput="recalcModalStudentRow('${st.id}')" id="modalStA_${st.id}" style="width:42px; height:28px; text-align:center; font-weight:700; color:#B91C1C; border:1px solid #FCA5A5; border-radius:4px; background:#FEF2F2;">
                        </td>
                        <td style="padding:4px; text-align:center; font-weight:700; color:var(--text-main);" id="modalStTot_${st.id}">${tot}</td>
                        <td style="padding:4px; text-align:center; font-weight:800; color:#0E6838;" id="modalStPct_${st.id}">${pct}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else if (currentEditReportTab === 'sign') {
        body.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:14px;">
            <!-- Pihak Kiri (Pimpinan) -->
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:12px;">
              <div style="font-size:12.5px; font-weight:700; color:var(--text-main); margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                <span>🖋️</span> Pihak Pengesah Kiri (Mengetahui)
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <div>
                  <label style="display:block; font-size:11.5px; color:#64748B; margin-bottom:3px;">Kata Pengantar</label>
                  <input type="text" id="editRepSignLeftTitle" value="${reportCustomOverrides.signerLeftTitle || 'Mengetahui,'}" style="width:100%; height:36px; border:1px solid #CBD5E1; border-radius:6px; padding:0 10px; font-size:12px; box-sizing:border-box;">
                </div>
                <div>
                  <label style="display:block; font-size:11.5px; color:#64748B; margin-bottom:3px;">Nama Penandatangan</label>
                  <input type="text" id="editRepSignLeftName" value="${reportCustomOverrides.signerLeftName || "K.H. Abdullah Syafi'i"}" style="width:100%; height:36px; border:1px solid #CBD5E1; border-radius:6px; padding:0 10px; font-size:12px; box-sizing:border-box;">
                </div>
              </div>
              <div style="margin-top:8px;">
                <label style="display:block; font-size:11.5px; color:#64748B; margin-bottom:3px;">Jabatan</label>
                <input type="text" id="editRepSignLeftRole" value="${reportCustomOverrides.signerLeftRole || 'Pimpinan Pondok'}" style="width:100%; height:36px; border:1px solid #CBD5E1; border-radius:6px; padding:0 10px; font-size:12px; box-sizing:border-box;">
              </div>
            </div>

            <!-- Pihak Kanan (Akademik/Admin) -->
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:12px;">
              <div style="font-size:12.5px; font-weight:700; color:var(--text-main); margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                <span>🖋️</span> Pihak Pengesah Kanan (Pembuat Laporan)
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <div>
                  <label style="display:block; font-size:11.5px; color:#64748B; margin-bottom:3px;">Kota Titimangsa</label>
                  <input type="text" id="editRepSignRightCity" value="${reportCustomOverrides.signerRightCity || 'Bogor'}" style="width:100%; height:36px; border:1px solid #CBD5E1; border-radius:6px; padding:0 10px; font-size:12px; box-sizing:border-box;">
                </div>
                <div>
                  <label style="display:block; font-size:11.5px; color:#64748B; margin-bottom:3px;">Nama Penandatangan</label>
                  <input type="text" id="editRepSignRightName" value="${reportCustomOverrides.signerRightName || (currentLoggedInUser ? currentLoggedInUser.fullName : 'Administrator Pondok')}" style="width:100%; height:36px; border:1px solid #CBD5E1; border-radius:6px; padding:0 10px; font-size:12px; box-sizing:border-box;">
                </div>
              </div>
              <div style="margin-top:8px;">
                <label style="display:block; font-size:11.5px; color:#64748B; margin-bottom:3px;">Jabatan</label>
                <input type="text" id="editRepSignRightRole" value="${reportCustomOverrides.signerRightRole || 'Bagian Akademik'}" style="width:100%; height:36px; border:1px solid #CBD5E1; border-radius:6px; padding:0 10px; font-size:12px; box-sizing:border-box;">
              </div>
            </div>
          </div>
        `;
      } else if (currentEditReportTab === 'style') {
        const theme = reportCustomOverrides.themeColor || '#074724';
        const colorOptions = [
          { label: 'Hijau Pondok', color: '#074724' },
          { label: 'Hijau Emerald', color: '#0E6838' },
          { label: 'Teal Islami', color: '#0F766E' },
          { label: 'Biru Navy', color: '#1E40AF' },
          { label: 'Slate Gelap', color: '#334155' }
        ];

        body.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div>
              <label style="display:block; font-size:12.5px; font-weight:700; color:var(--text-main); margin-bottom:8px;">Pilihan Warna Tema Header &amp; Garis Kop</label>
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(100px, 1fr)); gap:8px;">
                ${colorOptions.map(opt => `
                  <div onclick="selectReportThemeColor('${opt.color}')" style="cursor:pointer; border:2px solid ${theme === opt.color ? '#0E6838' : '#E2E8F0'}; border-radius:8px; padding:8px; text-align:center; background:${theme === opt.color ? '#F0FDF4' : '#FFF'};">
                    <div style="width:28px; height:28px; border-radius:6px; background:${opt.color}; margin:0 auto 4px;"></div>
                    <div style="font-size:11px; font-weight:700; color:var(--text-main);">${opt.label}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:12px;">
              <div style="font-size:12px; font-weight:700; color:var(--text-main); margin-bottom:10px;">Pengaturan Elemen Lembar Laporan:</div>
              <div style="display:flex; flex-direction:column; gap:8px;">
                <label style="display:flex; align-items:center; gap:8px; font-size:12px; cursor:pointer;">
                  <input type="checkbox" id="editRepToggleMetrics" ${reportCustomOverrides.showSummaryMetrics !== false ? 'checked' : ''} style="width:16px; height:16px; accent-color:#0E6838;">
                  <span>Tampilkan 5 Kartu Metrik Ringkasan (Santri, Hadir, Izin, Sakit, Rata²)</span>
                </label>
                <label style="display:flex; align-items:center; gap:8px; font-size:12px; cursor:pointer;">
                  <input type="checkbox" id="editRepToggleSign" ${reportCustomOverrides.showSignatures !== false ? 'checked' : ''} style="width:16px; height:16px; accent-color:#0E6838;">
                  <span>Tampilkan Kolom Tanda Tangan &amp; Pengesahan di Bagian Bawah</span>
                </label>
              </div>
            </div>
          </div>
        `;
      }
    }

    function recalcModalStudentRow(stId) {
      const hInp = document.getElementById('modalStH_' + stId);
      const iInp = document.getElementById('modalStI_' + stId);
      const sInp = document.getElementById('modalStS_' + stId);
      const aInp = document.getElementById('modalStA_' + stId);
      const totCell = document.getElementById('modalStTot_' + stId);
      const pctCell = document.getElementById('modalStPct_' + stId);

      if (!hInp || !iInp || !sInp || !aInp) return;
      const h = parseInt(hInp.value, 10) || 0;
      const i = parseInt(iInp.value, 10) || 0;
      const s = parseInt(sInp.value, 10) || 0;
      const a = parseInt(aInp.value, 10) || 0;
      const tot = h + i + s + a;
      const pct = tot === 0 ? '0%' : (Math.round((h / tot) * 1000) / 10) + '%';

      if (totCell) totCell.innerText = tot;
      if (pctCell) pctCell.innerText = pct;
    }

    function setAllStudentsPresent() {
      const data = computeReportData();
      const targetClass = data.classVal === 'Semua' ? 'VII A' : data.classVal;
      const students = data.type === 'perSantri' ? 
        (mockStudents.filter(s => s.id === data.studentIdVal).length ? mockStudents.filter(s => s.id === data.studentIdVal) : [mockStudents[0]]) :
        mockStudents.filter(s => s.className.toLowerCase() === targetClass.toLowerCase());

      students.forEach(st => {
        const hInp = document.getElementById('modalStH_' + st.id);
        const iInp = document.getElementById('modalStI_' + st.id);
        const sInp = document.getElementById('modalStS_' + st.id);
        const aInp = document.getElementById('modalStA_' + st.id);
        if (hInp) hInp.value = 1;
        if (iInp) iInp.value = 0;
        if (sInp) sInp.value = 0;
        if (aInp) aInp.value = 0;
        recalcModalStudentRow(st.id);
      });
      showToast('Seluruh santri diset Hadir 100%.', 'info');
    }

    function selectReportThemeColor(color) {
      reportCustomOverrides.themeColor = color;
      renderEditReportModalContent();
    }

    function saveReportModalEdits() {
      // Baca Kop & Judul jika ada elemennya
      const kopT = document.getElementById('editRepKopTitle');
      if (kopT) reportCustomOverrides.kopTitle = kopT.value.trim();

      const kopS = document.getElementById('editRepKopSubtitle');
      if (kopS) reportCustomOverrides.kopSubtitle = kopS.value.trim();

      const titleInp = document.getElementById('editRepTitle');
      if (titleInp) reportCustomOverrides.reportTitle = titleInp.value.trim();

      const periodInp = document.getElementById('editRepPeriod');
      if (periodInp) reportCustomOverrides.periodLabel = periodInp.value.trim();

      const dateInp = document.getElementById('editRepDate');
      if (dateInp) reportCustomOverrides.generatedDate = dateInp.value.trim();

      // Baca Data Santri jika tab data sedang terbuka
      const data = computeReportData();
      const targetClass = data.classVal === 'Semua' ? 'VII A' : data.classVal;
      const students = data.type === 'perSantri' ? 
        (mockStudents.filter(s => s.id === data.studentIdVal).length ? mockStudents.filter(s => s.id === data.studentIdVal) : [mockStudents[0]]) :
        mockStudents.filter(s => s.className.toLowerCase() === targetClass.toLowerCase());

      students.forEach(st => {
        const hInp = document.getElementById('modalStH_' + st.id);
        const iInp = document.getElementById('modalStI_' + st.id);
        const sInp = document.getElementById('modalStS_' + st.id);
        const aInp = document.getElementById('modalStA_' + st.id);
        if (hInp && iInp && sInp && aInp) {
          reportCustomOverrides.studentOverrides = reportCustomOverrides.studentOverrides || {};
          reportCustomOverrides.studentOverrides[st.id] = {
            hadir: parseInt(hInp.value, 10) || 0,
            izin: parseInt(iInp.value, 10) || 0,
            sakit: parseInt(sInp.value, 10) || 0,
            alfa: parseInt(aInp.value, 10) || 0
          };
        }
      });

      // Baca Pengesahan jika ada
      const sLTitle = document.getElementById('editRepSignLeftTitle');
      if (sLTitle) reportCustomOverrides.signerLeftTitle = sLTitle.value.trim();

      const sLName = document.getElementById('editRepSignLeftName');
      if (sLName) reportCustomOverrides.signerLeftName = sLName.value.trim();

      const sLRole = document.getElementById('editRepSignLeftRole');
      if (sLRole) reportCustomOverrides.signerLeftRole = sLRole.value.trim();

      const sRCity = document.getElementById('editRepSignRightCity');
      if (sRCity) reportCustomOverrides.signerRightCity = sRCity.value.trim();

      const sRName = document.getElementById('editRepSignRightName');
      if (sRName) reportCustomOverrides.signerRightName = sRName.value.trim();

      const sRRole = document.getElementById('editRepSignRightRole');
      if (sRRole) reportCustomOverrides.signerRightRole = sRRole.value.trim();

      // Baca Tampilan
      const togMetrics = document.getElementById('editRepToggleMetrics');
      if (togMetrics) reportCustomOverrides.showSummaryMetrics = togMetrics.checked;

      const togSign = document.getElementById('editRepToggleSign');
      if (togSign) reportCustomOverrides.showSignatures = togSign.checked;

      closeEditReportModal();
      renderAttendanceReport();
      showToast('Perubahan Laporan Absensi Santri berhasil diterapkan.', 'success');
    }

    function resetReportCustomOverrides() {
      reportCustomOverrides = {
        kopTitle: 'PONDOK PESANTREN ISLAM DARUL HIKMAH',
        kopSubtitle: 'Sistem Manajemen & Presensi Pembelajaran Santri',
        reportTitle: '',
        periodLabel: '',
        generatedDate: '',
        signerLeftTitle: 'Mengetahui,',
        signerLeftName: "K.H. Abdullah Syafi'i",
        signerLeftRole: 'Pimpinan Pondok',
        signerRightCity: 'Bogor',
        signerRightName: 'Administrator Pondok',
        signerRightRole: 'Bagian Akademik',
        themeColor: '#074724',
        showSummaryMetrics: true,
        showSignatures: true,
        studentOverrides: {}
      };

      const modal = document.getElementById('editReportModal');
      if (modal && modal.style.display === 'flex') {
        renderEditReportModalContent();
      }
      renderAttendanceReport();
      showToast('Kustomisasi laporan direset ke default sistem.', 'info');
    }

    // ========================================================
    // MODE EDIT LANGSUNG DI LEMBAR (DIRECT INLINE EDIT)
    // ========================================================
    function toggleDirectReportEdit() {
      isDirectReportEditMode = !isDirectReportEditMode;
      const notice = document.getElementById('directEditNotice');
      const btn = document.getElementById('btnToggleDirectEdit');
      const txt = document.getElementById('txtToggleDirectEdit');

      if (notice) {
        notice.style.display = isDirectReportEditMode ? 'flex' : 'none';
      }
      if (btn) {
        if (isDirectReportEditMode) {
          btn.style.background = '#DCFCE7';
          btn.style.borderColor = '#16A34A';
          btn.style.color = '#15803D';
          if (txt) txt.innerText = 'Tutup Edit Lembar';
        } else {
          btn.style.background = '#F0FDF4';
          btn.style.borderColor = '#86EFAC';
          btn.style.color = '#15803D';
          if (txt) txt.innerText = 'Edit di Lembar';
        }
      }

      renderAttendanceReport();
      if (isDirectReportEditMode) {
        showToast('Mode Edit di Lembar aktif: Ubah angka & teks langsung di atas kertas laporan.', 'info');
      }
    }

    function saveDirectReportEdit() {
      isDirectReportEditMode = false;
      const notice = document.getElementById('directEditNotice');
      const txt = document.getElementById('txtToggleDirectEdit');
      const btn = document.getElementById('btnToggleDirectEdit');

      if (notice) notice.style.display = 'none';
      if (txt) txt.innerText = 'Edit di Lembar';
      if (btn) {
        btn.style.background = '#F0FDF4';
        btn.style.borderColor = '#86EFAC';
      }

      renderAttendanceReport();
      showToast('Perubahan langsung pada laporan berhasil disimpan.', 'success');
    }

    function cancelDirectReportEdit() {
      isDirectReportEditMode = false;
      const notice = document.getElementById('directEditNotice');
      const txt = document.getElementById('txtToggleDirectEdit');
      const btn = document.getElementById('btnToggleDirectEdit');

      if (notice) notice.style.display = 'none';
      if (txt) txt.innerText = 'Edit di Lembar';
      if (btn) {
        btn.style.background = '#F0FDF4';
        btn.style.borderColor = '#86EFAC';
      }

      renderAttendanceReport();
      showToast('Mode Edit di Lembar ditutup.', 'info');
    }

    function updateDirectStudentNumber(studentId, field, value) {
      reportCustomOverrides.studentOverrides = reportCustomOverrides.studentOverrides || {};
      reportCustomOverrides.studentOverrides[studentId] = reportCustomOverrides.studentOverrides[studentId] || {
        hadir: 0, izin: 0, sakit: 0, alfa: 0
      };

      // Pastikan nilai terisi untuk field lainnya jika baru dibuat
      const data = computeReportData();
      const existingSt = mockStudents.find(s => s.id === studentId);
      if (existingSt && reportCustomOverrides.studentOverrides[studentId].hadir === undefined) {
        let sH = 0, sI = 0, sS = 0, sA = 0;
        data.filteredSessions.forEach(session => {
          const item = (session.items || []).find(it => it.studentId === studentId);
          if (item) {
            if (item.status === 'hadir') sH++;
            else if (item.status === 'izin') sI++;
            else if (item.status === 'sakit') sS++;
            else if (item.status === 'alfa') sA++;
          }
        });
        reportCustomOverrides.studentOverrides[studentId].hadir = sH;
        reportCustomOverrides.studentOverrides[studentId].izin = sI;
        reportCustomOverrides.studentOverrides[studentId].sakit = sS;
        reportCustomOverrides.studentOverrides[studentId].alfa = sA;
      }

      reportCustomOverrides.studentOverrides[studentId][field] = Math.max(0, parseInt(value, 10) || 0);
      renderAttendanceReport();
    }

    // ========================================================
    // EKSPOR LAPORAN PDF (MENDUKUNG KUSTOMISASI)
    // ========================================================
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

      const theme = reportCustomOverrides.themeColor || '#074724';

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cetak Laporan Absensi - Darul Hikmah</title>
          <style>
            @page { size: A4 portrait; margin: 15mm 12mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; margin: 0; padding: 0; font-size: 11px; }
            .a4-report-paper, #reportPaperContainer {
              width: 100% !important;
              max-width: 100% !important;
              min-height: auto !important;
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: none !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
            }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10.5px; }
            th { background: ${theme}; color: white; padding: 6px 8px; text-align: left; }
            td { padding: 5px 8px; border: 1px solid #cbd5e1; }
            tr:nth-child(even) { background: #f8fafc; }
            input { border: none !important; background: transparent !important; font-weight: inherit !important; font-size: inherit !important; color: inherit !important; text-align: center !important; }
            [contenteditable="true"] { border: none !important; }
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

    // Expose helpers globally
    window.openEditReportModal = openEditReportModal;
    window.closeEditReportModal = closeEditReportModal;
    window.switchEditReportTab = switchEditReportTab;
    window.renderEditReportModalContent = renderEditReportModalContent;
    window.recalcModalStudentRow = recalcModalStudentRow;
    window.setAllStudentsPresent = setAllStudentsPresent;
    window.selectReportThemeColor = selectReportThemeColor;
    window.saveReportModalEdits = saveReportModalEdits;
    window.resetReportCustomOverrides = resetReportCustomOverrides;
    window.toggleDirectReportEdit = toggleDirectReportEdit;
    window.saveDirectReportEdit = saveDirectReportEdit;
    window.cancelDirectReportEdit = cancelDirectReportEdit;
    window.updateDirectStudentNumber = updateDirectStudentNumber;
    window.reportCustomOverrides = reportCustomOverrides;

  