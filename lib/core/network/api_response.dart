/// Standarisasi Format Envelope Response dari NestJS Backend
class ApiResponse<T> {
  final int statusCode;
  final String message;
  final T? data;
  final Map<String, dynamic>? meta;
  final bool success;

  const ApiResponse({
    required this.statusCode,
    required this.message,
    this.data,
    this.meta,
    required this.success,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic dataJson)? fromJsonT,
  ) {
    final status = json['statusCode'] as int? ?? 200;
    final isSuccess = status >= 200 && status < 300;
    final rawData = json['data'];

    return ApiResponse<T>(
      statusCode: status,
      message: json['message'] as String? ?? (isSuccess ? 'Success' : 'Error'),
      data: rawData != null && fromJsonT != null ? fromJsonT(rawData) : rawData as T?,
      meta: json['meta'] as Map<String, dynamic>?,
      success: isSuccess,
    );
  }

  factory ApiResponse.success(T data, {String message = 'Sukses', int statusCode = 200, Map<String, dynamic>? meta}) {
    return ApiResponse<T>(
      statusCode: statusCode,
      message: message,
      data: data,
      meta: meta,
      success: true,
    );
  }

  factory ApiResponse.error(String message, {int statusCode = 400, Map<String, dynamic>? meta}) {
    return ApiResponse<T>(
      statusCode: statusCode,
      message: message,
      data: null,
      meta: meta,
      success: false,
    );
  }
}
