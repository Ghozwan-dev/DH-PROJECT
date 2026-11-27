// ========================================================
// MODUL SISTEM NOTIFIKASI PENGINGAT UNTUK GURU
// ========================================================

const TEACHER_NOTIF_STORAGE_KEY = 'dh_teacher_notif_state_v1';

let teacherNotifState = {
  readIds: {},
  dismissedIds: {},
  autoAlertedKeys: {},
  manualReminders: []
};

let teacherReminderTickerId = null;
let reminderToastTimerId = null;

function loadTeacherNotifState() {
  try {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(TEACHER_NOTIF_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      teacherNotifState.readIds = parsed.readIds || {};
      teacherNotifState.dismissedIds = parsed.dismissedIds || {};
      teacherNotifState.autoAlertedKeys = parsed.autoAlertedKeys || {};
      teacherNotifState.manualReminders = Array.isArray(parsed.manualReminders) ? parsed.manualReminders : [];
    }
  } catch (e) {
    // Abaikan jika localStorage tidak tersedia
  }
}

function saveTeacherNotifState() {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(TEACHER_NOTIF_STORAGE_KEY, JSON.stringify(teacherNotifState));
  } catch (e) {
    // Abaikan jika localStorage tidak tersedia
  }
}

function getTodayIndoDayName(dateObj) {
  const d = dateObj || new Date();
  const days = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[d.getDay()] || 'Senin';
}

function getTodayIsoDate(dateObj) {
  const d = dateObj || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatTodayIndoDisplay(dateObj) {
  const d = dateObj || new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${getTodayIndoDayName(d)}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function normalizeTeacherName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/ustadzah|ustadz|s\.pd\.i|s\.pd|m\.pd/gi, '')
    .replace(/[.,]/g, '')
    .trim();
}

function isScheduleForTeacher(schedule, user) {
  if (!schedule || !user) return false;
  if (schedule.teacherId && user.id && schedule.teacherId === user.id) return true;
  const sNorm = normalizeTeacherName(schedule.teacherName);
  const uNorm = normalizeTeacherName(user.fullName);
  if (!sNorm || !uNorm) return false;
  return sNorm === uNorm || sNorm.includes(uNorm) || uNorm.includes(sNorm);
}

function hasAttendanceForScheduleOnDate(scheduleId, isoDate) {
  if (typeof mockAttendanceRecords === 'undefined' || !Array.isArray(mockAttendanceRecords)) return false;
  return mockAttendanceRecords.some(r => r.scheduleId === scheduleId && r.date === isoDate);
}

function getReminderPrefs() {
  const defaults = {
    sesiBaru: true,
    rekapMingguan: true,
    jadwal: true,
    pengumuman: true,
    pengingatMengajar: true,
    pengingatAbsensi: true,
    leadMinutes: 15,
    suaraNotifikasi: true
  };
  if (typeof notificationPreferences !== 'undefined' && notificationPreferences) {
    return Object.assign({}, defaults, notificationPreferences);
  }
  return defaults;
}

function evaluateTeacherScheduleStatus(schedule, nowDate, leadMinutes) {
  const now = nowDate || new Date();
  const isoToday = getTodayIsoDate(now);
  const isDone = hasAttendanceForScheduleOnDate(schedule.id, isoToday);
  const lead = Number(leadMinutes) || 15;

  const parseMin = typeof parseTimeToMin === 'function'
    ? parseTimeToMin
    : function(str) {
        if (!str || !str.includes(':')) return 0;
        const p = str.split(':');
        return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
      };

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startMin = parseMin(schedule.startTime);
  const endMin = parseMin(schedule.endTime);
  const diffToStart = startMin - nowMin;

  if (isDone) {
    return {
      statusCode: 'done',
      statusLabel: 'Absensi Selesai',
      badgeClass: 'done',
      minutesUntilStart: diffToStart,
      isDone: true
    };
  }
  if (nowMin >= startMin && nowMin <= endMin) {
    return {
      statusCode: 'ongoing',
      statusLabel: 'Sedang Berlangsung • Belum Absen',
      badgeClass: 'ongoing',
      minutesUntilStart: diffToStart,
      isDone: false
    };
  }
  if (diffToStart > 0 && diffToStart <= lead) {
    return {
      statusCode: 'upcoming',
      statusLabel: `Segera Masuk (${diffToStart} menit lagi)`,
      badgeClass: 'upcoming',
      minutesUntilStart: diffToStart,
      isDone: false
    };
  }
  if (diffToStart > lead) {
    return {
      statusCode: 'scheduled',
      statusLabel: 'Terjadwal Hari Ini',
      badgeClass: 'scheduled',
      minutesUntilStart: diffToStart,
      isDone: false
    };
  }
  return {
    statusCode: 'overdue',
    statusLabel: 'Absensi Belum Diisi',
    badgeClass: 'overdue',
    minutesUntilStart: diffToStart,
    isDone: false
  };
}

function getTodaySchedulesForCurrentTeacher(nowDate) {
  if (typeof mockSchedules === 'undefined' || !Array.isArray(mockSchedules)) return [];
  const user = typeof currentLoggedInUser !== 'undefined' ? currentLoggedInUser : null;
  if (!user) return [];
  const todayName = getTodayIndoDayName(nowDate || new Date());

  return mockSchedules
    .filter(s => s.day && s.day.toLowerCase() === todayName.toLowerCase() && isScheduleForTeacher(s, user))
    .sort((a, b) => (a.periodNumber || 0) - (b.periodNumber || 0));
}

function getAllTodayPendingSchedulesForAdmin(nowDate) {
  if (typeof mockSchedules === 'undefined' || !Array.isArray(mockSchedules)) return [];
  const now = nowDate || new Date();
  const todayName = getTodayIndoDayName(now);
  const isoToday = getTodayIsoDate(now);

  return mockSchedules
    .filter(s => s.day && s.day.toLowerCase() === todayName.toLowerCase())
    .map(s => {
      const isDone = hasAttendanceForScheduleOnDate(s.id, isoToday);
      return { schedule: s, isDone };
    })
    .sort((a, b) => Number(a.isDone) - Number(b.isDone) || (a.schedule.periodNumber || 0) - (b.schedule.periodNumber || 0));
}

function buildNotificationsForCurrentUser(nowDate) {
  const now = nowDate || new Date();
  const user = typeof currentLoggedInUser !== 'undefined' ? currentLoggedInUser : null;
  if (!user) return [];

  const prefs = getReminderPrefs();
  const isoToday = getTodayIsoDate(now);
  const list = [];

  if (user.role === 'Guru') {
    const myTodaySchedules = getTodaySchedulesForCurrentTeacher(now);

    myTodaySchedules.forEach(sch => {
      const evalInfo = evaluateTeacherScheduleStatus(sch, now, prefs.leadMinutes);
      if (evalInfo.isDone) return;

      if ((evalInfo.statusCode === 'upcoming' || evalInfo.statusCode === 'scheduled') && prefs.pengingatMengajar) {
        const id = `rem_teach_${isoToday}_${sch.id}`;
        if (!teacherNotifState.dismissedIds[id]) {
          list.push({
            id,
            type: 'upcoming_class',
            priority: evalInfo.statusCode === 'upcoming' ? 'high' : 'normal',
            title: evalInfo.statusCode === 'upcoming'
              ? `Segera Masuk: ${sch.subject} (${sch.className})`
              : `Jadwal Hari Ini: ${sch.subject} (${sch.className})`,
            message: evalInfo.statusCode === 'upcoming'
              ? `Kelas dimulai dalam ${evalInfo.minutesUntilStart} menit (${sch.startTime} - ${sch.endTime} WIB) di ${sch.room || 'Ruang Kelas ' + sch.className}.`
              : `Jam Ke-${sch.periodNumber} pukul ${sch.startTime} - ${sch.endTime} WIB di ${sch.room || 'Ruang Kelas ' + sch.className}.`,
            scheduleId: sch.id,
            className: sch.className,
            subject: sch.subject,
            timeSlot: `${sch.startTime} - ${sch.endTime} WIB`,
            timeLabel: evalInfo.statusCode === 'upcoming' ? `${evalInfo.minutesUntilStart} menit lagi` : `${sch.startTime} WIB`,
            isRead: !!teacherNotifState.readIds[id]
          });
        }
      }

      if ((evalInfo.statusCode === 'ongoing' || evalInfo.statusCode === 'overdue') && prefs.pengingatAbsensi) {
        const id = `rem_att_${isoToday}_${sch.id}`;
        if (!teacherNotifState.dismissedIds[id]) {
          list.push({
            id,
            type: 'missing_attendance',
            priority: 'high',
            title: evalInfo.statusCode === 'ongoing'
              ? `Waktunya Absensi: ${sch.subject} (${sch.className})`
              : `Pengingat Absensi Belum Diisi`,
            message: evalInfo.statusCode === 'ongoing'
              ? `Sesi KBM sedang berlangsung (${sch.startTime} - ${sch.endTime} WIB). Jangan lupa catat kehadiran santri.`
              : `Absensi ${sch.subject} Kelas ${sch.className} (${sch.startTime} - ${sch.endTime} WIB) belum tercatat hari ini.`,
            scheduleId: sch.id,
            className: sch.className,
            subject: sch.subject,
            timeSlot: `${sch.startTime} - ${sch.endTime} WIB`,
            timeLabel: evalInfo.statusCode === 'ongoing' ? 'Sedang berlangsung' : 'Perlu dilengkapi',
            isRead: !!teacherNotifState.readIds[id]
          });
        }
      }
    });

    // Pengingat manual dari Admin khusus untuk ustadz ini
    teacherNotifState.manualReminders.forEach(rem => {
      if (teacherNotifState.dismissedIds[rem.id]) return;
      if (!rem.targetTeacher) return;
      const targetNorm = normalizeTeacherName(rem.targetTeacher);
      const userNorm = normalizeTeacherName(user.fullName);
      const matchesTarget = targetNorm && userNorm && (targetNorm === userNorm || targetNorm.includes(userNorm) || userNorm.includes(targetNorm));
      if (!matchesTarget) return;
      if (rem.scheduleId && hasAttendanceForScheduleOnDate(rem.scheduleId, isoToday)) return;

      list.push({
        id: rem.id,
        type: 'manual_reminder',
        priority: 'high',
        title: rem.title || 'Pengingat dari Admin Pondok',
        message: rem.message,
        scheduleId: rem.scheduleId || null,
        className: rem.className || '',
        subject: rem.subject || '',
        timeSlot: rem.timeSlot || '',
        timeLabel: rem.timeLabel || 'Dari Admin',
        isRead: !!teacherNotifState.readIds[rem.id]
      });
    });
  } else {
    // Mode Admin: pantau sesi KBM guru hari ini yang belum absen & kirim pengingat
    const todaySlots = getAllTodayPendingSchedulesForAdmin(now);
    const pendingSlots = todaySlots.filter(item => !item.isDone);

    pendingSlots.forEach(item => {
      const sch = item.schedule;
      const id = `adm_pending_${isoToday}_${sch.id}`;
      if (teacherNotifState.dismissedIds[id]) return;
      const alreadySent = teacherNotifState.manualReminders.some(r => r.scheduleId === sch.id && r.dateIso === isoToday);

      list.push({
        id,
        type: 'admin_monitor',
        priority: 'medium',
        title: `${sch.teacherName} • ${sch.subject} (${sch.className})`,
        message: alreadySent
          ? `Pengingat telah dikirim ke ${sch.teacherName} untuk sesi pukul ${sch.startTime} - ${sch.endTime} WIB.`
          : `Absensi KBM pukul ${sch.startTime} - ${sch.endTime} WIB belum tercatat.`,
        scheduleId: sch.id,
        teacherName: sch.teacherName,
        className: sch.className,
        subject: sch.subject,
        timeSlot: `${sch.startTime} - ${sch.endTime} WIB`,
        timeLabel: alreadySent ? 'Sudah Diingatkan' : 'Belum Absen',
        alreadySent,
        isRead: !!teacherNotifState.readIds[id] || alreadySent
      });
    });
  }

  // Urutkan belum dibaca & prioritas tinggi di atas
  const prioWeight = { high: 3, medium: 2, normal: 1 };
  list.sort((a, b) => {
    if (a.isRead !== b.isRead) return Number(a.isRead) - Number(b.isRead);
    return (prioWeight[b.priority] || 1) - (prioWeight[a.priority] || 1);
  });

  return list;
}

function getNotifTypeMeta(type) {
  switch (type) {
    case 'upcoming_class':
      return {
        bg: '#DCFCE7',
        color: '#0E6838',
        chipText: 'Jadwal Dekat',
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
      };
    case 'missing_attendance':
      return {
        bg: '#FEE2E2',
        color: '#DC2626',
        chipText: 'Belum Absen',
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`
      };
    case 'manual_reminder':
      return {
        bg: '#FEF3C7',
        color: '#D97706',
        chipText: 'Pengingat Admin',
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
      };
    case 'admin_monitor':
      return {
        bg: '#FEF3C7',
        color: '#B45309',
        chipText: 'Pantau Guru',
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>`
      };
    default:
      return {
        bg: '#E0F2FE',
        color: '#0284C7',
        chipText: 'Informasi',
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
      };
  }
}

function renderTeacherNotifBadge(notifications) {
  const badge = document.getElementById('teacherNotifBadge');
  const bellBtn = document.getElementById('teacherNotifBellBtn');
  if (!badge) return;

  const list = notifications || buildNotificationsForCurrentUser();
  const unreadCount = list.filter(n => !n.isRead).length;

  if (unreadCount > 0) {
    badge.innerText = unreadCount > 9 ? '9+' : String(unreadCount);
    badge.style.display = 'flex';
    if (bellBtn) bellBtn.classList.add('has-unread');
  } else {
    badge.style.display = 'none';
    if (bellBtn) bellBtn.classList.remove('has-unread');
  }
}

function renderTeacherNotifPanel(notifications, nowDate) {
  const listEl = document.getElementById('teacherNotifList');
  const subtitleEl = document.getElementById('teacherNotifPanelSubtitle');
  if (!listEl) return;

  const now = nowDate || new Date();
  const user = typeof currentLoggedInUser !== 'undefined' ? currentLoggedInUser : null;
  const isGuru = user && user.role === 'Guru';
  const list = notifications || buildNotificationsForCurrentUser(now);
  const unreadCount = list.filter(n => !n.isRead).length;

  if (subtitleEl) {
    subtitleEl.innerText = isGuru
      ? `${list.length} pengingat untuk ${user.fullName} • ${formatTodayIndoDisplay(now)}`
      : `Pantau & kirim pengingat absensi ke guru (${unreadCount} belum absen)`;
  }

  if (!list || list.length === 0) {
    listEl.innerHTML = `
      <div class="notif-empty-state">
        <div class="notif-empty-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0E6838" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="notif-empty-title">${isGuru ? 'Tidak Ada Pengingat Tertunda' : 'Semua Guru Sudah Mengisi Absensi'}</div>
        <div class="notif-empty-desc">${isGuru ? `Seluruh jadwal & absensi ${user ? user.fullName : 'Anda'} sudah terpenuhi.` : 'Seluruh jadwal KBM hari ini sudah tercatat.'}</div>
      </div>
    `;
    return;
  }

  const itemsHtml = list.map(n => {
    const meta = getNotifTypeMeta(n.type);
    const unreadCls = n.isRead ? 'read' : 'unread';

    let actionBtnHtml = '';
    if (isGuru && n.scheduleId) {
      actionBtnHtml = `
        <button type="button" class="notif-action-btn" onclick="openAttendanceFromReminder('${n.scheduleId}', '${n.id}')">
          Isi Absensi
        </button>
      `;
    } else if (!isGuru && n.type === 'admin_monitor') {
      actionBtnHtml = n.alreadySent
        ? `<span class="notif-sent-pill">✓ Terkirim</span>`
        : `<button type="button" class="notif-action-btn" onclick="sendManualTeacherReminder('${n.scheduleId}')">Kirim Pengingat</button>`;
    }

    return `
      <div class="notif-item ${unreadCls}">
        <div class="notif-item-icon" style="background:${meta.bg}; color:${meta.color};">
          ${meta.icon}
        </div>
        <div class="notif-item-body">
          <div class="notif-item-top">
            <span class="notif-item-chip" style="background:${meta.bg}; color:${meta.color};">${meta.chipText}</span>
            <span class="notif-item-time">${n.timeLabel || ''}</span>
          </div>
          <div class="notif-item-title">${n.title}</div>
          <div class="notif-item-desc">${n.message}</div>
          ${actionBtnHtml ? `<div class="notif-item-actions">${actionBtnHtml}</div>` : ''}
        </div>
        ${!n.isRead ? '<span class="notif-unread-dot" title="Belum dibaca"></span>' : ''}
      </div>
    `;
  }).join('');

  listEl.innerHTML = itemsHtml;
}

function toggleTeacherNotifPanel(e) {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
  if (typeof closeRoleDropdown === 'function') closeRoleDropdown();

  const panel = document.getElementById('teacherNotifPanel');
  if (!panel) return;
  const isOpen = panel.style.display === 'block';
  if (isOpen) {
    panel.style.display = 'none';
  } else {
    refreshTeacherReminders({ silent: true });
    panel.style.display = 'block';
  }
}

function closeTeacherNotifPanel() {
  const panel = document.getElementById('teacherNotifPanel');
  if (panel) panel.style.display = 'none';
}

function markTeacherNotifRead(notifId) {
  if (!notifId) return;
  teacherNotifState.readIds[notifId] = true;
  saveTeacherNotifState();
  refreshTeacherReminders({ silent: true });
}

function markAllTeacherNotifsRead() {
  const list = buildNotificationsForCurrentUser();
  list.forEach(n => {
    teacherNotifState.readIds[n.id] = true;
  });
  saveTeacherNotifState();
  refreshTeacherReminders({ silent: true });
  if (typeof showToast === 'function') {
    showToast('Semua notifikasi pengingat ditandai telah dibaca.', 'success');
  }
}

function dismissTeacherNotif(notifId) {
  if (!notifId) return;
  teacherNotifState.dismissedIds[notifId] = true;
  teacherNotifState.readIds[notifId] = true;
  saveTeacherNotifState();
  refreshTeacherReminders({ silent: true });
}

function markScheduleReminderResolved(scheduleId, dateIso) {
  const iso = dateIso || getTodayIsoDate();
  if (scheduleId) {
    teacherNotifState.readIds[`rem_teach_${iso}_${scheduleId}`] = true;
    teacherNotifState.readIds[`rem_att_${iso}_${scheduleId}`] = true;
    teacherNotifState.dismissedIds[`rem_att_${iso}_${scheduleId}`] = true;
    teacherNotifState.manualReminders.forEach(rem => {
      if (rem.scheduleId === scheduleId) {
        teacherNotifState.readIds[rem.id] = true;
        teacherNotifState.dismissedIds[rem.id] = true;
      }
    });
    saveTeacherNotifState();
  }
  refreshTeacherReminders({ silent: true });
}

function openAttendanceFromReminder(scheduleId, notifId) {
  if (notifId) {
    teacherNotifState.readIds[notifId] = true;
    saveTeacherNotifState();
  }
  closeTeacherNotifPanel();
  hideReminderFloatingToast();
  if (typeof openAttendanceForm === 'function') {
    openAttendanceForm(scheduleId, getTodayIsoDate());
  } else if (typeof openScheduleListPage === 'function') {
    openScheduleListPage();
  }
}

function sendManualTeacherReminder(scheduleId) {
  if (typeof mockSchedules === 'undefined') return;
  const sch = mockSchedules.find(s => s.id === scheduleId);
  if (!sch) return;

  const isoToday = getTodayIsoDate();
  const remId = `manual_${isoToday}_${sch.id}_${Date.now()}`;
  teacherNotifState.manualReminders.unshift({
    id: remId,
    targetTeacher: sch.teacherName,
    scheduleId: sch.id,
    dateIso: isoToday,
    subject: sch.subject,
    className: sch.className,
    timeSlot: `${sch.startTime} - ${sch.endTime} WIB`,
    title: `Pengingat Absensi: ${sch.subject} (Kelas ${sch.className})`,
    message: `Mohon segera melengkapi absensi KBM sesi pukul ${sch.startTime} - ${sch.endTime} WIB.`,
    timeLabel: 'Baru dikirim Admin',
    createdAt: Date.now()
  });
  saveTeacherNotifState();
  refreshTeacherReminders({ silent: true });

  if (typeof showToast === 'function') {
    showToast(`Pengingat berhasil dikirim ke ${sch.teacherName}.`, 'success');
  }
}

function playReminderChime() {
  const prefs = getReminderPrefs();
  if (!prefs.suaraNotifikasi) return;
  try {
    const AudioCtx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.14);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  } catch (e) {
    // Abaikan jika audio diblokir browser
  }
}

function showBrowserNotification(title, body) {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: 'assets/images/logo.png'
      });
    }
  } catch (e) {
    // Abaikan jika browser tidak mendukung
  }
}

function requestBrowserNotifPermission() {
  if (typeof Notification === 'undefined') {
    if (typeof showToast === 'function') showToast('Browser ini tidak mendukung notifikasi sistem.', 'error');
    return;
  }
  Notification.requestPermission().then(perm => {
    refreshTeacherReminders({ silent: true });
    if (perm === 'granted') {
      if (typeof showToast === 'function') showToast('Notifikasi browser berhasil diaktifkan.', 'success');
      showBrowserNotification('Darul Hikmah', 'Notifikasi pengingat mengajar guru telah aktif.');
    } else {
      if (typeof showToast === 'function') showToast('Izin notifikasi browser belum diberikan. Pengingat dalam aplikasi tetap aktif.', 'info');
    }
  }).catch(() => {});
}

function triggerReminderFloatingToast(notif) {
  if (!notif) return;
  const toastEl = document.getElementById('teacherReminderToast');
  if (!toastEl) {
    if (typeof showToast === 'function') {
      showToast(`${notif.title}: ${notif.message}`, 'success');
    }
    return;
  }

  const titleEl = document.getElementById('teacherReminderToastTitle');
  const descEl = document.getElementById('teacherReminderToastDesc');
  const actionBtn = document.getElementById('teacherReminderToastAction');

  if (titleEl) titleEl.innerText = notif.title;
  if (descEl) descEl.innerText = notif.message;
  if (actionBtn) {
    if (notif.scheduleId) {
      actionBtn.style.display = 'inline-flex';
      actionBtn.onclick = function() {
        openAttendanceFromReminder(notif.scheduleId, notif.id);
      };
    } else {
      actionBtn.style.display = 'none';
    }
  }

  toastEl.style.display = 'flex';
  playReminderChime();
  showBrowserNotification(notif.title, notif.message);

  if (reminderToastTimerId) clearTimeout(reminderToastTimerId);
  reminderToastTimerId = setTimeout(() => {
    hideReminderFloatingToast();
  }, 8000);
}

function hideReminderFloatingToast() {
  const toastEl = document.getElementById('teacherReminderToast');
  if (toastEl) toastEl.style.display = 'none';
}

function simulateTeacherReminder() {
  const user = typeof currentLoggedInUser !== 'undefined' ? currentLoggedInUser : null;
  const todaySchedules = getTodaySchedulesForCurrentTeacher();
  const sampleSch = todaySchedules[0] || (typeof mockSchedules !== 'undefined' && mockSchedules[0]) || null;

  if (user && user.role !== 'Guru' && sampleSch) {
    sendManualTeacherReminder(sampleSch.id);
    triggerReminderFloatingToast({
      id: 'sim_admin_preview',
      title: `Simulasi Pengingat ke ${sampleSch.teacherName}`,
      message: `Jadwal ${sampleSch.subject} Kelas ${sampleSch.className} (${sampleSch.startTime} - ${sampleSch.endTime} WIB) siap diabsen.`,
      scheduleId: null
    });
    return;
  }

  const targetSch = sampleSch || {
    id: 'sch_001',
    subject: 'Fiqih',
    className: 'VII A',
    startTime: '07:30',
    endTime: '08:15',
    room: 'Ruang Kelas VII A'
  };

  const prefs = getReminderPrefs();
  const simNotif = {
    id: `sim_guru_${Date.now()}`,
    type: 'upcoming_class',
    priority: 'high',
    title: `Pengingat Mengajar: ${targetSch.subject} (Kelas ${targetSch.className})`,
    message: `Pengingat ${prefs.leadMinutes || 15} menit sebelum KBM (${targetSch.startTime} - ${targetSch.endTime} WIB) di ${targetSch.room || 'Ruang Kelas ' + targetSch.className}.`,
    scheduleId: targetSch.id
  };

  triggerReminderFloatingToast(simNotif);
}

function refreshTeacherReminders(options) {
  const opts = options || {};
  const now = opts.nowDate || new Date();
  const notifications = buildNotificationsForCurrentUser(now);

  renderTeacherNotifBadge(notifications);
  renderTeacherNotifPanel(notifications, now);

  // Munculkan popup otomatis untuk pengingat prioritas tinggi yang belum pernah dipopupkan sesi ini
  const user = typeof currentLoggedInUser !== 'undefined' ? currentLoggedInUser : null;
  if (!opts.silent && user && user.role === 'Guru') {
    const urgent = notifications.find(n => !n.isRead && n.priority === 'high' && !teacherNotifState.autoAlertedKeys[n.id]);
    if (urgent) {
      teacherNotifState.autoAlertedKeys[urgent.id] = true;
      saveTeacherNotifState();
      triggerReminderFloatingToast(urgent);
    }
  }

  return notifications;
}

function startTeacherReminderTicker() {
  if (typeof window === 'undefined') return;
  if (teacherReminderTickerId) clearInterval(teacherReminderTickerId);
  teacherReminderTickerId = setInterval(() => {
    refreshTeacherReminders();
  }, 60000);
}

function initTeacherReminderSystem() {
  loadTeacherNotifState();
  refreshTeacherReminders({ silent: true });
  startTeacherReminderTicker();
}

if (typeof window !== 'undefined') {
  window.toggleTeacherNotifPanel = toggleTeacherNotifPanel;
  window.closeTeacherNotifPanel = closeTeacherNotifPanel;
  window.markTeacherNotifRead = markTeacherNotifRead;
  window.markAllTeacherNotifsRead = markAllTeacherNotifsRead;
  window.dismissTeacherNotif = dismissTeacherNotif;
  window.markScheduleReminderResolved = markScheduleReminderResolved;
  window.openAttendanceFromReminder = openAttendanceFromReminder;
  window.sendManualTeacherReminder = sendManualTeacherReminder;
  window.requestBrowserNotifPermission = requestBrowserNotifPermission;
  window.simulateTeacherReminder = simulateTeacherReminder;
  window.hideReminderFloatingToast = hideReminderFloatingToast;
  window.refreshTeacherReminders = refreshTeacherReminders;
  window.initTeacherReminderSystem = initTeacherReminderSystem;
}
