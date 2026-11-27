    // ========================================================
    // MODUL PENGATURAN (SETTINGS) — ADMIN & GURU
    // ========================================================
    let pesantrenSettings = {
      namaPesantren: 'Pondok Pesantren Islam Darul Hikmah',
      alamat: 'Cellong, Arjasa, Kepulauan Kangean, Sumenep, Jawa Timur',
      telepon: '+62 812-3456-7890',
      email: 'sekretariat@darulhikmah.ponpes.id',
      tahunAjaran: '2024/2025',
      semester: 'Ganjil',
      pimpinan: "K.H. Abdullah Syafi'i"
    };

    let attendanceSettings = {
      jamMulaiKbm: '07:30',
      jamSelesaiKbm: '15:30',
      toleransiTerlambat: 15,
      minKehadiran: 75,
      autoAlfa: true,
      guruEdit: true
    };

    let notificationPreferences = {
      sesiBaru: true,
      rekapMingguan: true,
      jadwal: true,
      pengumuman: true,
      pengingatMengajar: true,
      pengingatAbsensi: true,
      leadMinutes: 15,
      suaraNotifikasi: true
    };

    let teacherMasterList = [
      'Ustadz Ahmad Fauzi',
      'Ustadzah Halimah',
      'Ustadz Mansyur Hidayat',
      'Ustadz Zulkifli',
      'Ustadzah Nurul Azizah',
      'Ustadz Abdullah Said',
      'Ustadz Lukman Hakim'
    ];
    let editingTeacherMasterIdx = -1;

    function getMergedTeacherMasterList() {
      if (typeof mockSchedules !== 'undefined' && Array.isArray(mockSchedules)) {
        mockSchedules.forEach(function(s) {
          const name = s && s.teacherName ? String(s.teacherName).trim() : '';
          if (name && !teacherMasterList.some(t => t.toLowerCase() === name.toLowerCase())) {
            teacherMasterList.push(name);
          }
        });
      }
      return teacherMasterList;
    }

    function escapeTeacherHtml(str) {
      return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function syncTeacherSelectOptions() {
      if (typeof document === 'undefined') return;
      const list = getMergedTeacherMasterList();

      const formSel = document.getElementById('schFormTeacher');
      if (formSel) {
        const prevVal = formSel.value;
        formSel.innerHTML = list.map(name => `<option value="${escapeTeacherHtml(name)}">${escapeTeacherHtml(name)}</option>`).join('');
        if (prevVal && list.includes(prevVal)) {
          formSel.value = prevVal;
        } else if (list.length > 0) {
          formSel.value = list[0];
        }
      }

      const filterSel = document.getElementById('attFilterTeacher');
      if (filterSel) {
        const prevFilter = filterSel.value || 'Semua';
        filterSel.innerHTML = '<option value="Semua">Semua Guru</option>' +
          list.map(name => `<option value="${escapeTeacherHtml(name)}">${escapeTeacherHtml(name)}</option>`).join('');
        filterSel.value = (prevFilter === 'Semua' || list.includes(prevFilter)) ? prevFilter : 'Semua';
      }
    }

    function openSettingsPage() {
      if (!currentLoggedInUser) {
        currentLoggedInUser = mockUsers[0];
      }

      if (typeof showOnlyScreenPage === 'function') {
        showOnlyScreenPage('pageSettings');
      } else {
        document.querySelectorAll('.screen-page').forEach(function(p) {
          if (p.id === 'pageSettings') p.classList.add('active');
          else p.classList.remove('active');
        });
      }

      if (typeof syncActiveNav === 'function') syncActiveNav('settings');

      // Update User Info
      const user = currentLoggedInUser;
      const initials = (user.fullName || 'DH').trim().split(' ').map(w => w[0] || '').slice(0, 2).join('').toUpperCase();
      const avEl = document.getElementById('settingsUserAvatar');
      if (avEl) avEl.innerText = initials;

      const nameEl = document.getElementById('settingsUserName');
      if (nameEl) nameEl.innerText = user.fullName;

      const subEl = document.getElementById('settingsUserSubtitle');
      if (subEl) subEl.innerText = '@' + user.username + ' • ' + (user.email || user.phoneNumber || '-');

      const badgeEl = document.getElementById('settingsUserRoleBadge');
      if (badgeEl) {
        const isAdmin = user.role === 'Admin';
        badgeEl.innerText = isAdmin ? 'Admin' : 'Guru';
        badgeEl.style.background = isAdmin ? '#DCFCE7' : '#FEF3C7';
        badgeEl.style.color = isAdmin ? '#166534' : '#92400E';
      }

      renderSettingsMenu();
    }

    function backFromSettings() {
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

    function renderSettingsMenu() {
      const container = document.getElementById('settingsContainer');
      if (!container) return;

      const isAdmin = currentLoggedInUser && currentLoggedInUser.role === 'Admin';

      let html = '';

      // Section 1: AKUN
      html += `
        <div style="font-size:11px; font-weight:700; color:#64748B; letter-spacing:0.5px; margin-bottom:8px; padding-left:4px;">AKUN</div>
        <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:14px; margin-bottom:18px; box-shadow:0 1px 3px rgba(0,0,0,0.02); overflow:hidden;">
          <div onclick="openSettingDetail('profile')" style="display:flex; align-items:center; padding:13px 16px; cursor:pointer; border-bottom:1px solid #F1F5F9; transition:background 0.15s;" onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background='#FFFFFF'">
            <div style="width:36px; height:36px; border-radius:8px; background:#F1F5F9; display:flex; align-items:center; justify-content:center; color:var(--primary); margin-right:14px; flex-shrink:0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div style="flex:1;">
              <div style="font-size:13.5px; font-weight:600; color:var(--text-main);">Profil Saya</div>
              <div style="font-size:11.5px; color:#64748B; margin-top:1px;">Informasi identitas dan kontak akun</div>
            </div>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>

          <div onclick="openSettingDetail('security')" style="display:flex; align-items:center; padding:13px 16px; cursor:pointer; ${isAdmin ? 'border-bottom:1px solid #F1F5F9; ' : ''}transition:background 0.15s;" onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background='#FFFFFF'">
            <div style="width:36px; height:36px; border-radius:8px; background:#F1F5F9; display:flex; align-items:center; justify-content:center; color:var(--primary); margin-right:14px; flex-shrink:0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div style="flex:1;">
              <div style="font-size:13.5px; font-weight:600; color:var(--text-main);">Keamanan Akun</div>
              <div style="font-size:11.5px; color:#64748B; margin-top:1px;">Kelola kata sandi dan proteksi akun</div>
            </div>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>

          ${isAdmin ? `
          <div onclick="openSettingDetail('notifications')" style="display:flex; align-items:center; padding:13px 16px; cursor:pointer; transition:background 0.15s;" onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background='#FFFFFF'">
            <div style="width:36px; height:36px; border-radius:8px; background:#F1F5F9; display:flex; align-items:center; justify-content:center; color:var(--primary); margin-right:14px; flex-shrink:0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div style="flex:1;">
              <div style="font-size:13.5px; font-weight:600; color:var(--text-main);">Notifikasi</div>
              <div style="font-size:11.5px; color:#64748B; margin-top:1px;">Atur preferensi pemberitahuan pengguna</div>
            </div>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          ` : ''}
        </div>
      `;

      // Section 2: SISTEM PESANTREN (KHUSUS ADMIN)
      if (isAdmin) {
        html += `
          <div style="font-size:11px; font-weight:700; color:#64748B; letter-spacing:0.5px; margin-bottom:8px; padding-left:4px;">SISTEM PESANTREN (KHUSUS ADMIN)</div>
          <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:14px; margin-bottom:18px; box-shadow:0 1px 3px rgba(0,0,0,0.02); overflow:hidden;">
            <div onclick="openSettingDetail('pesantren')" style="display:flex; align-items:center; padding:13px 16px; cursor:pointer; border-bottom:1px solid #F1F5F9; transition:background 0.15s;" onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background='#FFFFFF'">
              <div style="width:36px; height:36px; border-radius:8px; background:#F1F5F9; display:flex; align-items:center; justify-content:center; color:var(--primary); margin-right:14px; flex-shrink:0;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-3"/></svg>
              </div>
              <div style="flex:1;">
                <div style="font-size:13.5px; font-weight:600; color:var(--text-main);">Pengaturan Pesantren</div>
                <div style="font-size:11.5px; color:#64748B; margin-top:1px;">Konfigurasi nama, alamat, dan tahun ajaran</div>
              </div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>

            <div onclick="openSettingDetail('attendance')" style="display:flex; align-items:center; padding:13px 16px; cursor:pointer; border-bottom:1px solid #F1F5F9; transition:background 0.15s;" onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background='#FFFFFF'">
              <div style="width:36px; height:36px; border-radius:8px; background:#F1F5F9; display:flex; align-items:center; justify-content:center; color:var(--primary); margin-right:14px; flex-shrink:0;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <div style="flex:1;">
                <div style="font-size:13.5px; font-weight:600; color:var(--text-main);">Pengaturan Absensi</div>
                <div style="font-size:11.5px; color:#64748B; margin-top:1px;">Jam KBM, toleransi keterlambatan, dan izin edit</div>
              </div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>

            <div onclick="openSettingDetail('teachers')" style="display:flex; align-items:center; padding:13px 16px; cursor:pointer; transition:background 0.15s;" onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background='#FFFFFF'">
              <div style="width:36px; height:36px; border-radius:8px; background:#F1F5F9; display:flex; align-items:center; justify-content:center; color:var(--primary); margin-right:14px; flex-shrink:0;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              </div>
              <div style="flex:1;">
                <div style="font-size:13.5px; font-weight:600; color:var(--text-main);">Daftar Ustadz / Guru</div>
                <div style="font-size:11.5px; color:#64748B; margin-top:1px;">Input dan kelola nama pengajar pondok</div>
              </div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        `;
      }

      // Section 3: SESI
      html += `
        <div style="font-size:11px; font-weight:700; color:#64748B; letter-spacing:0.5px; margin-bottom:8px; padding-left:4px;">SESI</div>
        <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:14px; margin-bottom:18px; box-shadow:0 1px 3px rgba(0,0,0,0.02); overflow:hidden;">
          <div onclick="confirmLogoutFromSettings()" style="display:flex; align-items:center; padding:13px 16px; cursor:pointer; transition:background 0.15s;" onmouseover="this.style.background='#FEF2F2'" onmouseout="this.style.background='#FFFFFF'">
            <div style="width:36px; height:36px; border-radius:8px; background:#FEE2E2; display:flex; align-items:center; justify-content:center; color:#DC2626; margin-right:14px; flex-shrink:0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </div>
            <div style="flex:1;">
              <div style="font-size:13.5px; font-weight:600; color:#DC2626;">Keluar dari akun</div>
              <div style="font-size:11.5px; color:#94A3B8; margin-top:1px;">Akhiri sesi aktif pada perangkat ini</div>
            </div>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FCA5A5" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      `;

      container.innerHTML = html;
    }

    function openSettingDetail(type) {
      const isAdmin = currentLoggedInUser && currentLoggedInUser.role === 'Admin';

      // Proteksi Hak Akses (RBAC Guard)
      if ((type === 'pesantren' || type === 'attendance' || type === 'teachers') && !isAdmin) {
        showToast('Akses ditolak: Menu ini hanya dapat diakses oleh Administrator Pondok.', 'error');
        return;
      }

      const modal = document.getElementById('settingsDetailModal');
      const titleEl = document.getElementById('settingsModalTitle');
      const subTitleEl = document.getElementById('settingsModalSubtitle');
      const iconEl = document.getElementById('settingsModalIcon');
      const bodyEl = document.getElementById('settingsModalBody');
      if (!modal || !titleEl || !bodyEl) return;

      if (type === 'profile') {
        titleEl.innerText = 'Profil Saya';
        if (subTitleEl) subTitleEl.innerText = 'Kelola data identitas dan informasi kontak akun Anda';
        if (iconEl) iconEl.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

        const user = currentLoggedInUser;
        const phone = user.phone || user.phoneNumber || '';
        const initials = (user.fullName || 'DH').trim().split(' ').map(w => w[0] || '').slice(0, 2).join('').toUpperCase();
        const isAdm = user.role === 'Admin';

        bodyEl.innerHTML = `
          <div class="settings-form-container">
            <!-- Mini User Identity Card -->
            <div class="profile-identity-card">
              <div class="profile-avatar-circle">${initials}</div>
              <div class="profile-identity-info">
                <div class="profile-identity-name">${user.fullName}</div>
                <div class="profile-identity-meta">
                  <span class="profile-role-pill ${isAdm ? 'pill-admin' : 'pill-guru'}">${user.role}</span>
                  <span class="profile-identity-handle">@${user.username}</span>
                </div>
              </div>
            </div>

            <!-- Form Fields -->
            <div class="form-group">
              <label class="form-label" for="setProfileName">Nama Lengkap <span class="text-danger">*</span></label>
              <input type="text" id="setProfileName" class="form-input" value="${user.fullName}" placeholder="Masukkan nama lengkap">
            </div>

            <div class="form-group-grid">
              <div class="form-group">
                <label class="form-label">Username <span class="badge-locked">Terkunci</span></label>
                <input type="text" class="form-input form-input-readonly" value="${user.username}" disabled readonly>
                <span class="form-hint">Username login tidak dapat diubah</span>
              </div>
              <div class="form-group">
                <label class="form-label">Email <span class="badge-locked">Terkunci</span></label>
                <input type="text" class="form-input form-input-readonly" value="${user.email || '-'}" disabled readonly>
                <span class="form-hint">Email akun terdaftar</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="setProfilePhone">Nomor Kontak / Telepon <span class="text-danger">*</span></label>
              <div class="input-with-icon">
                <span class="input-icon-addon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </span>
                <input type="tel" id="setProfilePhone" class="form-input has-icon" value="${phone}" placeholder="Contoh: 081234567890">
              </div>
              <span class="form-hint">Nomor telepon/WhatsApp aktif untuk komunikasi &amp; verifikasi</span>
            </div>

            <!-- Footer Action Buttons -->
            <div class="modal-btn-row">
              <button type="button" class="btn-modal-cancel" onclick="closeSettingDetail()">Batal</button>
              <button type="button" class="btn-modal-submit" onclick="saveSettingDetail('profile')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Simpan Perubahan
              </button>
            </div>
          </div>
        `;
      } else if (type === 'security') {
        titleEl.innerText = 'Keamanan Akun';
        if (subTitleEl) subTitleEl.innerText = 'Perbarui kata sandi akun untuk menjaga keamanan akses sistem';
        if (iconEl) iconEl.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

        bodyEl.innerHTML = `
          <div class="settings-form-container">
            <div id="setSecError" class="form-alert-error" style="display:none;"></div>

            <div class="form-group">
              <label class="form-label" for="setSecCurrent">Password Saat Ini <span class="text-danger">*</span></label>
              <input type="password" id="setSecCurrent" class="form-input" placeholder="Masukkan password saat ini">
            </div>

            <div class="form-group">
              <label class="form-label" for="setSecNew">Password Baru (min. 6 karakter) <span class="text-danger">*</span></label>
              <input type="password" id="setSecNew" class="form-input" placeholder="Minimal 6 karakter">
              <span class="form-hint">Kombinasikan huruf dan angka untuk keamanan optimal</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="setSecConfirm">Konfirmasi Password Baru <span class="text-danger">*</span></label>
              <input type="password" id="setSecConfirm" class="form-input" placeholder="Ulangi password baru">
            </div>

            <div class="modal-btn-row">
              <button type="button" class="btn-modal-cancel" onclick="closeSettingDetail()">Batal</button>
              <button type="button" class="btn-modal-submit" onclick="saveSettingDetail('security')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Perbarui Password
              </button>
            </div>
          </div>
        `;
      } else if (type === 'pesantren') {
        titleEl.innerText = 'Pengaturan Pesantren';
        if (subTitleEl) subTitleEl.innerText = 'Konfigurasi profil resmi dan identitas instansi Pondok Pesantren';
        if (iconEl) iconEl.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;

        bodyEl.innerHTML = `
          <div class="settings-form-container">
            <div class="form-group">
              <label class="form-label" for="setPesName">Nama Pesantren <span class="text-danger">*</span></label>
              <input type="text" id="setPesName" class="form-input" value="${pesantrenSettings.namaPesantren}">
            </div>

            <div class="form-group">
              <label class="form-label" for="setPesAddr">Alamat Pesantren</label>
              <textarea id="setPesAddr" class="form-input form-textarea" rows="2" style="resize:vertical;">${pesantrenSettings.alamat}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="setPesPhone">Nomor Telepon Sekretariat</label>
              <input type="text" id="setPesPhone" class="form-input" value="${pesantrenSettings.telepon}">
            </div>

            <div class="form-group-grid">
              <div class="form-group">
                <label class="form-label" for="setPesYear">Tahun Ajaran</label>
                <input type="text" id="setPesYear" class="form-input" value="${pesantrenSettings.tahunAjaran}">
              </div>
              <div class="form-group">
                <label class="form-label" for="setPesSem">Semester Aktif</label>
                <select id="setPesSem" class="form-select">
                  <option value="Ganjil" ${pesantrenSettings.semester === 'Ganjil' ? 'selected' : ''}>Ganjil</option>
                  <option value="Genap" ${pesantrenSettings.semester === 'Genap' ? 'selected' : ''}>Genap</option>
                </select>
              </div>
            </div>

            <div class="modal-btn-row">
              <button type="button" class="btn-modal-cancel" onclick="closeSettingDetail()">Batal</button>
              <button type="button" class="btn-modal-submit" onclick="saveSettingDetail('pesantren')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Simpan Pengaturan
              </button>
            </div>
          </div>
        `;
      } else if (type === 'attendance') {
        titleEl.innerText = 'Pengaturan Absensi KBM';
        if (subTitleEl) subTitleEl.innerText = 'Atur jam belajar, toleransi keterlambatan, dan kebijakan absensi';
        if (iconEl) iconEl.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

        bodyEl.innerHTML = `
          <div class="settings-form-container">
            <div class="form-group-grid">
              <div class="form-group">
                <label class="form-label" for="setAttStart">Jam Mulai KBM</label>
                <input type="time" id="setAttStart" class="form-input" value="${attendanceSettings.jamMulaiKbm}">
              </div>
              <div class="form-group">
                <label class="form-label" for="setAttEnd">Jam Selesai KBM</label>
                <input type="time" id="setAttEnd" class="form-input" value="${attendanceSettings.jamSelesaiKbm}">
              </div>
            </div>

            <div class="form-group-grid">
              <div class="form-group">
                <label class="form-label" for="setAttTol">Toleransi Terlambat (menit)</label>
                <input type="number" id="setAttTol" class="form-input" value="${attendanceSettings.toleransiTerlambat}" min="0" max="60">
              </div>
              <div class="form-group">
                <label class="form-label" for="setAttMin">Min. Kehadiran Ujian (%)</label>
                <input type="number" id="setAttMin" class="form-input" value="${attendanceSettings.minKehadiran}" min="0" max="100">
              </div>
            </div>

            <div class="settings-toggle-card">
              <div>
                <div class="toggle-card-title">Peringatan Otomatis Alfa</div>
                <div class="toggle-card-desc">Notifikasi otomatis saat santri tidak ada keterangan hadir</div>
              </div>
              <label class="switch-toggle">
                <input type="checkbox" id="setAttAutoAlfa" ${attendanceSettings.autoAlfa ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>

            <div class="settings-toggle-card">
              <div>
                <div class="toggle-card-title">Izin Guru Ubah Absensi</div>
                <div class="toggle-card-desc">Izinkan dewan guru mengedit sesi absensi yang telah tersimpan</div>
              </div>
              <label class="switch-toggle">
                <input type="checkbox" id="setAttGuruEdit" ${attendanceSettings.guruEdit ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>

            <div class="modal-btn-row">
              <button type="button" class="btn-modal-cancel" onclick="closeSettingDetail()">Batal</button>
              <button type="button" class="btn-modal-submit" onclick="saveSettingDetail('attendance')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Simpan Kebijakan
              </button>
            </div>
          </div>
        `;
      } else if (type === 'notifications') {
        const isAdminUser = currentLoggedInUser && currentLoggedInUser.role === 'Admin';
        if (!isAdminUser) {
          if (typeof showToast === 'function') {
            showToast('Akses dibatasi: Pengaturan notifikasi hanya dikelola oleh Admin Pondok.', 'error');
          }
          return;
        }
        titleEl.innerText = 'Preferensi Notifikasi';
        if (subTitleEl) subTitleEl.innerText = 'Tentukan jenis pemberitahuan sistem yang ingin Anda terima';
        if (iconEl) iconEl.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`;

        bodyEl.innerHTML = `
          <div class="settings-form-container">
            <div class="settings-toggle-card">
              <div>
                <div class="toggle-card-title">Pengingat Jadwal Mengajar Guru</div>
                <div class="toggle-card-desc">Ingatkan guru secara otomatis sebelum sesi KBM dimulai</div>
              </div>
              <label class="switch-toggle">
                <input type="checkbox" id="setNotifPengingatMengajar" ${notificationPreferences.pengingatMengajar !== false ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>

            <div class="settings-toggle-card">
              <div>
                <div class="toggle-card-title">Pengingat Absensi Belum Diisi</div>
                <div class="toggle-card-desc">Notifikasi pengingat jika absensi sesi KBM belum tercatat</div>
              </div>
              <label class="switch-toggle">
                <input type="checkbox" id="setNotifPengingatAbsensi" ${notificationPreferences.pengingatAbsensi !== false ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>

            <div class="form-group" style="margin-bottom: 10px;">
              <label class="form-label" for="setNotifLeadMinutes">Waktu Pengingat Sebelum KBM</label>
              <select id="setNotifLeadMinutes" class="form-input">
                <option value="5" ${Number(notificationPreferences.leadMinutes) === 5 ? 'selected' : ''}>5 menit sebelum masuk</option>
                <option value="10" ${Number(notificationPreferences.leadMinutes) === 10 ? 'selected' : ''}>10 menit sebelum masuk</option>
                <option value="15" ${!notificationPreferences.leadMinutes || Number(notificationPreferences.leadMinutes) === 15 ? 'selected' : ''}>15 menit sebelum masuk</option>
                <option value="30" ${Number(notificationPreferences.leadMinutes) === 30 ? 'selected' : ''}>30 menit sebelum masuk</option>
              </select>
            </div>

            <div class="settings-toggle-card">
              <div>
                <div class="toggle-card-title">Suara Pengingat Notifikasi</div>
                <div class="toggle-card-desc">Putar nada lembut saat notifikasi pengingat guru muncul</div>
              </div>
              <label class="switch-toggle">
                <input type="checkbox" id="setNotifSuara" ${notificationPreferences.suaraNotifikasi !== false ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>

            <div class="settings-toggle-card">
              <div>
                <div class="toggle-card-title">Sesi Absensi Masuk</div>
                <div class="toggle-card-desc">Pemberitahuan saat sesi absensi baru tercatat oleh dewan guru</div>
              </div>
              <label class="switch-toggle">
                <input type="checkbox" id="setNotifSesi" ${notificationPreferences.sesiBaru ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>

            <div class="settings-toggle-card">
              <div>
                <div class="toggle-card-title">Rekap Kehadiran Mingguan</div>
                <div class="toggle-card-desc">Ringkasan statistik berkala absensi per pekan</div>
              </div>
              <label class="switch-toggle">
                <input type="checkbox" id="setNotifRekap" ${notificationPreferences.rekapMingguan ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>

            <div class="settings-toggle-card">
              <div>
                <div class="toggle-card-title">Perubahan Jadwal Pelajaran</div>
                <div class="toggle-card-desc">Pemberitahuan perubahan alokasi jam mengajar atau kelas</div>
              </div>
              <label class="switch-toggle">
                <input type="checkbox" id="setNotifJadwal" ${notificationPreferences.jadwal ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>

            <div class="settings-toggle-card">
              <div>
                <div class="toggle-card-title">Pengumuman Penting Pesantren</div>
                <div class="toggle-card-desc">Informasi resmi dari pimpinan atau bagian akademik pondok</div>
              </div>
              <label class="switch-toggle">
                <input type="checkbox" id="setNotifPeng" ${notificationPreferences.pengumuman ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>

            <div class="modal-btn-row">
              <button type="button" class="btn-modal-cancel" onclick="closeSettingDetail()">Batal</button>
              <button type="button" class="btn-modal-submit" onclick="saveSettingDetail('notifications')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Simpan Preferensi
              </button>
            </div>
          </div>
        `;
      } else if (type === 'teachers') {
        titleEl.innerText = 'Daftar Ustadz / Guru';
        if (subTitleEl) subTitleEl.innerText = 'Tambahkan dan kelola nama ustadz/guru untuk jadwal KBM';
        if (iconEl) iconEl.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`;
        editingTeacherMasterIdx = -1;

        bodyEl.innerHTML = `
          <div class="settings-form-container">
            <div class="form-group">
              <label class="form-label" for="setTeacherNameInput">Tambah Nama Ustadz / Guru</label>
              <div class="teacher-add-row">
                <input type="text" id="setTeacherNameInput" class="form-input" placeholder="Contoh: Ustadz Hasan Basri, S.Pd.I" onkeydown="if(event.key==='Enter'){event.preventDefault();addTeacherMasterName();}">
                <button type="button" id="btnAddTeacherMaster" class="btn-modal-submit teacher-add-btn" onclick="addTeacherMasterName()">+ Tambah</button>
              </div>
              <div id="setTeacherError" class="form-alert-error" style="display:none; margin-top:8px;"></div>
            </div>

            <div class="teacher-list-meta">
              <span>Daftar Pengajar Aktif (<b id="setTeacherCount">0</b>)</span>
            </div>

            <div id="setTeacherListWrap" class="teacher-master-list"></div>

            <div class="modal-btn-row">
              <button type="button" class="btn-modal-submit" onclick="closeSettingDetail()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Selesai
              </button>
            </div>
          </div>
        `;
        renderTeacherMasterList();
      }

      modal.style.display = 'flex';
      if (type === 'teachers') {
        const inp = document.getElementById('setTeacherNameInput');
        if (inp && typeof inp.focus === 'function') setTimeout(() => inp.focus(), 60);
      }
    }

    function renderTeacherMasterList() {
      const listWrap = document.getElementById('setTeacherListWrap');
      const countEl = document.getElementById('setTeacherCount');
      const list = getMergedTeacherMasterList();
      if (countEl) countEl.innerText = String(list.length);
      if (!listWrap) return;

      if (list.length === 0) {
        listWrap.innerHTML = '<div style="text-align:center; padding:18px; color:#64748B; font-size:12.5px;">Belum ada nama ustadz/guru terdaftar.</div>';
        return;
      }

      listWrap.innerHTML = list.map((name, idx) => {
        const cleanLabel = name.replace(/^(Ustadz|Ustadzah)\s+/i, '').trim() || name;
        const initials = cleanLabel.split(/\s+/).map(w => w[0] || '').slice(0, 2).join('').toUpperCase() || 'U';
        if (editingTeacherMasterIdx === idx) {
          return `
            <div class="teacher-master-item">
              <div class="teacher-master-avatar">${initials}</div>
              <input type="text" id="setTeacherEditInput_${idx}" class="form-input teacher-edit-input" value="${escapeTeacherHtml(name)}" onkeydown="if(event.key==='Enter'){event.preventDefault();saveTeacherMasterEdit(${idx});}else if(event.key==='Escape'){cancelTeacherMasterEdit();}">
              <div class="teacher-item-actions">
                <button type="button" class="teacher-icon-btn edit" onclick="saveTeacherMasterEdit(${idx})" title="Simpan">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
                <button type="button" class="teacher-icon-btn" onclick="cancelTeacherMasterEdit()" title="Batal">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          `;
        }
        return `
          <div class="teacher-master-item">
            <div class="teacher-master-avatar">${initials}</div>
            <div class="teacher-master-name" title="${escapeTeacherHtml(name)}">${escapeTeacherHtml(name)}</div>
            <div class="teacher-item-actions">
              <button type="button" class="teacher-icon-btn edit" onclick="editTeacherMasterItem(${idx})" title="Ubah nama">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button type="button" class="teacher-icon-btn delete" onclick="deleteTeacherMasterItem(${idx})" title="Hapus dari daftar">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    function addTeacherMasterName() {
      const inp = document.getElementById('setTeacherNameInput');
      const errEl = document.getElementById('setTeacherError');
      if (!inp) return;
      const val = inp.value.trim();
      if (errEl) errEl.style.display = 'none';

      if (val.length < 3) {
        if (errEl) {
          errEl.innerText = 'Nama ustadz / guru minimal 3 karakter.';
          errEl.style.display = 'block';
        }
        return;
      }

      const list = getMergedTeacherMasterList();
      if (list.some(t => t.toLowerCase() === val.toLowerCase())) {
        if (errEl) {
          errEl.innerText = `Nama "${val}" sudah ada dalam daftar.`;
          errEl.style.display = 'block';
        }
        return;
      }

      teacherMasterList.unshift(val);
      inp.value = '';
      syncTeacherSelectOptions();
      renderTeacherMasterList();
      if (typeof showToast === 'function') {
        showToast(`"${val}" berhasil ditambahkan ke daftar ustadz/guru.`, 'success');
      }
    }

    function editTeacherMasterItem(idx) {
      editingTeacherMasterIdx = idx;
      renderTeacherMasterList();
      const inp = document.getElementById('setTeacherEditInput_' + idx);
      if (inp && typeof inp.focus === 'function') inp.focus();
    }

    function cancelTeacherMasterEdit() {
      editingTeacherMasterIdx = -1;
      renderTeacherMasterList();
    }

    function saveTeacherMasterEdit(idx) {
      const inp = document.getElementById('setTeacherEditInput_' + idx);
      const errEl = document.getElementById('setTeacherError');
      if (!inp) return;
      const newVal = inp.value.trim();
      if (errEl) errEl.style.display = 'none';

      if (newVal.length < 3) {
        if (errEl) {
          errEl.innerText = 'Nama ustadz / guru minimal 3 karakter.';
          errEl.style.display = 'block';
        }
        return;
      }
      if (teacherMasterList.some((t, i) => i !== idx && t.toLowerCase() === newVal.toLowerCase())) {
        if (errEl) {
          errEl.innerText = `Nama "${newVal}" sudah digunakan.`;
          errEl.style.display = 'block';
        }
        return;
      }

      teacherMasterList[idx] = newVal;
      editingTeacherMasterIdx = -1;
      syncTeacherSelectOptions();
      renderTeacherMasterList();
      if (typeof showToast === 'function') {
        showToast(`Nama pengajar diperbarui menjadi "${newVal}".`, 'success');
      }
    }

    function deleteTeacherMasterItem(idx) {
      if (idx < 0 || idx >= teacherMasterList.length) return;
      const removed = teacherMasterList.splice(idx, 1)[0];
      if (editingTeacherMasterIdx === idx) editingTeacherMasterIdx = -1;
      syncTeacherSelectOptions();
      renderTeacherMasterList();
      if (typeof showToast === 'function') {
        showToast(`"${removed}" dihapus dari daftar ustadz/guru.`, 'info');
      }
    }

    function closeSettingDetail() {
      const modal = document.getElementById('settingsDetailModal');
      if (modal) modal.style.display = 'none';
    }

    // Listener tombol Escape untuk menutup modal pengaturan
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const modal = document.getElementById('settingsDetailModal');
        if (modal && modal.style.display !== 'none') {
          closeSettingDetail();
        }
      }
    });

    function saveSettingDetail(type) {
      if (type === 'profile') {
        const nameVal = document.getElementById('setProfileName').value.trim();
        const phoneVal = document.getElementById('setProfilePhone').value.trim();
        if (!nameVal) {
          showToast('Nama lengkap tidak boleh kosong.', 'error');
          return;
        }
        currentLoggedInUser.fullName = nameVal;
        currentLoggedInUser.phone = phoneVal;
        currentLoggedInUser.phoneNumber = phoneVal;
        closeSettingDetail();
        openSettingsPage();
        showToast('Profil pengguna berhasil diperbarui.', 'success');
      } else if (type === 'security') {
        const cur = document.getElementById('setSecCurrent').value;
        const newP = document.getElementById('setSecNew').value;
        const confP = document.getElementById('setSecConfirm').value;
        const errEl = document.getElementById('setSecError');

        if (!cur.trim()) {
          errEl.style.display = 'block';
          errEl.innerText = 'Password saat ini wajib diisi.';
          return;
        }
        if (newP.length < 6) {
          errEl.style.display = 'block';
          errEl.innerText = 'Password baru minimal 6 karakter.';
          return;
        }
        if (newP !== confP) {
          errEl.style.display = 'block';
          errEl.innerText = 'Konfirmasi password baru tidak cocok.';
          return;
        }
        if (cur === newP) {
          errEl.style.display = 'block';
          errEl.innerText = 'Password baru tidak boleh sama dengan password saat ini.';
          return;
        }
        closeSettingDetail();
        showToast('Password akun berhasil diperbarui.', 'success');
      } else if (type === 'pesantren') {
        const name = document.getElementById('setPesName').value.trim();
        if (!name) {
          showToast('Nama pesantren wajib diisi.', 'error');
          return;
        }
        pesantrenSettings.namaPesantren = name;
        pesantrenSettings.alamat = document.getElementById('setPesAddr').value.trim();
        pesantrenSettings.telepon = document.getElementById('setPesPhone').value.trim();
        pesantrenSettings.tahunAjaran = document.getElementById('setPesYear').value.trim();
        pesantrenSettings.semester = document.getElementById('setPesSem').value;
        closeSettingDetail();
        showToast('Pengaturan pesantren berhasil disimpan.', 'success');
      } else if (type === 'attendance') {
        attendanceSettings.jamMulaiKbm = document.getElementById('setAttStart').value.trim();
        attendanceSettings.jamSelesaiKbm = document.getElementById('setAttEnd').value.trim();
        attendanceSettings.toleransiTerlambat = parseInt(document.getElementById('setAttTol').value) || 15;
        attendanceSettings.minKehadiran = parseInt(document.getElementById('setAttMin').value) || 75;
        attendanceSettings.autoAlfa = document.getElementById('setAttAutoAlfa').checked;
        attendanceSettings.guruEdit = document.getElementById('setAttGuruEdit').checked;
        closeSettingDetail();
        showToast('Pengaturan absensi KBM berhasil disimpan.', 'success');
      } else if (type === 'notifications') {
        const elPengingatMengajar = document.getElementById('setNotifPengingatMengajar');
        const elPengingatAbsensi = document.getElementById('setNotifPengingatAbsensi');
        const elLead = document.getElementById('setNotifLeadMinutes');
        const elSuara = document.getElementById('setNotifSuara');

        if (elPengingatMengajar) notificationPreferences.pengingatMengajar = elPengingatMengajar.checked;
        if (elPengingatAbsensi) notificationPreferences.pengingatAbsensi = elPengingatAbsensi.checked;
        if (elLead) notificationPreferences.leadMinutes = parseInt(elLead.value, 10) || 15;
        if (elSuara) notificationPreferences.suaraNotifikasi = elSuara.checked;

        notificationPreferences.sesiBaru = document.getElementById('setNotifSesi').checked;
        notificationPreferences.rekapMingguan = document.getElementById('setNotifRekap').checked;
        notificationPreferences.jadwal = document.getElementById('setNotifJadwal').checked;
        notificationPreferences.pengumuman = document.getElementById('setNotifPeng').checked;
        closeSettingDetail();
        if (typeof refreshTeacherReminders === 'function') {
          refreshTeacherReminders({ silent: true });
        }
        showToast('Preferensi notifikasi berhasil disimpan.', 'success');
      }
    }

    function confirmLogoutFromSettings() {
      const modal = document.getElementById('modalConfirmLogout');
      if (modal) modal.style.display = 'flex';
    }

    function cancelLogoutModal() {
      const modal = document.getElementById('modalConfirmLogout');
      if (modal) modal.style.display = 'none';
    }

    function executeLogoutFromSettings() {
      cancelLogoutModal();
      backFromSettings();
      logoutFromHome();
      showToast('Anda telah berhasil keluar dari akun.', 'info');
    }

    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', syncTeacherSelectOptions);
      } else {
        syncTeacherSelectOptions();
      }
    }

    if (typeof window !== 'undefined') {
      window.teacherMasterList = teacherMasterList;
      window.addTeacherMasterName = addTeacherMasterName;
      window.editTeacherMasterItem = editTeacherMasterItem;
      window.cancelTeacherMasterEdit = cancelTeacherMasterEdit;
      window.saveTeacherMasterEdit = saveTeacherMasterEdit;
      window.deleteTeacherMasterItem = deleteTeacherMasterItem;
      window.syncTeacherSelectOptions = syncTeacherSelectOptions;
    }

