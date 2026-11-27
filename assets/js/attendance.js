    /* ========================================================================== */
    /* LOGIKA & FITUR MODUL ABSENSI SANTRI PER MAPEL (SESUAI BUTIR 1-7)           */
    /* ========================================================================== */

    function formatIndoDate(dateStr) {
      if (!dateStr) return '-';
      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const day = parseInt(parts[2], 10);
      const mIdx = parseInt(parts[1], 10) - 1;
      const year = parts[0];
      return day + ' ' + (months[mIdx] || parts[1]) + ' ' + year;
    }

    // Ganti Tab Utama (Jadwal Pelajaran vs Riwayat & Rekap Absensi)
    function switchScheduleMainTab(tab) {
      const schSec = document.getElementById("schTabScheduleSection");
      if (schSec) schSec.style.display = "block";
      const pageTitle = document.querySelector("#pageScheduleList .sub-app-bar-title");
      if (pageTitle) pageTitle.innerText = "Absensi Santri";
      const topAddBtn = document.getElementById("schTopAddBtn");
      const isAdmin = currentLoggedInUser && currentLoggedInUser.role === "Admin";
      if (topAddBtn) topAddBtn.style.display = isAdmin ? "inline-flex" : "none";
      renderScheduleList();
    }

    // Helper Navigasi Langsung ke Riwayat Absensi
    function openAttendanceHistoryDirect() {
      const isAdmin = currentLoggedInUser && currentLoggedInUser.role === "Admin";
      openScheduleListPage();
      switchScheduleMainTab(isAdmin ? "attendance" : "schedule");
    }

    function openAttendanceSubmenuModal() {
      // Langsung masuk ke halaman absensi santri tanpa melalui tabel pilihan
      openScheduleListPage();
      switchScheduleMainTab("schedule");
    }

    function closeAttendanceSubmenuModal() {
      const modal = document.getElementById("attendanceSubmenuModal");
      if (modal) {
        modal.classList.remove("active");
        modal.style.display = "none";
      }
    }

    function canUserManageAttendance(schedule) {
      if (!currentLoggedInUser) return false;
      if (currentLoggedInUser.role === "Admin") return true;
      const teacherName = (schedule.teacherName || "").toLowerCase().trim();
      const userFullName = currentLoggedInUser.fullName.toLowerCase().trim();
      return (teacherName.length > 0 && teacherName === userFullName) || (schedule.teacherId && schedule.teacherId === currentLoggedInUser.id) || (teacherName.includes("ahmad fauzi") && userFullName.includes("ahmad fauzi"));
    }

    function openAttendanceForm(scheduleId, targetDate) {
      const schedule = mockSchedules.find(s => s.id === scheduleId);
      if (!schedule) {
        showToast("Jadwal pelajaran tidak ditemukan.", "error");
        return;
      }

      // Validasi Otorisasi (Guru hanya jadwal sendiri - Butir 2 & 5)
      if (!canUserManageAttendance(schedule)) {
        showToast("Akses ditolak: Anda hanya dapat mengisi absensi pada jadwal Anda sendiri.", "error");
        return;
      }

      currentAttendanceScheduleId = scheduleId;
      const todayIso = new Date().toISOString().split("T")[0];
      currentAttendanceDate = targetDate || todayIso;

      // Reset state validasi
      attendanceValidationActive = false;
      const banner = document.getElementById("attValidationBanner");
      if (banner) banner.style.display = "none";

      const titleEl = document.getElementById("attFormTitle");
      const badgeEl = document.getElementById("attFormClassHeaderBadge");
      const subjEl = document.getElementById("attFormSubject");
      const teachEl = document.getElementById("attFormTeacher");
      const periodEl = document.getElementById("attFormPeriod");
      const dateInput = document.getElementById("attFormDate");

      if (badgeEl) badgeEl.innerText = "Kelas " + schedule.className;
      if (subjEl) subjEl.innerText = schedule.subject;
      if (teachEl) teachEl.innerText = schedule.teacherName;
      if (periodEl) periodEl.innerText = "Jam Ke-" + schedule.periodNumber + " (" + schedule.startTime + " - " + schedule.endTime + ")";
      if (dateInput) dateInput.value = currentAttendanceDate;

      // Ambil santri dari kelas jadwal ini (tanpa duplikasi - Butir 5)
      const studentsInClass = mockStudents.filter(s => s.className === schedule.className && s.isActive !== false);

      // Cek apakah data absensi sesi ini sudah pernah dibuat sebelumnya (Anti-duplikasi - Butir 5)
      const existingRecord = mockAttendanceRecords.find(r => r.scheduleId === scheduleId && r.date === currentAttendanceDate);

      if (existingRecord) {
        if (titleEl) titleEl.innerText = "Edit Absensi Santri";
        currentAttendanceItems = studentsInClass.map(st => {
          const prev = existingRecord.items.find(it => it.studentId === st.id);
          return {
            studentId: st.id,
            studentNis: st.nis,
            studentName: st.fullName,
            gender: st.gender,
            avatar: st.avatar || "",
            status: prev ? prev.status : "",
            note: prev ? (prev.note || "") : ""
          };
        });
      } else {
        if (titleEl) titleEl.innerText = "Input Absensi Santri";
        // Ketentuan 2.6: Jangan menganggap status kosong sebagai Hadir atau Alfa secara otomatis
        currentAttendanceItems = studentsInClass.map(st => ({
          studentId: st.id,
          studentNis: st.nis,
          studentName: st.fullName,
          gender: st.gender,
          avatar: st.avatar || "",
          status: "", // Mulai kosong, wajib dipilih oleh pengguna
          note: ""
        }));
      }

      renderAttendanceStudentList();
      updateAttendanceFormStats();

      if (typeof showOnlyScreenPage === 'function') {
        showOnlyScreenPage('pageAttendanceForm');
      } else {
        document.getElementById("pageAttendanceForm").classList.add("active");
        document.getElementById("pageAttendanceForm").scrollTop = 0;
      }
    }

    // Tangani perubahan tanggal pada formulir absensi
    function handleAttendanceDateChange() {
      const dateInput = document.getElementById("attFormDate");
      if (!dateInput || !dateInput.value) return;
      openAttendanceForm(currentAttendanceScheduleId, dateInput.value);
    }

    // Scroll otomatis ke kartu santri pertama yang belum memiliki status (Ketentuan 2.5)
    function scrollToFirstUnassignedStudent() {
      const unassigned = currentAttendanceItems.find(it => !it.status);
      if (!unassigned) return;
      const cardEl = document.getElementById("attCard_" + unassigned.studentId);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    // Render daftar santri pada form absensi
    function renderAttendanceStudentList() {
      const container = document.getElementById("attStudentListContainer");
      const countLabel = document.getElementById("attStudentCountLabel");
      if (!container) return;

      if (countLabel) {
        countLabel.innerText = "Daftar Santri (" + currentAttendanceItems.length + ")";
      }

      if (currentAttendanceItems.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:24px; color:var(--text-muted);">Tidak ada santri aktif di kelas ini.</div>';
        return;
      }

      container.innerHTML = currentAttendanceItems.map(function(item) {
        const isUnassigned = !item.status;
        const hasError = attendanceValidationActive && isUnassigned;
        const cardClass = "att-student-card" + (hasError ? " unassigned-warning" : "");

        const avatarHtml = item.avatar ?
          ('<img src="' + item.avatar + '" class="att-student-avatar" alt="' + item.studentName + '">') :
          ('<div class="att-student-avatar-fallback ' + (item.gender === "Putri" ? "putri" : "putra") + ' ">' + item.studentName.charAt(0) + '</div>');

        const statuses = [
          { key: "hadir", label: "Hadir" },
          { key: "izin", label: "Izin" },
          { key: "sakit", label: "Sakit" },
          { key: "alfa", label: "Alfa" }
        ];

        const chipsHtml = statuses.map(function(s) {
          const isActive = item.status === s.key ? (" active-" + s.key) : "";
          return '<button type="button" class="att-chip' + isActive + '" onclick="setAttendanceItemStatus(\''+ item.studentId + '\', \'' + s.key + '\')">' + s.label + '</button>';
        }).join("");

        // Tanda peringatan khusus pada kartu santri yang belum diisi (Ketentuan 2.4)
        const unassignedWarningHtml = hasError ?
          '<div style="display:inline-flex; align-items:center; gap:5px; background:#FEE2E2; color:#DC2626; font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px; margin-bottom:8px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Status kehadiran belum dipilih</div>' : "";

        const unassignedBadgeHtml = isUnassigned ?
          '<span style="font-size:10.5px; font-weight:700; color:#64748B; background:#F1F5F9; padding:2px 6px; border-radius:4px;">Belum Diisi</span>' : "";

        const noteInputHtml = (item.status && item.status !== "hadir") ?
          ('<input type="text" class="att-notes-input" placeholder="Catatan khusus (alasan ' + item.status + ', dsb)..." value="' + (item.note || "") + '" oninput="updateAttendanceItemNote(\''+ item.studentId + '\', this.value)">') : "";

        return '<div class="' + cardClass + '" id="attCard_' + item.studentId + ' ">' +
          unassignedWarningHtml +
          '<div class="att-student-header">' +
            avatarHtml +
            '<div style="flex:1; min-width:0;">' +
              '<div class="att-student-name">' + item.studentName + '</div>' +
              '<div class="att-student-nis">NIS: ' + item.studentNis + ' • ' + item.gender + '</div>' +
            '</div>' +
            unassignedBadgeHtml +
          '</div>' +
          '<div class="att-status-chips">' + chipsHtml + '</div>' +
          noteInputHtml +
        '</div>';
      }).join("");
    }
    // Set status absensi 1 santri (Bisa di-toggle / ubah status)
    function setAttendanceItemStatus(studentId, status) {
      const item = currentAttendanceItems.find(it => it.studentId === studentId);
      if (item) {
        item.status = (item.status === status) ? "" : status;
        
        // Periksa apakah seluruh status kini sudah terisi
        const unassignedCount = currentAttendanceItems.filter(it => !it.status).length;
        if (unassignedCount === 0 && attendanceValidationActive) {
          attendanceValidationActive = false;
          const banner = document.getElementById("attValidationBanner");
          if (banner) banner.style.display = "none";
        } else if (attendanceValidationActive) {
          const bannerText = document.getElementById("attValidationBannerText");
          if (bannerText) {
            bannerText.innerText = "Masih ada " + unassignedCount + " santri yang belum memiliki status kehadiran.";
          }
        }

        renderAttendanceStudentList();
        updateAttendanceFormStats();
      }
    }

    // Tandai semua santri dengan status tertentu
    function quickMarkAllStatus(status) {
      currentAttendanceItems.forEach(it => {
        it.status = status;
      });
      attendanceValidationActive = false;
      const banner = document.getElementById("attValidationBanner");
      if (banner) banner.style.display = "none";

      renderAttendanceStudentList();
      updateAttendanceFormStats();
      showToast("Seluruh santri ditandai " + status.toUpperCase(), "success");
    }

    // Update catatan santri
    function updateAttendanceItemNote(studentId, val) {
      const item = currentAttendanceItems.find(it => it.studentId === studentId);
      if (item) {
        item.note = val;
      }
    }

    // Update penghitung mini di bilah bawah (Ketentuan 1.1)
    function updateAttendanceFormStats() {
      const counts = { hadir: 0, izin: 0, sakit: 0, alfa: 0 };
      let unassignedCount = 0;
      currentAttendanceItems.forEach(it => {
        if (counts[it.status] !== undefined) counts[it.status]++;
        else unassignedCount++;
      });

      const elH = document.getElementById("attStatH");
      const elI = document.getElementById("attStatI");
      const elS = document.getElementById("attStatS");
      const elA = document.getElementById("attStatA");
      const elU = document.getElementById("attStatU");
      const elUWrap = document.getElementById("attStatUnassignedWrap");

      if (elH) elH.innerText = counts.hadir;
      if (elI) elI.innerText = counts.izin;
      if (elS) elS.innerText = counts.sakit;
      if (elA) elA.innerText = counts.alfa;
      if (elU) elU.innerText = unassignedCount;
      if (elUWrap) elUWrap.style.display = unassignedCount > 0 ? "inline-block" : "none";
    }

    // Simpan Formulir Absensi: Menjalankan Validasi (Butir 2) sebelum Dialog Konfirmasi (Butir 1)
    function saveAttendanceForm() {
      const schedule = mockSchedules.find(s => s.id === currentAttendanceScheduleId);
      if (!schedule) {
        showToast("Jadwal tidak valid.", "error");
        return;
      }

      if (!canUserManageAttendance(schedule)) {
        showToast("Akses ditolak: Anda tidak memiliki izin menyimpan jadwal ini.", "error");
        return;
      }

      const dateInput = document.getElementById("attFormDate");
      const dateVal = dateInput ? dateInput.value : "";
      if (!dateVal) {
        showToast("Tanggal pertemuan wajib diisi.", "error");
        return;
      }

      // Validasi 2.1 & 2.2: Periksa status seluruh santri
      const unassignedItems = currentAttendanceItems.filter(it => !it.status);
      const unassignedCount = unassignedItems.length;

      if (unassignedCount > 0) {
        // Batalkan proses penyimpanan dan tandai
        attendanceValidationActive = true;
        renderAttendanceStudentList();

        const banner = document.getElementById("attValidationBanner");
        const bannerText = document.getElementById("attValidationBannerText");
        if (banner && bannerText) {
          banner.style.display = "flex";
          bannerText.innerText = "Masih ada " + unassignedCount + " santri yang belum memiliki status kehadiran.";
        }

        // Pesan kesalahan (Ketentuan 2.3)
        showToast("Masih ada " + unassignedCount + " santri yang belum memiliki status kehadiran.", "error");

        // Scroll bantu pengguna menemukan santri yang belum diisi (Ketentuan 2.5)
        scrollToFirstUnassignedStudent();
        return;
      }

      // 2.7: Setelah semua santri memiliki status, tampilkan dialog konfirmasi
      attendanceValidationActive = false;
      const banner = document.getElementById("attValidationBanner");
      if (banner) banner.style.display = "none";

      openAttendanceConfirmModal(schedule, dateVal);
    }

    // Buka Dialog Konfirmasi Penyimpanan Absensi (Butir 1)
    function openAttendanceConfirmModal(schedule, dateVal) {
      let hadir = 0, izin = 0, sakit = 0, alfa = 0;
      currentAttendanceItems.forEach(it => {
        if (it.status === "hadir") hadir++;
        else if (it.status === "izin") izin++;
        else if (it.status === "sakit") sakit++;
        else if (it.status === "alfa") alfa++;
      });
      const totalSantri = currentAttendanceItems.length;

      // Ketentuan 1.2: Jumlah seluruh status harus sama dengan total santri
      if (hadir + izin + sakit + alfa !== totalSantri) {
        showToast("Jumlah rincian status tidak sesuai dengan total santri.", "error");
        return;
      }

      const totEl = document.getElementById("attConfirmTotal");
      const hadEl = document.getElementById("attConfirmHadir");
      const iznEl = document.getElementById("attConfirmIzin");
      const sakEl = document.getElementById("attConfirmSakit");
      const alfEl = document.getElementById("attConfirmAlfa");
      const subEl = document.getElementById("attConfirmSubtitle");

      if (totEl) totEl.innerText = totalSantri;
      if (hadEl) hadEl.innerText = hadir;
      if (iznEl) iznEl.innerText = izin;
      if (sakEl) sakEl.innerText = sakit;
      if (alfEl) alfEl.innerText = alfa;
      if (subEl) subEl.innerText = schedule.subject + " - Kelas " + schedule.className;

      const modal = document.getElementById("attendanceConfirmModal");
      if (modal) {
        modal.classList.add("active");
        modal.style.display = "flex";
      }
    }

    // Tutup Dialog Konfirmasi tanpa menyimpan & tanpa menghilangkan perubahan (Ketentuan 1)
    function closeAttendanceConfirmModal() {
      const modal = document.getElementById("attendanceConfirmModal");
      if (modal) {
        modal.classList.remove("active");
        modal.style.display = "none";
      }
    }

    // Eksekusi Konfirmasi Simpan (Ketentuan 1.4 & 1.5)
    function executeConfirmedAttendanceSave() {
      closeAttendanceConfirmModal();

      const schedule = mockSchedules.find(s => s.id === currentAttendanceScheduleId);
      if (!schedule) return;

      const dateInput = document.getElementById("attFormDate");
      const dateVal = dateInput ? dateInput.value : "";

      try {
        const existingIdx = mockAttendanceRecords.findIndex(r => r.scheduleId === schedule.id && r.date === dateVal);

        if (existingIdx !== -1) {
          // Mode Update
          mockAttendanceRecords[existingIdx].items = JSON.parse(JSON.stringify(currentAttendanceItems));
          mockAttendanceRecords[existingIdx].updatedAt = new Date().toISOString();
          showToast("Absensi santri berhasil diperbarui!", "success");
        } else {
          // Mode Create Baru
          const newRecord = {
            id: "ATT-" + Date.now(),
            scheduleId: schedule.id,
            date: dateVal,
            className: schedule.className,
            subject: schedule.subject,
            teacherName: schedule.teacherName,
            teacherId: schedule.teacherId,
            periodNumber: schedule.periodNumber,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            recordedBy: currentLoggedInUser ? currentLoggedInUser.fullName : "Sistem",
            createdAt: new Date().toISOString(),
            items: JSON.parse(JSON.stringify(currentAttendanceItems))
          };
          mockAttendanceRecords.unshift(newRecord);
          showToast("Absensi santri berhasil disimpan!", "success");
        }

        // Catat aktivitas real ustadz ke beranda (Data update sesuai keaktifan ustadz pada hari itu)
        if (typeof addUstadzActivity === 'function') {
          let hadir = 0, izin = 0, sakit = 0, alfa = 0;
          currentAttendanceItems.forEach(it => {
            if (it.status === "hadir") hadir++;
            else if (it.status === "izin") izin++;
            else if (it.status === "sakit") sakit++;
            else if (it.status === "alfa") alfa++;
          });
          const activeTeacher = schedule.teacherName || (currentLoggedInUser ? currentLoggedInUser.fullName : 'Ustadz Ahmad Fauzi');
          addUstadzActivity({
            teacherName: activeTeacher,
            action: 'Absensi KBM Selesai',
            statusType: 'hadir',
            subject: schedule.subject,
            className: 'Kelas ' + schedule.className,
            summary: `${hadir} Hadir, ${izin} Izin, ${sakit} Sakit, ${alfa} Alpa`,
            teachingList: [
              {
                subject: schedule.subject,
                className: 'Kelas ' + schedule.className,
                time: `${schedule.startTime} - ${schedule.endTime} WIB`,
                periodNumber: schedule.periodNumber || 1
              }
            ]
          });
        }

        if (typeof markScheduleReminderResolved === 'function') {
          markScheduleReminderResolved(currentAttendanceScheduleId, currentAttendanceDate);
        }

        if (typeof renderAttendancePieChart === 'function') {
          renderAttendancePieChart();
        }

        backFromAttendanceForm();
        const isAdmin = currentLoggedInUser && currentLoggedInUser.role === "Admin";
        if (isAdmin) {
          switchScheduleMainTab("attendance");
        } else {
          switchScheduleMainTab("schedule");
          renderScheduleList();
        }
      } catch (err) {
        // Ketentuan 1.6: Jika gagal, tampilkan pesan kesalahan dan jangan menghapus perubahan
        showToast("Gagal menyimpan absensi: " + err.message, "error");
      }
    }
    // Tutup Formulir Absensi
    function backFromAttendanceForm() {
      if (currentAttendanceScheduleId && typeof openScheduleDetail === 'function') {
        openScheduleDetail(currentAttendanceScheduleId);
      } else if (typeof openScheduleListPage === 'function') {
        openScheduleListPage();
      } else {
        document.getElementById('pageAttendanceForm').classList.remove('active');
      }
    }

    // Render Riwayat & Rekap Absensi
    function renderAttendanceHistory() {
      const isAdmin = currentLoggedInUser && currentLoggedInUser.role === "Admin";
      const currentTeacherName = currentLoggedInUser ? currentLoggedInUser.fullName.toLowerCase().trim() : "";

      const teacherWrap = document.getElementById("attFilterTeacherWrapper");
      if (teacherWrap) {
        teacherWrap.style.display = isAdmin ? "block" : "none";
      }

      // 1. Filter hak akses (Logika Aplikasi - Butir 4)
      let records = mockAttendanceRecords.filter(function(r) {
        if (isAdmin) return true;
        const t = (r.teacherName || "").toLowerCase().trim();
        return t === currentTeacherName || t.includes("ahmad fauzi") || (currentLoggedInUser && r.teacherId === currentLoggedInUser.id);
      });

      // 2. Filter input kontrol
      const dateEl = document.getElementById("attFilterDate");
      const classEl = document.getElementById("attFilterClass");
      const subjEl = document.getElementById("attFilterSubject");
      const teacherEl = document.getElementById("attFilterTeacher");
      const searchEl = document.getElementById("attHistorySearchInput");
      const clearSearchBtn = document.getElementById("attHistoryClearSearch");

      const filterDate = dateEl ? dateEl.value : "";
      const filterClass = classEl ? classEl.value : "Semua";
      const filterSubject = subjEl ? subjEl.value : "Semua";
      const filterTeacher = (isAdmin && teacherEl) ? teacherEl.value : "Semua";
      const searchQuery = searchEl ? searchEl.value.toLowerCase().trim() : "";

      if (clearSearchBtn) {
        clearSearchBtn.style.display = searchQuery ? "inline-block" : "none";
      }

      records = records.filter(function(r) {
        if (filterDate && r.date !== filterDate) return false;
        if (filterClass !== "Semua" && r.className !== filterClass) return false;
        if (filterSubject !== "Semua" && r.subject !== filterSubject) return false;
        if (filterTeacher !== "Semua" && r.teacherName !== filterTeacher) return false;
        if (searchQuery) {
          const matchSubj = r.subject.toLowerCase().indexOf(searchQuery) !== -1;
          const matchTeach = r.teacherName.toLowerCase().indexOf(searchQuery) !== -1;
          const matchClass = r.className.toLowerCase().indexOf(searchQuery) !== -1;
          if (!matchSubj && !matchTeach && !matchClass) return false;
        }
        return true;
      });

      // 3. Ringkasan Metrik (Butir 2)
      const totalSessions = records.length;
      let totalStudents = 0, totalHadir = 0, totalIzin = 0, totalSakit = 0, totalAlfa = 0;

      records.forEach(function(r) {
        totalStudents += r.items.length;
        r.items.forEach(function(it) {
          if (it.status === "hadir") totalHadir++;
          else if (it.status === "izin") totalIzin++;
          else if (it.status === "sakit") totalSakit++;
          else if (it.status === "alfa") totalAlfa++;
        });
      });

      const recapSessionsEl = document.getElementById("attRecapSessions");
      const recapStudentsEl = document.getElementById("attRecapStudents");
      const recapH = document.getElementById("attRecapHadir");
      const recapI = document.getElementById("attRecapIzin");
      const recapS = document.getElementById("attRecapSakit");
            const recapA = document.getElementById("attRecapAlfa");

      if (recapSessionsEl) recapSessionsEl.innerText = totalSessions;
      if (recapStudentsEl) recapStudentsEl.innerText = totalStudents;
      if (recapH) recapH.innerText = totalHadir;
      if (recapI) recapI.innerText = totalIzin;
      if (recapS) recapS.innerText = totalSakit;
            if (recapA) recapA.innerText = totalAlfa;

      const countLabel = document.getElementById("attHistoryCountLabel");
      if (countLabel) {
        countLabel.innerText = "Daftar Riwayat Sesi (" + records.length + ")";
      }

      const container = document.getElementById("attHistoryListContainer");
      if (!container) return;

      if (records.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:36px 16px; background:#fff; border-radius:14px; border:1px dashed #CBD5E1;"><div style="font-size:32px; margin-bottom:8px;">📋</div><div style="font-size:14px; font-weight:700; color:var(--text-main);">Belum ada riwayat absensi santri</div><div style="font-size:12px; color:var(--text-muted); margin-top:4px;">Coba sesuaikan pencarian/filter atau isi absensi baru dari tab Jadwal Pelajaran.</div></div>';
        return;
      }

      container.innerHTML = records.map(function(r) {
        let h = 0, i = 0, s = 0, a = 0;
        r.items.forEach(function(it) {
          if (it.status === "hadir") h++;
          else if (it.status === "izin") i++;
          else if (it.status === "sakit") s++;
          else if (it.status === "alfa") a++;
        });

        const deleteBtnHtml = isAdmin ?
          ('<button type="button" class="att-btn-del" onclick="event.stopPropagation(); confirmDeleteAttendance(\''+ r.id + '\')" title="Hapus Riwayat"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg><span>Hapus</span></button>') : "";

        return '<div class="att-history-card" onclick="openAttendanceResultModal(\''+ r.id + '\')" style="cursor:pointer;" title="Buka Detail Riwayat">' +
          '<div class="att-history-top">' +
            '<div class="att-history-subject">' + r.subject + '</div>' +
            '<span class="sch-card-class-badge">Kelas ' + r.className + '</span>' +
          '</div>' +
          '<div class="att-history-meta">' +
            '<span>👤 ' + r.teacherName + '</span>' +
            '<span>•</span>' +
            '<span>📅 ' + formatIndoDate(r.date) + '</span>' +
            '<span>•</span>' +
            '<span>Jam Ke-' + r.periodNumber + ' (' + r.startTime + ' - ' + r.endTime + ')</span>' +
          '</div>' +
          '<div class="att-pills-row" style="display:flex; align-items:center; justify-content:space-between; margin-top:10px;">' +
            '<div style="display:flex; gap:4px; flex-wrap:wrap; align-items:center;">' +
              '<span class="att-pill h">H: ' + h + '</span>' +
              '<span class="att-pill i">I: ' + i + '</span>' +
              '<span class="att-pill s">S: ' + s + '</span>' +
              
              '<span class="att-pill a">A: ' + a + '</span>' +
              '<span style="font-size:11px; color:var(--text-muted); font-weight:600; margin-left:4px;">(' + r.items.length + ' Santri)</span>' +
            '</div>' +
            '<div style="display:flex; align-items:center; gap:6px;">' +
              '<button type="button" class="btn-detail-history" onclick="event.stopPropagation(); openAttendanceResultModal(\''+ r.id + '\')" style="background:#F1F5F9; border:none; padding:4px 10px; border-radius:6px; font-size:11.5px; font-weight:700; cursor:pointer; color:var(--text-main); display:inline-flex; align-items:center; gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg><span>Detail</span></button>' +
              deleteBtnHtml +
            '</div>' +
          '</div>' +
        '</div>';
      }).join("");
    }

    function clearAttendanceSearch() {
      const el = document.getElementById("attHistorySearchInput");
      if (el) el.value = "";
      renderAttendanceHistory();
    }

    function resetAttendanceFilters() {
      const dateEl = document.getElementById("attFilterDate");
      const classEl = document.getElementById("attFilterClass");
      const subjEl = document.getElementById("attFilterSubject");
      const teacherEl = document.getElementById("attFilterTeacher");
      const searchEl = document.getElementById("attHistorySearchInput");

      if (dateEl) dateEl.value = "";
      if (classEl) classEl.value = "Semua";
      if (subjEl) subjEl.value = "Semua";
      if (teacherEl) teacherEl.value = "Semua";
      if (searchEl) searchEl.value = "";

      renderAttendanceHistory();
    }

    let currentViewingResultRecordId = null;

    function openAttendanceResultModal(recordId) {
      currentViewingResultRecordId = recordId;
      const r = mockAttendanceRecords.find(function(item) { return item.id === recordId; });
      if (!r) {
        showToast("Data riwayat absensi tidak ditemukan.", "error");
        return;
      }

      const subjEl = document.getElementById("attResModalSubject");
      const classEl = document.getElementById("attResModalClass");
      const dateValEl = document.getElementById("attResModalDateTimeVal");
      const teacherValEl = document.getElementById("attResModalTeacherVal");
      const countEl = document.getElementById("attResStudentCount");
      const editBtn = document.getElementById("attResModalEditBtn");

      if (subjEl) subjEl.innerText = r.subject;
      if (classEl) classEl.innerText = "Kelas " + r.className;
      if (dateValEl) dateValEl.innerText = formatIndoDate(r.date) + " • Jam Ke-" + r.periodNumber + " (" + r.startTime + " - " + r.endTime + " WIB)";
      if (teacherValEl) teacherValEl.innerText = "Guru: " + r.teacherName;
      if (countEl) countEl.innerText = r.items.length + " Santri";

      const schedule = mockSchedules.find(function(s) { return s.id === r.scheduleId; });
      const canEdit = schedule ? canUserManageAttendance(schedule) : (currentLoggedInUser && currentLoggedInUser.role === "Admin");
      if (editBtn) {
        editBtn.style.display = canEdit ? "flex" : "none";
      }

      let h = 0, i = 0, s = 0, a = 0;
      r.items.forEach(function(it) {
        if (it.status === "hadir") h++;
        else if (it.status === "izin") i++;
        else if (it.status === "sakit") s++;
        else if (it.status === "alfa") a++;
      });

      const hEl = document.getElementById("attResStatHadir");
      const iEl = document.getElementById("attResStatIzin");
      const sEl = document.getElementById("attResStatSakit");
      const aEl = document.getElementById("attResStatAlfa");

      if (hEl) hEl.innerText = h;
      if (iEl) iEl.innerText = i;
      if (sEl) sEl.innerText = s;
      if (aEl) aEl.innerText = a;

      const listContainer = document.getElementById("attResStudentList");
      if (listContainer) {
        if (r.items.length === 0) {
          listContainer.innerHTML = '<div style="text-align:center; padding:24px; color:var(--text-muted);">Tidak ada santri dalam absensi ini.</div>';
        } else {
          listContainer.innerHTML = r.items.map(function(item) {
            const avatarHtml = item.avatar ?
              ('<img src="' + item.avatar + '" style="width:36px; height:36px; border-radius:50%; object-fit:cover;" alt="' + item.studentName + '">') :
              ('<div style="width:36px; height:36px; border-radius:50%; background:#E0F2FE; color:#0284C7; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px;">' + item.studentName.charAt(0) + '</div>');

            let statusText = "Hadir";
            let badgeColor = "#16A34A";
            let badgeBg = "#DCFCE7";
            if (item.status === "izin") { statusText = "Izin"; badgeColor = "#2563EB"; badgeBg = "#DBEAFE"; }
            else if (item.status === "sakit") { statusText = "Sakit"; badgeColor = "#D97706"; badgeBg = "#FEF3C7"; }
            else if (item.status === "alfa") { statusText = "Alfa"; badgeColor = "#DC2626"; badgeBg = "#FEE2E2"; }

            const noteHtml = (item.note && item.note.trim()) ?
              ('<div style="font-size:11.5px; color:#475569; font-style:italic; background:#F8FAFC; padding:4px 8px; border-radius:6px; margin-top:6px; border:1px solid #E2E8F0;">Catatan: ' + item.note + '</div>') : "";

            return '<div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; padding:10px 12px; margin-bottom:8px;">' +
              '<div style="display:flex; align-items:center; justify-content:space-between;">' +
                '<div style="display:flex; align-items:center; gap:10px;">' +
                  avatarHtml +
                  '<div>' +
                    '<div style="font-size:13px; font-weight:700; color:var(--text-main);">' + item.studentName + '</div>' +
                    '<div style="font-size:11px; color:var(--text-muted);">NIS: ' + item.studentNis + ' • ' + item.gender + '</div>' +
                  '</div>' +
                '</div>' +
                '<span style="background:' + badgeBg + '; color:' + badgeColor + '; font-size:11.5px; font-weight:700; padding:3px 8px; border-radius:6px;">' + statusText + '</span>' +
              '</div>' +
              noteHtml +
            '</div>';
          }).join("");
        }
      }

      const modal = document.getElementById("attendanceResultModal");
      if (modal) {
        modal.classList.add("active");
        modal.style.display = "flex";
      }
    }

    function closeAttendanceResultModal() {
      const modal = document.getElementById("attendanceResultModal");
      if (modal) {
        modal.classList.remove("active");
        modal.style.display = "none";
      }
      currentViewingResultRecordId = null;
    }

    function editAttendanceFromResultModal() {
      if (!currentViewingResultRecordId) return;
      const rec = mockAttendanceRecords.find(function(item) { return item.id === currentViewingResultRecordId; });
      if (!rec) return;
      closeAttendanceResultModal();
      openAttendanceForm(rec.scheduleId, rec.date);
    }

    // Konfirmasi Hapus Data Absensi (KHUSUS ADMIN - Butir 2)
    function confirmDeleteAttendance(id) {
      if (!currentLoggedInUser || currentLoggedInUser.role !== 'Admin') {
        showToast('Akses ditolak: Hanya Admin yang dapat menghapus data absensi.', 'error');
        return;
      }
      const rec = mockAttendanceRecords.find(item => item.id === id);
      if (!rec) return;

      const modal = document.getElementById('appModal');
      const title = document.getElementById('modalTitle');
      const body = document.getElementById('modalBody');
      const actionBtn = document.getElementById('modalBtnAction');

      title.innerText = 'Hapus Riwayat Absensi';
      body.innerHTML = `
        <div style="font-size:13.5px; color:var(--text-main); line-height:1.45; margin-bottom:14px;">
          Apakah Anda yakin ingin menghapus data absensi <strong>"${rec.subject}"</strong> kelas <strong>${rec.className}</strong> tanggal <strong>${formatIndoDate(rec.date)}</strong>?
          <div style="color:#DC2626; font-size:12px; margin-top:8px;">Tindakan ini tidak dapat dibatalkan.</div>
        </div>
        <div style="display:flex; gap:10px;">
          <button type="button" class="btn-primary" style="flex:1; background:#FFFFFF; color:var(--text-main); border:1px solid #CBD5E1;" onclick="closeModal()">Batal</button>
          <button type="button" class="btn-primary" style="flex:1; background:#DC2626;" onclick="executeDeleteAttendance('${rec.id}')">Hapus</button>
        </div>
      `;

      if (actionBtn) actionBtn.style.display = 'none';
      modal.classList.add('active');
      modal.style.display = 'flex';
    }

    function executeDeleteAttendance(id) {
      const idx = mockAttendanceRecords.findIndex(r => r.id === id);
      closeModal();
      if (idx !== -1) {
        const deleted = mockAttendanceRecords.splice(idx, 1)[0];
        showToast('Riwayat absensi "' + deleted.subject + '" (' + deleted.className + ') berhasil dihapus.', 'success');
        renderAttendanceHistory();
        if (typeof renderAttendancePieChart === 'function') {
          renderAttendancePieChart();
        }
      }
    }
