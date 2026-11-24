    // Alur Navigasi Alami: Buka Register hanya setelah klik Daftar
    function openRegisterPage() {
      document.getElementById('pageRegister').classList.add('active');
      document.getElementById('pageLogin').classList.add('slide-out');
      document.getElementById('pageRegister').scrollTop = 0;
    }

    // Kembali ke Halaman Login saat klik tombol kembali (<) atau teks "Masuk"
    function backToLoginPage() {
      document.getElementById('pageRegister').classList.remove('active');
      document.getElementById('pageLogin').classList.remove('slide-out');
      document.getElementById('pageLogin').scrollTop = 0;
    }

    // Database Simulasi (Selaras dengan AuthService di Flutter)
    const mockUsers = [
      {
        fullName: 'Administrator Pondok',
        username: 'admin',
        email: 'admin@darulhikmah.ponpes.id',
        phone: '081234567890',
        phoneNumber: '081234567890',
        password: 'admin123',
        role: 'Admin'
      },
      {
        fullName: 'Ustadz Ahmad Fauzi',
        username: 'ustadz_ahmad',
        email: 'ahmad.fauzi@darulhikmah.ponpes.id',
        phone: '081987654321',
        phoneNumber: '081987654321',
        password: 'guru123',
        role: 'Guru'
      }
    ];

    let currentLoggedInUser = mockUsers[0];
    let currentFilterIndex = 0; // 0: Hari Ini, 1: Kemarin, 2: Pekan Ini
    const filterOptions = ['Hari Ini', 'Kemarin', 'Pekan Ini'];

    const attendanceStats = {
      Admin: {
        'Hari Ini': { hadir: 245, izin: 12, alpha: 8 },
        'Kemarin': { hadir: 248, izin: 10, alpha: 7 },
        'Pekan Ini': { hadir: 242, izin: 15, alpha: 8 }
      },
      Guru: {
        'Hari Ini': { hadir: 68, izin: 3, alpha: 1 },
        'Kemarin': { hadir: 70, izin: 2, alpha: 0 },
        'Pekan Ini': { hadir: 66, izin: 4, alpha: 2 }
      }
    };

    // Quick demo action dari top-bar
    function directLoginAdmin() {
      currentLoggedInUser = mockUsers[0];
      navigateToHome(currentLoggedInUser);
      showToast('Masuk sebagai Administrator Pondok', 'success');
    }

    function directLoginGuru() {
      currentLoggedInUser = mockUsers[1];
      navigateToHome(currentLoggedInUser);
      showToast('Masuk sebagai Ustadz Ahmad Fauzi (Guru)', 'success');
    }

    function goToLoginScreen() {
      logoutFromHome();
    }

    function fillAdmin() {
      backToLoginPage();
      document.getElementById('loginIdentifier').value = 'admin';
      document.getElementById('loginPassword').value = 'admin123';
      clearErrors('login');
      showToast('Kredensial Admin dimuat: admin / admin123', 'success');
    }

    function fillGuru() {
      backToLoginPage();
      document.getElementById('loginIdentifier').value = 'ustadz_ahmad';
      document.getElementById('loginPassword').value = 'guru123';
      clearErrors('login');
      showToast('Kredensial Guru dimuat: ustadz_ahmad / guru123', 'success');
    }

    // Fungsi Utama Routing Antar-Halaman (Menampilkan HANYA halaman yang dipilih secara eksklusif)
    function showOnlyScreenPage(targetPageId) {
      const shell = document.querySelector('.device-shell');
      if (shell) {
        shell.classList.remove('on-students', 'on-schedule', 'on-report', 'on-settings');
        if (targetPageId === 'pageHome') shell.classList.add('on-home');
        else if (targetPageId.startsWith('pageStudent')) shell.classList.add('on-students');
        else if (targetPageId.startsWith('pageSchedule') || targetPageId.startsWith('pageAttendanceForm')) shell.classList.add('on-schedule');
        else if (targetPageId.startsWith('pageAttendanceReport') || targetPageId.startsWith('pageStudentRecap')) shell.classList.add('on-report');
        else if (targetPageId.startsWith('pageSetting')) shell.classList.add('on-settings');
      }

      // Pastikan slide login tertutup jika masuk ke halaman dalam
      const pageLogin = document.getElementById('pageLogin');
      if (pageLogin && targetPageId !== 'pageLogin' && targetPageId !== 'pageRegister') {
        pageLogin.classList.add('slide-out');
      }

      // Sembunyikan SEMUA screen-page, hanya aktifkan targetPageId
      const allPages = document.querySelectorAll('.screen-page');
      if (allPages && allPages.length > 0) {
        allPages.forEach(function(p) {
          if (p.id === targetPageId) {
            p.classList.add('active');
            p.scrollTop = 0;
          } else {
            p.classList.remove('active');
          }
        });
      } else {
        const targetEl = document.getElementById(targetPageId);
        if (targetEl) targetEl.classList.add('active');
      }

      if (typeof window !== 'undefined' && window.scrollTo) {
        try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch(e) {}
      }

      // Kontrol visibilitas navbar bawah:
      // Pertahankan & tampilkan pada halaman utama: Beranda, Absensi, Data Santri, Laporan, Pengaturan
      // Sembunyikan saat di halaman otentikasi (login/register) atau pengisian form absensi langsung
      const bNav = document.getElementById('bottomNavFixed') || document.querySelector('.bottom-nav-fixed');
      if (bNav) {
        if (targetPageId === 'pageLogin' || targetPageId === 'pageRegister' || targetPageId === 'pageAttendanceForm') {
          bNav.style.display = 'none';
        } else {
          bNav.style.display = '';
        }
      }
    }

    // Navigasi ke Homepage setelah Login
    function navigateToHome(user) {
      if (!user) user = currentLoggedInUser || mockUsers[0];
      currentLoggedInUser = user;
      
      showOnlyScreenPage('pageHome');

      // Update state role di UI
      updateHomeDisplayForRole(user.role);
      syncActiveNav('home');
      renderRecentActivities();
    }

    function toggleAppSidebar() {
      const sb = document.getElementById('appSidebar');
      const ov = document.getElementById('sidebarOverlay');
      if (!sb) return;
      const isOpen = sb.classList.contains('open');
      if (isOpen) {
        sb.classList.remove('open');
        if (ov) ov.classList.remove('active');
      } else {
        sb.classList.add('open');
        if (ov) ov.classList.add('active');
      }
    }

    function closeAppSidebar() {
      const sb = document.getElementById('appSidebar');
      const ov = document.getElementById('sidebarOverlay');
      if (sb) sb.classList.remove('open');
      if (ov) ov.classList.remove('active');
    }

    function syncActiveNav(pageKey) {
      const navMap = {
        'home': 'navLinkHome',
        'students': 'navLinkStudents',
        'schedule': 'navLinkSchedule',
        'report': 'navLinkReport',
        'settings': 'navLinkSettings'
      };
      const sbMap = {
        'home': 'sbLinkHome',
        'students': 'sbLinkStudents',
        'schedule': 'sbLinkSchedule',
        'report': 'sbLinkReport',
        'settings': 'sbLinkSettings'
      };

      Object.values(navMap).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
      });
      Object.values(sbMap).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
      });

      const activeNavId = navMap[pageKey];
      if (activeNavId) {
        const el = document.getElementById(activeNavId);
        if (el) el.classList.add('active');
      }

      const activeSbId = sbMap[pageKey];
      if (activeSbId) {
        const el = document.getElementById(activeSbId);
        if (el) el.classList.add('active');
      }

      // Sinkronisasi status tab navbar bawah (Mobile): 0: home, 1: schedule, 2: students, 3: report, 4: settings
      const tabIndices = {
        'home': 0,
        'schedule': 1,
        'students': 2,
        'report': 3,
        'settings': 4
      };
      const activeTabIndex = (pageKey in tabIndices) ? tabIndices[pageKey] : -1;
      for (let i = 0; i <= 4; i++) {
        const pill = document.getElementById('tabPill' + i);
        const label = document.getElementById('tabLabel' + i);
        const underline = document.getElementById('tabUnderline' + i);
        if (pill) {
          pill.className = (activeTabIndex === i) ? 'tab-pill-active' : 'tab-icon-passive';
        }
        if (label) {
          label.className = (activeTabIndex === i) ? 'tab-label active' : 'tab-label';
        }
        if (underline) {
          underline.style.display = (activeTabIndex === i) ? 'block' : 'none';
        }
      }
    }

    function updateHomeDisplayForRole(role) {
      document.getElementById('homeRoleLabel').innerText = role;
      const bAdmin = document.getElementById('demoBtnAdmin');
      const bGuru = document.getElementById('demoBtnGuru');
      if (bAdmin && bGuru) {
        if (role === 'Admin') {
          bAdmin.classList.add('active');
          bGuru.classList.remove('active');
        } else {
          bGuru.classList.add('active');
          bAdmin.classList.remove('active');
        }
      }
      document.getElementById('popoverUserName').innerText = currentLoggedInUser.fullName;
      document.getElementById('popoverUserEmail').innerText = currentLoggedInUser.email || currentLoggedInUser.username;

      // Update responsive navbar & sidebar identity
      const navUserName = document.getElementById('navbarUserName');
      const navUserRole = document.getElementById('navbarUserRole');
      const navUserAvatar = document.getElementById('navbarUserAvatar');
      const sbUserName = document.getElementById('sidebarUserName');
      const sbUserRole = document.getElementById('sidebarUserRoleBadge');
      const sbUserAvatar = document.getElementById('sidebarUserAvatar');
      const topRoleText = document.getElementById('topNavbarRoleText');
      const navReport = document.getElementById('navLinkReport');
      const sbReport = document.getElementById('sbItemReport');

      const initial = (currentLoggedInUser.fullName || 'A').charAt(0).toUpperCase();
      const roleBadge = role === 'Admin' ? 'Admin Pondok' : 'Guru Pengajar';

      if (navUserName) navUserName.innerText = currentLoggedInUser.fullName;
      if (navUserRole) navUserRole.innerText = roleBadge;
      if (navUserAvatar) navUserAvatar.innerText = initial;

      if (sbUserName) sbUserName.innerText = currentLoggedInUser.fullName;
      if (sbUserRole) sbUserRole.innerText = roleBadge;
      if (sbUserAvatar) sbUserAvatar.innerText = initial;

      if (topRoleText) topRoleText.innerText = role;

      // Laporan Absensi RBAC: Khusus Admin
      if (navReport) navReport.style.display = role === 'Admin' ? 'inline-flex' : 'none';
      if (sbReport) sbReport.style.display = role === 'Admin' ? 'block' : 'none';

      // Popover active item
      const popAdmin = document.getElementById('popoverItemAdmin');
      const popGuru = document.getElementById('popoverItemGuru');
      if (popAdmin) {
        if (role === 'Admin') popAdmin.classList.add('active');
        else popAdmin.classList.remove('active');
      }
      if (popGuru) {
        if (role === 'Guru') popGuru.classList.add('active');
        else popGuru.classList.remove('active');
      }
      const menuPeng = document.getElementById('homeMenuPengaturan');
      if (menuPeng) menuPeng.classList.remove('restricted');

      // Diagram Lingkaran (Pie Chart) Kehadiran Per Kelas (Khusus Admin)
      const chartCard = document.getElementById('adminAttendanceChartCard');
      if (chartCard) {
        if (role === 'Admin') {
          chartCard.style.display = 'block';
          renderAttendancePieChart(currentSelectedChartClass);
        } else {
          chartCard.style.display = 'none';
        }
      }

      // Update angka ringkasan
      updateStatsDisplay();

      // Sinkronisasi hak akses Modul Data Santri jika sedang dibuka (Sesuai Butir D)
      const sntList = document.getElementById('pageStudentList');
      if (sntList && sntList.classList.contains('active')) {
        openStudentListPage();
      }
      const sntDetail = document.getElementById('pageStudentDetail');
      if (sntDetail && sntDetail.classList.contains('active') && currentDetailStudentId) {
        openStudentDetail(currentDetailStudentId);
      }

      // Sinkronisasi hak akses Modul Manajemen Jadwal jika sedang dibuka (Hanya Admin yang bisa Edit/Tambah)
      const schList = document.getElementById('pageScheduleList');
      if (schList && schList.classList.contains('active')) {
        openScheduleListPage();
      }
      const schDetail = document.getElementById('pageScheduleDetail');
      if (schDetail && schDetail.classList.contains('active') && currentDetailScheduleId) {
        openScheduleDetail(currentDetailScheduleId);
      }
    }

    function switchHomeRole(newRole) {
      closeRoleDropdown();
      if (newRole === 'Admin') {
        currentLoggedInUser = mockUsers[0];
      } else {
        currentLoggedInUser = mockUsers[1];
      }
      updateHomeDisplayForRole(newRole);
      showToast(`Beralih ke mode tampilan: ${newRole}`, 'success');
    }

    function toggleRoleDropdown(e) {
      if (e) e.stopPropagation();
      const popover = document.getElementById('homeRolePopover');
      const chevron = document.getElementById('homeRoleChevron');
      const isOpen = popover.style.display === 'block';
      popover.style.display = isOpen ? 'none' : 'block';
      if (chevron) {
        if (!isOpen) chevron.classList.add('open');
        else chevron.classList.remove('open');
      }
    }

    function closeRoleDropdown() {
      const popover = document.getElementById('homeRolePopover');
      if (popover) popover.style.display = 'none';
      const chevron = document.getElementById('homeRoleChevron');
      if (chevron) chevron.classList.remove('open');
    }

    document.addEventListener('click', () => {
      closeRoleDropdown();
    });

    // Siklus Filter Tanggal Ringkasan Absensi (Hari Ini -> Kemarin -> Pekan Ini)
    function cycleAttendanceFilter() {
      currentFilterIndex = (currentFilterIndex + 1) % filterOptions.length;
      const fLabel = document.getElementById('filterLabel');
      if (fLabel) fLabel.innerText = filterOptions[currentFilterIndex];
      updateStatsDisplay();
      showToast(`Filter diubah: ${filterOptions[currentFilterIndex]}`, 'success');
    }

    function updateStatsDisplay() {
      const role = currentLoggedInUser.role || 'Admin';
      const filterName = filterOptions[currentFilterIndex];
      const data = attendanceStats[role][filterName];

      const h = document.getElementById('statHadir');
      const i = document.getElementById('statIzin');
      const a = document.getElementById('statAlpha');
      if (h) h.innerText = data.hadir;
      if (i) i.innerText = data.izin;
      if (a) a.innerText = data.alpha;
    }

    // ========================================================
    // STATISTIK DIAGRAM LINGKARAN (PIE CHART) KEHADIRAN PER KELAS
    // ========================================================
    const classAttendanceStats = {
      'Semua Kelas': { hadir: 245, izin: 12, sakit: 9, alpa: 8 },
      'Kelas VII A': { hadir: 32, izin: 1, sakit: 2, alpa: 1 },
      'Kelas VII B': { hadir: 30, izin: 2, sakit: 1, alpa: 2 },
      'Kelas VIII A': { hadir: 34, izin: 1, sakit: 1, alpa: 0 },
      'Kelas VIII B': { hadir: 31, izin: 3, sakit: 2, alpa: 1 },
      'Kelas IX A': { hadir: 35, izin: 2, sakit: 1, alpa: 1 },
      'Kelas IX B': { hadir: 33, izin: 2, sakit: 2, alpa: 2 }
    };

    let currentSelectedChartClass = 'Semua Kelas';

    function onClassChartFilterChange(className) {
      currentSelectedChartClass = className;
      renderAttendancePieChart(className);
    }

    function renderAttendancePieChart(className) {
      if (!className) className = currentSelectedChartClass || 'Semua Kelas';
      const stats = classAttendanceStats[className] || classAttendanceStats['Semua Kelas'];

      const hadir = stats.hadir || 0;
      const izin = stats.izin || 0;
      const sakit = stats.sakit || 0;
      const alpa = stats.alpa || 0;
      const total = hadir + izin + sakit + alpa;

      const pctHadir = total > 0 ? (hadir / total) * 100 : 0;
      const pctIzin = total > 0 ? (izin / total) * 100 : 0;
      const pctSakit = total > 0 ? (sakit / total) * 100 : 0;
      const pctAlpa = total > 0 ? (alpa / total) * 100 : 0;

      // Update text values di Legend & Info
      const elPctH = document.getElementById('legendPctHadir');
      const elPctI = document.getElementById('legendPctIzin');
      const elPctS = document.getElementById('legendPctSakit');
      const elPctA = document.getElementById('legendPctAlpa');

      const elCntH = document.getElementById('legendCountHadir');
      const elCntI = document.getElementById('legendCountIzin');
      const elCntS = document.getElementById('legendCountSakit');
      const elCntA = document.getElementById('legendCountAlpa');

      const elCenterRate = document.getElementById('pieCenterRate');
      const selClass = document.getElementById('chartClassSelect');

      if (selClass && selClass.value !== className) {
        selClass.value = className;
      }

      if (elPctH) elPctH.innerText = pctHadir.toFixed(1) + '%';
      if (elPctI) elPctI.innerText = pctIzin.toFixed(1) + '%';
      if (elPctS) elPctS.innerText = pctSakit.toFixed(1) + '%';
      if (elPctA) elPctA.innerText = pctAlpa.toFixed(1) + '%';

      if (elCntH) elCntH.innerText = hadir + ' Santri';
      if (elCntI) elCntI.innerText = izin + ' Santri';
      if (elCntS) elCntS.innerText = sakit + ' Santri';
      if (elCntA) elCntA.innerText = alpa + ' Santri';

      if (elCenterRate) elCenterRate.innerText = pctHadir.toFixed(0) + '%';

      // Render SVG Donut Chart Slices
      const svg = document.getElementById('attendancePieChartSvg');
      if (!svg) return;

      const r = 68;
      const c = 2 * Math.PI * r; // ~ 427.2566
      const strokeWidth = 26;

      const slices = [
        { label: 'Hadir', pct: pctHadir, color: '#16A34A', count: hadir },
        { label: 'Izin', pct: pctIzin, color: '#2563EB', count: izin },
        { label: 'Sakit', pct: pctSakit, color: '#F59E0B', count: sakit },
        { label: 'Alpa', pct: pctAlpa, color: '#DC2626', count: alpa }
      ];

      let currentOffset = 0;
      let svgHtml = `
        <circle cx="100" cy="100" r="${r}" fill="none" stroke="#F1F5F9" stroke-width="${strokeWidth}" />
      `;

      slices.forEach(slice => {
        if (slice.pct <= 0) return;
        const sliceLength = (slice.pct / 100) * c;
        svgHtml += `
          <circle 
            class="pie-slice"
            cx="100" 
            cy="100" 
            r="${r}" 
            fill="none" 
            stroke="${slice.color}" 
            stroke-width="${strokeWidth}" 
            stroke-dasharray="${sliceLength.toFixed(2)} ${c.toFixed(2)}" 
            stroke-dashoffset="${(-currentOffset).toFixed(2)}"
            transform="rotate(-90 100 100)"
            style="transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer;"
          >
            <title>${slice.label}: ${slice.pct.toFixed(1)}% (${slice.count} Santri)</title>
          </circle>
        `;
        currentOffset += sliceLength;
      });

      svg.innerHTML = svgHtml;
    }

    // Modal Fitur Menu & Cek Akses
    function openMenuModal(title, code) {
      // Integrasi Navigasi Menu Data Santri (Sesuai Butir I & C)
      if (code === 'data_santri') {
        openStudentListPage();
        return;
      }

      // Navigasi Langsung ke Halaman Absensi Santri (Tanpa Pop-up Pilihan)
      if (code === 'absensi') {
        openScheduleListPage();
        return;
      }
      if (code === 'laporan') {
        const isAdmin = currentLoggedInUser && currentLoggedInUser.role === 'Admin';
        if (isAdmin) {
          openAttendanceReportPage();
          return;
        }
      }

      const isRestricted = currentLoggedInUser.role === 'Guru' && code === 'pengaturan';
      let desc = '';

      if (isRestricted) {
        desc = 'Mohon maaf, pengaturan administrasi sistem pesantren dan pengelolaan akun hanya dapat diakses oleh Administrator Pondok. Akun Guru tidak memiliki kewenangan di bagian ini (Sesuai Butir 8 Hak Akses).';
      } else {
        switch (code) {
          case 'data_santri':
            desc = currentLoggedInUser.role === 'Admin'
              ? 'Menu Data Santri: Mengelola seluruh basis data santri Pondok Pesantren Islam Darul Hikmah, kamar asrama, dan data wali santri.'
              : 'Menu Data Santri: Melihat data santri pada rombel / kelas yang Anda bina.';
            break;
          case 'absensi':
            desc = 'Menu Absensi Santri: Pencatatan presensi harian berbasis digital untuk shalat berjamaah, halaqah Qur\'an, dan kegiatan kelas.';
            break;
          case 'laporan':
            desc = 'Menu Laporan Absensi: Rekapitulasi presensi berkala santri dengan grafik tren kehadiran dan ekspor data presensi.';
            break;
          case 'pengaturan':
            desc = 'Pengaturan sistem absensi, manajemen akun pengguna, hak akses, dan konfigurasi master data pondok.';
            break;
        }
      }

      showAppModal(
        title,
        `
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px;">
          <div style="width:40px; height:40px; border-radius:50%; background:${isRestricted ? '#FEE2E2' : '#DCFCE7'}; display:flex; align-items:center; justify-content:center; color:${isRestricted ? '#DC2626' : '#16A34A'};">
            ${isRestricted ? '🔒' : '✓'}
          </div>
          <div>
            <div style="font-size:12.5px; font-weight:700; color:${isRestricted ? '#DC2626' : '#16A34A'};">
              ${isRestricted ? 'Akses Terbatas: Khusus Admin' : 'Hak Akses: ' + currentLoggedInUser.role}
            </div>
            <div style="font-size:11px; color:#6B7280;">Aplikasi Absensi Darul Hikmah</div>
          </div>
        </div>
        <p style="color:#4B5563; font-size:13.5px; line-height:1.5;">${desc}</p>
        `,
        'Mengerti',
        closeModal
      );
    }

    // ========================================================
    // AKTIVITAS REAL USTADZ SETIAP HARINYA (DYNAMIC FEED)
    // ========================================================
    let mockUstadzActivities = [
      {
        id: 'act_001',
        teacherName: 'Ustadz Ahmad Fauzi, S.Pd.I',
        avatar: 'assets/images/santri_ahmad.png',
        action: 'Absensi KBM Selesai',
        statusType: 'hadir',
        subject: 'Fiqih',
        className: 'Kelas VII A',
        summary: '32 Hadir • 1 Izin • 1 Sakit',
        time: '08:12',
        date: 'Hari Ini',
        timestamp: Date.now() - 1000 * 60 * 12
      },
      {
        id: 'act_002',
        teacherName: 'Ustadzah Halimah',
        avatar: 'assets/images/santri_aisyah.png',
        action: 'Absensi KBM Selesai',
        statusType: 'hadir',
        subject: 'Bahasa Arab',
        className: 'Kelas VIII B',
        summary: '31 Hadir • 2 Izin • 1 Alpa',
        time: '07:50',
        date: 'Hari Ini',
        timestamp: Date.now() - 1000 * 60 * 34
      },
      {
        id: 'act_003',
        teacherName: 'Ustadz Mansyur Hidayat',
        avatar: 'assets/images/santri_rizky.png',
        action: 'Absensi KBM Selesai',
        statusType: 'hadir',
        subject: 'Al-Qur\'an Hadits',
        className: 'Kelas VII B',
        summary: '33 Hadir • 1 Izin',
        time: '07:30',
        date: 'Hari Ini',
        timestamp: Date.now() - 1000 * 60 * 54
      },
      {
        id: 'act_004',
        teacherName: 'Ustadz Zulkifli',
        avatar: 'assets/images/santri_putra_2.png',
        action: 'Absensi KBM Selesai',
        statusType: 'hadir',
        subject: 'Nahwu Shorof',
        className: 'Kelas VIII A',
        summary: '34 Hadir • 0 Alpa',
        time: '07:15',
        date: 'Hari Ini',
        timestamp: Date.now() - 1000 * 60 * 69
      },
      {
        id: 'act_005',
        teacherName: 'Ustadzah Nurul Azizah',
        avatar: 'assets/images/santri_putri_2.png',
        action: 'KBM Berjalan',
        statusType: 'info',
        subject: 'Matematika',
        className: 'Kelas IX A',
        summary: 'Sesi Aktif',
        time: '07:05',
        date: 'Hari Ini',
        timestamp: Date.now() - 1000 * 60 * 79
      }
    ];

    // Render 3 Aktivitas Ustadz Terakhir ke Kartu Beranda
    function renderRecentActivities() {
      const container = document.getElementById('homeActivitiesList');
      if (!container) return;

      if (!mockUstadzActivities || mockUstadzActivities.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding:24px 12px; color:var(--text-muted); font-size:13px;">
            Belum ada aktivitas ustadz tercatat hari ini.
          </div>`;
        return;
      }

      const displayItems = mockUstadzActivities.slice(0, 3);
      let html = '';

      displayItems.forEach(item => {
        const badgeClass = item.statusType === 'hadir' ? 'hadir' : (item.statusType === 'info' ? 'info' : 'izin');
        const badgeIcon = item.statusType === 'hadir'
          ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>`
          : (item.statusType === 'info'
            ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
            : `!`);

        html += `
          <div class="activity-row">
            <div class="activity-avatar-wrap">
              <img src="${item.avatar || 'assets/images/santri_ahmad.png'}" class="activity-avatar" onerror="this.src='assets/images/logo.png'">
              <div class="activity-badge ${badgeClass}">${badgeIcon}</div>
            </div>
            <div class="activity-info">
              <div class="activity-name">${item.teacherName}</div>
              <div class="activity-meta">
                <span class="meta-status ${badgeClass}">${item.action}</span>
                <span class="meta-class">• ${item.className} (${item.subject})</span>
              </div>
            </div>
            <div class="activity-time-col">
              <div class="activity-time">${item.time}</div>
              <div class="activity-date">${item.date || 'Hari Ini'}</div>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
    }

    // Tambahkan Aktivitas Ustadz Baru Secara Real-Time
    function addUstadzActivity(activity) {
      if (!activity) return;
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;

      let avatarUrl = activity.avatar;
      if (!avatarUrl) {
        const nameLower = (activity.teacherName || '').toLowerCase();
        if (nameLower.includes('halimah') || nameLower.includes('nurul') || nameLower.includes('ustadzah')) {
          avatarUrl = 'assets/images/santri_aisyah.png';
        } else if (nameLower.includes('mansyur')) {
          avatarUrl = 'assets/images/santri_rizky.png';
        } else if (nameLower.includes('zulkifli')) {
          avatarUrl = 'assets/images/santri_putra_2.png';
        } else {
          avatarUrl = 'assets/images/santri_ahmad.png';
        }
      }

      const newAct = {
        id: 'act_' + Date.now(),
        teacherName: activity.teacherName || 'Ustadz Ahmad Fauzi',
        avatar: avatarUrl,
        action: activity.action || 'Absensi KBM Selesai',
        statusType: activity.statusType || 'hadir',
        subject: activity.subject || 'Fiqih',
        className: activity.className || 'Kelas VII A',
        summary: activity.summary || 'Kehadiran santri berhasil disimpan',
        time: activity.time || timeStr,
        date: 'Hari Ini',
        timestamp: Date.now()
      };

      mockUstadzActivities.unshift(newAct);
      renderRecentActivities();
    }

    // Modal Riwayat Lengkap Aktivitas Ustadz Hari Ini (Lihat Semua)
    function openViewAllActivities() {
      if (!mockUstadzActivities || mockUstadzActivities.length === 0) {
        showAppModal('Aktivitas Ustadz Hari Ini', '<p style="text-align:center; padding:16px; color:#64748b;">Belum ada aktivitas ustadz hari ini.</p>', 'Tutup', closeModal);
        return;
      }

      let rowsHtml = '';
      mockUstadzActivities.forEach(item => {
        const badgeColor = item.statusType === 'hadir' ? '#16A34A' : '#2563EB';
        rowsHtml += `
          <div style="padding:10px 0; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:10px;">
              <img src="${item.avatar || 'assets/images/santri_ahmad.png'}" style="width:38px; height:38px; border-radius:50%; object-fit:cover;" onerror="this.src='assets/images/logo.png'">
              <div>
                <div style="font-weight:700; color:#0f172a; font-size:13.5px;">${item.teacherName}</div>
                <div style="font-size:12px; color:#64748b; margin-top:2px;">
                  <span style="color:${badgeColor}; font-weight:700;">${item.action}</span> • ${item.className} (${item.subject})
                </div>
                ${item.summary ? `<div style="font-size:11px; color:#94a3b8; margin-top:2px;">${item.summary}</div>` : ''}
              </div>
            </div>
            <div style="text-align:right; flex-shrink:0;">
              <div style="font-weight:700; font-size:13px; color:#0f172a;">${item.time}</div>
              <div style="font-size:11px; color:#94a3b8;">${item.date || 'Hari Ini'}</div>
            </div>
          </div>
        `;
      });

      showAppModal(
        'Riwayat Aktivitas Ustadz Hari Ini',
        `<div style="max-height:360px; overflow-y:auto; text-align:left; font-size:13px; padding-right:4px;">${rowsHtml}</div>`,
        'Tutup',
        closeModal
      );
    }

    // Switch Bottom Nav Tab
    function switchNavTab(index) {
      if (index === 0) {
        navigateToHome(currentLoggedInUser);
        return;
      }
      if (index === 1) {
        openScheduleListPage();
        return;
      }
      if (index === 2) {
        openStudentListPage();
        return;
      }
      if (index === 3) {
        const isAdmin = currentLoggedInUser && currentLoggedInUser.role === 'Admin';
        if (isAdmin) {
          openAttendanceReportPage();
        } else {
          showToast('Akses ditolak: Modul Laporan Absensi hanya dapat diakses oleh Administrator Pondok.', 'error');
        }
        return;
      }
      if (index === 4) {
        openSettingsPage();
        return;
      }
      const names = ['Beranda', 'Absensi', 'Data Santri', 'Laporan', 'Pengaturan'];
      const codes = ['beranda', 'absensi', 'santri', 'laporan', 'pengaturan'];
      openMenuModal(names[index], codes[index]);
    }

    // Logout dari Homepage
    function logoutFromHome() {
      closeRoleDropdown();
      document.querySelector('.device-shell').classList.remove('on-home');
      document.getElementById('pageHome').classList.remove('active');
      document.getElementById('pageRegister').classList.remove('active');
      document.getElementById('pageLogin').classList.remove('slide-out');
      document.getElementById('pageLogin').scrollTop = 0;
      const bNav = document.getElementById('bottomNavFixed') || document.querySelector('.bottom-nav-fixed');
      if (bNav) bNav.style.display = 'none';
      showToast('Anda telah keluar dari sesi akun.', 'success');
    }

    // Toggle Password Visibility
    function togglePassVisibility(inputId, el) {
      const input = document.getElementById(inputId);
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      el.innerHTML = isPass
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
    }

    // Show Toast
    function showToast(msg, type = 'error') {
      const toast = document.getElementById('appToast');
      toast.className = `toast ${type}`;
      toast.innerText = msg;
      toast.style.display = 'flex';
      setTimeout(() => { toast.style.display = 'none'; }, 3500);
    }

    // Clear validation errors
    function clearErrors(prefix) {
      document.querySelectorAll(`[id^="${prefix}"][id$="Wrapper"]`).forEach(w => w.classList.remove('error'));
      document.querySelectorAll(`[id^="${prefix}"][id$="Error"]`).forEach(e => e.style.display = 'none');
    }

    function setFieldError(wrapperId, errorId, msg) {
      const wrap = document.getElementById(wrapperId);
      const err = document.getElementById(errorId);
      if (wrap) wrap.classList.add('error');
      if (err) {
        if (msg) err.innerText = msg;
        err.style.display = 'block';
      }
    }

    // Handle Login Submit
    function handleLoginSubmit(e) {
      e.preventDefault();
      clearErrors('login');

      const id = document.getElementById('loginIdentifier').value.trim();
      const pass = document.getElementById('loginPassword').value;
      let hasError = false;

      if (!id) {
        setFieldError('loginIdWrapper', 'loginIdError', 'Username atau Email wajib diisi');
        hasError = true;
      }
      if (!pass || pass.length < 6) {
        setFieldError('loginPassWrapper', 'loginPassError', 'Password minimal 6 karakter');
        hasError = true;
      }

      if (hasError) return;

      const btn = document.getElementById('btnLogin');
      btn.disabled = true;
      btn.innerHTML = '<div class="spinner"></div>';

      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = '<span>Masuk</span>';

        const clean = id.toLowerCase();
        const found = mockUsers.find(u => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean);

        if (!found) {
          showToast('Akun tidak ditemukan. Periksa kembali username atau email Anda.');
          setFieldError('loginIdWrapper', 'loginIdError', 'Akun tidak ditemukan');
          return;
        }

        if (found.password !== pass) {
          showToast('Password yang Anda masukkan salah.');
          setFieldError('loginPassWrapper', 'loginPassError', 'Password salah');
          return;
        }

        // Login sukses -> Otomatis arahkan ke Homepage sesuai role akun (Admin / Guru)
        showToast(`Ahlan wa Sahlan, ${found.fullName}! (${found.role})`, 'success');
        navigateToHome(found);
      }, 700);
    }

    // Handle Register Submit
    function handleRegisterSubmit(e) {
      e.preventDefault();
      clearErrors('reg');

      const name = document.getElementById('regFullName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const phone = document.getElementById('regPhone').value.trim();
      const pass = document.getElementById('regPassword').value;
      const confirm = document.getElementById('regConfirmPassword').value;

      let hasError = false;

      if (!name || name.length < 3) {
        setFieldError('regNameWrapper', 'regNameError', 'Nama lengkap minimal 3 karakter');
        hasError = true;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFieldError('regEmailWrapper', 'regEmailError', 'Format email tidak valid (contoh: user@pesantren.id)');
        hasError = true;
      }
      if (!phone || phone.replace(/\D/g,'').length < 10) {
        setFieldError('regPhoneWrapper', 'regPhoneError', 'Nomor HP minimal 10 digit angka');
        hasError = true;
      }
      if (!pass || pass.length < 6) {
        setFieldError('regPassWrapper', 'regPassError', 'Password minimal 6 karakter');
        hasError = true;
      }
      if (pass !== confirm) {
        setFieldError('regConfirmWrapper', 'regConfirmError', 'Konfirmasi password tidak cocok');
        hasError = true;
      }

      if (hasError) return;

      // Cek email duplikat
      if (mockUsers.some(u => u.email && u.email.toLowerCase() === email.toLowerCase())) {
        setFieldError('regEmailWrapper', 'regEmailError', `Email "${email}" sudah terdaftar`);
        showToast(`Email "${email}" sudah digunakan.`);
        return;
      }

      const btn = document.getElementById('btnRegister');
      btn.disabled = true;
      btn.innerHTML = '<div class="spinner"></div>';

      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = '<span>Daftar</span>';

        // Simpan akun baru (KUNCI ROLE GURU SESUAI SECTION 5)
        const newUser = {
          fullName: name,
          username: email.split('@')[0],
          email: email,
          phone: phone,
          password: pass,
          role: 'Guru' // Mutlak Guru
        };
        mockUsers.push(newUser);

        // Dialog sukses pendaftaran
        showAppModal(
          'Pendaftaran Berhasil',
          `Alhamdulillah, akun untuk <strong>${name}</strong> telah berhasil dibuat.
          <div class="role-chip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Peran: Guru (Otorisasi Pendaftaran Publik)
          </div>
          <p style="margin-top:6px;">Silakan masuk menggunakan email <strong>${email}</strong>.</p>`,
          'Masuk Sekarang',
          () => {
            closeModal();
            document.getElementById('loginIdentifier').value = email;
            document.getElementById('loginPassword').value = '';
            backToLoginPage();
            showToast('Silakan masukkan password untuk akun baru Anda.', 'success');
          }
        );
      }, 800);
    }

    function openForgotModal() {
      const email = prompt('Masukkan Username atau Email Anda untuk pemulihan kata sandi:', document.getElementById('loginIdentifier').value);
      if (email) {
        showToast(`Instruksi pemulihan telah dikirim untuk: ${email}`, 'success');
      }
    }

    function showAppModal(title, bodyHtml, btnText, btnAction) {
      document.getElementById('modalTitle').innerText = title;
      document.getElementById('modalBody').innerHTML = bodyHtml;
      const btn = document.getElementById('modalBtnAction');
      if (btn) {
        btn.innerText = btnText;
        btn.onclick = btnAction;
      }
      const modal = document.getElementById('appModal');
      if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
      }
    }

    function closeModal() {
      const modal = document.getElementById('appModal');
      if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
      }
    }
