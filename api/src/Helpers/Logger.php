<?php
declare(strict_types=1);

final class Logger {
    public static function log(string $action, ?string $detail = null, ?int $userId = null): void {
        try {
            $pdo = db();
            $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $ua = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);
            $uid = $userId ?? (AuthMiddleware::user()['id'] ?? null);
            // try DB first
            $pdo->prepare("INSERT INTO logs (user_id, action, detail, ip, ua) VALUES (?,?,?,?,?)")
                ->execute([$uid, $action, $detail, $ip, $ua]);
        } catch(Throwable $e) {
            // fallback to file if DB fails
        }
        // always file log for performance & audit (shared host friendly)
        $line = sprintf("[%s] uid=%s ip=%s %s %s %s\n",
            date('Y-m-d H:i:s'),
            $userId ?? (AuthMiddleware::user()['id'] ?? '-'),
            $_SERVER['REMOTE_ADDR'] ?? '-',
            $_SERVER['REQUEST_METHOD'] ?? '-',
            $action,
            $detail ? substr($detail,0,200) : ''
        );
        @file_put_contents(__DIR__ . '/../../storage_app.log', $line, FILE_APPEND | LOCK_EX);
    }
}
