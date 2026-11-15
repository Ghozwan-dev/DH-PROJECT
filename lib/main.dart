import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'core/constants/app_constants.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/presentation/pages/login_page.dart';
import 'features/auth/presentation/pages/register_page.dart';
import 'features/home/presentation/pages/admin_home_page.dart';
import 'features/home/presentation/pages/guru_home_page.dart';
import 'features/students/presentation/pages/student_list_page.dart';
import 'features/auth/data/models/user_model.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Konfigurasi status bar transparan dengan ikon gelap (sesuai background putih)
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const DarulHikmahApp());
}

/// Root Application Widget untuk Darul Hikmah
class DarulHikmahApp extends StatelessWidget {
  const DarulHikmahApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      initialRoute: AppConstants.routeLogin,
      routes: {
        AppConstants.routeLogin: (context) => const LoginPage(),
        AppConstants.routeRegister: (context) => const RegisterPage(),
        AppConstants.routeHomeAdmin: (context) => const AdminHomePage(),
        AppConstants.routeHomeGuru: (context) => const GuruHomePage(),
        AppConstants.routeStudentList: (context) => const StudentListPage(currentUserRole: UserRole.admin),
      },
    );
  }
}
