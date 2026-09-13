<?php
declare(strict_types=1);

final class Sms {
    /**
     * Send OTP via Kavenegar (lookup) — performance: curl with 3s timeout, fallback to log
     * Template must be created in kavenegar panel: e.g. "arcbes-otp" with token=%token%
     */
    public static function sendOtp(string $phone, string $code): bool {
        $env = require __DIR__ . '/../../config/env.php';
        $apiKey = trim((string)($env['SMS_API_KEY'] ?? ''));
        $sender = trim((string)($env['SMS_SENDER'] ?? ''));
        $template = trim((string)($env['SMS_TEMPLATE'] ?? 'arcbes-otp'));

        // if no API key → mock (dev): just log, return true
        if ($apiKey === '' || $apiKey === 'change-me') {
            return true;
        }

        // normalize phone: 0912... → 98912... for Kavenegar? API accepts 09...
        $receptor = $phone;

        // Kavenegar lookup API: POST https://api.kavenegar.com/v1/{apikey}/verify/lookup.json
        $url = "https://api.kavenegar.com/v1/{$apiKey}/verify/lookup.json";
        $data = http_build_query([
            'receptor' => $receptor,
            'token'    => $code,
            'template' => $template,
            // 'type' => 'sms', // optional
        ]);

        // prefer curl (more reliable on shared host with timeout)
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $data,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 3, // performance: fail fast
                CURLOPT_CONNECTTIMEOUT => 2,
                CURLOPT_SSL_VERIFYPEER => true,
            ]);
            $resp = curl_exec($ch);
            $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $err = curl_error($ch);
            curl_close($ch);
            if ($resp === false) {
                error_log("Kavenegar curl error: $err");
                return false;
            }
            $json = json_decode($resp, true);
            $ok = isset($json['return']['status']) && $json['return']['status'] === 200;
            if (!$ok) error_log("Kavenegar API failed: $resp");
            return $ok;
        }

        // fallback: file_get_contents
        $opts = ['http' => [
            'method'  => 'POST',
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'content' => $data,
            'timeout' => 3,
        ]];
        $ctx = stream_context_create($opts);
        $resp = @file_get_contents($url, false, $ctx);
        if ($resp === false) return false;
        $json = json_decode($resp, true);
        return isset($json['return']['status']) && $json['return']['status'] === 200;
    }

    // generic SMS (for future: notifications)
    public static function send(string $phone, string $message): bool {
        $env = require __DIR__ . '/../../config/env.php';
        $apiKey = trim((string)($env['SMS_API_KEY'] ?? ''));
        if ($apiKey === '' || $apiKey === 'change-me') return true;
        $url = "https://api.kavenegar.com/v1/{$apiKey}/sms/send.json";
        $data = http_build_query([
            'receptor' => $phone,
            'sender'   => $env['SMS_SENDER'] ?? '',
            'message'  => $message,
        ]);
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $data,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 3,
            ]);
            $resp = curl_exec($ch); curl_close($ch);
            $json = json_decode($resp, true);
            return isset($json['return']['status']) && $json['return']['status'] === 200;
        }
        return false;
    }
}
