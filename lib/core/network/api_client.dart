import 'dart:convert';
import 'api_endpoints.dart';
import 'api_exception.dart';
import 'api_response.dart';

/// Abstraksi REST API Client untuk Komunikasi ke NestJS
/// Mendukung Flutter Web & Android dengan penanganan timeout, header, dan token auth
class ApiClient {
  final String baseUrl;
  String? _authToken;

  ApiClient({String? baseUrl}) : baseUrl = baseUrl ?? ApiEndpoints.defaultBaseUrl;

  /// Set bearer token untuk request terautentikasi
  void setAuthToken(String? token) {
    _authToken = token;
  }

  /// Header default untuk request JSON
  Map<String, String> get defaultHeaders {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (_authToken != null && _authToken!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $_authToken';
    }
    return headers;
  }

  /// Memproses response JSON standar dan memetakan kode HTTP ke ApiException
  ApiResponse<T> handleResponse<T>(
    int statusCode,
    String responseBody,
    T Function(dynamic dataJson)? fromJsonT,
  ) {
    dynamic decoded;
    try {
      decoded = jsonDecode(responseBody);
    } catch (_) {
      decoded = {'message': responseBody};
    }

    final message = decoded is Map<String, dynamic>
        ? (decoded['message']?.toString() ?? 'Terjadi kesalahan')
        : 'Terjadi kesalahan';

    if (statusCode >= 200 && statusCode < 300) {
      if (decoded is Map<String, dynamic>) {
        return ApiResponse<T>.fromJson(decoded, fromJsonT);
      }
      return ApiResponse<T>.success(decoded as T, statusCode: statusCode);
    }

    if (statusCode == 401) {
      throw UnauthorizedException(message: message, statusCode: statusCode, details: decoded);
    } else if (statusCode == 403) {
      throw ForbiddenException(message: message, statusCode: statusCode, details: decoded);
    } else if (statusCode == 404) {
      throw NotFoundException(message: message, statusCode: statusCode, details: decoded);
    } else if (statusCode == 400 || statusCode == 422) {
      throw ValidationException(message: message, statusCode: statusCode, details: decoded);
    } else if (statusCode >= 500) {
      throw ServerException(message: message, statusCode: statusCode, details: decoded);
    } else {
      throw ServerException(message: 'HTTP Error $statusCode: $message', statusCode: statusCode, details: decoded);
    }
  }
}
