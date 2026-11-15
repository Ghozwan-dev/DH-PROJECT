import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/form_validators.dart';
import '../../../../core/widgets/app_header.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/custom_text_field.dart';
import '../../../../core/widgets/feedback_banner.dart';
import '../../data/models/user_model.dart';
import '../../data/services/auth_service.dart';
import '../widgets/remember_me_checkbox.dart';
import 'register_page.dart';
import '../../../home/presentation/pages/home_page.dart';

/// Halaman Login Aplikasi Darul Hikmah (Sesuai Butir 3)
class LoginPage extends StatefulWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _identifierController = TextEditingController();
  final _passwordController = TextEditingController();

  final _authService = AuthService();
  bool _rememberMe = false;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // Memuat preferensi username jika Ingat Saya aktif sebelumnya
    if (_authService.rememberMeEnabled && _authService.savedUsername != null) {
      _identifierController.text = _authService.savedUsername!;
      _rememberMe = true;
    }
  }

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    // 1. Validasi form Flutter
    if (!_formKey.currentState!.validate()) {
      return;
    }

    // Tutup keyboard
    FocusScope.of(context).unfocus();

    setState(() {
      _isLoading = true;
    });

    final result = await _authService.login(
      identifier: _identifierController.text,
      password: _passwordController.text,
      rememberMe: _rememberMe,
    );

    if (!mounted) return;

    setState(() {
      _isLoading = false;
    });

    if (result.success && result.user != null) {
      _handleLoginSuccess(result.user!);
    } else {
      FeedbackBanner.showError(
        context,
        result.errorMessage ?? 'Gagal masuk. Silakan periksa kembali data Anda.',
      );
    }
  }

  /// Penanganan setelah login berhasil:
  /// Mengarahkan secara otomatis ke Homepage sesuai role akun (Admin / Guru)
  void _handleLoginSuccess(UserModel user) {
    FeedbackBanner.showSuccess(
      context,
      'Ahlan wa Sahlan, ${user.fullName} (${user.role.label})',
    );

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => HomePage(currentUser: user),
      ),
    );
  }

  void _handleForgotPassword() {
    final emailOrUserCtrl = TextEditingController(text: _identifierController.text);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 24,
          right: 24,
          top: 24,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Lupa Password',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              'Masukkan username atau email Anda. Instruksi pemulihan kata sandi akan dikirimkan oleh sistem pesantren.',
              style: TextStyle(fontSize: 13.5, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 16),
            CustomTextField(
              controller: emailOrUserCtrl,
              hintText: 'Username atau Email',
              prefixIcon: Icons.alternate_email,
            ),
            const SizedBox(height: 20),
            CustomButton(
              text: 'Kirim Permintaan',
              onPressed: () {
                Navigator.pop(ctx);
                FeedbackBanner.showSuccess(
                  context,
                  'Permintaan pemulihan telah dikirim ke pengelola pesantren.',
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  void _navigateToRegister() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const RegisterPage()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
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
                    const SizedBox(height: 12),

                    // 1. Logo Darul Hikmah, 2. Nama Darul Hikmah, 3. Tagline
                    const AppHeader(logoSize: 96),

                    const SizedBox(height: 28),

                    // 4. Judul "Selamat Datang"
                    const Text(
                      'Selamat Datang',
                      textAlign: TextAlign.center,
                      style: AppTextStyles.pageTitle,
                    ),
                    const SizedBox(height: 6),

                    // 5. Teks "Silakan masuk untuk melanjutkan"
                    const Text(
                      'Silakan masuk untuk melanjutkan',
                      textAlign: TextAlign.center,
                      style: AppTextStyles.pageSubtitle,
                    ),

                    const SizedBox(height: 28),

                    // 6. Input Username atau Email
                    CustomTextField(
                      controller: _identifierController,
                      hintText: 'Username atau Email',
                      prefixIcon: Icons.person_outline,
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.next,
                      validator: FormValidators.validateLoginIdentifier,
                    ),

                    const SizedBox(height: 14),

                    // 7. Input Password & 8. Fitur tampil/sembunyikan password
                    CustomTextField(
                      controller: _passwordController,
                      hintText: 'Password',
                      prefixIcon: Icons.lock_outline,
                      isPassword: true,
                      textInputAction: TextInputAction.done,
                      validator: FormValidators.validatePassword,
                      onFieldSubmitted: (_) => _handleLogin(),
                    ),

                    const SizedBox(height: 12),

                    // 9. Checkbox Ingat Saya & 10. Link Lupa Password?
                    RememberForgotRow(
                      rememberMe: _rememberMe,
                      onRememberMeChanged: (val) {
                        setState(() {
                          _rememberMe = val ?? false;
                        });
                      },
                      onForgotPassword: _handleForgotPassword,
                    ),

                    const SizedBox(height: 24),

                    // 11. Tombol Masuk
                    CustomButton(
                      text: 'Masuk',
                      isLoading: _isLoading,
                      onPressed: _handleLogin,
                    ),

                    const SizedBox(height: 24),

                    // 12. Teks "Belum punya akun? Daftar"
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text(
                          'Belum punya akun? ',
                          style: AppTextStyles.footerPrompt,
                        ),
                        GestureDetector(
                          onTap: _navigateToRegister,
                          child: const Text(
                            'Daftar',
                            style: AppTextStyles.footerAction,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
