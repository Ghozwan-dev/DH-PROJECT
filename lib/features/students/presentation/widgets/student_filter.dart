import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../data/models/student_model.dart';

/// Filter Bar Santri (Sesuai Butir C.4):
/// - Filter berdasarkan Tingkat Kelas (Semua, VII, VIII, IX)
/// - Filter berdasarkan Jenis Kelamin (Semua, Putra, Putri)
class StudentFilterBar extends StatelessWidget {
  final String selectedGrade;
  final SantriGender? selectedGender;
  final ValueChanged<String> onGradeChanged;
  final ValueChanged<SantriGender?> onGenderChanged;

  const StudentFilterBar({
    Key? key,
    required this.selectedGrade,
    required this.selectedGender,
    required this.onGradeChanged,
    required this.onGenderChanged,
  }) : super(key: key);

  static const List<String> gradeOptions = ['Semua', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Filter Tingkat Kelas
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: Row(
            children: gradeOptions.map((grade) {
              final isSelected = selectedGrade == grade;
              return Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: ChoiceChip(
                  label: Text(grade == 'Semua' ? 'Semua Kelas' : 'Kelas $grade'),
                  selected: isSelected,
                  onSelected: (_) => onGradeChanged(grade),
                  selectedColor: AppColors.primary,
                  backgroundColor: Colors.white,
                  labelStyle: TextStyle(
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected ? Colors.white : AppColors.textSecondary,
                  ),
                  side: BorderSide(
                    color: isSelected ? AppColors.primary : AppColors.border,
                    width: 1,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              );
            }).toList(),
          ),
        ),

        const SizedBox(height: 8),

        // Filter Jenis Kelamin (Horizontal Scroll Aman RenderFlex)
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: Row(
            children: [
              _buildGenderFilterChip(
                label: 'Santri Putra',
                isSelected: selectedGender == SantriGender.putra,
                onTap: () => onGenderChanged(
                  selectedGender == SantriGender.putra ? null : SantriGender.putra,
                ),
                icon: Icons.male_rounded,
                activeColor: AppColors.genderMale,
              ),
              const SizedBox(width: 8),
              _buildGenderFilterChip(
                label: 'Santri Putri',
                isSelected: selectedGender == SantriGender.putri,
                onTap: () => onGenderChanged(
                  selectedGender == SantriGender.putri ? null : SantriGender.putri,
                ),
                icon: Icons.female_rounded,
                activeColor: AppColors.genderFemale,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildGenderFilterChip({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
    IconData? icon,
    Color? activeColor,
  }) {
    final color = activeColor ?? AppColors.primary;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? color.withOpacity(0.12) : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? color : AppColors.border,
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 14, color: isSelected ? color : AppColors.textMuted),
              const SizedBox(width: 4),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: 11.5,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? color : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
