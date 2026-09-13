<?php
// env.example.php — کپی کنید با نام env.php و تنظیمات هاست را وارد کنید
return [
    'DB_HOST' => 'localhost', // معمولاً localhost در هاست‌های اشتراکی
    'DB_NAME' => 'نام_دیتابیس_شما',
    'DB_USER' => 'نام_کاربری_دیتابیس',
    'DB_PASS' => 'رمز_عبور_دیتابیس',
    'DB_CHARSET' => 'utf8mb4',

    // کاوه‌نگار — از پنل https://panel.kavenegar.com بگیرید
    // 1) API-KEY را اینجا بگذارید 2) قالب lookup با نام arcbes-otp بسازید
    'SMS_API_KEY' => 'کلید_API_خود_را_اینجا_وارد_کنید',
    'SMS_SENDER'  => '10008663', // شماره فرستنده (اختیاری برای lookup)
    'SMS_TEMPLATE' => 'arcbes-otp', // نام قالب تایید شده در کاوه‌نگار

    // تنظیمات برنامه
    'APP_URL' => 'https://دامین_شما.ir', // آدرس اصلی سایت شما
    'JWT_SECRET' => 'یک_رشته_تصادفی_طولانی_حداقل_64_کاراکتر_اینجا_وارد_کنید',
    'OTP_EXPIRE_SECONDS' => 120,
    'OTP_RESEND_SECONDS' => 60,

    // امنیت
    'RATE_LIMIT_LOGIN' => 5,        // تعداد درخواست در دقیقه برای هر IP
    'RATE_LIMIT_API' => 60,         // تعداد درخواست در دقیقه برای هر IP
    'SESSION_LIFETIME' => 604800,   // 7 روز
    'CSRF_TOKEN_NAME' => 'csrf_token',

    // آپلود
    'UPLOAD_MAX_SIZE' => 4194304,   // 4MB
    'UPLOAD_ALLOWED_TYPES' => ['jpg', 'jpeg', 'png', 'webp'],

    // لاگ و دیباگ
    'APP_DEBUG' => false,           // در محیط production روی false قرار دهید
    'LOG_LEVEL' => 'info',
];
