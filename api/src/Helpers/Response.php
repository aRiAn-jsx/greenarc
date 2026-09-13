<?php
declare(strict_types=1);

final class Response {
    public static function json(mixed $data, int $status = 200): void {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        // security headers
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        // CORS for same-origin; allow localhost dev
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin === '' || str_contains($origin, 'arcbes') || str_contains($origin, 'localhost')) {
            header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization');
            header('Access-Control-Allow-Credentials: true');
        }
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function error(string $msg, int $status = 400, mixed $extra = null): void {
        $payload = ['ok' => false, 'error' => $msg];
        if ($extra !== null) $payload['extra'] = $extra;
        self::json($payload, $status);
    }

    public static function ok(mixed $data = null, string $msg = 'ok'): void {
        $payload = ['ok' => true, 'message' => $msg];
        if ($data !== null) $payload['data'] = $data;
        self::json($payload);
    }
}
