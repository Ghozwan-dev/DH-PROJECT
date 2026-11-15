import 'package:flutter/material.dart';
import '../../../auth/data/models/user_model.dart';
import 'home_page.dart';

/// Halaman Khusus Beranda Administrator Darul Hikmah
class AdminHomePage extends StatelessWidget {
  final UserModel? user;

  const AdminHomePage({Key? key, this.user}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final effectiveUser = user ??
        UserModel(
          id: 'USR-ADMIN',
          fullName: 'Administrator Pondok',
          username: 'admin',
          email: 'admin@darulhikmah.ponpes.id',
          phoneNumber: '081234567890',
          passwordHash: '',
          role: UserRole.admin,
          createdAt: DateTime.now(),
        );

    return HomePage(currentUser: effectiveUser);
  }
}
