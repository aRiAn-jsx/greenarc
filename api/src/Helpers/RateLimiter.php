<?php
declare(strict_types=1);

final class RateLimiter {
    private static function key(string $prefix, string $identifier): string {
        return "ratelimit:$prefix:$identifier";
    }

    public static function check(string $prefix, string $identifier, int $maxRequests, int $windowSeconds): bool {
        $pdo = db();
        $key = self::key($prefix, $identifier);
        $now = time();
        $windowStart = $now - $windowSeconds;

        // Clean old entries
        $pdo->prepare("DELETE FROM rate_limits WHERE `key` = ? AND created_at < ?")
            ->execute([$key, date('Y-m-d H:i:s', $windowStart)]);

        // Count current
        $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM rate_limits WHERE `key` = ? AND created_at >= ?");
        $stmt->execute([$key, date('Y-m-d H:i:s', $windowStart)]);
        $count = (int)$stmt->fetchColumn();

        if ($count >= $maxRequests) {
            return false;
        }

        // Add new
        $pdo->prepare("INSERT INTO rate_limits (`key`, created_at) VALUES (?, NOW())")
            ->execute([$key]);
        return true;
    }

    public static function remaining(string $prefix, string $identifier, int $maxRequests, int $windowSeconds): int {
        $pdo = db();
        $key = self::key($prefix, $identifier);
        $windowStart = time() - $windowSeconds;
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM rate_limits WHERE `key` = ? AND created_at >= ?");
        $stmt->execute([$key, date('Y-m-d H:i:s', $windowStart)]);
        return max(0, $maxRequests - (int)$stmt->fetchColumn());
    }
}