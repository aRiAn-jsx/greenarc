<?php
// env.php — simple env loader (no composer needed) — for shared hosting just edit this file
return [
    'DB_HOST' => 'localhost',
    'DB_NAME' => 'arcbes_db',
    'DB_USER' => 'root',
    'DB_PASS' => '',
    'DB_CHARSET' => 'utf8mb4',

    // Kavenegar — از پنل https://panel.kavenegar.com بگیر
    // 1) API-KEY را اینجا بگذار 2) قالب lookup با نام arcbes-otp بساز (متن: کد تایید شما %token% )
    'SMS_API_KEY' => 'change-me', // <-- اینجا کلید واقعی را بگذار
    'SMS_SENDER'  => '10008663', // شماره فرستنده (اختیاری برای lookup)
    'SMS_TEMPLATE' => 'arcbes-otp', // نام قالب تایید شده در کاوه‌نگار

    // App
    'APP_URL' => 'http://localhost:8000',
    'JWT_SECRET' => 'change-this-to-random-64-chars-for-production',
    'OTP_EXPIRE_SECONDS' => 120,
    'OTP_RESEND_SECONDS' => 60,

    // Security
    'RATE_LIMIT_LOGIN' => 5,        // requests per minute per IP
    'RATE_LIMIT_API' => 60,         // requests per minute per IP
    'SESSION_LIFETIME' => 604800,   // 7 days
    'CSRF_TOKEN_NAME' => 'csrf_token',

    // Upload
    'UPLOAD_MAX_SIZE' => 4194304,   // 4MB
    'UPLOAD_ALLOWED_TYPES' => ['jpg', 'jpeg', 'png', 'webp'],

    // Error handling
    'APP_DEBUG' => true,
    'LOG_LEVEL' => 'info',
];
