import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

/// Bottom Sheet reusable untuk pemilihan foto profil / avatar santri
/// Menghilangkan duplikasi kode antara student_form_page dan student_detail_page
class StudentAvatarPickerSheet extends StatelessWidget {
  final bool isMale;
  final String? currentAvatar;
  final ValueChanged<String> onSelected;
  final String? title;

  const StudentAvatarPickerSheet({
    super.key,
    required this.isMale,
    required this.currentAvatar,
    required this.onSelected,
    this.title,
  });

  static const List<String> malePresets = [
    'assets/images/santri_ahmad.png',
    'assets/images/santri_rizky.png',
    'assets/images/santri_putra_2.png',
    'assets/images/santri_putra_3.png',
  ];

  static const List<String> femalePresets = [
    'assets/images/santri_aisyah.png',
    'assets/images/santri_putri_2.png',
    'assets/images/santri_putri_3.png',
  ];

  static Future<void> show({
    required BuildContext context,
    required bool isMale,
    required String? currentAvatar,
    required ValueChanged<String> onSelected,
    String? title,
  }) {
    return showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StudentAvatarPickerSheet(
        isMale: isMale,
        currentAvatar: currentAvatar,
        onSelected: onSelected,
        title: title,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final presets = isMale ? malePresets : femalePresets;
    final displayTitle = title ?? 'Pilih Foto Profil Santri (${isMale ? 'Putra' : 'Putri'})';

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  displayTitle,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              'Pilih dari pilihan foto avatar santri ${isMale ? 'putra' : 'putri'}:',
              style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: presets.map((path) {
                final isCurrent = currentAvatar == path;
                return InkWell(
                  onTap: () {
                    Navigator.pop(context);
                    onSelected(path);
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    width: 68,
                    height: 68,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isCurrent ? AppColors.primary : Colors.grey.shade300,
                        width: isCurrent ? 3 : 1.5,
                      ),
                      boxShadow: [
                        if (isCurrent)
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.3),
                            blurRadius: 8,
                          ),
                      ],
                    ),
                    child: ClipOval(
                      child: Image.asset(
                        path,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Icon(Icons.person, color: AppColors.primary),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 20),
            const Divider(),
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: () {
                Navigator.pop(context);
                final altPath = isMale ? 'assets/images/santri_rizky.png' : 'assets/images/santri_putri_2.png';
                onSelected(altPath);
              },
              icon: const Icon(Icons.photo_library_outlined, size: 18, color: AppColors.primary),
              label: const Text(
                'Pilih dari Galeri Perangkat',
                style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.primary),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                minimumSize: const Size.fromHeight(44),
              ),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }
}
