<?php
declare(strict_types=1);

final class AuthController {
    // POST /api/auth/send-otp  {phone}
    public static function sendOtp(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $phone = trim((string)($input['phone'] ?? ''));
        if (!Validator::phone($phone)) {
            Response::error('شماره موبایل معتبر نیست (۰۹xxxxxxxxx)', 422);
        }
        $pdo = db();
        $env = require __DIR__ . '/../../config/env.php';
        $resendSec = (int)$env['OTP_RESEND_SECONDS'];
        $expireSec = (int)$env['OTP_EXPIRE_SECONDS'];

        // rate-limit: check last OTP for this phone
        $stmt = $pdo->prepare("SELECT created_at FROM otps WHERE phone=? ORDER BY id DESC LIMIT 1");
        $stmt->execute([$phone]);
        $last = $stmt->fetch();
        if ($last) {
            $elapsed = time() - strtotime($last['created_at']);
            if ($elapsed < $resendSec) {
                Response::error('لطفاً ' . ($resendSec - $elapsed) . ' ثانیه دیگر تلاش کنید', 429);
            }
        }

        // generate 6-digit code
        $code = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = date('Y-m-d H:i:s', time() + $expireSec);

        // clean old codes for this phone
        $pdo->prepare("DELETE FROM otps WHERE phone=?")->execute([$phone]);
        $pdo->prepare("INSERT INTO otps (phone, code, expires_at) VALUES (?,?,?)")->execute([$phone, $code, $expiresAt]);

        // log always (for audit)
        $logLine = date('Y-m-d H:i:s') . " | $phone | $code | expires $expiresAt\n";
        @file_put_contents(__DIR__ . '/../../storage_otp.log', $logLine, FILE_APPEND | LOCK_EX);
        Logger::log('auth.send_otp', $phone);

        // try real SMS via Kavenegar (if API key set) — non-blocking; on fail still return ok (code is in DB)
        $smsOk = Sms::sendOtp($phone, $code);
        if (!$smsOk) {
            // don't fail the request — OTP is saved, user can use dev_code in dev or retry
            error_log("SMS failed for $phone, code $code — fallback to log");
        }

        // if real gateway configured, send here (kavenegar etc) — omitted for performance

        // in dev (no SMS key) return code for testing; in prod do NOT expose code
        $isDev = ($env['SMS_API_KEY'] === '' || $env['SMS_API_KEY'] === 'change-me');
        Response::ok(
            $isDev ? ['dev_code' => $code, 'expires_in' => $expireSec] : ['expires_in' => $expireSec],
            $isDev ? 'کد تأیید (تست): '.$code : 'کد تأیید پیامک شد'
        );
    }

    // POST /api/auth/verify  {phone, code}
    public static function verify(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $phone = trim((string)($input['phone'] ?? ''));
        $code  = trim((string)($input['code'] ?? ''));
        if (!Validator::phone($phone) || !preg_match('/^\d{6}$/', $code)) {
            Response::error('اطلاعات نامعتبر', 422);
        }
        $pdo = db();
        $stmt = $pdo->prepare("SELECT * FROM otps WHERE phone=? AND code=? LIMIT 1");
        $stmt->execute([$phone, $code]);
        $otp = $stmt->fetch();
        if (!$otp) {
            Response::error('کد صحیح نیست', 401);
        }
        if (strtotime($otp['expires_at']) < time()) {
            Response::error('کد منقضی شده است', 401);
        }
        // consume otp
        $pdo->prepare("DELETE FROM otps WHERE phone=?")->execute([$phone]);

        // find or auto-create user? For login, user must exist; for verify we create if not exists? We keep login-only: user must be registered
        $stmt = $pdo->prepare("SELECT * FROM users WHERE phone=? LIMIT 1");
        $stmt->execute([$phone]);
        $user = $stmt->fetch();
        if (!$user) {
            Response::error('کاربری با این شماره یافت نشد؛ ابتدا ثبت‌نام کنید', 404);
        }
        // update last_login
        $pdo->prepare("UPDATE users SET last_login=NOW() WHERE id=?")->execute([$user['id']]);
        AuthMiddleware::login($user);
        Logger::log('auth.verify', $phone, (int)$user['id']);
        Response::ok(['user' => ['id'=>$user['id'],'username'=>$user['username'],'phone'=>$user['phone'],'role'=>$user['role']]], 'ورود موفق');
    }

    // POST /api/auth/register  {username, phone}
    public static function register(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $username = trim((string)($input['username'] ?? ''));
        $phone    = trim((string)($input['phone'] ?? ''));
        if (!Validator::username($username)) {
            Response::error('نام کاربری حداقل ۳ کاراکتر', 422);
        }
        if (!Validator::phone($phone)) {
            Response::error('شماره موبایل معتبر نیست', 422);
        }
        $pdo = db();
        // uniqueness
        $stmt = $pdo->prepare("SELECT id FROM users WHERE phone=? OR username=? LIMIT 1");
        $stmt->execute([$phone, $username]);
        if ($stmt->fetch()) {
            Response::error('نام کاربری یا شماره قبلاً ثبت شده', 409);
        }
        $pdo->prepare("INSERT INTO users (username, phone, role) VALUES (?,?, 'user')")->execute([$username, $phone]);
        $id = (int)$pdo->lastInsertId();
        Logger::log('auth.register', "$username $phone", $id);
        Response::ok(['id'=>$id], 'ثبت‌نام انجام شد؛ اکنون وارد شوید');
    }

    // POST /api/auth/logout
    public static function logout(): void {
        AuthMiddleware::logout();
        Response::ok(null, 'خروج موفق');
    }

    // GET /api/auth/me
    public static function me(): void {
        $u = AuthMiddleware::user();
        if (!$u) Response::error('وارد نشده‌اید', 401);
        Response::ok(['user'=>$u]);
    }
}
