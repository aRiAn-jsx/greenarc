<?php
declare(strict_types=1);

final class ContactController {
    // POST /api/contact  {name, phone, email?, subject, message}
    public static function store(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $name    = Validator::text((string)($input['name'] ?? ''), 80);
        $phone   = trim((string)($input['phone'] ?? ''));
        $email   = trim((string)($input['email'] ?? ''));
        $subject = Validator::text((string)($input['subject'] ?? 'سایر'), 60);
        $message = Validator::text((string)($input['message'] ?? ''), 3000);

        if ($name === '' || mb_strlen($name) < 2) Response::error('نام الزامی است', 422);
        if (!Validator::phone($phone)) Response::error('شماره موبایل معتبر نیست', 422);
        if ($email !== '' && !Validator::email($email)) Response::error('ایمیل نامعتبر', 422);
        if ($message === '' || mb_strlen($message) < 5) Response::error('متن پیام کوتاه است', 422);

        $pdo = db();
        $pdo->prepare("INSERT INTO messages (sender_name, phone, email, subject, body) VALUES (?,?,?,?,?)")
            ->execute([$name, $phone, $email, $subject, $message]);
        Logger::log('contact.store', "$name $phone $subject");

        Response::ok(null, 'پیام شما ثبت شد');
    }

    // POST /api/consult  {name, phone, type}
    public static function consult(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $name = Validator::text((string)($input['name'] ?? ''), 80);
        $phone = trim((string)($input['phone'] ?? ''));
        $type = Validator::text((string)($input['type'] ?? 'شبیه‌سازی انرژی'), 60);
        if ($name === '' || !Validator::phone($phone)) Response::error('اطلاعات نامعتبر', 422);
        $pdo = db();
        $pdo->prepare("INSERT INTO consults (name, phone, type, status) VALUES (?,?,?,'new')")
            ->execute([$name, $phone, $type]);
        Response::ok(null, 'درخواست مشاوره ثبت شد');
    }
}
