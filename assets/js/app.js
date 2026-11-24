// ========================================================
// APLIKASI UTAMA — INISIALISASI AWAL & BOOTSTRAP
// ========================================================

// Inisialisasi awal saat seluruh modul skrip telah termuat
if (typeof navigateToHome === 'function' && typeof mockUsers !== 'undefined' && mockUsers.length > 0) {
  navigateToHome(mockUsers[0]);
}

if (typeof renderRecentActivities === 'function') {
  renderRecentActivities();
}
