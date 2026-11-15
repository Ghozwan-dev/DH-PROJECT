/// Standarisasi Exception Jaringan & API
/// Memudahkan error handling terpusat di seluruh lapisan aplikasi
abstract class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic details;

  const ApiException({
    required this.message,
    this.statusCode,
    this.details,
  });

  @override
  String toString() => message;
}

/// Kesalahan Koneksi Jaringan / Timeout
class NetworkException extends ApiException {
  const NetworkException({
    String message = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
    int? statusCode,
    dynamic details,
  }) : super(message: message, statusCode: statusCode, details: details);
}

/// Sesi Habis atau Kredensial Tidak Valid (HTTP 401)
class UnauthorizedException extends ApiException {
  const UnauthorizedException({
    String message = 'Sesi Anda telah berakhir atau kredensial tidak valid. Silakan login kembali.',
    int statusCode = 401,
    dynamic details,
  }) : super(message: message, statusCode: statusCode, details: details);
}

/// Akses Ditolak berdasarkan Role RBAC (HTTP 403)
class ForbiddenException extends ApiException {
  const ForbiddenException({
    String message = 'Akses ditolak: Anda tidak memiliki wewenang untuk tindakan ini.',
    int statusCode = 403,
    dynamic details,
  }) : super(message: message, statusCode: statusCode, details: details);
}

/// Data Tidak Ditemukan (HTTP 404)
class NotFoundException extends ApiException {
  const NotFoundException({
    String message = 'Data yang diminta tidak ditemukan.',
    int statusCode = 404,
    dynamic details,
  }) : super(message: message, statusCode: statusCode, details: details);
}

/// Validasi Input Gagal dari Server (HTTP 400 / 422)
class ValidationException extends ApiException {
  const ValidationException({
    required String message,
    int statusCode = 422,
    dynamic details,
  }) : super(message: message, statusCode: statusCode, details: details);
}

/// Kesalahan Internal Server (HTTP 500)
class ServerException extends ApiException {
  const ServerException({
    String message = 'Terjadi gangguan internal pada server. Silakan coba beberapa saat lagi.',
    int statusCode = 500,
    dynamic details,
  }) : super(message: message, statusCode: statusCode, details: details);
}
