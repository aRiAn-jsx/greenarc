<?php
declare(strict_types=1);

final class AuthMiddleware {
    public static function startSession(): void {
        if (session_status() === PHP_SESSION_NONE) {
            $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
            session_set_cookie_params([
                'lifetime' => 60*60*24*7, // 7 days
                'path' => '/',
                'httponly' => true,
                'secure' => $secure,
                'samesite' => 'Lax',
            ]);
            session_start();
        }
    }

    public static function user(): ?array {
        self::startSession();
        return $_SESSION['user'] ?? null;
    }

    public static function requireLogin(): array {
        $u = self::user();
        if (!$u) {
            Response::error('وارد نشده‌اید', 401);
        }
        return $u;
    }

    public static function requireAdmin(): array {
        $u = self::requireLogin();
        if (($u['role'] ?? 'user') !== 'admin') {
            Response::error('دسترسی غیرمجاز', 403);
        }
        return $u;
    }

    public static function login(array $user): void {
        self::startSession();
        // regenerate to prevent fixation
        session_regenerate_id(true);
        $_SESSION['user'] = [
            'id' => (int)$user['id'],
            'username' => $user['username'],
            'phone' => $user['phone'],
            'role' => $user['role'] ?? 'user',
        ];
    }

    public static function logout(): void {
        self::startSession();
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(session_name(), '', time()-42000, $p['path'], $p['domain'] ?? '', $p['secure'], $p['httponly']);
        }
        session_destroy();
    }
}
