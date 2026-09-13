<?php
declare(strict_types=1);

final class Validator {
    public static function phone(string $v): bool {
        return (bool) preg_match('/^09\d{9}$/', trim($v));
    }
    public static function username(string $v): bool {
        $v = trim($v);
        return mb_strlen($v) >= 3 && mb_strlen($v) <= 30;
    }
    public static function email(string $v): bool {
        if ($v === '') return true; // optional field
        return filter_var($v, FILTER_VALIDATE_EMAIL) !== false;
    }
    public static function required(string $v): bool {
        return trim($v) !== '';
    }
    public static function sanitize(string $v): string {
        return trim(htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));
    }
    // strict: strip tags + limit length
    public static function text(string $v, int $max = 2000): string {
        $v = trim(strip_tags($v));
        if (mb_strlen($v) > $max) $v = mb_substr($v, 0, $max);
        return $v;
    }
}
