    /* ==========================================================================
       MODUL DATA SANTRI — LOGIKA JAVASCRIPT (SEKSI C, D, E, F, G, H)
       Selaras dengan:
       - lib/features/students/data/models/student_model.dart
       - lib/features/students/data/services/student_service.dart
       ========================================================================== */

    // Data Dummy Awal Santri (Minimal 10, disediakan 12 dengan variasi putra/putri, kelas VII-IX, kamar berbeda, aktif/nonaktif)
    let mockStudents = [
      {
        id: 'SNT-001',
        nis: '2024001',
        fullName: 'Ahmad Fauzi',
        gender: 'Putra',
        className: 'VII A',
        room: 'Al-Fatih 01',
        birthPlace: 'Sumenep',
        birthDate: '2011-04-12',
        address: 'Dusun Pajenassem, Arjasa, Kangean, Sumenep',
        parentName: 'H. Muhammad Syukri',
        parentPhone: '081234567891',
        enrollmentDate: '2024-07-15',
        isActive: true,
        avatar: 'assets/images/santri_ahmad.png'
      },
      {
        id: 'SNT-002',
        nis: '2024002',
        fullName: 'Siti Aisyah',
        gender: 'Putri',
        className: 'VIII B',
        room: 'Khadijah 02',
        birthPlace: 'Surabaya',
        birthDate: '2010-08-23',
        address: 'Jl. Rungkut Asri No. 45, Rungkut, Surabaya',
        parentName: 'Drs. H. Ahmad Dahlan',
        parentPhone: '081987654322',
        enrollmentDate: '2023-07-10',
        isActive: true,
        avatar: 'assets/images/santri_aisyah.png'
      },
      {
        id: 'SNT-003',
        nis: '2024003',
        fullName: 'Muhammad Rizky',
        gender: 'Putra',
        className: 'VII B',
        room: 'Al-Fatih 03',
        birthPlace: 'Pamekasan',
        birthDate: '2011-11-05',
        address: 'Jl. Jokotole No. 18, Barurambat Kota, Pamekasan',
        parentName: 'Bambang Irawan',
        parentPhone: '081345678912',
        enrollmentDate: '2024-07-15',
        isActive: true,
        avatar: 'assets/images/santri_rizky.png'
      },
      {
        id: 'SNT-004',
        nis: '2024004',
        fullName: 'Fatimah Zahra',
        gender: 'Putri',
        className: 'VII A',
        room: 'Khadijah 01',
        birthPlace: 'Bangkalan',
        birthDate: '2011-02-19',
        address: 'Dusun Bancaran, Bangkalan, Madura',
        parentName: 'Ustadz Abdullah Said',
        parentPhone: '081223344556',
        enrollmentDate: '2024-07-15',
        isActive: true
      },
      {
        id: 'SNT-005',
        nis: '2024005',
        fullName: 'Zaidan Al-Farisi',
        gender: 'Putra',
        className: 'IX A',
        room: 'Umar bin Khattab 02',
        birthPlace: 'Sumenep',
        birthDate: '2009-06-14',
        address: 'Desa Duko, Kec. Arjasa, Kepulauan Kangean',
        parentName: 'K.H. Faruq Mansyur',
        parentPhone: '081556677889',
        enrollmentDate: '2022-07-12',
        isActive: true
      },
      {
        id: 'SNT-006',
        nis: '2024006',
        fullName: 'Nabila Nur Azizah',
        gender: 'Putri',
        className: 'VIII A',
        room: 'Aisyah 03',
        birthPlace: 'Sidoarjo',
        birthDate: '2010-10-30',
        address: 'Perum Gading Fajar 2 Blok C, Buduran, Sidoarjo',
        parentName: 'Ir. Agus Wahyudi',
        parentPhone: '081334455667',
        enrollmentDate: '2023-07-10',
        isActive: true
      },
      {
        id: 'SNT-007',
        nis: '2024007',
        fullName: 'Bilal Habibi',
        gender: 'Putra',
        className: 'VIII B',
        room: 'Abu Bakar 01',
        birthPlace: 'Sampang',
        birthDate: '2010-03-08',
        address: 'Jl. KH. Wahid Hasyim No. 10, Sampang',
        parentName: 'H. Hasan Basri',
        parentPhone: '081998877665',
        enrollmentDate: '2023-07-10',
        isActive: true
      },
      {
        id: 'SNT-008',
        nis: '2024008',
        fullName: 'Maryam Salsabila',
        gender: 'Putri',
        className: 'IX B',
        room: 'Fatimah 02',
        birthPlace: 'Malang',
        birthDate: '2009-01-17',
        address: 'Jl. Ijen No. 22, Klojen, Kota Malang',
        parentName: 'Dr. H. Rusdianto',
        parentPhone: '081776655443',
        enrollmentDate: '2022-07-12',
        isActive: true
      },
      {
        id: 'SNT-009',
        nis: '2024009',
        fullName: 'Hamzah Asadullah',
        gender: 'Putra',
        className: 'IX A',
        room: 'Umar bin Khattab 01',
        birthPlace: 'Sumenep',
        birthDate: '2009-09-25',
        address: 'Desa Paseraman, Kec. Arjasa, Kangean',
        parentName: 'M. Thohiruddin',
        parentPhone: '081665544332',
        enrollmentDate: '2022-07-12',
        isActive: false
      },
      {
        id: 'SNT-010',
        nis: '2024010',
        fullName: 'Khadijah Al-Kubro',
        gender: 'Putri',
        className: 'VII B',
        room: 'Khadijah 03',
        birthPlace: 'Gresik',
        birthDate: '2011-07-07',
        address: 'Jl. Panglima Sudirman No. 88, Kebomas, Gresik',
        parentName: 'H. Zainal Arifin',
        parentPhone: '081887766554',
        enrollmentDate: '2024-07-15',
        isActive: true
      },
      {
        id: 'SNT-011',
        nis: '2024011',
        fullName: 'Umar Al-Faruq',
        gender: 'Putra',
        className: 'VII A',
        room: 'Al-Fatih 02',
        birthPlace: 'Probolinggo',
        birthDate: '2011-12-01',
        address: 'Jl. Pahlawan No. 04, Kanigaran, Probolinggo',
        parentName: 'H. Syamsul Huda',
        parentPhone: '081445566778',
        enrollmentDate: '2024-07-15',
        isActive: true
      },
      {
        id: 'SNT-012',
        nis: '2024012',
        fullName: 'Raihana Qanita',
        gender: 'Putri',
        className: 'VIII A',
        room: 'Aisyah 01',
        birthPlace: 'Sumenep',
        birthDate: '2010-05-14',
        address: 'Desa Laok Jang-Jang, Arjasa, Kangean',
        parentName: 'H. Abdul Ghofur',
        parentPhone: '081332211445',
        enrollmentDate: '2023-07-10',
        isActive: false
      },
      {
        id: 'SNT-013',
        nis: '2024013',
        fullName: 'Fadhil Mubarak',
        gender: 'Putra',
        className: 'X A',
        room: 'Utsman bin Affan 01',
        birthPlace: 'Sumenep',
        birthDate: '2008-08-10',
        address: 'Desa Kolo-Kolo, Arjasa, Kangean',
        parentName: 'H. Anwar Sadat',
        parentPhone: '081234567813',
        enrollmentDate: '2024-07-15',
        isActive: true
      },
      {
        id: 'SNT-014',
        nis: '2024014',
        fullName: 'Zahra An-Nisa',
        gender: 'Putri',
        className: 'X B',
        room: 'Hafshah 01',
        birthPlace: 'Surabaya',
        birthDate: '2008-03-22',
        address: 'Jl. Kutisari Indah Barat No. 12, Surabaya',
        parentName: 'H. Mansur Hidayat',
        parentPhone: '081234567814',
        enrollmentDate: '2024-07-15',
        isActive: true
      },
      {
        id: 'SNT-015',
        nis: '2024015',
        fullName: 'Rayhan Pratama',
        gender: 'Putra',
        className: 'XI A',
        room: 'Utsman bin Affan 02',
        birthPlace: 'Pamekasan',
        birthDate: '2007-11-18',
        address: 'Jl. Trunojoyo No. 44, Pamekasan',
        parentName: 'Drs. H. Mulyadi',
        parentPhone: '081234567815',
        enrollmentDate: '2023-07-10',
        isActive: true
      },
      {
        id: 'SNT-016',
        nis: '2024016',
        fullName: 'Afiqah Salma',
        gender: 'Putri',
        className: 'XI B',
        room: 'Hafshah 02',
        birthPlace: 'Sumenep',
        birthDate: '2007-06-05',
        address: 'Desa Kalikatak, Arjasa, Kangean',
        parentName: 'H. Suhaimi',
        parentPhone: '081234567816',
        enrollmentDate: '2023-07-10',
        isActive: true
      },
      {
        id: 'SNT-017',
        nis: '2024017',
        fullName: 'Lukman Al-Hakim',
        gender: 'Putra',
        className: 'XII A',
        room: 'Ali bin Abi Thalib 01',
        birthPlace: 'Sampang',
        birthDate: '2006-09-12',
        address: 'Jl. Diponegoro No. 09, Sampang',
        parentName: 'K.H. Badruddin',
        parentPhone: '081234567817',
        enrollmentDate: '2022-07-12',
        isActive: true
      },
      {
        id: 'SNT-018',
        nis: '2024018',
        fullName: 'Syifa Maulida',
        gender: 'Putri',
        className: 'XII B',
        room: 'Zainab 01',
        birthPlace: 'Bangkalan',
        birthDate: '2006-02-28',
        address: 'Jl. Pemuda Kaffa No. 56, Bangkalan',
        parentName: 'H. Marzuki',
        parentPhone: '081234567818',
        enrollmentDate: '2022-07-12',
        isActive: true
      }
    ];

    // State Filter & Form Modul Santri
    let selectedGradeFilter = 'Semua';
    let selectedGenderFilter = 'Semua';
    let studentSearchQuery = '';
    let currentDetailStudentId = null;
    let isEditingStudentMode = false;

    // Buka Halaman Daftar Santri
    function openStudentListPage() {
      if (typeof showOnlyScreenPage === 'function') {
        showOnlyScreenPage('pageStudentList');
      } else {
        document.querySelectorAll('.screen-page').forEach(function(p) {
          if (p.id === 'pageStudentList') p.classList.add('active');
          else p.classList.remove('active');
        });
      }
      if (typeof syncActiveNav === 'function') syncActiveNav('students');

      // Sesuai Butir D: Hak Akses Admin dan Guru
      const isAdmin = currentLoggedInUser && currentLoggedInUser.role === 'Admin';
      const topAddBtn = document.getElementById('sntTopAddBtn');
      const roleDesc = document.getElementById('sntRoleSubDesc');

      if (isAdmin) {
        if (topAddBtn) topAddBtn.style.display = 'inline-flex';
        if (roleDesc) roleDesc.innerText = 'Kelola data seluruh santri, kamar asrama, dan perwalian.';
      } else {
        if (topAddBtn) topAddBtn.style.display = 'none';
        if (roleDesc) roleDesc.innerText = 'Akses Khusus Guru.';
      }

      renderStudentList();
      syncStudentFilterPills(true);
    }

    // Kembali dari Daftar Santri ke Halaman Sebelumnya (Beranda)
    function backFromStudentList() {
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

    function syncStudentSlidingPill(containerId, pillId, activeSelector, immediate, modifierClass) {
      const container = document.getElementById(containerId);
      const pill = document.getElementById(pillId);
      if (!container || !pill) return;

      container.classList.add('has-sliding-pill');
      const activeChip = activeSelector && typeof container.querySelector === 'function'
        ? container.querySelector(activeSelector)
        : null;

      if (!activeChip) {
        pill.classList.remove('is-putra', 'is-putri');
        pill.style.opacity = '0';
        const prevTx = pill.dataset.lastTranslate || 'translate3d(0px, 0px, 0)';
        pill.style.transform = `${prevTx} scale(0.92)`;
        return;
      }

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
        const translateStr = `translate3d(${left}px, ${top}px, 0)`;
        pill.dataset.lastTranslate = translateStr;

        pill.classList.remove('is-putra', 'is-putri');
        if (modifierClass) pill.classList.add(modifierClass);

        if (shouldSnap) {
          pill.style.transition = 'none';
          pill.style.width = w + 'px';
          pill.style.height = h + 'px';
          pill.style.transform = immediate ? translateStr : `${translateStr} scale(0.94)`;
          void pill.offsetWidth;
          pill.style.transition = '';
        }

        pill.style.width = w + 'px';
        pill.style.height = h + 'px';
        pill.style.transform = translateStr;
        pill.style.opacity = '1';

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

    function syncStudentGradePill(immediate) {
      syncStudentSlidingPill('sntGradeFilterRow', 'sntGradeSlidingPill', '.snt-chip.active', immediate);
    }

    function syncStudentGenderPill(immediate) {
      const selector = selectedGenderFilter === 'Putra'
        ? '.snt-gchip.active-putra'
        : (selectedGenderFilter === 'Putri' ? '.snt-gchip.active-putri' : '');
      const modClass = selectedGenderFilter === 'Putra'
        ? 'is-putra'
        : (selectedGenderFilter === 'Putri' ? 'is-putri' : '');
      syncStudentSlidingPill('sntGenderFilterRow', 'sntGenderSlidingPill', selector, immediate, modClass);
    }

    function syncStudentFilterPills(immediate) {
      syncStudentGradePill(immediate);
      syncStudentGenderPill(immediate);
    }

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('resize', () => {
        syncStudentFilterPills(true);
      });
    }

    // Filter Kelas
    function setGradeFilter(grade) {
      selectedGradeFilter = grade;
      const chips = [
        { id: 'chipGradeAll', val: 'Semua' },
        { id: 'chipGradeVII', val: 'VII' },
        { id: 'chipGradeVIII', val: 'VIII' },
        { id: 'chipGradeIX', val: 'IX' },
        { id: 'chipGradeX', val: 'X' },
        { id: 'chipGradeXI', val: 'XI' },
        { id: 'chipGradeXII', val: 'XII' }
      ];
      chips.forEach(c => {
        const el = document.getElementById(c.id);
        if (el) {
          if (c.val === grade) el.classList.add('active');
          else el.classList.remove('active');
        }
      });
      syncStudentGradePill(false);
      renderStudentList();
    }

    // Filter Gender (Santri Putra / Santri Putri - toggle)
    function setGenderFilter(gender) {
      if (selectedGenderFilter === gender) {
        selectedGenderFilter = 'Semua';
      } else {
        selectedGenderFilter = gender;
      }
      const chipPutra = document.getElementById('chipGendPutra');
      const chipPutri = document.getElementById('chipGendPutri');

      if (chipPutra) chipPutra.className = 'snt-gchip' + (selectedGenderFilter === 'Putra' ? ' active-putra' : '');
      if (chipPutri) chipPutri.className = 'snt-gchip' + (selectedGenderFilter === 'Putri' ? ' active-putri' : '');

      syncStudentGenderPill(false);
      renderStudentList();
    }

    // Input Pencarian
    function handleStudentSearchInput() {
      const input = document.getElementById('sntSearchInput');
      const clearBtn = document.getElementById('sntClearSearch');
      studentSearchQuery = input.value.trim().toLowerCase();
      if (clearBtn) clearBtn.style.display = input.value ? 'inline' : 'none';
      renderStudentList();
    }

    // Bersihkan Pencarian
    function clearStudentSearch() {
      const input = document.getElementById('sntSearchInput');
      const clearBtn = document.getElementById('sntClearSearch');
      if (input) input.value = '';
      studentSearchQuery = '';
      if (clearBtn) clearBtn.style.display = 'none';
      renderStudentList();
    }

    // Render Daftar Santri & Ringkasan (Butir C & G)
    function renderStudentList() {
      // 1. Ringkasan Total, Putra, Putri
      const totalCount = mockStudents.length;
      const maleCount = mockStudents.filter(s => s.gender === 'Putra').length;
      const femaleCount = mockStudents.filter(s => s.gender === 'Putri').length;

      const totalEl = document.getElementById('sntStatTotal');
      const maleEl = document.getElementById('sntStatMale');
      const femaleEl = document.getElementById('sntStatFemale');

      if (totalEl) totalEl.innerText = totalCount;
      if (maleEl) maleEl.innerText = maleCount;
      if (femaleEl) femaleEl.innerText = femaleCount;

      // 2. Filter data
      const filtered = mockStudents.filter(s => {
        if (selectedGradeFilter !== 'Semua') {
          const parts = s.className.split(' ');
          const grade = parts.length > 0 ? parts[0] : s.className;
          if (grade !== selectedGradeFilter) return false;
        }
        if (selectedGenderFilter !== 'Semua') {
          if (s.gender !== selectedGenderFilter) return false;
        }
        if (studentSearchQuery) {
          const matchName = s.fullName.toLowerCase().includes(studentSearchQuery);
          const matchNis = s.nis.toLowerCase().includes(studentSearchQuery);
          if (!matchName && !matchNis) return false;
        }
        return true;
      });

      // 3. Counter judul hasil
      const resCountEl = document.getElementById('sntResultCount');
      if (resCountEl) {
        resCountEl.innerText = `Daftar Santri (${filtered.length})`;
      }

      // 4. Render HTML
      const container = document.getElementById('sntListContainer');
      if (!container) return;

      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding:36px 16px; background:#fff; border-radius:14px; border:1px dashed #CBD5E1;">
            <div style="font-size:32px; margin-bottom:8px;">🔍</div>
            <div style="font-size:14px; font-weight:700; color:var(--text-main);">Tidak ada santri ditemukan</div>
            <div style="font-size:12px; color:var(--text-muted); margin-top:3px;">Coba gunakan kata kunci lain atau ubah filter kelas/gender.</div>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(s => {
        const isPutra = s.gender === 'Putra';
        const genderClass = isPutra ? 'L' : 'P';
        const genderLabel = isPutra ? 'Putra' : 'Putri';
        const avatarHtml = s.avatar
          ? `<img src="${s.avatar}" class="snt-item-avatar" alt="${s.fullName}" onerror="this.outerHTML='<div class=\\'snt-item-avatar-default ${isPutra ? 'putra' : 'putri'}\\'>${s.fullName.charAt(0)}</div>'"/>`
          : `<div class="snt-item-avatar-default ${isPutra ? 'putra' : 'putri'}">${s.fullName.charAt(0)}</div>`;

        return `
          <div class="snt-item-card" onclick="openStudentDetail('${s.id}')">
            ${avatarHtml}
            <div class="snt-item-info">
              <div class="snt-item-top">
                <span class="snt-item-name">${s.fullName}</span>
              </div>
              <div class="snt-item-sub">
                <span>NIS: ${s.nis}</span>
                <span>•</span>
                <span class="snt-tag-gender ${genderClass}">${genderLabel}</span>
              </div>
              <div class="snt-item-bottom">
                <span style="display:inline-flex; align-items:center; gap:5px;">
                  <img src="assets/images/ic_graduation_cap.png" alt="Kelas" style="height:12.5px; width:auto; object-fit:contain; flex-shrink:0; vertical-align:middle; filter:brightness(0);" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:none; flex-shrink:0;"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                  <span>Kelas ${s.className}</span>
                </span>
                <span style="display:inline-flex; align-items:center; gap:4px;">
                  <span style="font-size:14px; line-height:1; display:inline-flex; align-items:center;">🏠</span>
                  <span>Kamar ${s.room}</span>
                </span>
              </div>
            </div>
            <div style="color:#94A3B8;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        `;
      }).join('');
    }

    // Buka Halaman Detail Santri (Butir E & D)
    function openStudentDetail(id) {
      currentDetailStudentId = id;
      const s = mockStudents.find(item => item.id === id);
      if (!s) return;

      const isPutra = s.gender === 'Putra';
      const avatarEl = document.getElementById('detailAvatarImg');
      if (avatarEl) {
        if (s.avatar) {
          avatarEl.src = s.avatar;
        } else {
          avatarEl.src = 'assets/images/logo.png';
        }
      }

      document.getElementById('detailFullName').innerText = s.fullName;
      document.getElementById('detailNisBadge').innerText = `NIS: ${s.nis}`;

      const statusBadge = document.getElementById('detailStatusBadge');
      if (statusBadge) {
        statusBadge.className = `snt-badge-status ${s.isActive ? 'aktif' : 'nonaktif'}`;
        statusBadge.innerText = s.isActive ? 'Aktif' : 'Nonaktif';
      }

      document.getElementById('detailNisVal').innerText = s.nis;
      document.getElementById('detailClassVal').innerText = s.className;
      document.getElementById('detailRoomVal').innerText = s.room;
      document.getElementById('detailEnrollVal').innerText = s.enrollmentDate;
      document.getElementById('detailStatusVal').innerText = s.isActive ? 'Aktif' : 'Nonaktif';

      document.getElementById('detailGenderVal').innerText = isPutra ? 'Laki-laki' : 'Perempuan';

      // Usia santri
      let ageStr = '';
      if (s.birthDate) {
        const birthYear = new Date(s.birthDate).getFullYear();
        const age = new Date().getFullYear() - birthYear;
        ageStr = ` (${age} thn)`;
      }
      document.getElementById('detailTtlVal').innerText = `${s.birthPlace || '-'}, ${s.birthDate || '-'}${ageStr}`;
      document.getElementById('detailAddressVal').innerText = s.address || '-';
      document.getElementById('detailParentNameVal').innerText = s.parentName || '-';
      document.getElementById('detailParentPhoneVal').innerText = s.parentPhone || '-';

      // Sesuai Butir D & Permintaan User: Hak Akses Admin vs Guru di Halaman Detail & Kamera Profil
      const isAdmin = currentLoggedInUser && currentLoggedInUser.role === 'Admin';
      const detailTopAdminActions = document.getElementById('sntDetailAdminActions');
      const detailBottomAdminActions = document.getElementById('detailBottomAdminActions');
      const changePhotoBtn = document.getElementById('sntChangePhotoBtn');

      if (isAdmin) {
        if (detailTopAdminActions) detailTopAdminActions.style.display = 'flex';
        if (detailBottomAdminActions) detailBottomAdminActions.style.display = 'flex';
        if (changePhotoBtn) changePhotoBtn.style.display = 'flex';
      } else {
        if (detailTopAdminActions) detailTopAdminActions.style.display = 'none';
        if (detailBottomAdminActions) detailBottomAdminActions.style.display = 'none';
        if (changePhotoBtn) changePhotoBtn.style.display = 'none';
      }

      if (typeof showOnlyScreenPage === 'function') {
        showOnlyScreenPage('pageStudentDetail');
      } else {
        document.getElementById('pageStudentDetail').classList.add('active');
        document.getElementById('pageStudentDetail').scrollTop = 0;
      }
    }

    function backFromStudentDetail() {
      openStudentListPage();
    }

    // Formulir Santri (Butir F & D)
    function updateFormGenderStyle() {
      const isPutri = document.getElementById('genderPutriRadio').checked;
      const lblPutra = document.getElementById('labelGenderPutra');
      const lblPutri = document.getElementById('labelGenderPutri');

      if (lblPutri && lblPutra) {
        if (isPutri) {
          lblPutri.style.borderColor = '#DB2777';
          lblPutri.style.background = '#FCE7F3';
          lblPutra.style.borderColor = 'var(--border)';
          lblPutra.style.background = 'transparent';
        } else {
          lblPutra.style.borderColor = '#0284C7';
          lblPutra.style.background = '#E0F2FE';
          lblPutri.style.borderColor = 'var(--border)';
          lblPutri.style.background = 'transparent';
        }
      }
    }

    // Toggle Status Santri Aktif Switch (Interaktif)
    function toggleFormStatusSantri(e) {
      const checkbox = document.getElementById('formIsActiveCheck');
      if (!checkbox) return;
      checkbox.checked = !checkbox.checked;
      updateFormStatusSwitchUI();
    }

    function updateFormStatusSwitchUI() {
      const checkbox = document.getElementById('formIsActiveCheck');
      const desc = document.getElementById('formActiveStatusDesc');
      if (!checkbox) return;
      const isActive = checkbox.checked;
      if (desc) {
        if (isActive) {
          desc.innerText = 'Santri aktif menempuh pendidikan di pondok';
          desc.style.color = '#16A34A';
        } else {
          desc.innerText = 'Santri tidak aktif / cuti / mutasi';
          desc.style.color = '#DC2626';
        }
      }
    }

    function clearStudentFormErrors() {
      ['formNis', 'formName', 'formRoom'].forEach(field => {
        const wrap = document.getElementById(field + 'Wrapper');
        const err = document.getElementById(field + 'Error');
        if (wrap) wrap.classList.remove('error');
        if (err) err.style.display = 'none';
      });
    }

    const SNT_CAL_MONTHS_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const sntCalendarState = {
      enroll: { year: 2024, month: 6, popoverId: 'enrollCalendarPopover', wrapperId: 'formEnrollDateWrapper' },
      birth: { year: 2011, month: 3, popoverId: 'birthCalendarPopover', wrapperId: 'formBirthDateWrapper' }
    };

    function parseStudentIsoParts(iso) {
      if (!iso || typeof iso !== 'string') return null;
      const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!m) return null;
      const y = parseInt(m[1], 10), mo = parseInt(m[2], 10), d = parseInt(m[3], 10);
      if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
      return { year: y, month: mo, day: d };
    }

    function formatStudentIsoParts(y, m, d) {
      return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }

    function getStudentTodayIso() {
      const n = new Date();
      return formatStudentIsoParts(n.getFullYear(), n.getMonth() + 1, n.getDate());
    }

    function isoToDisplayDmy(iso) {
      const p = parseStudentIsoParts(iso);
      return p ? `${String(p.day).padStart(2, '0')}/${String(p.month).padStart(2, '0')}/${String(p.year).padStart(4, '0')}` : '';
    }

    function displayDmyToIso(dmy) {
      if (!dmy || typeof dmy !== 'string') return '';
      const trimmed = dmy.trim();
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
        const [d, m, y] = trimmed.split('/');
        return `${y}-${m}-${d}`;
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
      return '';
    }

    function syncEnrollDateDisplay() {
      const hiddenEl = document.getElementById('formEnrollDate');
      const dispEl = document.getElementById('formEnrollDisplay');
      if (hiddenEl && dispEl) {
        const desc = typeof HTMLInputElement !== 'undefined'
          ? Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
          : null;
        const iso = desc && desc.get ? desc.get.call(hiddenEl) : hiddenEl.value;
        dispEl.value = isoToDisplayDmy(iso);
      }
    }

    function syncEnrollDateFromDisplay(val) {
      const iso = displayDmyToIso(val);
      const hiddenEl = document.getElementById('formEnrollDate');
      if (hiddenEl && iso) {
        const desc = typeof HTMLInputElement !== 'undefined'
          ? Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
          : null;
        if (desc && desc.set) desc.set.call(hiddenEl, iso);
        else hiddenEl.value = iso;
        const p = parseStudentIsoParts(iso);
        if (p) {
          sntCalendarState.enroll.year = p.year;
          sntCalendarState.enroll.month = p.month - 1;
          const pop = document.getElementById('enrollCalendarPopover');
          if (pop && pop.classList.contains('open')) renderStudentCalendarPopover('enroll');
        }
      }
    }

    function getStudentDateIso(type) {
      if (type === 'enroll') {
        const el = document.getElementById('formEnrollDate');
        return el && el.value ? el.value : '';
      }
      const birthInp = document.getElementById('formBirthDate');
      const isoFromText = birthInp ? displayDmyToIso(birthInp.value) : '';
      if (isoFromText) return isoFromText;
      const nativeEl = document.getElementById('nativeBirthDatePicker');
      return nativeEl && nativeEl.value ? nativeEl.value : '';
    }

    function renderStudentCalendarPopover(type, stepDir) {
      const st = sntCalendarState[type];
      if (!st) return;
      const pop = document.getElementById(st.popoverId);
      if (!pop) return;

      const selectedIso = getStudentDateIso(type);
      const todayIso = getStudentTodayIso();

      const firstWeekday = new Date(st.year, st.month, 1).getDay();
      const daysInMonth = new Date(st.year, st.month + 1, 0).getDate();
      const prevMonthDays = new Date(st.year, st.month, 0).getDate();

      const cells = [];
      for (let i = firstWeekday - 1; i >= 0; i--) {
        const d = prevMonthDays - i;
        const m = st.month === 0 ? 12 : st.month;
        const y = st.month === 0 ? st.year - 1 : st.year;
        cells.push({ day: d, iso: formatStudentIsoParts(y, m, d), outside: true });
      }
      for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ day: d, iso: formatStudentIsoParts(st.year, st.month + 1, d), outside: false });
      }
      const trailing = (7 - (cells.length % 7)) % 7;
      for (let d = 1; d <= trailing; d++) {
        const m = st.month === 11 ? 1 : st.month + 2;
        const y = st.month === 11 ? st.year + 1 : st.year;
        cells.push({ day: d, iso: formatStudentIsoParts(y, m, d), outside: true });
      }

      const monthAnimClass = stepDir === 'month-up' ? ' att-step-roll-up' : (stepDir === 'month-down' ? ' att-step-roll-down' : '');
      const yearAnimClass = stepDir === 'year-up' ? ' att-step-roll-up' : (stepDir === 'year-down' ? ' att-step-roll-down' : '');

      pop.innerHTML = `
        <div class="att-cal-steppers-bar">
          <div class="att-cal-mini-stepper" aria-label="Stepper Bulan">
            <button type="button" class="att-cal-step-btn" onclick="stepStudentCalendarMonth('${type}', -1)" title="Bulan sebelumnya" aria-label="Bulan sebelumnya">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span class="att-cal-step-value-wrap">
              <span class="att-cal-step-value${monthAnimClass}" id="sntCalMonthLabel_${type}">${SNT_CAL_MONTHS_FULL[st.month]}</span>
            </span>
            <button type="button" class="att-cal-step-btn" onclick="stepStudentCalendarMonth('${type}', 1)" title="Bulan berikutnya" aria-label="Bulan berikutnya">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div class="att-cal-mini-stepper is-year" aria-label="Stepper Tahun">
            <button type="button" class="att-cal-step-btn" onclick="stepStudentCalendarYear('${type}', -1)" title="Kurangi tahun" aria-label="Kurangi tahun">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <span class="att-cal-step-value-wrap">
              <span class="att-cal-step-value${yearAnimClass}" id="sntCalYearLabel_${type}">${st.year}</span>
            </span>
            <button type="button" class="att-cal-step-btn" onclick="stepStudentCalendarYear('${type}', 1)" title="Tambah tahun" aria-label="Tambah tahun">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
        </div>
        <div class="att-cal-weekdays">
          <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
        </div>
        <div class="att-cal-days-grid">
          ${cells.map(c => {
            const cls = ['att-cal-day-btn'];
            if (c.outside) cls.push('is-outside');
            if (c.iso === todayIso) cls.push('is-today');
            if (c.iso === selectedIso) cls.push('is-selected');
            return `<button type="button" class="${cls.join(' ')}" data-date="${c.iso}" onclick="selectStudentCalendarDate('${type}', '${c.iso}')">${c.day}</button>`;
          }).join('')}
        </div>
        <div class="att-cal-footer">
          <button type="button" class="att-cal-footer-btn subtle" onclick="closeStudentDatePopover('${type}')">Tutup</button>
          <button type="button" class="att-cal-footer-btn primary" onclick="selectStudentCalendarDate('${type}', '${todayIso}')">Hari Ini</button>
        </div>
      `;
    }

    function openStudentDatePopover(type) {
      const otherType = type === 'enroll' ? 'birth' : 'enroll';
      closeStudentDatePopover(otherType);

      const st = sntCalendarState[type];
      if (!st) return;
      const pop = document.getElementById(st.popoverId);
      const wrap = document.getElementById(st.wrapperId);
      if (!pop) return;

      const curIso = getStudentDateIso(type);
      const parsed = parseStudentIsoParts(curIso);
      if (parsed) {
        st.year = parsed.year;
        st.month = parsed.month - 1;
      } else {
        const def = type === 'birth' ? { y: 2011, m: 3 } : { y: new Date().getFullYear(), m: new Date().getMonth() };
        st.year = def.y;
        st.month = def.m;
      }

      renderStudentCalendarPopover(type);

      if (wrap && typeof wrap.getBoundingClientRect === 'function' && typeof window !== 'undefined') {
        const rect = wrap.getBoundingClientRect();
        const spaceBelow = (window.innerHeight || 800) - rect.bottom;
        pop.classList.toggle('open-upward', spaceBelow < 320 && rect.top > spaceBelow);
      }

      pop.classList.add('open');
      pop.setAttribute('aria-hidden', 'false');
      if (wrap) wrap.classList.add('is-cal-open');
    }

    function closeStudentDatePopover(type) {
      if (!type) {
        closeStudentDatePopover('enroll');
        closeStudentDatePopover('birth');
        return;
      }
      const st = sntCalendarState[type];
      if (!st) return;
      const pop = document.getElementById(st.popoverId);
      const wrap = document.getElementById(st.wrapperId);
      if (pop) {
        pop.classList.remove('open', 'open-upward');
        pop.setAttribute('aria-hidden', 'true');
      }
      if (wrap) wrap.classList.remove('is-cal-open');
    }

    function toggleStudentDatePopover(type) {
      const st = sntCalendarState[type];
      if (!st) return;
      const pop = document.getElementById(st.popoverId);
      if (pop && pop.classList.contains('open')) {
        closeStudentDatePopover(type);
      } else {
        openStudentDatePopover(type);
      }
    }

    function stepStudentCalendarMonth(type, delta) {
      const st = sntCalendarState[type];
      if (!st) return;
      const d = new Date(st.year, st.month + delta, 1);
      st.year = d.getFullYear();
      st.month = d.getMonth();
      renderStudentCalendarPopover(type, delta >= 0 ? 'month-up' : 'month-down');
    }

    function stepStudentCalendarYear(type, delta) {
      const st = sntCalendarState[type];
      if (!st) return;
      st.year += delta;
      renderStudentCalendarPopover(type, delta >= 0 ? 'year-up' : 'year-down');
    }

    function selectStudentCalendarDate(type, iso) {
      if (type === 'enroll') {
        const hiddenEl = document.getElementById('formEnrollDate');
        if (hiddenEl) hiddenEl.value = iso;
        syncEnrollDateDisplay();
      } else {
        const nativePicker = document.getElementById('nativeBirthDatePicker');
        if (nativePicker) nativePicker.value = iso;
        handleNativeBirthDateChange(iso);
      }
      closeStudentDatePopover(type);
    }

    // Helper Picker Tanggal Lahir (membuka kalender stepper modern)
    function triggerBirthDatePicker() {
      toggleStudentDatePopover('birth');
    }

    function handleNativeBirthDateChange(val) {
      const birthEl = document.getElementById('formBirthDate');
      if (!birthEl) return;
      if (!val) {
        birthEl.value = '';
        return;
      }
      const parts = val.split('-');
      if (parts.length === 3) {
        birthEl.value = `${parts[2]}/${parts[1]}/${parts[0]}`;
      } else {
        birthEl.value = val;
      }
    }

    function syncBirthDateToNative(val) {
      const picker = document.getElementById('nativeBirthDatePicker');
      const iso = displayDmyToIso(val);
      if (picker && iso) {
        picker.value = iso;
        const p = parseStudentIsoParts(iso);
        if (p) {
          sntCalendarState.birth.year = p.year;
          sntCalendarState.birth.month = p.month - 1;
          const pop = document.getElementById('birthCalendarPopover');
          if (pop && pop.classList.contains('open')) renderStudentCalendarPopover('birth');
        }
      }
    }

    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
      document.addEventListener('click', (e) => {
        const target = e.target;
        ['enroll', 'birth'].forEach((type) => {
          const st = sntCalendarState[type];
          const wrap = document.getElementById(st.wrapperId);
          const pop = document.getElementById(st.popoverId);
          if (pop && pop.classList.contains('open')) {
            if (wrap && typeof wrap.contains === 'function' && !wrap.contains(target)) {
              closeStudentDatePopover(type);
            }
          }
        });
      });

      const attachEnrollHook = () => {
        const el = document.getElementById('formEnrollDate');
        if (el && !el.dataset.dhDateHook && typeof HTMLInputElement !== 'undefined') {
          el.dataset.dhDateHook = '1';
          const desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
          if (desc && desc.get && desc.set) {
            Object.defineProperty(el, 'value', {
              configurable: true,
              get() { return desc.get.call(this); },
              set(v) {
                desc.set.call(this, v);
                syncEnrollDateDisplay();
              }
            });
          }
          syncEnrollDateDisplay();
        }
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachEnrollHook);
      } else {
        attachEnrollHook();
      }
    }

    // Buka Form Tambah Santri (Khusus Admin)
    function openAddStudentForm() {
      if (currentLoggedInUser && currentLoggedInUser.role !== 'Admin') {
        showToast('Akses ditolak: Hanya Administrator yang dapat menambah data santri.', 'error');
        return;
      }

      isEditingStudentMode = false;
      document.getElementById('sntFormPageTitle').innerText = 'Tambah Santri Baru';
      document.getElementById('btnSaveStudent').innerHTML = '<span>Simpan Data Santri</span>';

      clearStudentFormErrors();

      // Saran otomatis NIS baru (nomor tertinggi + 1)
      const maxNis = mockStudents.reduce((max, s) => {
        const n = parseInt(s.nis, 10);
        return isNaN(n) ? max : Math.max(max, n);
      }, 2024000);

      currentFormAvatar = 'assets/images/santri_ahmad.png';
      const formAvatarImg = document.getElementById('formAvatarImg');
      if (formAvatarImg) formAvatarImg.src = currentFormAvatar;

      document.getElementById('formNis').value = maxNis + 1;
      document.getElementById('formName').value = '';
      document.getElementById('genderPutraRadio').checked = true;
      document.getElementById('genderPutriRadio').checked = false;
      updateFormGenderStyle();
      document.getElementById('formClass').value = 'VII A';
      document.getElementById('formRoom').value = '';
      document.getElementById('formEnrollDate').value = getStudentTodayIso();
      if (typeof syncEnrollDateDisplay === 'function') syncEnrollDateDisplay();
      if (typeof closeStudentDatePopover === 'function') closeStudentDatePopover();
      document.getElementById('formBirthPlace').value = '';
      document.getElementById('formBirthDate').value = '';
      const nativePicker = document.getElementById('nativeBirthDatePicker');
      if (nativePicker) nativePicker.value = '';
      document.getElementById('formAddress').value = '';
      document.getElementById('formParentName').value = '';
      document.getElementById('formParentPhone').value = '';
      document.getElementById('formIsActiveCheck').checked = true;
      updateFormStatusSwitchUI();

      if (typeof showOnlyScreenPage === 'function') {
        showOnlyScreenPage('pageStudentForm');
      } else {
        document.getElementById('pageStudentForm').classList.add('active');
        document.getElementById('pageStudentForm').scrollTop = 0;
      }
    }

    // Buka Form Edit Santri (Khusus Admin)
    function openEditStudentForm() {
      if (currentLoggedInUser && currentLoggedInUser.role !== 'Admin') {
        showToast('Akses ditolak: Hanya Administrator yang dapat mengedit data santri.', 'error');
        return;
      }

      const s = mockStudents.find(item => item.id === currentDetailStudentId);
      if (!s) return;

      isEditingStudentMode = true;
      document.getElementById('sntFormPageTitle').innerText = 'Edit Data Santri';
      document.getElementById('btnSaveStudent').innerHTML = '<span>Perbarui Data Santri</span>';

      clearStudentFormErrors();

      currentFormAvatar = s.avatar || (s.gender === 'Putri' ? 'assets/images/santri_aisyah.png' : 'assets/images/santri_ahmad.png');
      const editFormAvatarImg = document.getElementById('formAvatarImg');
      if (editFormAvatarImg) editFormAvatarImg.src = currentFormAvatar;

      document.getElementById('formNis').value = s.nis;
      document.getElementById('formName').value = s.fullName;
      if (s.gender === 'Putri') {
        document.getElementById('genderPutriRadio').checked = true;
        document.getElementById('genderPutraRadio').checked = false;
      } else {
        document.getElementById('genderPutraRadio').checked = true;
        document.getElementById('genderPutriRadio').checked = false;
      }
      updateFormGenderStyle();
      document.getElementById('formClass').value = s.className;
      document.getElementById('formRoom').value = s.room;
      document.getElementById('formEnrollDate').value = s.enrollmentDate;
      if (typeof syncEnrollDateDisplay === 'function') syncEnrollDateDisplay();
      if (typeof closeStudentDatePopover === 'function') closeStudentDatePopover();
      document.getElementById('formBirthPlace').value = s.birthPlace || '';
      if (s.birthDate) {
        let bVal = s.birthDate;
        if (/^\d{4}-\d{2}-\d{2}$/.test(bVal)) {
          const [y, m, d] = bVal.split('-');
          document.getElementById('formBirthDate').value = `${d}/${m}/${y}`;
        } else {
          document.getElementById('formBirthDate').value = bVal;
        }
        const nativePicker = document.getElementById('nativeBirthDatePicker');
        if (nativePicker && /^\d{4}-\d{2}-\d{2}$/.test(bVal)) {
          nativePicker.value = bVal;
        }
      } else {
        document.getElementById('formBirthDate').value = '';
        const nativePicker = document.getElementById('nativeBirthDatePicker');
        if (nativePicker) nativePicker.value = '';
      }
      document.getElementById('formAddress').value = s.address || '';
      document.getElementById('formParentName').value = s.parentName || '';
      document.getElementById('formParentPhone').value = s.parentPhone || '';
      document.getElementById('formIsActiveCheck').checked = !!s.isActive;
      updateFormStatusSwitchUI();

      if (typeof showOnlyScreenPage === 'function') {
        showOnlyScreenPage('pageStudentForm');
      } else {
        document.getElementById('pageStudentForm').classList.add('active');
        document.getElementById('pageStudentForm').scrollTop = 0;
      }
    }

    function backFromStudentForm() {
      openStudentListPage();
    }

    // Simpan Formulir Santri (Tambah / Edit)
    function handleStudentFormSubmit(event) {
      event.preventDefault();
      clearStudentFormErrors();

      const nis = document.getElementById('formNis').value.trim();
      const name = document.getElementById('formName').value.trim();
      const isPutri = document.getElementById('genderPutriRadio').checked;
      const gender = isPutri ? 'Putri' : 'Putra';
      const className = document.getElementById('formClass').value;
      const room = document.getElementById('formRoom').value.trim();
      const enrollDate = document.getElementById('formEnrollDate').value;
      const birthPlace = document.getElementById('formBirthPlace').value.trim();
      const rawBirthDate = document.getElementById('formBirthDate').value.trim();
      let birthDate = rawBirthDate;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawBirthDate)) {
        const [d, m, y] = rawBirthDate.split('/');
        birthDate = `${y}-${m}-${d}`;
      }
      const address = document.getElementById('formAddress').value.trim();
      const parentName = document.getElementById('formParentName').value.trim();
      const parentPhone = document.getElementById('formParentPhone').value.trim();
      const isActive = document.getElementById('formIsActiveCheck').checked;

      let hasError = false;

      // Validasi NIS wajib
      if (!nis) {
        setFieldError('formNisWrapper', 'formNisError', 'NIS wajib diisi');
        hasError = true;
      } else {
        // Cek duplikasi NIS (Butir F)
        const duplicate = mockStudents.some(s => s.nis === nis && (!isEditingStudentMode || s.id !== currentDetailStudentId));
        if (duplicate) {
          setFieldError('formNisWrapper', 'formNisError', `NIS ${nis} sudah digunakan oleh santri lain`);
          hasError = true;
        }
      }

      // Validasi Nama minimal 3 karakter
      if (!name || name.length < 3) {
        setFieldError('formNameWrapper', 'formNameError', 'Nama lengkap santri wajib diisi (minimal 3 karakter)');
        hasError = true;
      }

      // Validasi Kamar
      if (!room) {
        setFieldError('formRoomWrapper', 'formRoomError', 'Kamar asrama santri wajib diisi');
        hasError = true;
      }

      if (hasError) {
        showToast('Mohon lengkapi seluruh kolom wajib bertanda bintang (*)', 'error');
        return;
      }

      const saveBtn = document.getElementById('btnSaveStudent');
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<div class="spinner"></div>';

      setTimeout(() => {
        saveBtn.disabled = false;

        if (isEditingStudentMode) {
          // Edit santri yang ada
          const idx = mockStudents.findIndex(s => s.id === currentDetailStudentId);
          if (idx !== -1) {
            mockStudents[idx] = {
              ...mockStudents[idx],
              avatar: currentFormAvatar || mockStudents[idx].avatar || (gender === 'Putri' ? 'assets/images/santri_aisyah.png' : 'assets/images/santri_ahmad.png'),
              nis,
              fullName: name,
              gender,
              className,
              room,
              enrollmentDate: enrollDate || mockStudents[idx].enrollmentDate,
              birthPlace,
              birthDate,
              address,
              parentName,
              parentPhone,
              isActive
            };
            showToast(`Data santri "${name}" berhasil diperbarui`, 'success');
            // Refresh detail view jika sedang terbuka
            openStudentDetail(currentDetailStudentId);
          }
        } else {
          // Tambah santri baru
          const newId = 'SNT-' + String(mockStudents.length + 1).padStart(3, '0');
          const newStudent = {
            id: newId,
            avatar: currentFormAvatar || (gender === 'Putri' ? 'assets/images/santri_aisyah.png' : 'assets/images/santri_ahmad.png'),
            nis,
            fullName: name,
            gender,
            className,
            room,
            enrollmentDate: enrollDate || new Date().toISOString().split('T')[0],
            birthPlace,
            birthDate,
            address,
            parentName,
            parentPhone,
            isActive
          };
          mockStudents.unshift(newStudent);
          showToast(`Santri baru "${name}" (NIS: ${nis}) berhasil ditambahkan`, 'success');
        }

        renderStudentList();
        backFromStudentForm();
      }, 500);
    }

    // Dialog Konfirmasi Hapus Santri (Butir D & E)
    function confirmDeleteStudent() {
      if (currentLoggedInUser && currentLoggedInUser.role !== 'Admin') {
        showToast('Akses ditolak: Hanya Administrator yang dapat menghapus data santri.', 'error');
        return;
      }

      const s = mockStudents.find(item => item.id === currentDetailStudentId);
      if (!s) return;

      showAppModal(
        'Hapus Data Santri?',
        `
        <div style="text-align:center; padding:10px 0;">
          <div style="width:50px; height:50px; border-radius:50%; background:#FEE2E2; color:#DC2626; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; font-size:24px;">
            ⚠️
          </div>
          <div style="font-size:15px; font-weight:700; color:var(--text-main); margin-bottom:6px;">
            Hapus "${s.fullName}"?
          </div>
          <p style="color:#64748B; font-size:13px; line-height:1.5; margin:0;">
            Data santri dengan NIS <strong>${s.nis}</strong> (Kelas ${s.className}) akan dihapus secara permanen dari basis data santri. Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        `,
        'Ya, Hapus Santri',
        () => {
          mockStudents = mockStudents.filter(item => item.id !== currentDetailStudentId);
          closeModal();
          backFromStudentDetail();
          renderStudentList();
          showToast(`Data santri "${s.fullName}" berhasil dihapus.`, 'success');
        }
      );
    }
  

// --- Student Profile Photo Picker Feature ---

    // ==========================================
    // FITUR FOTO PROFIL SANTRI (KHUSUS ADMIN)
    // ==========================================
    let currentPhotoPickerContext = 'detail'; // 'detail' | 'form'
    let tempSelectedPhotoUrl = '';
    let tempSelectedPhotoLabel = '';
    let currentFormAvatar = 'assets/images/santri_ahmad.png';

    const SNT_PRESETS_PUTRA = [
      { id: 'p1', label: 'Ahmad Fauzi', file: 'assets/images/santri_ahmad.png' },
      { id: 'p2', label: 'Rizky Pratama', file: 'assets/images/santri_rizky.png' },
      { id: 'p3', label: 'Santri Putra 2', file: 'assets/images/santri_putra_2.png' },
      { id: 'p4', label: 'Santri Putra 3', file: 'assets/images/santri_putra_3.png' }
    ];

    const SNT_PRESETS_PUTRI = [
      { id: 'w1', label: 'Siti Aisyah', file: 'assets/images/santri_aisyah.png' },
      { id: 'w2', label: 'Santri Putri 2', file: 'assets/images/santri_putri_2.png' },
      { id: 'w3', label: 'Santri Putri 3', file: 'assets/images/santri_putri_3.png' }
    ];

    function renderPhotoPickerGrids() {
      const gridPutra = document.getElementById('presetGridPutra');
      if (gridPutra) {
        gridPutra.innerHTML = SNT_PRESETS_PUTRA.map(item => `
          <div class="snt-photo-preset-item ${tempSelectedPhotoUrl === item.file ? 'active' : ''}" onclick="selectPhotoPreset('${item.file}', '${item.label}')" title="${item.label}">
            <img src="${item.file}" alt="${item.label}" onerror="this.src='assets/images/logo.png'">
            <div class="preset-check">✓</div>
          </div>
        `).join('');
      }

      const gridPutri = document.getElementById('presetGridPutri');
      if (gridPutri) {
        gridPutri.innerHTML = SNT_PRESETS_PUTRI.map(item => `
          <div class="snt-photo-preset-item ${tempSelectedPhotoUrl === item.file ? 'active' : ''}" onclick="selectPhotoPreset('${item.file}', '${item.label}')" title="${item.label}">
            <img src="${item.file}" alt="${item.label}" onerror="this.src='assets/images/logo.png'">
            <div class="preset-check">✓</div>
          </div>
        `).join('');
      }
    }

    function openPhotoPickerModal(context = 'detail') {
      if (!currentLoggedInUser || currentLoggedInUser.role !== 'Admin') {
        showToast('Akses ditolak: Hanya Administrator yang dapat mengubah foto profil santri.', 'error');
        return;
      }

      currentPhotoPickerContext = context;
      let targetGender = 'Putra';

      if (context === 'detail') {
        const s = mockStudents.find(item => item.id === currentDetailStudentId);
        if (s) {
          tempSelectedPhotoUrl = s.avatar || (s.gender === 'Putri' ? 'assets/images/santri_aisyah.png' : 'assets/images/santri_ahmad.png');
          tempSelectedPhotoLabel = s.fullName;
          targetGender = s.gender;
        }
      } else {
        const isPutri = document.getElementById('genderPutriRadio') && document.getElementById('genderPutriRadio').checked;
        targetGender = isPutri ? 'Putri' : 'Putra';
        tempSelectedPhotoUrl = currentFormAvatar || (targetGender === 'Putri' ? 'assets/images/santri_aisyah.png' : 'assets/images/santri_ahmad.png');
        tempSelectedPhotoLabel = 'Foto Formulir';
      }

      const previewImg = document.getElementById('photoPickerPreviewImg');
      if (previewImg) previewImg.src = tempSelectedPhotoUrl;
      const previewLbl = document.getElementById('photoPickerPreviewLabel');
      if (previewLbl) previewLbl.innerText = tempSelectedPhotoLabel;

      switchPhotoPickerTab(targetGender === 'Putri' ? 'putri' : 'putra');
      renderPhotoPickerGrids();

      document.getElementById('photoPickerModal').style.display = 'flex';
    }

    function closePhotoPickerModal() {
      const modal = document.getElementById('photoPickerModal');
      if (modal) modal.style.display = 'none';
    }

    function switchPhotoPickerTab(tab) {
      const btnPutra = document.getElementById('tabBtnPutra');
      const btnPutri = document.getElementById('tabBtnPutri');
      const btnUpload = document.getElementById('tabBtnUpload');

      const panelPutra = document.getElementById('tabPanelPutra');
      const panelPutri = document.getElementById('tabPanelPutri');
      const panelUpload = document.getElementById('tabPanelUpload');

      if (!btnPutra || !btnPutri || !btnUpload || !panelPutra || !panelPutri || !panelUpload) return;

      const activeStyle = 'background:#FFFFFF; color:#0E6838; box-shadow:0 1px 3px rgba(0,0,0,0.08);';
      const inactiveStyle = 'background:transparent; color:#64748B; box-shadow:none;';

      if (tab === 'putra') {
        btnPutra.style.cssText = 'flex:1; padding:6px 0; border:none; border-radius:8px; font-size:11.5px; font-weight:700; cursor:pointer; ' + activeStyle;
        btnPutri.style.cssText = 'flex:1; padding:6px 0; border:none; border-radius:8px; font-size:11.5px; font-weight:700; cursor:pointer; ' + inactiveStyle;
        btnUpload.style.cssText = 'flex:1; padding:6px 0; border:none; border-radius:8px; font-size:11.5px; font-weight:700; cursor:pointer; ' + inactiveStyle;
        panelPutra.style.display = 'block';
        panelPutri.style.display = 'none';
        panelUpload.style.display = 'none';
      } else if (tab === 'putri') {
        btnPutra.style.cssText = 'flex:1; padding:6px 0; border:none; border-radius:8px; font-size:11.5px; font-weight:700; cursor:pointer; ' + inactiveStyle;
        btnPutri.style.cssText = 'flex:1; padding:6px 0; border:none; border-radius:8px; font-size:11.5px; font-weight:700; cursor:pointer; ' + activeStyle;
        btnUpload.style.cssText = 'flex:1; padding:6px 0; border:none; border-radius:8px; font-size:11.5px; font-weight:700; cursor:pointer; ' + inactiveStyle;
        panelPutra.style.display = 'none';
        panelPutri.style.display = 'block';
        panelUpload.style.display = 'none';
      } else {
        btnPutra.style.cssText = 'flex:1; padding:6px 0; border:none; border-radius:8px; font-size:11.5px; font-weight:700; cursor:pointer; ' + inactiveStyle;
        btnPutri.style.cssText = 'flex:1; padding:6px 0; border:none; border-radius:8px; font-size:11.5px; font-weight:700; cursor:pointer; ' + inactiveStyle;
        btnUpload.style.cssText = 'flex:1; padding:6px 0; border:none; border-radius:8px; font-size:11.5px; font-weight:700; cursor:pointer; ' + activeStyle;
        panelPutra.style.display = 'none';
        panelPutri.style.display = 'none';
        panelUpload.style.display = 'block';
      }
    }

    function selectPhotoPreset(file, label) {
      tempSelectedPhotoUrl = file;
      tempSelectedPhotoLabel = label;
      const previewImg = document.getElementById('photoPickerPreviewImg');
      if (previewImg) previewImg.src = file;
      const previewLbl = document.getElementById('photoPickerPreviewLabel');
      if (previewLbl) previewLbl.innerText = label;
      renderPhotoPickerGrids();
    }

    function handlePhotoFileUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showToast('Format file tidak didukung. Harap pilih gambar.', 'error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showToast('Ukuran file maksimal 5MB.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        tempSelectedPhotoUrl = e.target.result;
        tempSelectedPhotoLabel = file.name || 'Foto Kustom';
        const previewImg = document.getElementById('photoPickerPreviewImg');
        if (previewImg) previewImg.src = tempSelectedPhotoUrl;
        const previewLbl = document.getElementById('photoPickerPreviewLabel');
        if (previewLbl) previewLbl.innerText = tempSelectedPhotoLabel;
        renderPhotoPickerGrids();
        showToast('Foto kustom berhasil diunggah untuk pratinjau', 'success');
      };
      reader.readAsDataURL(file);
    }

    function saveSelectedStudentPhoto() {
      if (!currentLoggedInUser || currentLoggedInUser.role !== 'Admin') {
        showToast('Akses ditolak: Hanya Administrator yang dapat mengubah foto profil santri.', 'error');
        return;
      }

      if (!tempSelectedPhotoUrl) {
        showToast('Silakan pilih salah satu foto profil terlebih dahulu.', 'error');
        return;
      }

      if (currentPhotoPickerContext === 'detail') {
        const idx = mockStudents.findIndex(item => item.id === currentDetailStudentId);
        if (idx !== -1) {
          mockStudents[idx].avatar = tempSelectedPhotoUrl;
          const detailImg = document.getElementById('detailAvatarImg');
          if (detailImg) detailImg.src = tempSelectedPhotoUrl;
          renderStudentList();
          showToast(`Foto profil ${mockStudents[idx].fullName} berhasil diperbarui!`, 'success');
        }
      } else {
        currentFormAvatar = tempSelectedPhotoUrl;
        const formImg = document.getElementById('formAvatarImg');
        if (formImg) formImg.src = tempSelectedPhotoUrl;
        showToast('Foto profil santri dipilih untuk formulir.', 'success');
      }

      closePhotoPickerModal();
    }

  
