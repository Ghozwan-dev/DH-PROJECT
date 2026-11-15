import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/form_validators.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/custom_text_field.dart';
import '../../../../core/widgets/feedback_banner.dart';
import '../../data/services/auth_service.dart';
import '../widgets/role_security_badge.dart';

/// Halaman Register Aplikasi Darul Hikmah (Sesuai Butir 4 & 5)
class RegisterPage extends StatefulWidget {
  const RegisterPage({Key? key}) : super(key: key);

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();

  // Text Controllers
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  final _authService = AuthService();
  bool _isLoading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    // 1. Validasi form Flutter
    if (!_formKey.currentState!.validate()) {
      return;
    }

    // Tutup keyboard
    FocusScope.of(context).unfocus();

    setState(() {
      _isLoading = true;
    });

    // 2. Registrasi via AuthService
    // Backend mengunci peran pengguna secara mutlak ke 'Guru' (Butir 5)
    final result = await _authService.register(
      fullName: _nameController.text,
      email: _emailController.text,
      phoneNumber: _phoneController.text,
      password: _passwordController.text,
    );

    if (!mounted) return;

    setState(() {
      _isLoading = false;
    });

    if (result.success && result.user != null) {
      _showRegistrationSuccessDialog(result.user!.fullName, result.user!.email ?? result.user!.username);
    } else {
      FeedbackBanner.showError(
        context,
        result.errorMessage ?? 'Pendaftaran gagal. Silakan coba kembali.',
      );
    }
  }

  void _showRegistrationSuccessDialog(String fullName, String loginIdentifier) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: const [
            Icon(Icons.check_circle, color: AppColors.primary, size: 28),
            SizedBox(width: 10),
            Text('Pendaftaran Berhasil'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Alhamdulillah, akun untuk $fullName telah berhasil dibuat sebagai akun Guru.'),
            const SizedBox(height: 12),
            Text(
              'Silakan masuk menggunakan email $loginIdentifier dan kata sandi yang telah Anda daftarkan.',
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx); // Tutup dialog
              Navigator.pop(context); // Kembali ke halaman Login
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Masuk Sekarang', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Stack(
          children: [
            Center(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 420),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const SizedBox(height: 52), // Jarak untuk tombol kembali

                        // Judul "Daftar Akun"
                        const Text(
                          'Daftar Akun',
                          textAlign: TextAlign.center,
                          style: AppTextStyles.pageTitle,
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Buat akun untuk mulai menggunakan aplikasi',
                          textAlign: TextAlign.center,
                          style: AppTextStyles.pageSubtitle,
                        ),

                        const SizedBox(height: 20),

                        // Informasi Hak Akses Guru (Butir 5)
                        const RoleSecurityBadge(),

                        const SizedBox(height: 20),

                        // 6. Input Nama Lengkap
                        CustomTextField(
                          controller: _nameController,
                          hintText: 'Nama Lengkap',
                          prefixIcon: Icons.person_outline,
                          textInputAction: TextInputAction.next,
                          validator: FormValidators.validateFullName,
                        ),

                        const SizedBox(height: 14),

                        // Input Email
                        CustomTextField(
                          controller: _emailController,
                          hintText: 'Email',
                          prefixIcon: Icons.mail_outline,
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.next,
                          validator: (val) => FormValidators.validateEmail(val, isOptional: false),
                        ),

                        const SizedBox(height: 14),

                        // 9. Input Nomor HP
                        CustomTextField(
                          controller: _phoneController,
                          hintText: 'Nomor HP',
                          prefixIcon: Icons.phone_outlined,
                          keyboardType: TextInputType.phone,
                          textInputAction: TextInputAction.next,
                          validator: FormValidators.validatePhone,
                        ),

                        const SizedBox(height: 14),

                        // 10. Input Password
                        CustomTextField(
                          controller: _passwordController,
                          hintText: 'Password',
                          prefixIcon: Icons.lock_outline,
                          isPassword: true,
                          textInputAction: TextInputAction.next,
                          validator: FormValidators.validatePassword,
                        ),

                        const SizedBox(height: 14),

                        // 11. Input Konfirmasi Password
                        CustomTextField(
                          controller: _confirmPasswordController,
                          hintText: 'Konfirmasi Password',
                          prefixIcon: Icons.lock_outline,
                          isPassword: true,
                          textInputAction: TextInputAction.done,
                          validator: (val) => FormValidators.validateConfirmPassword(
                            val,
                            _passwordController.text,
                          ),
                          onFieldSubmitted: (_) => _handleRegister(),
                        ),

                        const SizedBox(height: 24),

                        // 12. Tombol Daftar
                        CustomButton(
                          text: 'Daftar',
                          isLoading: _isLoading,
                          onPressed: _handleRegister,
                        ),

                        const SizedBox(height: 24),

                        // 13. Teks "Sudah punya akun? Masuk"
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text(
                              'Sudah punya akun? ',
                              style: AppTextStyles.footerPrompt,
                            ),
                            GestureDetector(
                              onTap: () => Navigator.pop(context),
                              child: const Text(
                                'Masuk',
                                style: AppTextStyles.footerAction,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // 1. Tombol Kembali di Pojok Kiri Atas
            Positioned(
              top: 12,
              left: 12,
              child: Material(
                color: Colors.transparent,
                child: IconButton(
                  icon: const Icon(
                    Icons.arrow_back_ios_new_rounded,
                    color: AppColors.primary,
                    size: 22,
                  ),
                  tooltip: 'Kembali ke Login',
                  onPressed: () => Navigator.pop(context),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
