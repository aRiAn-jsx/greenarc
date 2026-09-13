<?php
declare(strict_types=1);

final class Jwt {
    private static function secret(): string {
        $env = require __DIR__ . '/../../config/env.php';
        return $env['JWT_SECRET'];
    }

    public static function encode(array $payload, int $ttl = 604800): string {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload['iat'] = time();
        $payload['exp'] = time() + $ttl;
        $payload = json_encode($payload);
        $b64 = fn($s) => rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
        $sig = hash_hmac('sha256', $b64($header) . '.' . $b64($payload), self::secret(), true);
        return $b64($header) . '.' . $b64($payload) . '.' . $b64($sig);
    }

    public static function decode(string $token): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;
        [$h, $p, $s] = $parts;
        $expected = hash_hmac('sha256', "$h.$p", self::secret(), true);
        if (!hash_equals($expected, self::b64d($s))) return null;
        $data = json_decode(self::b64d($p), true);
        if (!$data) return null;
        if (($data['exp'] ?? 0) < time()) return null;
        return $data;
    }

    private static function b64d(string $s): string {
        $s = strtr($s, '-_', '+/');
        $pad = 4 - (strlen($s) % 4);
        if ($pad !== 4) $s .= str_repeat('=', $pad);
        return base64_decode($s);
    }
}