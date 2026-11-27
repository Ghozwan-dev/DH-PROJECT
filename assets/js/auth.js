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

    let currentActiveNavPage = 'home';

    function syncActiveNav(pageKey) {
      currentActiveNavPage = pageKey;
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

      // Animasi sliding pill sidebar navigasi (Khusus Tampilan Desktop)
      updateSidebarSlidingPill(pageKey);

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

      // Animasi sliding pill & line untuk navbar bawah tampilan mobile
      if (activeTabIndex >= 0) {
        updateBottomNavSlidingPill(activeTabIndex);
      }
    }

    // Animasi Sliding Pill Sidebar Navigasi (Khusus Tampilan Desktop)
    function updateSidebarSlidingPill(pageKey) {
      if (!pageKey) pageKey = currentActiveNavPage || 'home';
      currentActiveNavPage = pageKey;
      if (typeof document === 'undefined') return;
      if (typeof window !== 'undefined' && window.innerWidth < 768) return;

      const pill = document.getElementById('sidebarSlidingPill');
      const container = document.querySelector('.sidebar-nav-container');
      if (!pill || !container) return;

      const sbMap = {
        'home': 'sbLinkHome',
        'students': 'sbLinkStudents',
        'schedule': 'sbLinkSchedule',
        'report': 'sbLinkReport',
        'settings': 'sbLinkSettings'
      };

      const targetId = sbMap[pageKey];
      if (!targetId) {
        pill.style.opacity = '0';
        return;
      }

      const activeItem = document.getElementById(targetId);
      if (!activeItem) {
        pill.style.opacity = '0';
        return;
      }

      // Hitung posisi vertikal dan horizontal relatif terhadap container
      let top = 0;
      let left = 0;
      let curr = activeItem;
      while (curr && curr !== container) {
        top += curr.offsetTop || 0;
        left += curr.offsetLeft || 0;
        curr = curr.offsetParent;
      }

      const width = (activeItem.offsetWidth && activeItem.offsetWidth > 0)
        ? activeItem.offsetWidth
        : (container.clientWidth ? (container.clientWidth - 8) : 220);
      const height = (activeItem.offsetHeight && activeItem.offsetHeight > 0)
        ? activeItem.offsetHeight
        : 38;

      pill.style.width = width + 'px';
      pill.style.height = height + 'px';
      pill.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      pill.style.opacity = '1';
    }

    // Animasi Sliding Pill Navbar Bawah (Khusus Tampilan Mobile)
    function updateBottomNavSlidingPill(index) {
      if (index === undefined || index < 0 || index > 4) return;
      if (typeof document === 'undefined') return;
      const bNav = document.querySelector('.bottom-nav-fixed');
      if (!bNav) return;

      if (typeof bNav.setAttribute === 'function') {
        bNav.setAttribute('data-active-tab', index);
      }

      const pill = document.getElementById('bottomNavSlidingPill');
      const line = document.getElementById('bottomNavSlidingLine');
      if (!pill) return;

      // Cek apakah posisi dapat dihitung secara dinamis (lebar render tersedia)
      if (typeof bNav.querySelectorAll === 'function') {
        const tabs = bNav.querySelectorAll('.bottom-nav-tab');
        if (tabs && tabs[index]) {
          const tab = tabs[index];
          const tabWidth = tab.offsetWidth || 0;
          const tabLeft = tab.offsetLeft || 0;
          if (tabWidth > 0) {
            const pillWidth = pill.offsetWidth || 46;
            const targetPillLeft = tabLeft + (tabWidth - pillWidth) / 2;
            pill.style.left = targetPillLeft + 'px';

            if (line) {
              const lineWidth = line.offsetWidth || 24;
              const targetLineLeft = tabLeft + (tabWidth - lineWidth) / 2;
              line.style.left = targetLineLeft + 'px';
            }
            return;
          }
        }
      }

      // Fallback persentase jika offsetWidth belum tersedia (misal saat load awal)
      const pct = (index * 20) + 10;
      pill.style.left = `calc(${pct}% - 23px)`;
      if (line) line.style.left = `calc(${pct}% - 12px)`;
    }

    if (typeof window !== 'undefined') {
      window.updateBottomNavSlidingPill = updateBottomNavSlidingPill;
      window.updateSidebarSlidingPill = updateSidebarSlidingPill;
      if (typeof window.addEventListener === 'function') {
        window.addEventListener('resize', function() {
          const bNav = document.querySelector('.bottom-nav-fixed');
          if (bNav && bNav.hasAttribute('data-active-tab')) {
            const curTab = parseInt(bNav.getAttribute('data-active-tab'), 10);
            if (!isNaN(curTab)) updateBottomNavSlidingPill(curTab);
          }
          if (window.innerWidth >= 768 && typeof updateSidebarSlidingPill === 'function') {
            updateSidebarSlidingPill(currentActiveNavPage);
          }
        });
      }
    }

    function updateHomeDisplayForRole(role) {
      const homeRoleLabel = document.getElementById('homeRoleLabel');
      if (homeRoleLabel) homeRoleLabel.innerText = role;
      const roleBtn = document.getElementById('roleDropdownBtn');
      if (roleBtn) roleBtn.title = `Mode: ${role} — Pilih Mode Pengguna`;
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

      // Sinkronisasi pengingat & notifikasi guru sesuai role aktif
      if (typeof refreshTeacherReminders === 'function') {
        refreshTeacherReminders();
      }

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
      if (typeof closeTeacherNotifPanel === 'function') closeTeacherNotifPanel();
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
      if (typeof closeTeacherNotifPanel === 'function') closeTeacherNotifPanel();
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
    // Dihitung dinamis dari data absensi & santri (mockAttendanceRecords & mockStudents)
    // ========================================================
    let classAttendanceStats = {
      'Semua Kelas': { hadir: 0, izin: 0, sakit: 0, alpa: 0 }
    };

    let currentSelectedChartClass = 'Semua Kelas';
    let currentSelectedChartStatus = null; // null | 'hadir' | 'izin' | 'sakit' | 'alpa'

    const CHART_STATUS_META = {
      hadir: {
        label: 'Hadir',
        color: '#16A34A',
        bg: '#DCFCE7',
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><polyline points="20 6 9 17 4 12"/></svg>`
      },
      izin: {
        label: 'Izin',
        color: '#2563EB',
        bg: '#DBEAFE',
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
      },
      sakit: {
        label: 'Sakit',
        color: '#D97706',
        bg: '#FEF3C7',
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`
      },
      alpa: {
        label: 'Alpa',
        color: '#DC2626',
        bg: '#FEE2E2',
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
      }
    };

    function getChartStatusRecords(statusKey, className) {
      const results = [];
      if (typeof mockAttendanceRecords === 'undefined' || !Array.isArray(mockAttendanceRecords)) {
        return results;
      }

      const targetStatus = (statusKey || 'hadir').toLowerCase();
      const targetClass = normalizeChartClassName(className || currentSelectedChartClass);
      const isAll = targetClass === 'Semua Kelas';
      const studentById = {};

      if (typeof mockStudents !== 'undefined' && Array.isArray(mockStudents)) {
        mockStudents.forEach(st => {
          if (st.id) studentById[st.id] = st;
        });
      }

      mockAttendanceRecords.forEach(record => {
        const recClassKey = normalizeChartClassName(record.className);
        if (!isAll && recClassKey !== targetClass) return;

        (record.items || []).forEach(item => {
          const st = (item.status || '').toLowerCase();
          const normalizedStatus = st === 'alfa' ? 'alpa' : st;
          if (normalizedStatus !== targetStatus) return;

          const studentProfile = item.studentId ? studentById[item.studentId] : null;
          results.push({
            recordId: record.id,
            studentId: item.studentId || '',
            studentNis: item.studentNis || (studentProfile ? studentProfile.nis : ''),
            studentName: item.studentName || (studentProfile ? studentProfile.fullName : '-'),
            avatar: studentProfile ? studentProfile.avatar : null,
            className: recClassKey,
            subject: record.subject || '-',
            teacherName: record.teacherName || '-',
            date: record.date || '',
            periodNumber: record.periodNumber || 1,
            note: item.note || '',
            status: normalizedStatus
          });
        });
      });

      return results;
    }

    function toggleChartStatusDetail(statusKey) {
      if (currentSelectedChartStatus === statusKey) {
        closeChartStatusDetail();
      } else {
        openChartStatusDetail(statusKey);
      }
    }

    function openChartStatusDetail(statusKey) {
      currentSelectedChartStatus = statusKey;
      renderAttendancePieChart(currentSelectedChartClass);
      renderChartStatusDetailPanel();
    }

    function closeChartStatusDetail(btnEl) {
      const closeBtn = btnEl || document.getElementById('chartDetailCloseBtn');
      if (closeBtn && closeBtn.classList) {
        closeBtn.classList.remove('is-tapping');
        if (typeof closeBtn.offsetWidth !== 'undefined') void closeBtn.offsetWidth;
        closeBtn.classList.add('is-tapping');
        setTimeout(() => {
          if (closeBtn && closeBtn.classList) closeBtn.classList.remove('is-tapping');
        }, 400);
      }
      currentSelectedChartStatus = null;
      const panel = document.getElementById('chartStatusDetailPanel');
      if (panel) {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
      }
      renderAttendancePieChart(currentSelectedChartClass);
    }

    function updateChartDetailTabsPill(statusKey) {
      const pill = document.getElementById('chartDetailTabsPill');
      const tabsWrap = document.getElementById('chartDetailTabs');
      if (!pill || !tabsWrap || !statusKey) return;

      const cap = statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
      const activeTab = document.getElementById('chartTab' + cap);
      if (!activeTab) return;

      const idxMap = { hadir: 0, izin: 1, sakit: 2, alpa: 3 };
      const width = activeTab.offsetWidth || 0;
      const left = activeTab.offsetLeft || 0;

      if (width > 0) {
        pill.style.width = width + 'px';
        pill.style.transform = `translate3d(${Math.max(0, left - 3)}px, 0, 0)`;
        pill.style.opacity = '1';
      } else if (statusKey in idxMap) {
        pill.style.width = '24%';
        pill.style.transform = `translate3d(${idxMap[statusKey] * 100}%, 0, 0)`;
        pill.style.opacity = '1';
      }
    }

    function renderChartStatusDetailPanel() {
      const panel = document.getElementById('chartStatusDetailPanel');
      const listEl = document.getElementById('chartStatusDetailList');
      const headingEl = document.getElementById('chartDetailHeading');
      const subEl = document.getElementById('chartDetailSubheading');
      const iconEl = document.getElementById('chartDetailBadgeIcon');

      if (!panel || !listEl) return;

      if (!currentSelectedChartStatus || !CHART_STATUS_META[currentSelectedChartStatus]) {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        return;
      }

      const meta = CHART_STATUS_META[currentSelectedChartStatus];
      const items = getChartStatusRecords(currentSelectedChartStatus, currentSelectedChartClass);

      if (headingEl) headingEl.innerText = `Daftar Santri — ${meta.label}`;
      if (subEl) subEl.innerText = `${currentSelectedChartClass} • ${items.length} Santri`;
      if (iconEl) {
        iconEl.style.background = meta.bg;
        iconEl.style.color = meta.color;
        iconEl.innerHTML = meta.icon;
      }

      // Update quick tab buttons & Apple-style sliding segmented pill
      ['hadir', 'izin', 'sakit', 'alpa'].forEach(key => {
        const cap = key.charAt(0).toUpperCase() + key.slice(1);
        const tab = document.getElementById('chartTab' + cap);
        if (tab) {
          if (key === currentSelectedChartStatus) tab.classList.add('active');
          else tab.classList.remove('active');
        }
      });
      updateChartDetailTabsPill(currentSelectedChartStatus);

      if (items.length === 0) {
        listEl.innerHTML = `
          <div class="chart-detail-empty">
            Tidak ada data santri berstatus <strong>${meta.label}</strong> pada filter <strong>${currentSelectedChartClass}</strong>.
          </div>
        `;
      } else {
        listEl.innerHTML = items.map((item, idx) => {
          const initials = (item.studentName || 'S')
            .split(' ')
            .map(w => w[0] || '')
            .slice(0, 2)
            .join('')
            .toUpperCase();
          const avatarHtml = item.avatar
            ? `<img src="${item.avatar}" alt="${item.studentName}" class="chart-student-avatar" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div class="chart-student-initials ${item.status}" style="display:none;">${initials}</div>`
            : `<div class="chart-student-initials ${item.status}">${initials}</div>`;
          const dateDisp = typeof formatIndoDate === 'function' && item.date ? formatIndoDate(item.date) : item.date;
          const noteHtml = item.note ? `<span class="chart-student-note">• ${item.note}</span>` : '';

          return `
            <div class="chart-student-item ${item.status}" style="--stagger-idx:${idx};" onclick="if(typeof openAttendanceResultModal==='function'){openAttendanceResultModal('${item.recordId}');}">
              <div class="chart-student-avatar-wrap">
                ${avatarHtml}
                <span class="chart-student-dot ${item.status}"></span>
              </div>
              <div class="chart-student-body">
                <div class="chart-student-name">${item.studentName}</div>
                <div class="chart-student-badges">
                  <span class="chart-badge-class">${item.className}</span>
                  <span class="chart-badge-subject">${item.subject}</span>
                </div>
                <div class="chart-student-meta">
                  <span>${dateDisp || 'Tercatat'}</span>
                  <span>• Jam Ke-${item.periodNumber}</span>
                  ${noteHtml}
                </div>
              </div>
            </div>
          `;
        }).join('');
      }

      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
    }

    function normalizeChartClassName(name) {
      if (!name || name === 'Semua Kelas' || name === 'Semua') return 'Semua Kelas';
      const cleaned = name.replace(/^Kelas\s+/i, '').trim();
      return cleaned ? `Kelas ${cleaned}` : 'Semua Kelas';
    }

    function syncClassAttendanceStats() {
      const statsMap = {
        'Semua Kelas': { hadir: 0, izin: 0, sakit: 0, alpa: 0 }
      };

      if (typeof mockStudents !== 'undefined' && Array.isArray(mockStudents)) {
        mockStudents.forEach(s => {
          if (!s.className) return;
          const key = normalizeChartClassName(s.className);
          if (!statsMap[key]) statsMap[key] = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
        });
      }

      if (typeof mockAttendanceRecords !== 'undefined' && Array.isArray(mockAttendanceRecords)) {
        mockAttendanceRecords.forEach(record => {
          const key = normalizeChartClassName(record.className);
          if (!statsMap[key]) statsMap[key] = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };

          (record.items || []).forEach(item => {
            const st = (item.status || '').toLowerCase();
            if (st === 'hadir') {
              statsMap['Semua Kelas'].hadir++;
              statsMap[key].hadir++;
            } else if (st === 'izin') {
              statsMap['Semua Kelas'].izin++;
              statsMap[key].izin++;
            } else if (st === 'sakit') {
              statsMap['Semua Kelas'].sakit++;
              statsMap[key].sakit++;
            } else if (st === 'alfa' || st === 'alpa') {
              statsMap['Semua Kelas'].alpa++;
              statsMap[key].alpa++;
            }
          });
        });
      }

      classAttendanceStats = statsMap;
      return statsMap;
    }

    function syncChartClassFilterOptions() {
      const selClass = document.getElementById('chartClassSelect');
      if (!selClass) return;

      const keys = Object.keys(classAttendanceStats).filter(k => k !== 'Semua Kelas');
      if (keys.length === 0) return;

      const currentVal = selClass.value || currentSelectedChartClass || 'Semua Kelas';
      selClass.innerHTML = ['Semua Kelas', ...keys].map(k => `<option value="${k}">${k}</option>`).join('');
      if (classAttendanceStats[currentVal]) {
        selClass.value = currentVal;
      } else {
        selClass.value = 'Semua Kelas';
        currentSelectedChartClass = 'Semua Kelas';
      }
    }

    function onClassChartFilterChange(className) {
      currentSelectedChartClass = className;
      renderAttendancePieChart(className);
      if (currentSelectedChartStatus) {
        renderChartStatusDetailPanel();
      }
    }

    function renderAttendancePieChart(className) {
      syncClassAttendanceStats();
      syncChartClassFilterOptions();

      if (!className) className = currentSelectedChartClass || 'Semua Kelas';
      const stats = classAttendanceStats[className] || classAttendanceStats['Semua Kelas'] || { hadir: 0, izin: 0, sakit: 0, alpa: 0 };

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
      const elCenterLabel = document.getElementById('pieCenterLabel');
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

      // Highlight legend cards sesuai kriteria aktif
      const legendGrid = document.querySelector('.pie-chart-legend-grid');
      if (legendGrid) {
        if (currentSelectedChartStatus) legendGrid.classList.add('has-active');
        else legendGrid.classList.remove('has-active');
      }
      ['hadir', 'izin', 'sakit', 'alpa'].forEach(key => {
        const cap = key.charAt(0).toUpperCase() + key.slice(1);
        const card = document.getElementById('legendCard' + cap);
        if (card) {
          if (currentSelectedChartStatus === key) card.classList.add('active');
          else card.classList.remove('active');
        }
      });

      const pctByKey = { hadir: pctHadir, izin: pctIzin, sakit: pctSakit, alpa: pctAlpa };
      if (elCenterRate) {
        const activeMeta = currentSelectedChartStatus ? CHART_STATUS_META[currentSelectedChartStatus] : null;
        const rateVal = activeMeta ? pctByKey[currentSelectedChartStatus] : pctHadir;
        elCenterRate.innerText = rateVal.toFixed(0) + '%';
        elCenterRate.style.color = activeMeta ? activeMeta.color : 'var(--primary)';
        if (elCenterLabel) elCenterLabel.innerText = activeMeta ? activeMeta.label : 'Hadir';
        if (elCenterRate.classList) {
          elCenterRate.classList.remove('pie-center-pop');
          if (typeof elCenterRate.offsetWidth !== 'undefined') void elCenterRate.offsetWidth;
          elCenterRate.classList.add('pie-center-pop');
        }
      }

      // Render SVG Donut Chart Slices (interaktif saat diklik)
      const svg = document.getElementById('attendancePieChartSvg');
      if (!svg) return;

      const r = 68;
      const c = 2 * Math.PI * r; // ~ 427.2566
      const strokeWidth = 26;

      const slices = [
        { key: 'hadir', label: 'Hadir', pct: pctHadir, color: '#16A34A', count: hadir },
        { key: 'izin', label: 'Izin', pct: pctIzin, color: '#2563EB', count: izin },
        { key: 'sakit', label: 'Sakit', pct: pctSakit, color: '#F59E0B', count: sakit },
        { key: 'alpa', label: 'Alpa', pct: pctAlpa, color: '#DC2626', count: alpa }
      ];

      let currentOffset = 0;
      let slicesHtml = '';

      slices.forEach(slice => {
        if (slice.pct <= 0) return;
        const sliceLength = (slice.pct / 100) * c;
        const activeCls = currentSelectedChartStatus
          ? (currentSelectedChartStatus === slice.key ? ' is-active' : ' is-dimmed')
          : '';
        slicesHtml += `
          <circle 
            class="pie-slice${activeCls}"
            cx="100" 
            cy="100" 
            r="${r}" 
            fill="none" 
            stroke="${slice.color}" 
            stroke-width="${strokeWidth}" 
            stroke-dasharray="${sliceLength.toFixed(2)} ${c.toFixed(2)}" 
            stroke-dashoffset="${(-currentOffset).toFixed(2)}"
            onclick="toggleChartStatusDetail('${slice.key}')"
            style="cursor: pointer;"
          >
            <title>${slice.label}: ${slice.pct.toFixed(1)}% (${slice.count} Santri) — Klik untuk lihat daftar</title>
          </circle>
        `;
        currentOffset += sliceLength;
      });

      const svgHtml = `
        <circle cx="100" cy="100" r="${r}" fill="none" stroke="#F1F5F9" stroke-width="${strokeWidth}" />
        <g transform="rotate(-90 100 100)">
          ${slicesHtml}
        </g>
      `;

      svg.innerHTML = svgHtml;
      if (currentSelectedChartStatus) {
        renderChartStatusDetailPanel();
      }
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
    // Helper: Mengambil daftar mapel, kelas, dan waktu yang diampu oleh ustadz pada hari tertentu
    function getTeacherScheduleForDay(teacherName, targetDay = 'Senin') {
      if (typeof mockSchedules === 'undefined') return [];
      const clean = (teacherName || '')
        .toLowerCase()
        .replace('ustadzah', '')
        .replace('ustadz', '')
        .replace('s.pd.i', '')
        .replace(',', '')
        .trim();

      return mockSchedules
        .filter(s => {
          const matchDay = targetDay === 'Semua' || s.day === targetDay;
          const sTeacher = (s.teacherName || '').toLowerCase();
          const matchTeacher = sTeacher.includes(clean) || clean.includes(sTeacher.replace('ustadz', '').replace('ustadzah', '').trim());
          return matchDay && matchTeacher;
        })
        .map(s => ({
          scheduleId: s.id,
          subject: s.subject,
          className: s.className.startsWith('Kelas') ? s.className : `Kelas ${s.className}`,
          time: `${s.startTime} - ${s.endTime} WIB`,
          periodNumber: s.periodNumber
        }));
    }

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
        teachingList: [
          { scheduleId: 'sch_001', subject: 'Fiqih', className: 'Kelas VII A', time: '07:30 - 08:15 WIB', periodNumber: 1 },
          { scheduleId: 'sch_005', subject: 'Fiqih', className: 'Kelas VIII A', time: '08:15 - 09:00 WIB', periodNumber: 2 }
        ],
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
        teachingList: [
          { scheduleId: 'sch_002a', subject: 'Bahasa Arab', className: 'Kelas VIII B', time: '07:30 - 08:15 WIB', periodNumber: 1 },
          { scheduleId: 'sch_002b', subject: 'Bahasa Arab', className: 'Kelas VII A', time: '08:15 - 09:00 WIB', periodNumber: 2 }
        ],
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
        teachingList: [
          { scheduleId: 'sch_003a', subject: 'Al-Qur\'an Hadits', className: 'Kelas VII B', time: '07:30 - 08:15 WIB', periodNumber: 1 },
          { scheduleId: 'sch_003b', subject: 'Akidah Akhlak', className: 'Kelas VII A', time: '08:15 - 09:00 WIB', periodNumber: 2 }
        ],
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
        teachingList: [
          { scheduleId: 'sch_004', subject: 'Nahwu Shorof', className: 'Kelas VIII A', time: '07:30 - 08:15 WIB', periodNumber: 1 }
        ],
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
        teachingList: [
          { scheduleId: 'sch_006', subject: 'Matematika', className: 'Kelas IX A', time: '07:30 - 08:15 WIB', periodNumber: 1 }
        ],
        timestamp: Date.now() - 1000 * 60 * 79
      }
    ];

    // Render 3 Aktivitas Ustadz Terakhir beserta Daftar Mapel, Kelas & Waktu ke Kartu Beranda
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

      displayItems.forEach((item, idx) => {
        const badgeClass = item.statusType === 'hadir' ? 'hadir' : (item.statusType === 'info' ? 'info' : 'izin');
        const badgeIcon = item.statusType === 'hadir'
          ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>`
          : (item.statusType === 'info'
            ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
            : `!`);

        // Mengambil daftar mapel, kelas, dan waktu yang diampu oleh ustadz pada hari itu
        const tList = (item.teachingList && item.teachingList.length > 0)
          ? item.teachingList
          : (typeof getTeacherScheduleForDay === 'function' ? getTeacherScheduleForDay(item.teacherName, 'Senin') : [
              { scheduleId: 'sch_001', subject: item.subject, className: item.className, time: `${item.time} WIB`, periodNumber: 1 }
            ]);

        let teachingHtml = '';
        if (tList && tList.length > 0) {
          const boxId = 'dynTeachBox_' + idx;
          const teacherEscaped = (item.teacherName || '').replace(/'/g, "\\'");
          teachingHtml = `
            <div class="activity-teaching-toggle-wrap">
              <button type="button" class="btn-teaching-toggle" onclick="toggleTeachingBox('${boxId}', this)" aria-expanded="false" title="Tampilkan/Sembunyikan Jadwal Mapel">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span class="btn-toggle-label">Lihat Jadwal</span>
                <svg class="chevron-arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
            <div class="activity-teaching-box" id="${boxId}" style="display: none;">
              <div class="activity-teaching-header">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span>Jadwal Mapel Diampu Hari Ini:</span>
              </div>
              <div class="activity-teaching-list">
                ${tList.map(t => `
                  <div class="activity-teaching-item">
                    <div class="activity-teaching-left">
                      <span class="teaching-period-badge">${t.periodNumber ? 'Jam Ke-' + t.periodNumber : 'KBM'}</span>
                      <strong class="teaching-subject-name">${t.subject}</strong>
                      <span class="teaching-class-badge">${t.className}</span>
                    </div>
                    <div class="activity-teaching-time">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
                      <span>${t.time}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }

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
              </div>
              ${teachingHtml}
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
    }

    // Toggle Tampilan Jadwal Mengajar Ustadz di Kartu Beranda (1 button kecil rapi)
    function toggleTeachingBox(boxId, btn) {
      if (typeof document === 'undefined') return;
      const box = document.getElementById(boxId);
      if (!box) return;
      const isHidden = box.style.display === 'none' || (typeof getComputedStyle !== 'undefined' && getComputedStyle(box).display === 'none');
      if (isHidden) {
        box.style.display = 'block';
        if (btn) {
          btn.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
          const label = btn.querySelector('.btn-toggle-label');
          if (label) {
            if (!btn.dataset.prevLabel) {
              btn.dataset.prevLabel = label.innerText;
            }
            label.innerText = 'Tutup Jadwal';
          }
        }
      } else {
        box.style.display = 'none';
        if (btn) {
          btn.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
          const label = btn.querySelector('.btn-toggle-label');
          if (label) {
            label.innerText = btn.dataset.prevLabel || 'Lihat Jadwal';
          }
        }
      }
    }

    // Modal Rincian Jadwal Mengajar Harian Ustadz
    function openTeacherDailyScheduleDetail(teacherName, day) {
      day = day || 'Senin';
      const schedules = typeof getTeacherScheduleForDay === 'function'
        ? getTeacherScheduleForDay(teacherName, day)
        : [];

      if (!schedules || schedules.length === 0) {
        showAppModal(
          `Jadwal ${teacherName}`,
          `<p style="text-align:center; padding:16px; color:#64748b;">Tidak ada jadwal mengajar pada hari ${day}.</p>`,
          'Tutup',
          closeModal
        );
        return;
      }

      let rows = schedules.map(s => {
        const schId = s.scheduleId || 'sch_001';
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; margin-bottom:8px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px;">
            <div>
              <div style="font-weight:600; color:#0f172a; font-size:13px;">${s.subject} - <span style="color:#059669;">${s.className}</span></div>
              <div style="font-size:11px; color:#64748b; margin-top:2px;">${s.periodNumber ? 'Jam Ke-' + s.periodNumber + ' • ' : ''}${s.time}</div>
            </div>
            <button type="button" class="btn-item-detail-shortcut" onclick="closeModal(); if (typeof openScheduleDetail === 'function') openScheduleDetail('${schId}', 'pageHome');" style="padding:4px 8px; font-size:11px; display:inline-flex; align-items:center; gap:3px;">
              <span>Detail</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        `;
      }).join('');

      showAppModal(
        `Jadwal Mengajar: ${teacherName}`,
        `
          <div style="margin-bottom:12px; font-size:12.5px; color:#475569;">
            Daftar mata pelajaran yang diampu pada hari <strong>${day}</strong>:
          </div>
          <div style="max-height:360px; overflow-y:auto; padding-right:2px;">
            ${rows}
          </div>
        `,
        'Tutup',
        closeModal
      );
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

      const activeTeachingList = (activity.teachingList && activity.teachingList.length > 0)
        ? activity.teachingList
        : (typeof getTeacherScheduleForDay === 'function' ? getTeacherScheduleForDay(activity.teacherName || 'Ustadz Ahmad Fauzi', 'Senin') : [
            {
              subject: activity.subject || 'Fiqih',
              className: activity.className || 'Kelas VII A',
              time: `${activity.time || timeStr} WIB`,
              periodNumber: 1
            }
          ]);

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
        teachingList: activeTeachingList,
        timestamp: Date.now()
      };

      mockUstadzActivities.unshift(newAct);
      renderRecentActivities();
    }

    // Modal Riwayat Lengkap Pengajar Hari Ini (Lihat Semua)
    function openViewAllActivities() {
      if (!mockUstadzActivities || mockUstadzActivities.length === 0) {
        showAppModal('Pengajar Hari Ini', '<p style="text-align:center; padding:16px; color:#64748b;">Belum ada data pengajar hari ini.</p>', 'Tutup', closeModal);
        return;
      }

      let rowsHtml = '';
      mockUstadzActivities.forEach(item => {
        const badgeColor = item.statusType === 'hadir' ? '#16A34A' : '#2563EB';
        const tList = (item.teachingList && item.teachingList.length > 0)
          ? item.teachingList
          : (typeof getTeacherScheduleForDay === 'function' ? getTeacherScheduleForDay(item.teacherName, 'Senin') : []);

        let teachingHtml = '';
        if (tList && tList.length > 0) {
          teachingHtml = `
            <div style="margin-top:6px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:6px 8px;">
              <div style="font-size:11px; font-weight:700; color:#475569; display:flex; align-items:center; gap:5px; margin-bottom:4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0E6838" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span>Jadwal Mapel Diampu Hari Ini:</span>
              </div>
              <div style="display:flex; flex-direction:column; gap:4px;">
                ${tList.map(t => `
                  <div style="display:flex; justify-content:space-between; align-items:center; background:#FFF; border:1px solid #EDF2F7; padding:4px 8px; border-radius:5px; font-size:11.5px; flex-wrap:wrap; gap:6px;">
                    <div style="display:flex; align-items:center; gap:5px;">
                      <span style="font-size:9.5px; font-weight:700; background:#DCFCE7; color:#074724; padding:1px 5px; border-radius:3px;">${t.periodNumber ? 'Jam Ke-' + t.periodNumber : 'KBM'}</span>
                      <strong style="color:#0F172A;">${t.subject}</strong>
                      <span style="color:#475569; background:#F1F5F9; padding:1px 5px; border-radius:3px; font-size:10.5px;">${t.className}</span>
                    </div>
                    <div style="color:#0E6838; font-weight:600; font-size:11px;">
                      🕒 ${t.time}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }

        rowsHtml += `
          <div style="padding:12px 0; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
            <div style="display:flex; align-items:flex-start; gap:10px; flex:1;">
              <img src="${item.avatar || 'assets/images/santri_ahmad.png'}" style="width:38px; height:38px; border-radius:50%; object-fit:cover; margin-top:2px; flex-shrink:0;" onerror="this.src='assets/images/logo.png'">
              <div style="flex:1;">
                <div style="font-weight:700; color:#0f172a; font-size:13.5px;">${item.teacherName}</div>
                <div style="font-size:12px; color:#64748b; margin-top:2px;">
                  <span style="color:${badgeColor}; font-weight:700;">${item.action}</span>
                </div>
                ${item.summary ? `<div style="font-size:11px; color:#94a3b8; margin-top:2px;">${item.summary}</div>` : ''}
                ${teachingHtml}
              </div>
            </div>
          </div>
        `;
      });

      showAppModal(
        'Pengajar Hari Ini',
        `<div style="max-height:420px; overflow-y:auto; text-align:left; font-size:13px; padding-right:4px;">${rowsHtml}</div>`,
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
      if (typeof closeTeacherNotifPanel === 'function') closeTeacherNotifPanel();
      if (typeof hideReminderFloatingToast === 'function') hideReminderFloatingToast();
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

    if (typeof window !== 'undefined') {
      window.toggleTeachingBox = toggleTeachingBox;
      window.openTeacherDailyScheduleDetail = openTeacherDailyScheduleDetail;
      window.renderRecentActivities = renderRecentActivities;
      window.getTeacherScheduleForDay = getTeacherScheduleForDay;
      window.toggleChartStatusDetail = toggleChartStatusDetail;
      window.openChartStatusDetail = openChartStatusDetail;
      window.closeChartStatusDetail = closeChartStatusDetail;
    }
