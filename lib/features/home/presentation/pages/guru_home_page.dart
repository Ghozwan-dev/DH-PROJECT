import 'package:flutter/material.dart';
import '../../../auth/data/models/user_model.dart';
import 'home_page.dart';

/// Halaman Khusus Beranda Guru Darul Hikmah
class GuruHomePage extends StatelessWidget {
  final UserModel? user;

  const GuruHomePage({Key? key, this.user}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final effectiveUser = user ??
        UserModel(
          id: 'USR-GURU',
          fullName: 'Ustadz Ahmad Fauzi',
          username: 'ustadz_ahmad',
          email: 'ahmad.fauzi@darulhikmah.ponpes.id',
          phoneNumber: '081987654321',
          passwordHash: '',
          role: UserRole.guru,
          createdAt: DateTime.now(),
        );

    return HomePage(currentUser: effectiveUser);
  }
}
