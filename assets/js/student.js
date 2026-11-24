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

      document.getElementById('detailGenderVal').innerText = isPutra ? 'Santri Putra' : 'Santri Putri';

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

    // Helper Picker Tanggal Lahir (Format DD/MM/YYYY dengan placeholder 17/08/1945)
    function triggerBirthDatePicker() {
      const picker = document.getElementById('nativeBirthDatePicker');
      if (picker) {
        if (typeof picker.showPicker === 'function') {
          try { picker.showPicker(); return; } catch(e) {}
        }
        picker.focus();
        picker.click();
      }
    }

    function handleNativeBirthDateChange(val) {
      if (!val) {
        document.getElementById('formBirthDate').value = '';
        return;
      }
      const parts = val.split('-');
      if (parts.length === 3) {
        document.getElementById('formBirthDate').value = `${parts[2]}/${parts[1]}/${parts[0]}`;
      } else {
        document.getElementById('formBirthDate').value = val;
      }
    }

    function syncBirthDateToNative(val) {
      const picker = document.getElementById('nativeBirthDatePicker');
      if (!picker) return;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
        const [d, m, y] = val.split('/');
        picker.value = `${y}-${m}-${d}`;
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        picker.value = val;
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
      document.getElementById('formEnrollDate').value = new Date().toISOString().split('T')[0];
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

  
