import '../../../../core/utils/password_hasher.dart';
import '../models/user_model.dart';

/// Data awal (mock seed) untuk Akun Pengguna Darul Hikmah
/// Dipisahkan dari repository agar siap beralih ke REST API NestJS & database PostgreSQL
List<UserModel> getInitialMockUsers() {
  return [
    // 1. Akun Admin (Dibuat melalui pengelola sistem)
    UserModel(
      id: 'adm_001',
      fullName: 'Administrator Pondok',
      username: 'admin',
      email: 'admin@darulhikmah.ponpes.id',
      phoneNumber: '081234567890',
      passwordHash: PasswordHasher.hashPassword('admin123'),
      role: UserRole.admin,
      createdAt: DateTime(2026, 1, 1),
    ),

    // 2. Akun Guru terdaftar
    UserModel(
      id: 'guru_001',
      fullName: 'Ustadz Ahmad Fauzi',
      username: 'ustadz_ahmad',
      email: 'ahmad.fauzi@darulhikmah.ponpes.id',
      phoneNumber: '081987654321',
      passwordHash: PasswordHasher.hashPassword('guru123'),
      role: UserRole.guru,
      createdAt: DateTime(2026, 2, 1),
    ),
  ];
}
