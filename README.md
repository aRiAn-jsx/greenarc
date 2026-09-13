# Arcbes - وبسایت معماری و مهندسی سازه

یک وبسایت کامل برای شرکت معماری و مهندسی سازه با پنل مدیریت، احراز هویت SMS و API.

## ✨ ویژگی‌ها
- طراحی واکنشگرا (Responsive)
- پنل مدیریت با احراز هویت
- ثبت‌نام و لاگین با کد تایید SMS
- فرم تماس و مشاوره آنلاین
- گالری پروژه‌ها
- سیستم وبینار
- API RESTful برای ارتباط Front-end و Back-end

## 🏗️ ساختار پروژه
```
arcbes-website/
├── index.html              # صفحه اصلی
├── about.html              # درباره ما
├── services.html           # خدمات
├── portfolio.html          # نمونه کارها
├── blog.html              # وبلاگ
├── contact.html           # تماس با ما
├── webinar.html           # وبینار
├── login.html             # ورود
├── register.html          # ثبت‌نام
├── admin/                 # پنل مدیریت
├── api/                   # API بک‌اند (PHP)
├── assets/                # استایل‌ها و اسکریپت‌ها
├── uploads/               # فایل‌های آپلود شده
├── blog/                  # مقالات بلاگ
└── database.sql          # ساختار دیتابیس
```

## 🚀 نصب روی هاست
برای نصب روی هاست، مراحل [DEPLOYMENT.md](./DEPLOYMENT.md) را دنبال کنید.

## 🔧 نیازمندی‌ها
- هاست با PHP 7.4 یا بالاتر
- MySQL 5.7 یا بالاتر
- Apache یا Nginx با پشتیبانی از mod_rewrite
- دسترسی به API کاوه‌نگار برای ارسال SMS

## 📞 API Endpoints
```
POST   /api/auth/register   # ثبت‌نام
POST   /api/auth/login      # ورود
POST   /api/auth/verify     # تایید کد SMS
POST   /api/contact         # ارسال پیام تماس
POST   /api/consult         # ثبت درخواست مشاوره
POST   /api/webinar         # ثبت‌نام در وبینار
GET    /api/gallery         # دریافت گالری
GET    /api/status          # بررسی وضعیت سرور
```

## 👥 اطلاعات ورود پیش‌فرض
**پنل مدیریت:**
- آدرس: `دامین_شما/admin/`
- شماره موبایل: `09120000000`
- کلمه عبور: `Admin123!`

## 🔒 امنیت
- استفاده از JWT برای احراز هویت
- محدودیت نرخ درخواست (Rate Limiting)
- اعتبارسنجی ورودی‌ها
- محافظت در برابر CSRF
- رمزنگاری مناسب داده‌ها

## 📄 مستندات
- [DEPLOYMENT.md](./DEPLOYMENT.md) - راهنمای کامل نصب روی هاست
- [database.sql](./database.sql) - ساختار دیتابیس
- پوشه `api/` - مستندات API

## 🤝 توسعه
برای توسعه محلی:
1. تنظیمات XAMPP یا WAMP
2. کپی کردن پروژه در پوشه `htdocs`
3. تنظیم دیتابیس و فایل `env.php`
4. اجرای `database.sql`

## 📞 پشتیبانی
برای گزارش مشکلات یا درخواست ویژگی‌های جدید، Issues در ریپازیتوری پروژه را بررسی کنید.