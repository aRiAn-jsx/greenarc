<?php
declare(strict_types=1);

final class PostController {
    // GET /api/posts?q=&cat= (public)
    public static function listPublic(): void {
        $q = trim($_GET['q'] ?? '');
        $cat = trim($_GET['cat'] ?? '');
        $sql = "SELECT id, slug, title, cat, created_at FROM posts WHERE 1";
        $params = [];
        if ($cat !== '' && $cat !== 'all') { $sql .= " AND cat=?"; $params[] = $cat; }
        if ($q !== '') { $sql .= " AND (title LIKE ? OR slug LIKE ?)"; $params[]="%$q%"; $params[]="%$q%"; }
        $sql .= " ORDER BY id DESC LIMIT 100";
        $stmt = db()->prepare($sql); $stmt->execute($params);
        Response::ok($stmt->fetchAll());
    }
    // GET /api/posts/{slug}
    public static function getOne(): void {
        $slug = trim($_GET['slug'] ?? basename(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)));
        // also support /api/posts?slug=xxx
        if (isset($_GET['slug'])) $slug = $_GET['slug'];
        else {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $parts = explode('/', trim($path,'/'));
            $slug = end($parts);
        }
        $stmt = db()->prepare("SELECT * FROM posts WHERE slug=? LIMIT 1");
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        if (!$row) Response::error('مقاله یافت نشد',404);
        Response::ok($row);
    }
    // Admin CRUD
    public static function adminList(): void {
        AuthMiddleware::requireAdmin();
        $rows = db()->query("SELECT * FROM posts ORDER BY id DESC")->fetchAll();
        Response::ok($rows);
    }
    public static function create(): void {
        AuthMiddleware::requireAdmin();
        $in = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $title = Validator::text((string)($in['title'] ?? ''), 160);
        $slug = trim((string)($in['slug'] ?? ''));
        $cat = Validator::text((string)($in['cat'] ?? 'عمومی'), 30);
        $body = trim((string)($in['body'] ?? ''));
        if ($title === '' || mb_strlen($title) < 3) Response::error('عنوان حداقل ۳ کاراکتر',422);
        if ($slug === '') $slug = preg_replace('/\s+/', '-', $title);
        $slug = preg_replace('/[^a-z0-9\-_]/i', '-', $slug);
        $slug = strtolower(trim($slug,'-'));
        if ($slug === '') $slug = 'post-'.time();
        if (mb_strlen($body) < 10) Response::error('متن مقاله کوتاه است',422);
        // unique slug
        $chk = db()->prepare("SELECT id FROM posts WHERE slug=? LIMIT 1"); $chk->execute([$slug]);
        if ($chk->fetch()) $slug .= '-'.time();
        db()->prepare("INSERT INTO posts (slug, title, body, cat) VALUES (?,?,?,?)")->execute([$slug,$title,$body,$cat]);
        Response::ok(['id'=>db()->lastInsertId(),'slug'=>$slug],'مقاله ایجاد شد');
    }
    public static function update(): void {
        AuthMiddleware::requireAdmin();
        $in = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $id = (int)($in['id'] ?? 0);
        if (!$id) Response::error('id الزامی است',422);
        $title = Validator::text((string)($in['title'] ?? ''), 160);
        $cat = Validator::text((string)($in['cat'] ?? ''), 30);
        $body = trim((string)($in['body'] ?? ''));
        $fields=[]; $params=[];
        if ($title !== '') { $fields[]="title=?"; $params[]=$title; }
        if ($cat !== '') { $fields[]="cat=?"; $params[]=$cat; }
        if ($body !== '') { $fields[]="body=?"; $params[]=$body; }
        if (!$fields) Response::error('چیزی برای به‌روزرسانی نیست',422);
        $params[]=$id;
        db()->prepare("UPDATE posts SET ".implode(',',$fields)." WHERE id=?")->execute($params);
        Response::ok(null,'به‌روزرسانی شد');
    }
    public static function delete(): void {
        AuthMiddleware::requireAdmin();
        $in = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $id = (int)($in['id'] ?? $_POST['id'] ?? 0);
        if (!$id) Response::error('id الزامی است',422);
        db()->prepare("DELETE FROM posts WHERE id=?")->execute([$id]);
        Response::ok(null,'حذف شد');
    }
}
