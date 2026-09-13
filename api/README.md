# Arcbes API — PHP Plain (Shared Hosting Ready)

## Performance & Security first
- PDO persistent, prepared statements, no ORM overhead
- Rate-limit OTP 60s, expire 120s
- Session httpOnly + SameSite=Lax + regenerate_id
- Input: trim + strip_tags + length limit + htmlspecialchars on output
- No composer/vendor needed — just upload

## Deploy on Shared Host (e.g., ParsPack, Iranserver, Hostinger)
1. Create DB `arcbes_db` in cPanel → Import `database.sql`
2. Edit `api/config/env.php` → set DB_HOST/NAME/USER/PASS
3. Upload whole `C:\arcbes-website` via FTP to `public_html` (so `api/` is at `yourdomain.ir/api`)
4. Ensure `api/uploads/gallery` is writable 755
5. For SMS real: set `SMS_API_KEY` + implement Kavenegar in `AuthController::sendOtp` (currently logs to `storage_otp.log`)
6. Test: `https://yourdomain.ir/api/health` → should return `{"ok":true}`

## Local dev (with PHP, not python http.server)
```bash
# PHP built-in server (executes PHP)
"C:\Users\Arian\AppData\Local\Programs\Python\Python311\python.exe" -m http.server 8000
# is NOT enough for PHP — use:
php -S localhost:8000 -t "C:\arcbes-website"
# then open http://localhost:8000 and http://localhost:8000/api/health
```

## Endpoints
- POST /api/auth/send-otp {phone}
- POST /api/auth/verify {phone, code}
- POST /api/auth/register {username, phone}
- POST /api/auth/logout
- GET  /api/auth/me
- POST /api/contact {name,phone,email,subject,message}
- POST /api/consult {name,phone,type}
- GET  /api/admin/stats , /admin/users etc (require admin session)

Default admin: phone `09120000000` (inserted by database.sql) — login via OTP `123456` in dev.

## Fallback
Frontend fetch has try/catch → if API/DB not ready, it falls back to demo (OTP 123456) so site still works offline.
