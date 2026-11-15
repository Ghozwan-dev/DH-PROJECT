/// Definisi Peran Pengguna Sesuai Butir 5:
/// "Aplikasi hanya memiliki dua role: Admin dan Guru."
enum UserRole {
  admin('Admin', 'admin'),
  guru('Guru', 'guru');

  final String label;
  final String value;
  const UserRole(this.label, this.value);

  static UserRole fromString(String? role) {
    if (role == null) return UserRole.guru;
    final lower = role.toLowerCase().trim();
    if (lower == 'admin') return UserRole.admin;
    return UserRole.guru;
  }
}

/// Model Pengguna Absensi Darul Hikmah
class UserModel {
  final String id;
  final String fullName;
  final String username;
  final String? email;
  final String phoneNumber;
  final String passwordHash; // Tidak pernah menyimpan plaintext
  final UserRole role;
  final DateTime createdAt;

  const UserModel({
    required this.id,
    required this.fullName,
    required this.username,
    this.email,
    required this.phoneNumber,
    required this.passwordHash,
    required this.role,
    required this.createdAt,
  });

  bool get isAdmin => role == UserRole.admin;
  bool get isGuru => role == UserRole.guru;

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'fullName': fullName,
      'username': username,
      'email': email,
      'phoneNumber': phoneNumber,
      'passwordHash': passwordHash,
      'role': role.value,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  Map<String, dynamic> toJson() => toMap();

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel.fromMap(json);

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      id: map['id']?.toString() ?? '',
      fullName: map['fullName']?.toString() ?? '',
      username: map['username']?.toString() ?? '',
      email: map['email']?.toString(),
      phoneNumber: map['phoneNumber']?.toString() ?? '',
      passwordHash: map['passwordHash']?.toString() ?? '',
      role: UserRole.fromString(map['role']?.toString()),
      createdAt: map['createdAt'] != null
          ? DateTime.tryParse(map['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  UserModel copyWith({
    String? id,
    String? fullName,
    String? username,
    String? email,
    String? phoneNumber,
    String? passwordHash,
    UserRole? role,
    DateTime? createdAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      fullName: fullName ?? this.fullName,
      username: username ?? this.username,
      email: email ?? this.email,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      passwordHash: passwordHash ?? this.passwordHash,
      role: role ?? this.role,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
