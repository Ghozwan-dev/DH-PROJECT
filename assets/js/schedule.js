    // ========================================================
    // MODUL MANAJEMEN JADWAL PELAJARAN - STATE & LOGIC
    // ========================================================
    
    // State & Mock Data Absensi Santri per Mata Pelajaran (Selaras dengan mockStudents)
    let mockAttendanceRecords = [
      {
        id: 'ATT-001',
        scheduleId: 'sch_001',
        date: '2026-11-15',
        className: 'VII A',
        subject: 'Fiqih',
        teacherName: 'Ustadz Ahmad Fauzi',
        teacherId: 'guru_001',
        periodNumber: 1,
        startTime: '07:30',
        endTime: '08:15',
        recordedBy: 'Ustadz Ahmad Fauzi',
        items: [
          { studentId: 'SNT-001', studentNis: '2024001', studentName: 'Ahmad Fauzi', status: 'hadir', note: '' },
          { studentId: 'SNT-004', studentNis: '2024004', studentName: 'Fatimah Zahra', status: 'hadir', note: '' },
          { studentId: 'SNT-011', studentNis: '2024011', studentName: 'Umar Al-Faruq', status: 'hadir', note: '' }
        ]
      },
      {
        id: 'ATT-002',
        scheduleId: 'sch_003a',
        date: '2026-11-15',
        className: 'VII B',
        subject: 'Al-Qur\'an Hadits',
        teacherName: 'Ustadz Mansyur Hidayat',
        teacherId: 'guru_003',
        periodNumber: 1,
        startTime: '07:30',
        endTime: '08:15',
        recordedBy: 'Ustadz Mansyur Hidayat',
        items: [
          { studentId: 'SNT-003', studentNis: '2024003', studentName: 'Muhammad Rizky', status: 'hadir', note: '' },
          { studentId: 'SNT-010', studentNis: '2024010', studentName: 'Khadijah Al-Kubro', status: 'sakit', note: 'Demam' }
        ]
      },
      {
        id: 'ATT-003',
        scheduleId: 'sch_005',
        date: '2026-11-14',
        className: 'VIII A',
        subject: 'Fiqih',
        teacherName: 'Ustadz Ahmad Fauzi',
        teacherId: 'guru_001',
        periodNumber: 2,
        startTime: '08:15',
        endTime: '09:00',
        recordedBy: 'Ustadz Ahmad Fauzi',
        items: [
          { studentId: 'SNT-006', studentNis: '2024006', studentName: 'Nabila Nur Azizah', status: 'izin', note: 'Izin urusan keluarga' }
        ]
      },
      {
        id: 'ATT-004',
        scheduleId: 'sch_009',
        date: '2026-11-14',
        className: 'VIII B',
        subject: 'Fiqih',
        teacherName: 'Ustadz Ahmad Fauzi',
        teacherId: 'guru_001',
        periodNumber: 2,
        startTime: '08:15',
        endTime: '09:00',
        recordedBy: 'Ustadz Ahmad Fauzi',
        items: [
          { studentId: 'SNT-002', studentNis: '2024002', studentName: 'Siti Aisyah', status: 'hadir', note: '' },
          { studentId: 'SNT-007', studentNis: '2024007', studentName: 'Bilal Habibi', status: 'hadir', note: '' }
        ]
      },
      {
        id: 'ATT-005',
        scheduleId: 'sch_006',
        date: '2026-11-14',
        className: 'IX A',
        subject: 'Matematika',
        teacherName: 'Ustadzah Nurul Azizah',
        teacherId: 'guru_005',
        periodNumber: 1,
        startTime: '07:30',
        endTime: '08:15',
        recordedBy: 'Ustadzah Nurul Azizah',
        items: [
          { studentId: 'SNT-005', studentNis: '2024005', studentName: 'Zaidan Al-Farisi', status: 'hadir', note: '' }
        ]
      },
      {
        id: 'ATT-006',
        scheduleId: 'sch_010',
        date: '2026-11-14',
        className: 'IX B',
        subject: 'Tahfidz Al-Qur\'an',
        teacherName: 'Ustadz Abdullah Said',
        teacherId: 'guru_006',
        periodNumber: 1,
        startTime: '07:30',
        endTime: '08:15',
        recordedBy: 'Ustadz Abdullah Said',
        items: [
          { studentId: 'SNT-008', studentNis: '2024008', studentName: 'Maryam Salsabila', status: 'alfa', note: 'Tanpa keterangan' }
        ]
      },
      {
        id: 'ATT-007',
        scheduleId: 'sch_021',
        date: '2026-11-14',
        className: 'X A',
        subject: 'Fiqih',
        teacherName: 'Ustadz Ahmad Fauzi',
        teacherId: 'guru_001',
        periodNumber: 1,
        startTime: '07:30',
        endTime: '08:15',
        recordedBy: 'Ustadz Ahmad Fauzi',
        items: [
          { studentId: 'SNT-013', studentNis: '2024013', studentName: 'Fadhil Mubarak', status: 'hadir', note: '' }
        ]
      },
      {
        id: 'ATT-008',
        scheduleId: 'sch_022',
        date: '2026-11-14',
        className: 'X B',
        subject: 'Bahasa Arab',
        teacherName: 'Ustadzah Halimah',
        teacherId: 'guru_002',
        periodNumber: 1,
        startTime: '07:30',
        endTime: '08:15',
        recordedBy: 'Ustadzah Halimah',
        items: [
          { studentId: 'SNT-014', studentNis: '2024014', studentName: 'Zahra An-Nisa', status: 'hadir', note: '' }
        ]
      },
      {
        id: 'ATT-009',
        scheduleId: 'sch_023',
        date: '2026-11-14',
        className: 'XI A',
        subject: 'Al-Qur\'an Hadits',
        teacherName: 'Ustadz Mansyur Hidayat',
        teacherId: 'guru_003',
        periodNumber: 1,
        startTime: '07:30',
        endTime: '08:15',
        recordedBy: 'Ustadz Mansyur Hidayat',
        items: [
          { studentId: 'SNT-015', studentNis: '2024015', studentName: 'Rayhan Pratama', status: 'hadir', note: '' }
        ]
      },
      {
        id: 'ATT-010',
        scheduleId: 'sch_024',
        date: '2026-11-14',
        className: 'XI B',
        subject: 'Bahasa Arab',
        teacherName: 'Ustadzah Halimah',
        teacherId: 'guru_002',
        periodNumber: 1,
        startTime: '07:30',
        endTime: '08:15',
        recordedBy: 'Ustadzah Halimah',
        items: [
          { studentId: 'SNT-016', studentNis: '2024016', studentName: 'Afiqah Salma', status: 'izin', note: 'Izin kegiatan pondok' }
        ]
      },
      {
        id: 'ATT-011',
        scheduleId: 'sch_025',
        date: '2026-11-14',
        className: 'XII A',
        subject: 'Fiqih',
        teacherName: 'Ustadz Ahmad Fauzi',
        teacherId: 'guru_001',
        periodNumber: 1,
        startTime: '07:30',
        endTime: '08:15',
        recordedBy: 'Ustadz Ahmad Fauzi',
        items: [
          { studentId: 'SNT-017', studentNis: '2024017', studentName: 'Lukman Al-Hakim', status: 'hadir', note: '' }
        ]
      },
      {
        id: 'ATT-012',
        scheduleId: 'sch_026',
        date: '2026-11-14',
        className: 'XII B',
        subject: 'Fiqih',
        teacherName: 'Ustadz Ahmad Fauzi',
        teacherId: 'guru_001',
        periodNumber: 1,
        startTime: '07:30',
        endTime: '08:15',
        recordedBy: 'Ustadz Ahmad Fauzi',
        items: [
          { studentId: 'SNT-018', studentNis: '2024018', studentName: 'Syifa Maulida', status: 'hadir', note: '' }
        ]
      }
    ];

    let currentAttendanceMainTab = 'schedule'; // 'schedule' atau 'attendance'
    let currentAttendanceScheduleId = null;
    let currentAttendanceDate = '';
    let currentAttendanceItems = [];

    let mockSchedules = [
      // SENIN
      { id: 'sch_001', day: 'Senin', className: 'VII A', subject: 'Fiqih', teacherName: 'Ustadz Ahmad Fauzi', teacherId: 'guru_001', periodNumber: 1, startTime: '07:30', endTime: '08:15', room: 'Ruang Kelas VII A', notes: 'Membawa kitab Fathul Qorib' },
      { id: 'sch_002a', day: 'Senin', className: 'VIII B', subject: 'Bahasa Arab', teacherName: 'Ustadzah Halimah', teacherId: 'guru_002', periodNumber: 1, startTime: '07:30', endTime: '08:15', room: 'Ruang Kelas VIII B', notes: 'Kosakata harian Bab 1' },
      { id: 'sch_002b', day: 'Senin', className: 'VII A', subject: 'Bahasa Arab', teacherName: 'Ustadzah Halimah', teacherId: 'guru_002', periodNumber: 2, startTime: '08:15', endTime: '09:00', room: 'Ruang Kelas VII A', notes: 'Latihan Muhadatsah' },
      { id: 'sch_003a', day: 'Senin', className: 'VII B', subject: 'Al-Qur\'an Hadits', teacherName: 'Ustadz Mansyur Hidayat', teacherId: 'guru_003', periodNumber: 1, startTime: '07:30', endTime: '08:15', room: 'Ruang Kelas VII B', notes: 'Hafalan Surat Al-Hujurat' },
      { id: 'sch_003b', day: 'Senin', className: 'VII A', subject: 'Akidah Akhlak', teacherName: 'Ustadz Mansyur Hidayat', teacherId: 'guru_003', periodNumber: 2, startTime: '08:15', endTime: '09:00', room: 'Ruang Kelas VII A', notes: 'Kajian Asmaul Husna' },
      { id: 'sch_004', day: 'Senin', className: 'VIII A', subject: 'Nahwu Shorof', teacherName: 'Ustadz Zulkifli', teacherId: 'guru_004', periodNumber: 1, startTime: '07:30', endTime: '08:15', room: 'Ruang Kelas VIII A', notes: 'Bab I\'rab' },
      { id: 'sch_005', day: 'Senin', className: 'VIII A', subject: 'Fiqih', teacherName: 'Ustadz Ahmad Fauzi', teacherId: 'guru_001', periodNumber: 2, startTime: '08:15', endTime: '09:00', room: 'Ruang Kelas VIII A', notes: 'Bab Zakat' },
      { id: 'sch_006', day: 'Senin', className: 'IX A', subject: 'Matematika', teacherName: 'Ustadzah Nurul Azizah', teacherId: 'guru_005', periodNumber: 1, startTime: '07:30', endTime: '08:15', room: 'Ruang Kelas IX A', notes: 'Persiapan Ujian Tengah Semester' },

      // SELASA
      { id: 'sch_007', day: 'Selasa', className: 'VII A', subject: 'Akidah Akhlak', teacherName: 'Ustadz Mansyur Hidayat', teacherId: 'guru_003', periodNumber: 1, startTime: '07:30', endTime: '08:15', room: 'Ruang Kelas VII A', notes: 'Kajian Asmaul Husna' },
      { id: 'sch_008', day: 'Selasa', className: 'VII B', subject: 'Bahasa Arab', teacherName: 'Ustadzah Halimah', teacherId: 'guru_002', periodNumber: 1, startTime: '07:30', endTime: '08:15', room: 'Ruang Kelas VII B', notes: 'Latihan Muhadatsah' },
      { id: 'sch_009', day: 'Selasa', className: 'VIII B', subject: 'Fiqih', teacherName: 'Ustadz Ahmad Fauzi', teacherId: 'guru_001', periodNumber: 2, startTime: '08:15', endTime: '09:00', room: 'Ruang Kelas VIII B', notes: 'Kajian Bab Muamalah' },
      { id: 'sch_010', day: 'Selasa', className: 'IX B', subject: 'Tahfidz Al-Qur\'an', teacherName: 'Ustadz Abdullah Said', teacherId: 'guru_006', periodNumber: 1, startTime: '07:30', endTime: '08:15', room: 'Ruang Kelas IX B', notes: 'Setoran Juz 29' },

      // RABU
      { id: 'sch_011', day: 'Rabu', className: 'VII A', subject: 'Sejarah Kebudayaan Islam (SKI)', teacherName: 'Ustadz Lukman Hakim', teacherId: 'guru_007', periodNumber: 1, startTime: '07:30', endTime: '08:15', room: 'Ruang Kelas VII A', notes: 'Khulafaur Rasyidin' },
      { id: 'sch_012', day: 'Rabu', className: 'VII B', subject: 'Fiqih', teacherName: 'Ustadz Ahmad Fauzi', teacherId: 'guru_001', periodNumber: 1, startTime: '07:30', endTime: '08:15', room: 'Ruang Kelas VII B', notes: 'Ketentuan Shalat Jama\' dan Qashar' },
      { id: 'sch_013', day: 'Rabu', className: 'VIII A', subject: 'Bahasa Inggris', teacherName: 'Ustadzah Nurul Azizah', teacherId: 'guru_005', periodNumber: 2, startTime: '08:15', endTime: '09:00', room: 'Ruang Kelas VIII A', notes: 'Reading Comprehension' },
      { id: 'sch_014', day: 'Rabu', className: 'IX A', subject: 'Nahwu Shorof', teacherName: 'Ustadz Zulkifli', teacherId: 'guru_004', periodNumber: 1, startTime: '07:30', endTime: '08:15', room: 'Ruang Kelas IX A', notes: 'Alfiyah Ibnu Malik' },

      // KAMIS
      { id: 'sch_015', day: 'Kamis', className: 'VII A', subject: 'Tahfidz Al-Qur\'an', teacherName: 'Ustadz Abdullah Said', teacherId: 'guru_006', periodNumber: 1, startTime: '07:30', endTime: '08:15', room: 'Ruang Kelas VII A', notes: 'Setoran Juz 30' },
      { id: 'sch_016', day: 'Kamis', className: 'VIII B', subject: 'IPA Terpadu', teacherName: 'Ustadzah Nurul Azizah', teacherId: 'guru_005', periodNumber: 2, startTime: '08:15', endTime: '09:00', room: 'Laboratorium IPA', notes: 'Praktikum Mikroskop' },
      { id: 'sch_017', day: 'Kamis', className: 'IX B', subject: 'Fiqih', teacherName: 'Ustadz Ahmad Fauzi', teacherId: 'guru_001', periodNumber: 1, startTime: '07:30', endTime: '08:15', room: 'Ruang Kelas IX B', notes: 'Bab Mawaris Dasar' },

      // JUMAT
      { id: 'sch_018', day: 'Jumat', className: 'VII B', subject: 'Akidah Akhlak', teacherName: 'Ustadz Mansyur Hidayat', teacherId: 'guru_003', periodNumber: 1, startTime: '07:30', endTime: '08:15', room: 'Ruang Kelas VII B', notes: 'Adab kepada Orang Tua dan Guru' },
      { id: 'sch_019', day: 'Jumat', className: 'VIII A', subject: 'Al-Qur\'an Hadits', teacherName: 'Ustadz Ahmad Fauzi', teacherId: 'guru_001', periodNumber: 1, startTime: '07:30', endTime: '08:15', room: 'Ruang Kelas VIII A', notes: 'Hadits Menuntut Ilmu' },

      // SABTU
      { id: 'sch_020', day: 'Sabtu', className: 'IX A', subject: 'Bahasa Indonesia', teacherName: 'Ustadzah Halimah', teacherId: 'guru_002', periodNumber: 1, startTime: '07:30', endTime: '08:15', room: 'Ruang Kelas IX A', notes: 'Menulis Teks Pidato Islami' }
    ];

    let selectedScheduleDay = 'Semua';
    let selectedScheduleClass = 'Semua';
    let scheduleSearchQuery = '';
    let currentDetailScheduleId = null;
    let isEditingScheduleMode = false;

    const scheduleDayList = ['Semua', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad'];
    const scheduleClassList = ['Semua', 'VII A', 'VII B', 'VIII A', 'VIII B', 'IX A', 'IX B', 'X A', 'X B', 'XI A', 'XI B', 'XII A', 'XII B'];

    // Helper: Konversi waktu 'HH:mm' ke menit integer untuk deteksi bentrok
    function parseTimeToMin(timeStr) {
      if (!timeStr || !timeStr.includes(':')) return 0;
      const parts = timeStr.trim().split(':');
      const h = parseInt(parts[0], 10) || 0;
      const m = parseInt(parts[1], 10) || 0;
      return h * 60 + m;
    }

    // Helper: Cek apakah 2 rentang waktu tumpang tindih
    function isTimeOverlap(s1, e1, s2, e2) {
      return parseTimeToMin(s1) < parseTimeToMin(e2) && parseTimeToMin(e1) > parseTimeToMin(s2);
    }

    // Buka Halaman Manajemen Jadwal
    function openScheduleListPage() {
      if (!currentLoggedInUser) {
        currentLoggedInUser = mockUsers[1];
      }

      if (typeof showOnlyScreenPage === 'function') {
        showOnlyScreenPage('pageScheduleList');
      } else {
        document.querySelectorAll('.screen-page').forEach(function(p) {
          if (p.id === 'pageScheduleList') p.classList.add('active');
          else p.classList.remove('active');
        });
      }

      if (typeof syncActiveNav === 'function') syncActiveNav('schedule');
      const schSec = document.getElementById('schTabScheduleSection');
      if (schSec) schSec.style.display = 'block';
      const pageTitle = document.querySelector('#pageScheduleList .sub-app-bar-title');
      if (pageTitle) pageTitle.innerText = 'Absensi Santri';
      renderScheduleList();

      const isAdmin = currentLoggedInUser && currentLoggedInUser.role === 'Admin';
      const topAddBtn = document.getElementById('schTopAddBtn');
      const headerBanner = document.getElementById('schHeaderBanner');
      const roleBadge = document.getElementById('schRoleBadge');
      const roleDesc = document.getElementById('schRoleDesc');
      const bannerTitle = document.getElementById('schBannerTitle');
      const headerIcon = document.getElementById('schHeaderIcon');

      if (isAdmin) {
        if (topAddBtn) topAddBtn.style.display = 'inline-flex';
        // Sesuai instruksi pengguna: Bagian admin dihapus (banner tidak dimunculkan)
        if (headerBanner) headerBanner.style.display = 'none';
      } else {
        if (topAddBtn) topAddBtn.style.display = 'none';
        if (headerBanner) {
          headerBanner.style.display = 'flex';
          const teacherName = currentLoggedInUser ? currentLoggedInUser.fullName : 'Ustadz Ahmad Fauzi';
          if (bannerTitle) bannerTitle.innerText = teacherName;
          if (roleBadge) {
            roleBadge.style.display = 'none';
          }
          if (roleDesc) roleDesc.innerText = 'Jadwal pelajaran & pengisian absensi santri yang ditugaskan kepada Anda.';
          if (headerIcon) {
            headerIcon.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
          }
        }
      }

      renderScheduleChips();
      renderScheduleList();
    }

    // Kembali dari Halaman Jadwal ke Home
    function backFromScheduleList() {
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

    function syncScheduleChipPill(container, pillId, immediate) {
      if (!container) return;
      const pill = document.getElementById(pillId);
      const activeChip = container.querySelector('.sch-chip.active');
      if (!pill || !activeChip) return;

      const applyPosition = () => {
        let w = 0;
        let h = 0;
        let left = 0;
        let top = 0;

        if (typeof activeChip.getBoundingClientRect === 'function' && typeof container.getBoundingClientRect === 'function') {
          const chipRect = activeChip.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          if (chipRect.width > 0 && chipRect.height > 0) {
            w = chipRect.width;
            h = chipRect.height;
            left = (chipRect.left - containerRect.left) - (container.clientLeft || 0) + (container.scrollLeft || 0);
            top = (chipRect.top - containerRect.top) - (container.clientTop || 0) + (container.scrollTop || 0);
          }
        }

        if (w <= 0 || h <= 0) {
          w = activeChip.offsetWidth || 0;
          h = activeChip.offsetHeight || 0;
          left = activeChip.offsetLeft || 0;
          top = activeChip.offsetTop || 0;
        }

        if (w <= 0 || h <= 0) return false;

        const shouldSnap = immediate || pill.style.opacity !== '1';

        if (shouldSnap) {
          pill.style.transition = 'none';
        }
        pill.style.width = w + 'px';
        pill.style.height = h + 'px';
        pill.style.transform = `translate3d(${left}px, ${top}px, 0)`;
        pill.style.opacity = '1';

        if (shouldSnap) {
          void pill.offsetWidth;
          pill.style.transition = '';
        }

        // Scroll container smoothly if active chip sits outside visible horizontal bounds
        if (typeof container.scrollTo === 'function' && container.clientWidth > 0) {
          const viewLeft = container.scrollLeft;
          const viewRight = viewLeft + container.clientWidth;
          if (left < viewLeft + 12) {
            container.scrollTo({ left: Math.max(0, left - 16), behavior: shouldSnap ? 'auto' : 'smooth' });
          } else if (left + w > viewRight - 12) {
            container.scrollTo({ left: Math.max(0, left + w - container.clientWidth + 16), behavior: shouldSnap ? 'auto' : 'smooth' });
          }
        }
        return true;
      };

      if (!applyPosition() && typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(applyPosition);
      }
    }

    function renderScheduleChipGroup(containerId, pillId, items, activeValue, onClickFnName) {
      const container = document.getElementById(containerId);
      if (!container) return;

      const itemsSignature = items.join('|');
      const existingPill = document.getElementById(pillId);
      const needsInit = !existingPill || container.dataset.renderedItems !== itemsSignature;

      if (needsInit) {
        container.classList.add('has-sliding-pill');
        container.dataset.renderedItems = itemsSignature;
        container.innerHTML =
          `<span class="sch-chip-sliding-pill" id="${pillId}" aria-hidden="true"></span>` +
          items.map(val => {
            const activeClass = val === activeValue ? ' active' : '';
            const safeVal = String(val).replace(/'/g, "\\'");
            return `<div class="sch-chip${activeClass}" role="button" tabindex="0" data-value="${val}" onclick="${onClickFnName}('${safeVal}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();${onClickFnName}('${safeVal}');}"><span class="sch-chip-text">${val}</span></div>`;
          }).join('');
      } else {
        container.classList.add('has-sliding-pill');
        container.querySelectorAll('.sch-chip').forEach(chip => {
          chip.classList.toggle('active', chip.getAttribute('data-value') === activeValue);
        });
      }

      syncScheduleChipPill(container, pillId, needsInit);
    }

    // Render Filter Chips
    function renderScheduleChips() {
      renderScheduleChipGroup('schDayChipsContainer', 'schDaySlidingPill', scheduleDayList, selectedScheduleDay, 'setScheduleDayFilter');
      renderScheduleChipGroup('schClassChipsContainer', 'schClassSlidingPill', scheduleClassList, selectedScheduleClass, 'setScheduleClassFilter');
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        const dayContainer = document.getElementById('schDayChipsContainer');
        const classContainer = document.getElementById('schClassChipsContainer');
        if (dayContainer) syncScheduleChipPill(dayContainer, 'schDaySlidingPill', true);
        if (classContainer) syncScheduleChipPill(classContainer, 'schClassSlidingPill', true);
      });
    }

    function setScheduleDayFilter(day) {
      selectedScheduleDay = day;
      renderScheduleChips();
      renderScheduleList();
    }

    function setScheduleClassFilter(cls) {
      selectedScheduleClass = cls;
      renderScheduleChips();
      renderScheduleList();
    }

    function handleScheduleSearchInput() {
      const input = document.getElementById('schSearchInput');
      const clearBtn = document.getElementById('schClearSearch');
      scheduleSearchQuery = input.value.trim().toLowerCase();
      if (clearBtn) clearBtn.style.display = input.value ? 'inline' : 'none';
      renderScheduleList();
    }

    function clearScheduleSearch() {
      const input = document.getElementById('schSearchInput');
      const clearBtn = document.getElementById('schClearSearch');
      if (input) input.value = '';
      scheduleSearchQuery = '';
      if (clearBtn) clearBtn.style.display = 'none';
      renderScheduleList();
    }

    function resetScheduleFilters() {
      selectedScheduleDay = 'Semua';
      selectedScheduleClass = 'Semua';
      scheduleSearchQuery = '';
      const input = document.getElementById('schSearchInput');
      if (input) input.value = '';
      const clearBtn = document.getElementById('schClearSearch');
      if (clearBtn) clearBtn.style.display = 'none';
      renderScheduleChips();
      renderScheduleList();
    }

    // Render Daftar Jadwal
    function renderScheduleList() {
      const isAdmin = currentLoggedInUser && currentLoggedInUser.role === 'Admin';
      const currentTeacherName = currentLoggedInUser ? currentLoggedInUser.fullName.toLowerCase() : '';

      // Pastikan tombol Tambah selalu tampil di pojok kanan HANYA untuk Admin
      const topAddBtn = document.getElementById('schTopAddBtn');
      if (topAddBtn) {
        topAddBtn.style.display = isAdmin ? 'inline-flex' : 'none';
      }

      // 1. Filter dasar berdasarkan role (Guru hanya jadwal miliknya - Butir E)
      const baseSchedules = mockSchedules.filter(s => {
        if (isAdmin) return true;
        const t = s.teacherName.toLowerCase();
        return t === currentTeacherName || t.includes('ahmad fauzi') || (currentLoggedInUser && s.teacherId === currentLoggedInUser.id);
      });

      // 2. Ringkasan Statistik
      const totalSchedules = baseSchedules.length;
      const uniqueClasses = new Set(baseSchedules.map(s => s.className)).size;
      const uniqueTeachers = new Set(baseSchedules.map(s => s.teacherName)).size;

      const totalEl = document.getElementById('schStatTotal');
      const classEl = document.getElementById('schStatClass');
      const teacherEl = document.getElementById('schStatTeacher');
      if (totalEl) totalEl.innerText = totalSchedules;
      if (classEl) classEl.innerText = uniqueClasses;
      if (teacherEl) teacherEl.innerText = uniqueTeachers;

      // 3. Filter berdasarkan input pencarian, hari, dan kelas
      const filtered = baseSchedules.filter(s => {
        if (selectedScheduleDay !== 'Semua' && s.day !== selectedScheduleDay) return false;
        if (selectedScheduleClass !== 'Semua' && s.className !== selectedScheduleClass) return false;
        if (scheduleSearchQuery) {
          const matchSubj = s.subject.toLowerCase().includes(scheduleSearchQuery);
          const matchTeach = s.teacherName.toLowerCase().includes(scheduleSearchQuery);
          const matchClass = s.className.toLowerCase().includes(scheduleSearchQuery);
          if (!matchSubj && !matchTeach && !matchClass) return false;
        }
        return true;
      });

      // 4. Counter hasil
      const resCountEl = document.getElementById('schResultCount');
      if (resCountEl) {
        resCountEl.innerText = 'Daftar Jadwal (' + filtered.length + ')';
      }

      // 5. Render ke container
      const container = document.getElementById('schListContainer');
      if (!container) return;

      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding:36px 16px; background:#fff; border-radius:14px; border:1px dashed #CBD5E1;">
            <div style="font-size:32px; margin-bottom:8px;">📅</div>
            <div style="font-size:14px; font-weight:700; color:var(--text-main);">Tidak ada jadwal ditemukan</div>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(s => {
        const adminActions = isAdmin ? `
          <div class="sch-action-btns" onclick="event.stopPropagation()">
            <button class="sch-btn-icon edit" onclick="openEditScheduleForm('${s.id}')" title="Edit Jadwal">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="sch-btn-icon delete" onclick="confirmDeleteSchedule('${s.id}')" title="Hapus Jadwal">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        ` : `
          <div style="color:#94A3B8;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        `;

        return `
          <div class="sch-card" onclick="openScheduleDetail('${s.id}')" style="cursor:pointer;" title="Klik untuk melihat Detail Jadwal">
            <div class="sch-card-top">
              <div class="sch-card-subject">${s.subject}</div>
              <span class="sch-card-class-badge">Kelas ${s.className}</span>
            </div>
            <div class="sch-card-meta">
              <span style="font-weight:700; color:var(--text-main);">${s.day}</span>
              <span>•</span>
              <span style="background:#F1F5F9; color:#475569; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:600;">Jam Ke-${s.periodNumber}</span>
              <span>•</span>
              <span style="display:inline-flex; align-items:center; gap:3px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                ${s.teacherName}
              </span>
            </div>
            <div class="sch-card-divider"></div>
            <div class="sch-card-bottom">
              <span class="sch-time-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${s.startTime} - ${s.endTime} WIB
              </span>
              <div style="display:flex; align-items:center; gap:6px;">
                ${adminActions}
              </div>
            </div>
            <button type="button" class="sch-btn-attendance" onclick="event.stopPropagation(); openAttendanceForm('${s.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              <span>Isi Absensi Santri (Kelas ${s.className})</span>
            </button>
          </div>
        `;
      }).join('');
    }

    let currentScheduleReturnPage = 'pageScheduleList';

    // Buka Halaman Detail Jadwal (Mendukung pintasan kembali ke pageHome jika dibuka dari Beranda)
    function openScheduleDetail(id, returnPage) {
      currentScheduleReturnPage = returnPage || 'pageScheduleList';
      currentDetailScheduleId = id;
      const s = mockSchedules.find(item => item.id === id);
      if (!s) return;

      const isAdmin = currentLoggedInUser && currentLoggedInUser.role === 'Admin';

      document.getElementById('schDetSubject').innerText = s.subject;
      document.getElementById('schDetClassBadge').innerText = 'Kelas ' + s.className;
      document.getElementById('schDetDayBadge').innerText = s.day;
      document.getElementById('schDetTeacher').innerText = s.teacherName;

      document.getElementById('schDetDayVal').innerText = s.day;
      document.getElementById('schDetPeriodVal').innerText = 'Jam Ke-' + s.periodNumber;
      document.getElementById('schDetStartVal').innerText = s.startTime + ' WIB';
      document.getElementById('schDetEndVal').innerText = s.endTime + ' WIB';

      const dur = parseTimeToMin(s.endTime) - parseTimeToMin(s.startTime);
      document.getElementById('schDetDurationVal').innerText = (dur > 0 ? dur : 0) + ' Menit';

      document.getElementById('schDetTeacherVal').innerText = s.teacherName;
      document.getElementById('schDetClassVal').innerText = 'Kelas ' + s.className;
      document.getElementById('schDetRoomVal').innerText = s.room || ('Ruang Kelas ' + s.className);

      const notesRow = document.getElementById('schDetNotesRow');
      const notesVal = document.getElementById('schDetNotesVal');
      if (s.notes) {
        if (notesRow) notesRow.style.display = 'flex';
        if (notesVal) notesVal.innerText = s.notes;
      } else {
        if (notesRow) notesRow.style.display = 'none';
      }

      // Hak akses Admin vs Guru di halaman detail
      const topActions = document.getElementById('schDetailTopActions');
      const bottomActions = document.getElementById('schDetBottomActions');
      if (topActions) topActions.style.display = isAdmin ? 'flex' : 'none';
      if (bottomActions) bottomActions.style.display = isAdmin ? 'block' : 'none';

      if (typeof showOnlyScreenPage === 'function') {
        showOnlyScreenPage('pageScheduleDetail');
      } else {
        document.getElementById('pageScheduleDetail').classList.add('active');
        document.getElementById('pageScheduleDetail').scrollTop = 0;
      }
    }

    function backFromScheduleDetail() {
      if (currentScheduleReturnPage === 'pageHome' && typeof navigateToHome === 'function') {
        navigateToHome(currentLoggedInUser);
      } else {
        openScheduleListPage();
      }
    }

    function editScheduleFromDetail() {
      if (currentDetailScheduleId) {
        openEditScheduleForm(currentDetailScheduleId);
      }
    }

    function deleteScheduleFromDetail() {
      if (currentDetailScheduleId) {
        confirmDeleteSchedule(currentDetailScheduleId, () => {
          backFromScheduleDetail();
        });
      }
    }

    // Buka Formulir Tambah Jadwal (KHUSUS ADMIN)
    function openAddScheduleForm() {
      const isAdmin = currentLoggedInUser && currentLoggedInUser.role === 'Admin';
      if (!isAdmin) {
        showToast('Akses ditolak: Hanya Administrator yang berwenang menambah jadwal pelajaran.', 'error');
        return;
      }
      isEditingScheduleMode = false;
      document.getElementById('schFormPageTitle').innerText = 'Tambah Jadwal Pelajaran';
      document.getElementById('schBtnSubmit').innerHTML = '<span>Tambah Jadwal</span>';
      document.getElementById('schConflictNotice').style.display = 'none';

      document.getElementById('schFormDay').value = 'Senin';
      document.getElementById('schFormClass').value = 'VII A';
      document.getElementById('schFormPeriod').value = '1';
      document.getElementById('schFormSubject').value = 'Fiqih';
      document.getElementById('schFormTeacher').value = 'Ustadz Ahmad Fauzi';
      document.getElementById('schFormStartTime').value = '07:30';
      document.getElementById('schFormEndTime').value = '08:15';
      document.getElementById('schFormRoom').value = 'Ruang Kelas VII A';
      document.getElementById('schFormNotes').value = '';

      if (typeof showOnlyScreenPage === 'function') {
        showOnlyScreenPage('pageScheduleForm');
      } else {
        document.getElementById('pageScheduleForm').classList.add('active');
        document.getElementById('pageScheduleForm').scrollTop = 0;
      }
    }

    // Buka Formulir Edit Jadwal (KHUSUS ADMIN - Guru Dilarang Edit)
    function openEditScheduleForm(id) {
      const isAdmin = currentLoggedInUser && currentLoggedInUser.role === 'Admin';
      if (!isAdmin) {
        showToast('Akses ditolak: Hanya Administrator yang berwenang mengedit jadwal pelajaran.', 'error');
        return;
      }
      isEditingScheduleMode = true;
      currentDetailScheduleId = id;
      const s = mockSchedules.find(item => item.id === id);
      if (!s) return;

      document.getElementById('schFormPageTitle').innerText = 'Edit Jadwal Pelajaran';
      document.getElementById('schBtnSubmit').innerHTML = '<span>Simpan Perubahan</span>';
      document.getElementById('schConflictNotice').style.display = 'none';

      document.getElementById('schFormDay').value = s.day;
      document.getElementById('schFormClass').value = s.className;
      document.getElementById('schFormPeriod').value = s.periodNumber.toString();
      document.getElementById('schFormSubject').value = s.subject;
      document.getElementById('schFormTeacher').value = s.teacherName;
      document.getElementById('schFormStartTime').value = s.startTime;
      document.getElementById('schFormEndTime').value = s.endTime;
      document.getElementById('schFormRoom').value = s.room || ('Ruang Kelas ' + s.className);
      document.getElementById('schFormNotes').value = s.notes || '';

      if (typeof showOnlyScreenPage === 'function') {
        showOnlyScreenPage('pageScheduleForm');
      } else {
        document.getElementById('pageScheduleForm').classList.add('active');
        document.getElementById('pageScheduleForm').scrollTop = 0;
      }
    }

    function backFromScheduleForm() {
      openScheduleListPage();
    }

    function handleFormClassChange() {
      const cls = document.getElementById('schFormClass').value;
      const roomInput = document.getElementById('schFormRoom');
      if (roomInput && (roomInput.value.startsWith('Ruang Kelas ') || !roomInput.value)) {
        roomInput.value = 'Ruang Kelas ' + cls;
      }
    }

    // Submit Form Tambah & Edit Jadwal (Dengan Validasi Bentrok Lengkap - Sesuai Butir D & Aturan Penugasan Guru)
    function handleScheduleFormSubmit(e) {
      e.preventDefault();
      const isAdmin = currentLoggedInUser && currentLoggedInUser.role === 'Admin';
      if (!isAdmin) {
        showToast('Akses ditolak: Hanya Administrator yang berwenang mengubah jadwal pelajaran.', 'error');
        backFromScheduleForm();
        return;
      }
      const conflictBox = document.getElementById('schConflictNotice');
      const conflictMsg = document.getElementById('schConflictMsg');
      conflictBox.style.display = 'none';

      const day = document.getElementById('schFormDay').value;
      const className = document.getElementById('schFormClass').value;
      const periodNumber = parseInt(document.getElementById('schFormPeriod').value, 10);
      const subject = document.getElementById('schFormSubject').value;
      const teacherName = document.getElementById('schFormTeacher').value;
      const startTime = document.getElementById('schFormStartTime').value.trim();
      const endTime = document.getElementById('schFormEndTime').value.trim();
      const room = document.getElementById('schFormRoom').value.trim();
      const notes = document.getElementById('schFormNotes').value.trim();

      // 1. Validasi Jam Selesai harus setelah Jam Mulai
      const startMin = parseTimeToMin(startTime);
      const endMin = parseTimeToMin(endTime);
      if (endMin <= startMin) {
        conflictBox.style.display = 'flex';
        conflictMsg.innerText = 'Waktu selesai (' + endTime + ') harus setelah waktu mulai (' + startTime + '). Durasi tidak boleh nol atau negatif.';
        return;
      }

      // 2. Deteksi Bentrok Kelas, Bentrok Guru, dan Duplikasi
      for (const other of mockSchedules) {
        if (isEditingScheduleMode && other.id === currentDetailScheduleId) {
          continue; // Lewati diri sendiri saat edit
        }

        // Cek hari yang sama
        if (other.day.toLowerCase() === day.toLowerCase()) {
          const overlaps = isTimeOverlap(startTime, endTime, other.startTime, other.endTime);

          // a. Bentrok Kelas (Butir D & Aturan 7)
          if (other.className.toLowerCase() === className.toLowerCase() && overlaps) {
            conflictBox.style.display = 'flex';
            conflictMsg.innerText = 'Bentrok Kelas: Kelas ' + className + ' sudah memiliki jadwal "' + other.subject + '" pada hari ' + day + ' pukul ' + other.startTime + ' - ' + other.endTime + ' WIB.';
            return;
          }

          // b. Bentrok Guru (Butir D & Aturan 6)
          if (other.teacherName.toLowerCase() === teacherName.toLowerCase() && overlaps) {
            conflictBox.style.display = 'flex';
            conflictMsg.innerText = 'Bentrok Guru: ' + teacherName + ' sudah memiliki jadwal mengajar di Kelas ' + other.className + ' ("' + other.subject + '") pada hari ' + day + ' pukul ' + other.startTime + ' - ' + other.endTime + ' WIB.';
            return;
          }

          // c. Duplikasi Persis (Hari, Kelas, Jam Ke-)
          if (other.className.toLowerCase() === className.toLowerCase() && other.periodNumber === periodNumber) {
            conflictBox.style.display = 'flex';
            conflictMsg.innerText = 'Duplikasi Jadwal: Kelas ' + className + ' sudah memiliki jadwal Jam Ke-' + periodNumber + ' pada hari ' + day + ' ("' + other.subject + '").';
            return;
          }
        }
      }

      // 3. Simpan Jadwal
      if (isEditingScheduleMode) {
        const idx = mockSchedules.findIndex(s => s.id === currentDetailScheduleId);
        if (idx !== -1) {
          mockSchedules[idx] = {
            ...mockSchedules[idx],
            day,
            className,
            periodNumber,
            subject,
            teacherName,
            startTime,
            endTime,
            room: room || ('Ruang Kelas ' + className),
            notes: notes || null
          };
          showToast('Jadwal "' + subject + '" (' + className + ') berhasil diperbarui.', 'success');
        }
      } else {
        const newSchedule = {
          id: 'sch_' + Date.now(),
          day,
          className,
          periodNumber,
          subject,
          teacherName,
          teacherId: 'guru_' + Math.floor(Math.random() * 100),
          startTime,
          endTime,
          room: room || ('Ruang Kelas ' + className),
          notes: notes || null
        };
        mockSchedules.unshift(newSchedule);
        showToast('Jadwal baru "' + subject + '" (' + className + ') berhasil ditambahkan.', 'success');
      }

      backFromScheduleForm();
      renderScheduleList();
      if (typeof refreshTeacherReminders === 'function') {
        refreshTeacherReminders({ silent: true });
      }

      if (isEditingScheduleMode && currentDetailScheduleId) {
        openScheduleDetail(currentDetailScheduleId);
      }
    }

    // Dialog Konfirmasi Hapus Jadwal (Sesuai Butir C.5)
    function confirmDeleteSchedule(id, onDeletedCallback) {
      const s = mockSchedules.find(item => item.id === id);
      if (!s) return;

      const modal = document.getElementById('appModal');
      const title = document.getElementById('modalTitle');
      const body = document.getElementById('modalBody');
      const actionBtn = document.getElementById('modalBtnAction');

      title.innerText = 'Hapus Jadwal';
      body.innerHTML = `
        <div style="font-size:13.5px; color:var(--text-main); line-height:1.45; margin-bottom:14px;">
          Apakah Anda yakin ingin menghapus jadwal mata pelajaran <strong>"${s.subject}"</strong> untuk kelas <strong>${s.className}</strong> (${s.day}, Jam Ke-${s.periodNumber})?
          <div style="color:#DC2626; font-size:12px; margin-top:8px;">Tindakan ini tidak dapat dibatalkan.</div>
        </div>
        <div style="display:flex; gap:10px;">
          <button type="button" class="btn-primary" style="flex:1; background:#FFFFFF; color:var(--text-main); border:1px solid #CBD5E1;" onclick="closeModal()">Batal</button>
          <button type="button" class="btn-primary" style="flex:1; background:#DC2626;" onclick="executeDeleteSchedule('${s.id}')">Hapus</button>
        </div>
      `;

      actionBtn.style.display = 'none';
      modal.classList.add('active');

      window._onScheduleDeleted = onDeletedCallback;
    }

    function executeDeleteSchedule(id) {
      const idx = mockSchedules.findIndex(s => s.id === id);
      closeModal();
      if (idx !== -1) {
        const deleted = mockSchedules.splice(idx, 1)[0];
        showToast('Jadwal "' + deleted.subject + '" (' + deleted.className + ') berhasil dihapus.', 'success');
        renderScheduleList();
        if (typeof refreshTeacherReminders === 'function') {
          refreshTeacherReminders({ silent: true });
        }
        if (window._onScheduleDeleted) {
          window._onScheduleDeleted();
          window._onScheduleDeleted = null;
        }
      }
    }

    // Tactile Press Effect (Desktop & Mobile Quick-Tap Hold) untuk Tombol Detail Jadwal
    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
      const releasePressedBtn = (btn) => {
        if (!btn || !btn.classList) return;
        const pressedAt = Number(btn.dataset.pressedAt || 0);
        const elapsed = Date.now() - pressedAt;
        const remaining = Math.max(0, 130 - elapsed);
        if (btn._pressReleaseTimer) clearTimeout(btn._pressReleaseTimer);
        btn._pressReleaseTimer = setTimeout(() => {
          btn.classList.remove('is-pressed');
          btn._pressReleaseTimer = null;
        }, remaining);
      };

      const pressStartEvent = (typeof window !== 'undefined' && 'PointerEvent' in window) ? 'pointerdown' : 'touchstart';
      document.addEventListener(pressStartEvent, (e) => {
        const target = e.target;
        const btn = target && typeof target.closest === 'function' ? target.closest('.sch-det-press-btn') : null;
        if (!btn || btn.disabled) return;
        if (btn._pressReleaseTimer) {
          clearTimeout(btn._pressReleaseTimer);
          btn._pressReleaseTimer = null;
        }
        btn.dataset.pressedAt = String(Date.now());
        btn.classList.add('is-pressed');
      }, { passive: true });

      ['pointerup', 'pointercancel', 'touchend', 'touchcancel'].forEach((evName) => {
        document.addEventListener(evName, () => {
          document.querySelectorAll('.sch-det-press-btn.is-pressed').forEach(releasePressedBtn);
        }, { passive: true });
      });
    }

