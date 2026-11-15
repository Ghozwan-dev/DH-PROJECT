import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../data/services/schedule_service.dart';

/// Widget Pencarian & Filter Jadwal Pelajaran (Sesuai Butir C.3 & H):
/// - Kolom pencarian real-time (Mata Pelajaran & Nama Guru)
/// - Filter Hari horizontal scroll
/// - Filter Kelas horizontal scroll
class ScheduleFilterBar extends StatelessWidget {
  final String searchQuery;
  final String selectedDay;
  final String selectedClass;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<String> onDayChanged;
  final ValueChanged<String> onClassChanged;

  const ScheduleFilterBar({
    Key? key,
    required this.searchQuery,
    required this.selectedDay,
    required this.selectedClass,
    required this.onSearchChanged,
    required this.onDayChanged,
    required this.onClassChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1. Kolom Pencarian Real-Time
        Container(
          height: 46,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0), width: 1.2),
            boxShadow: const [
              BoxShadow(
                color: Color(0x06000000),
                offset: Offset(0, 2),
                blurRadius: 6,
              ),
            ],
          ),
          child: TextField(
            onChanged: onSearchChanged,
            controller: TextEditingController(text: searchQuery)
              ..selection = TextSelection.fromPosition(
                TextPosition(offset: searchQuery.length),
              ),
            style: const TextStyle(fontSize: 13.5, color: AppColors.textPrimary),
            decoration: InputDecoration(
              hintText: 'Cari mata pelajaran atau nama guru...',
              hintStyle: const TextStyle(fontSize: 13, color: AppColors.textHint),
              prefixIcon: const Icon(Icons.search_rounded, size: 20, color: AppColors.textHint),
              suffixIcon: searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear_rounded, size: 18, color: AppColors.textHint),
                      onPressed: () => onSearchChanged(''),
                    )
                  : null,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(vertical: 12),
            ),
          ),
        ),

        const SizedBox(height: 12),

        // 2. Filter Hari (Horizontal Scroll - Bebas Overflow)
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: Row(
            children: ScheduleService.dayOptions.map((day) {
              final isSelected = selectedDay == day;
              return Padding(
                padding: const EdgeInsets.only(right: 6.0),
                child: ChoiceChip(
                  label: Text(day == 'Semua' ? 'Semua Hari' : day),
                  selected: isSelected,
                  onSelected: (_) => onDayChanged(day),
                  selectedColor: AppColors.primary,
                  backgroundColor: Colors.white,
                  labelStyle: TextStyle(
                    fontSize: 11.5,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected ? Colors.white : AppColors.textSecondary,
                  ),
                  side: BorderSide(
                    color: isSelected ? AppColors.primary : const Color(0xFFE2E8F0),
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

        // 3. Filter Kelas (Horizontal Scroll - Bebas Overflow)
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: Row(
            children: ['Semua', ...ScheduleService.classOptions].map((c) {
              final isSelected = selectedClass == c;
              return Padding(
                padding: const EdgeInsets.only(right: 6.0),
                child: ChoiceChip(
                  label: Text(c == 'Semua' ? 'Semua Kelas' : 'Kelas $c'),
                  selected: isSelected,
                  onSelected: (_) => onClassChanged(c),
                  selectedColor: const Color(0xFF0284C7),
                  backgroundColor: Colors.white,
                  labelStyle: TextStyle(
                    fontSize: 11.5,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected ? Colors.white : AppColors.textSecondary,
                  ),
                  side: BorderSide(
                    color: isSelected ? const Color(0xFF0284C7) : const Color(0xFFE2E8F0),
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
      ],
    );
  }
}
