import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

/// Widget Welcome Section (Sesuai Butir 3):
/// - Teks sapaan: Assalamu'alaikum, Selamat Datang! di Aplikasi Absensi Santri
/// - Background hijau tua dengan foto gedung pesantren di sisi kanan
/// - Aksen lengkungan warna hijau dan emas elegan sesuai gambar referensi
class WelcomeHeroBanner extends StatelessWidget {
  const WelcomeHeroBanner({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Kontainer Utama dengan Latar Belakang Hijau Tua & Gedung
        Container(
          width: double.infinity,
          height: 195,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFF074724), // Hijau tua pekat
                Color(0xFF0E6838), // Hijau Darul Hikmah
                Color(0xFF10733E), // Hijau emerald
              ],
            ),
          ),
          child: Stack(
            children: [
              // Foto Gedung Pesantren di Sisi Kanan (Sesuai Referensi)
              Positioned(
                top: 0,
                right: 0,
                bottom: 25,
                width: 210,
                child: Image.asset(
                  'assets/images/pesantren_building.png',
                  fit: BoxFit.cover,
                  alignment: Alignment.centerLeft,
                  errorBuilder: (_, __, ___) => const SizedBox(),
                ),
              ),

              // Teks Sapaan di Sisi Kiri
              Positioned(
                left: 20,
                top: 14,
                right: 170,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Text(
                      "Assalamu'alaikum,",
                      style: AppTextStyles.welcomeGreeting,
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Selamat Datang!',
                      style: AppTextStyles.welcomeTitle,
                    ),
                    SizedBox(height: 6),
                    Text(
                      'di Aplikasi Absensi Santri',
                      style: AppTextStyles.welcomeSubtitle,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        // Aksen Lengkungan Emas & Hijau di Bagian Bawah (Sesuai Referensi)
        Positioned(
          left: 0,
          right: 0,
          bottom: 0,
          height: 38,
          child: CustomPaint(
            painter: _WaveCurvePainter(),
          ),
        ),
      ],
    );
  }
}

/// CustomPainter untuk menggambar aksen lengkungan emas & transisi latar belakang bawah
class _WaveCurvePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // 1. Lengkungan Emas (Gold Accent Ribbon)
    final goldPaint = Paint()
      ..color = AppColors.goldAccent
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;

    final goldPath = Path();
    goldPath.moveTo(0, h * 0.45);
    goldPath.quadraticBezierTo(w * 0.35, h * 0.95, w * 0.70, h * 0.50);
    goldPath.quadraticBezierTo(w * 0.88, h * 0.25, w, h * 0.40);
    goldPath.lineTo(w, h);
    goldPath.lineTo(0, h);
    goldPath.close();
    canvas.drawPath(goldPath, goldPaint);

    // 2. Lengkungan Putih Utama (Body Background Transition)
    final whitePaint = Paint()
      ..color = AppColors.dashboardBg
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;

    final whitePath = Path();
    whitePath.moveTo(0, h * 0.65);
    whitePath.quadraticBezierTo(w * 0.35, h * 1.15, w * 0.72, h * 0.70);
    whitePath.quadraticBezierTo(w * 0.88, h * 0.45, w, h * 0.60);
    whitePath.lineTo(w, h);
    whitePath.lineTo(0, h);
    whitePath.close();
    canvas.drawPath(whitePath, whitePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
