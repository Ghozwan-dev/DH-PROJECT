import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

/// Widget Welcome Section (Sesuai Butir 3):
/// - Teks sapaan: Assalamu'alaikum, Selamat Datang! di Aplikasi Santriya
/// - Background hijau tua dengan foto gedung pesantren di sisi kanan
/// - Aksen lengkungan warna hijau dan emas elegan sesuai gambar referensi
class WelcomeHeroBanner extends StatelessWidget {
  const WelcomeHeroBanner({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isDesktop = constraints.maxWidth >= 1024;
        final bannerHeight = isDesktop ? 230.0 : 195.0;
        final greetingStyle = isDesktop
            ? AppTextStyles.welcomeGreeting.copyWith(fontSize: 22, fontWeight: FontWeight.w700)
            : AppTextStyles.welcomeGreeting;
        final titleStyle = isDesktop
            ? AppTextStyles.welcomeTitle.copyWith(fontSize: 38, fontWeight: FontWeight.w800)
            : AppTextStyles.welcomeTitle;
        final subtitleStyle = isDesktop
            ? AppTextStyles.welcomeSubtitle.copyWith(fontSize: 17.5, fontWeight: FontWeight.w500)
            : AppTextStyles.welcomeSubtitle;

        return Stack(
          children: [
            // Kontainer Utama dengan Latar Belakang Hijau Tua & Gedung
            Container(
              width: double.infinity,
              height: bannerHeight,
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
                    width: isDesktop ? 340 : 210,
                    child: Image.asset(
                      'assets/images/pesantren_building.png',
                      fit: BoxFit.cover,
                      alignment: Alignment.centerLeft,
                      errorBuilder: (_, __, ___) => const SizedBox(),
                    ),
                  ),

                  // Teks Sapaan di Sisi Kiri
                  Positioned(
                    left: isDesktop ? 40 : 20,
                    top: isDesktop ? 32 : 14,
                    right: isDesktop ? 320 : 170,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          "Assalamu'alaikum,",
                          style: greetingStyle,
                        ),
                        SizedBox(height: isDesktop ? 6 : 4),
                        Text(
                          'Selamat Datang!',
                          style: titleStyle,
                        ),
                        SizedBox(height: isDesktop ? 8 : 6),
                        Text(
                          'Di Aplikasi SANTRIYA',
                          style: subtitleStyle,
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
              height: isDesktop ? 40 : 38,
              child: CustomPaint(
                painter: _WaveCurvePainter(),
              ),
            ),
          ],
        );
      },
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
