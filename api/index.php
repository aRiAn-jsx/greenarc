<?php
declare(strict_types=1);
// api/index.php — front controller, performance: no framework, direct routing
header('X-Powered-By: arcbes');

// handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? '*'));
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Credentials: true');
    http_response_code(204); exit;
}

// autoload helpers (no composer)
require __DIR__ . '/config/db.php';
require __DIR__ . '/src/Helpers/Response.php';
require __DIR__ . '/src/Helpers/Validator.php';
require __DIR__ . '/src/Helpers/Logger.php';
require __DIR__ . '/src/Helpers/Sms.php';
require __DIR__ . '/src/Middleware/Auth.php';
require __DIR__ . '/src/Controllers/AuthController.php';
require __DIR__ . '/src/Controllers/ContactController.php';
require __DIR__ . '/src/Controllers/AdminController.php';
require __DIR__ . '/src/Controllers/PostController.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// strip /api prefix and trailing slash
$path = preg_replace('#^/api#', '', $uri);
$path = rtrim($path, '/');
if ($path === '') $path = '/';

// simple router array: [METHOD, PATH, HANDLER]
$routes = [
    ['GET',  '/health',          function(){ Response::ok(['time'=>date('c'), 'php'=>PHP_VERSION], 'ok'); }],
    ['POST', '/auth/send-otp',   [AuthController::class, 'sendOtp']],
    ['POST', '/auth/verify',     [AuthController::class, 'verify']],
    ['POST', '/auth/register',   [AuthController::class, 'register']],
    ['POST', '/auth/logout',     [AuthController::class, 'logout']],
    ['GET',  '/auth/me',         [AuthController::class, 'me']],

    ['POST', '/contact',         [ContactController::class, 'store']],
    ['POST', '/consult',         [ContactController::class, 'consult']],

    ['GET',  '/admin/stats',           [AdminController::class, 'stats']],
    ['GET',  '/admin/users',           [AdminController::class, 'usersList']],
    ['POST', '/admin/users/toggle',    [AdminController::class, 'userToggle']],
    ['POST', '/admin/users/delete',    [AdminController::class, 'userDelete']],
    ['GET',  '/admin/consults',        [AdminController::class, 'consultsList']],
    ['POST', '/admin/consults/update', [AdminController::class, 'consultUpdate']],
    ['POST', '/admin/consults/delete', [AdminController::class, 'consultDelete']],
    ['GET',  '/admin/messages',        [AdminController::class, 'messagesList']],
    ['POST', '/admin/messages/read',   [AdminController::class, 'messageRead']],
    ['POST', '/admin/messages/delete', [AdminController::class, 'messageDelete']],
    ['GET',  '/admin/gallery',         [AdminController::class, 'galleryList']],
    ['POST', '/admin/gallery/upload',  [AdminController::class, 'galleryUpload']],
    ['POST', '/admin/gallery/delete',  [AdminController::class, 'galleryDelete']],

    ['GET',  '/posts',                [PostController::class, 'listPublic']],
    ['GET',  '/posts/one',            [PostController::class, 'getOne']],
    ['GET',  '/admin/posts',          [PostController::class, 'adminList']],
    ['POST', '/admin/posts',          [PostController::class, 'create']],
    ['POST', '/admin/posts/update',   [PostController::class, 'update']],
    ['POST', '/admin/posts/delete',   [PostController::class, 'delete']],

    ['GET',  '/admin/logs',           function(){ AuthMiddleware::requireAdmin(); $rows=db()->query("SELECT l.*, u.username FROM logs l LEFT JOIN users u ON u.id=l.user_id ORDER BY l.id DESC LIMIT 200")->fetchAll(); Response::ok($rows); }],
];

foreach ($routes as [$m, $p, $h]) {
    if ($m === $method && $p === $path) {
        try {
            call_user_func($h);
        } catch (Throwable $e) {
            // log, don't leak details in production
            error_log($e->getMessage());
            Response::error('خطای سرور', 500);
        }
        exit;
    }
}
Response::error('مسیر یافت نشد', 404);
