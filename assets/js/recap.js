    // ========================================================
    // REKAP ABSENSI PER SANTRI — LOGIKA JAVASCRIPT (KHUSUS ADMIN)
    // ========================================================
    function renderStudentRecapList() {
      // 1. RBAC Guard: Hanya Admin
      if (!currentLoggedInUser || currentLoggedInUser.role !== 'Admin') {
        const sec = document.getElementById('schTabRecapSection');
        if (sec) {
          sec.innerHTML = '<div style="text-align:center; padding:30px; color:#DC2626; font-weight:700;">Akses Ditolak: Khusus Administrator Pondok.</div>';
        }
        return;
      }

      const q = (document.getElementById('recapSearchInput') ? document.getElementById('recapSearchInput').value : '').toLowerCase().trim();
      const cls = document.getElementById('recapFilterClass') ? document.getElementById('recapFilterClass').value : 'Semua';
      const startD = document.getElementById('recapFilterStartDate') ? document.getElementById('recapFilterStartDate').value : '';
      const endD = document.getElementById('recapFilterEndDate') ? document.getElementById('recapFilterEndDate').value : '';

      const clearBtn = document.getElementById('recapClearSearch');
      if (clearBtn) clearBtn.style.display = q.length > 0 ? 'inline-block' : 'none';

      // Saring sesi absensi berdasarkan rentang tanggal
      const filteredAttendances = mockAttendanceRecords.filter(function(r) {
        if (startD && r.date < startD) return false;
        if (endD && r.date > endD) return false;
        return true;
      });

      // Saring santri berdasarkan kelas dan pencarian
      let targetStudents = mockStudents.slice();
      if (cls !== 'Semua') {
        targetStudents = targetStudents.filter(function(s) {
          return (s.className || '').toLowerCase() === cls.toLowerCase();
        });
      }
      if (q) {
        targetStudents = targetStudents.filter(function(s) {
          return (s.fullName || '').toLowerCase().includes(q) || (s.nis || '').toLowerCase().includes(q);
        });
      }

      // Hitung agregasi per santri
      let globalMeetings = 0;
      let globalHadir = 0;
      const recapData = targetStudents.map(function(s) {
        let h = 0, i = 0, sk = 0, a = 0;
        const logs = [];

        filteredAttendances.forEach(function(att) {
          const it = (att.items || []).find(function(item) {
            return item.studentId === s.id || item.studentNis === s.nis;
          });
          if (it) {
            if (it.status === 'hadir') h++;
            else if (it.status === 'izin') i++;
            else if (it.status === 'sakit') sk++;
            else if (it.status === 'alfa') a++;

            logs.push({
              attendanceId: att.id,
              date: att.date,
              subject: att.subject,
              className: att.className,
              teacherName: att.teacherName,
              periodNumber: att.periodNumber,
              startTime: att.startTime,
              endTime: att.endTime,
              status: it.status,
              note: it.note
            });
          }
        });

        logs.sort(function(x, y) { return y.date.localeCompare(x.date); });

        const total = h + i + sk + a;
        globalMeetings += total;
        globalHadir += h;
        const pct = total === 0 ? 0 : Math.round((h / total) * 1000) / 10;

        return {
          student: s,
          total: total,
          hadir: h,
          izin: i,
          sakit: sk,
          alfa: a,
          percentage: pct,
          logs: logs
        };
      });

      // Update ringkasan global
      const totStdEl = document.getElementById('recapTotalStudents');
      const totMeetEl = document.getElementById('recapTotalMeetings');
      const avgPctEl = document.getElementById('recapAvgPercentage');
      const countLbl = document.getElementById('recapStudentCountLabel');

      if (totStdEl) totStdEl.innerText = recapData.length;
      if (totMeetEl) totMeetEl.innerText = globalMeetings;
      const globalAvg = globalMeetings === 0 ? 0 : Math.round((globalHadir / globalMeetings) * 1000) / 10;
      if (avgPctEl) avgPctEl.innerText = (globalAvg % 1 === 0 ? globalAvg.toFixed(0) : globalAvg.toFixed(1)) + '%';
      if (countLbl) countLbl.innerText = 'Daftar Rekap Santri (' + recapData.length + ')';

      const container = document.getElementById('recapStudentListContainer');
      if (!container) return;

      if (recapData.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding:36px 16px; background:#fff; border-radius:14px; border:1px dashed #CBD5E1;">
            <div style="font-size:32px; margin-bottom:8px;">🔍</div>
            <div style="font-size:14px; font-weight:700; color:var(--text-main);">Tidak ada santri ditemukan</div>
            <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">Coba sesuaikan kata kunci pencarian, kelas, atau tanggal.</div>
          </div>
        `;
        return;
      }

      container.innerHTML = recapData.map(function(item) {
        const s = item.student;
        const initial = (s.fullName || 'S').charAt(0).toUpperCase();
        const isMale = (s.gender || '').toLowerCase() === 'putra' || (s.gender || '').toLowerCase() === 'l';
        const avBg = isMale ? '#DBEAFE' : '#FCE7F3';
        const avColor = isMale ? '#1D4ED8' : '#DB2777';

        let indColor = '#DC2626';
        let indBg = '#FEE2E2';
        if (item.total === 0) {
          indColor = '#94A3B8';
          indBg = '#F1F5F9';
        } else if (item.percentage >= 90) {
          indColor = '#16A34A';
          indBg = '#DCFCE7';
        } else if (item.percentage >= 75) {
          indColor = '#D97706';
          indBg = '#FEF3C7';
        }

        const pctText = item.total === 0 ? '0%' : (item.percentage % 1 === 0 ? item.percentage.toFixed(0) : item.percentage.toFixed(1)) + '%';

        return `
          <div class="snt-card" onclick="openStudentRecapDetail('${s.id}')" style="margin-bottom:10px; cursor:pointer;" title="Buka Detail Rekap ${s.fullName}">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="width:42px; height:42px; border-radius:12px; background:${avBg}; color:${avColor}; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:800; flex-shrink:0;">
                ${initial}
              </div>
              <div style="flex:1; min-width:0;">
                <div style="font-size:14px; font-weight:700; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${s.fullName}</div>
                <div style="display:flex; align-items:center; gap:6px; margin-top:2px;">
                  <span style="font-size:11px; font-weight:600; color:var(--text-muted);">NIS: ${s.nis}</span>
                  <span style="color:#CBD5E1; font-size:10px;">•</span>
                  <span style="background:#F0FDF4; color:var(--primary); font-size:10.5px; font-weight:700; padding:1px 5px; border-radius:4px;">Kelas ${s.className}</span>
                </div>
              </div>
              <div style="padding:4px 8px; border-radius:8px; font-size:12.5px; font-weight:800; background:${indBg}; color:${indColor}; flex-shrink:0;">
                ${pctText}
              </div>
            </div>
            <div style="height:1px; background:#F1F5F9; margin:9px 0;"></div>
            <div style="display:flex; align-items:center; justify-content:space-between;">
              <span style="font-size:11.5px; font-weight:600; color:var(--text-secondary);">${item.total} Sesi Tercatat</span>
              <div style="display:flex; align-items:center; gap:4px;">
                <span class="att-pill h">H: ${item.hadir}</span>
                <span class="att-pill i">I: ${item.izin}</span>
                <span class="att-pill s">S: ${item.sakit}</span>
                <span class="att-pill a">A: ${item.alfa}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2.5" style="margin-left:3px;"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    function clearRecapSearch() {
      const el = document.getElementById('recapSearchInput');
      if (el) el.value = '';
      renderStudentRecapList();
    }

    function resetRecapFilters() {
      const q = document.getElementById('recapSearchInput');
      const cls = document.getElementById('recapFilterClass');
      const startD = document.getElementById('recapFilterStartDate');
      const endD = document.getElementById('recapFilterEndDate');

      if (q) q.value = '';
      if (cls) cls.value = 'Semua';
      if (startD) startD.value = '';
      if (endD) endD.value = '';

      renderStudentRecapList();
    }

    // Detail Rekap Absensi Santri
    let currentViewingRecapStudentId = null;

    function openStudentRecapDetail(studentId) {
      if (!currentLoggedInUser || currentLoggedInUser.role !== 'Admin') {
        showToast('Akses ditolak: Hanya Admin yang dapat melihat detail rekap.', 'error');
        return;
      }
      currentViewingRecapStudentId = studentId;
      const s = mockStudents.find(function(item) { return item.id === studentId; });
      if (!s) return;

      const startD = document.getElementById('recapFilterStartDate') ? document.getElementById('recapFilterStartDate').value : '';
      const endD = document.getElementById('recapFilterEndDate') ? document.getElementById('recapFilterEndDate').value : '';

      // Hitung log dan status untuk santri ini
      let h = 0, i = 0, sk = 0, a = 0;
      const logs = [];

      mockAttendanceRecords.forEach(function(att) {
        if (startD && att.date < startD) return;
        if (endD && att.date > endD) return;

        const it = (att.items || []).find(function(item) {
          return item.studentId === s.id || item.studentNis === s.nis;
        });
        if (it) {
          if (it.status === 'hadir') h++;
          else if (it.status === 'izin') i++;
          else if (it.status === 'sakit') sk++;
          else if (it.status === 'alfa') a++;

          logs.push({
            date: att.date,
            subject: att.subject,
            className: att.className,
            teacherName: att.teacherName,
            periodNumber: att.periodNumber,
            startTime: att.startTime,
            endTime: att.endTime,
            status: it.status,
            note: it.note
          });
        }
      });

      logs.sort(function(x, y) { return y.date.localeCompare(x.date); });

      const total = h + i + sk + a;
      const pct = total === 0 ? 0 : Math.round((h / total) * 1000) / 10;

      // Populate UI
      const nameEl = document.getElementById('recapDetName');
      const nisEl = document.getElementById('recapDetNis');
      const clsEl = document.getElementById('recapDetClass');
      const genderEl = document.getElementById('recapDetGenderRoom');
      const avBox = document.getElementById('recapDetAvatarBox');
      const pctEl = document.getElementById('recapDetPercentage');
      const meetSub = document.getElementById('recapDetMeetingsSub');
      const badgeSt = document.getElementById('recapDetBadgeStatus');
      const hadirEl = document.getElementById('recapDetHadir');
      const izinEl = document.getElementById('recapDetIzin');
      const sakitEl = document.getElementById('recapDetSakit');
      const alfaEl = document.getElementById('recapDetAlfa');
      const headerLog = document.getElementById('recapDetLogHeader');
      const logCont = document.getElementById('recapDetLogContainer');

      if (nameEl) nameEl.innerText = s.fullName;
      if (nisEl) nisEl.innerText = 'NIS: ' + s.nis;
      if (clsEl) clsEl.innerText = 'Kelas ' + s.className;
      if (genderEl) genderEl.innerText = s.gender + ' • Ruang: ' + s.room;

      const isMale = (s.gender || '').toLowerCase() === 'putra' || (s.gender || '').toLowerCase() === 'l';
      if (avBox) {
        avBox.style.background = isMale ? '#DBEAFE' : '#FCE7F3';
        avBox.style.color = isMale ? '#1D4ED8' : '#DB2777';
        avBox.innerText = (s.fullName || 'S').charAt(0).toUpperCase();
      }

      let indColor = '#DC2626';
      let indBg = '#FEE2E2';
      let labelStatus = 'Perlu Perhatian';
      if (total === 0) {
        indColor = '#94A3B8';
        indBg = '#F1F5F9';
        labelStatus = 'Belum Ada Sesi';
      } else if (pct >= 90) {
        indColor = '#16A34A';
        indBg = '#DCFCE7';
        labelStatus = 'Sangat Baik';
      } else if (pct >= 75) {
        indColor = '#D97706';
        indBg = '#FEF3C7';
        labelStatus = 'Cukup';
      }

      const pctStr = total === 0 ? '0%' : (pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(1)) + '%';
      if (pctEl) {
        pctEl.innerText = pctStr;
        pctEl.style.color = indColor;
      }
      if (meetSub) meetSub.innerText = '(' + h + '/' + total + ' Pertemuan)';
      if (badgeSt) {
        badgeSt.innerText = labelStatus;
        badgeSt.style.background = indBg;
        badgeSt.style.color = indColor;
      }

      if (hadirEl) hadirEl.innerText = h;
      if (izinEl) izinEl.innerText = i;
      if (sakitEl) sakitEl.innerText = sk;
      if (alfaEl) alfaEl.innerText = a;

      if (headerLog) headerLog.innerText = 'Riwayat Sesi Absensi (' + logs.length + ')';

      if (logCont) {
        if (logs.length === 0) {
          logCont.innerHTML = `
            <div style="background:#fff; border-radius:12px; padding:24px; text-align:center; border:1px dashed #CBD5E1;">
              <div style="font-size:24px; margin-bottom:6px;">📅</div>
              <div style="font-size:13px; font-weight:700; color:var(--text-main);">Belum ada sesi absensi yang tercatat</div>
              <div style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">Santri ini belum memiliki presensi pada periode tanggal yang dipilih.</div>
            </div>
          `;
        } else {
          logCont.innerHTML = logs.map(function(item) {
            let stColor = '#16A34A', stBg = '#DCFCE7', stLabel = 'Hadir';
            if (item.status === 'izin') { stColor = '#0284C7'; stBg = '#E0F2FE'; stLabel = 'Izin'; }
            else if (item.status === 'sakit') { stColor = '#D97706'; stBg = '#FEF3C7'; stLabel = 'Sakit'; }
            else if (item.status === 'alfa') { stColor = '#DC2626'; stBg = '#FEE2E2'; stLabel = 'Alfa'; }

            const noteHtml = item.note ? `
              <div style="margin-top:6px; padding:4px 8px; background:#F8FAFC; border-radius:6px; font-size:11px; font-style:italic; color:var(--text-secondary); border:1px solid #E2E8F0;">
                Catatan: ${item.note}
              </div>
            ` : '';

            return `
              <div style="background:#fff; border-radius:12px; padding:12px; border:1px solid #E2E8F0; margin-bottom:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:14px; font-weight:700; color:var(--text-main);">${item.subject}</span>
                  <span style="padding:2px 8px; border-radius:6px; font-size:11px; font-weight:700; background:${stBg}; color:${stColor};">${stLabel}</span>
                </div>
                <div style="font-size:11.5px; color:var(--text-muted); margin-top:4px; display:flex; align-items:center; gap:6px;">
                  <span>📅 ${formatIndoDate(item.date)}</span>
                  <span>•</span>
                  <span>Jam Ke-${item.periodNumber} (${item.startTime} - ${item.endTime})</span>
                </div>
                <div style="font-size:11.5px; color:var(--text-secondary); margin-top:3px;">
                  Guru: ${item.teacherName}
                </div>
                ${noteHtml}
              </div>
            `;
          }).join('');
        }
      }

      if (typeof showOnlyScreenPage === 'function') {
        showOnlyScreenPage('pageStudentRecapDetail');
      } else {
        const page = document.getElementById('pageStudentRecapDetail');
        if (page) {
          page.classList.add('active');
          page.scrollTop = 0;
        }
      }
    }

    function backFromStudentRecapDetail() {
      currentViewingRecapStudentId = null;
      if (typeof openAttendanceReportPage === 'function') {
        openAttendanceReportPage();
      } else {
        const page = document.getElementById('pageStudentRecapDetail');
        if (page) page.classList.remove('active');
      }
    }

