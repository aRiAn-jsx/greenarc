<?php
declare(strict_types=1);

final class AdminController {
    private static function guard(): array { return AuthMiddleware::requireAdmin(); }

    // GET /api/admin/stats
    public static function stats(): void {
        self::guard();
        $pdo = db();
        $users = (int)$pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $consults = (int)$pdo->query("SELECT COUNT(*) FROM consults")->fetchColumn();
        $webinars = (int)$pdo->query("SELECT COUNT(*) FROM webinar_participants")->fetchColumn();
        $unread = (int)$pdo->query("SELECT COUNT(*) FROM messages WHERE is_read=0")->fetchColumn();
        $gallery = (int)$pdo->query("SELECT COUNT(*) FROM gallery")->fetchColumn();
        // monthly chart
        $monthly = $pdo->query("
            SELECT DATE_FORMAT(created_at,'%Y-%m') as ym, COUNT(*) as c FROM users
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 5 MONTH)
            GROUP BY ym ORDER BY ym
        ")->fetchAll();
        Response::ok(compact('users','consults','webinars','unread','gallery','monthly'));
    }

    // users CRUD
    public static function usersList(): void {
        self::guard();
        $q = trim($_GET['q'] ?? '');
        $filter = $_GET['filter'] ?? 'all';
        $sql = "SELECT id, username as name, phone, email, created_at as date, status FROM users WHERE 1";
        $params = [];
        if ($filter !== 'all') { $sql .= " AND status=?"; $params[] = $filter; }
        if ($q !== '') { $sql .= " AND (username LIKE ? OR phone LIKE ? OR email LIKE ?)"; $params[]="%$q%"; $params[]="%$q%"; $params[]="%$q%"; }
        $sql .= " ORDER BY id DESC LIMIT 200";
        $stmt = db()->prepare($sql); $stmt->execute($params);
        Response::ok($stmt->fetchAll());
    }
    public static function userToggle(): void {
        self::guard();
        $id = (int)($_POST['id'] ?? json_decode(file_get_contents('php://input'),true)['id'] ?? 0);
        $pdo = db();
        $u = $pdo->prepare("SELECT status FROM users WHERE id=?"); $u->execute([$id]); $row=$u->fetch();
        if (!$row) Response::error('کاربر یافت نشد',404);
        $new = $row['status']==='active'?'blocked':'active';
        $pdo->prepare("UPDATE users SET status=? WHERE id=?")->execute([$new,$id]);
        Response::ok(['status'=>$new]);
    }
    public static function userDelete(): void {
        self::guard();
        $id = (int)($_POST['id'] ?? 0);
        db()->prepare("DELETE FROM users WHERE id=?")->execute([$id]);
        Response::ok(null,'حذف شد');
    }

    // consults
    public static function consultsList(): void {
        self::guard();
        $f = $_GET['filter'] ?? 'all';
        $sql = "SELECT * FROM consults WHERE 1";
        $p=[];
        if($f!=='all'){ $sql.=" AND status=?"; $p[]=$f; }
        $sql.=" ORDER BY id DESC";
        $stmt=db()->prepare($sql); $stmt->execute($p);
        Response::ok($stmt->fetchAll());
    }
    public static function consultUpdate(): void {
        self::guard();
        $in = json_decode(file_get_contents('php://input'),true) ?? $_POST;
        $id=(int)($in['id']??0); $status=$in['status']??'';
        if(!in_array($status,['new','process','done'],true)) Response::error('وضعیت نامعتبر',422);
        db()->prepare("UPDATE consults SET status=? WHERE id=?")->execute([$status,$id]);
        Response::ok(null,'به‌روزرسانی شد');
    }
    public static function consultDelete(): void {
        self::guard();
        $id=(int)($_POST['id']??0);
        db()->prepare("DELETE FROM consults WHERE id=?")->execute([$id]);
        Response::ok(null,'حذف شد');
    }

    // messages
    public static function messagesList(): void {
        self::guard();
        $rows = db()->query("SELECT * FROM messages ORDER BY id DESC")->fetchAll();
        Response::ok($rows);
    }
    public static function messageRead(): void {
        self::guard();
        $in = json_decode(file_get_contents('php://input'),true) ?? $_POST;
        $id=(int)($in['id']??0);
        if(isset($in['all']) && $in['all']) { db()->exec("UPDATE messages SET is_read=1"); }
        else { db()->prepare("UPDATE messages SET is_read=1 WHERE id=?")->execute([$id]); }
        Response::ok(null,'خوانده شد');
    }
    public static function messageDelete(): void {
        self::guard();
        $id=(int)($_POST['id']??0);
        db()->prepare("DELETE FROM messages WHERE id=?")->execute([$id]);
        Response::ok(null,'حذف شد');
    }

    // gallery
    public static function galleryList(): void {
        self::guard();
        $rows = db()->query("SELECT * FROM gallery ORDER BY id DESC")->fetchAll();
        Response::ok($rows);
    }
    public static function galleryUpload(): void {
        self::guard();
        if(empty($_FILES['image'])) Response::error('فایلی ارسال نشد',400);
        $f = $_FILES['image'];
        if($f['error']!==UPLOAD_ERR_OK) Response::error('خطا در آپلود',400);
        if($f['size']>4*1024*1024) Response::error('حجم فایل بیشتر از ۴ مگابایت',400);
        $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
        if(!in_array($ext,['jpg','jpeg','png','webp'],true)) Response::error('فرمت مجاز: jpg, png, webp',400);
        // verify is image
        if(!@getimagesize($f['tmp_name'])) Response::error('فایل تصویر نیست',400);
        $name = bin2hex(random_bytes(8)).'.'.$ext;
        $dir = __DIR__ . '/../../uploads/gallery';
        if(!is_dir($dir)) mkdir($dir,0755,true);
        $dest = $dir.'/'.$name;
        if(!move_uploaded_file($f['tmp_name'],$dest)) Response::error('ذخیره نشد',500);
        $title = Validator::text($_POST['title'] ?? pathinfo($f['name'],PATHINFO_FILENAME), 80);
        $cat = Validator::text($_POST['cat'] ?? 'جدید', 30);
        $src = 'uploads/gallery/'.$name;
        db()->prepare("INSERT INTO gallery (title, cat, src) VALUES (?,?,?)")->execute([$title,$cat,$src]);
        Response::ok(['id'=>db()->lastInsertId(),'title'=>$title,'cat'=>$cat,'src'=>$src],'آپلود شد');
    }
    public static function galleryDelete(): void {
        self::guard();
        $id=(int)($_POST['id']??0);
        $row = db()->prepare("SELECT src FROM gallery WHERE id=?"); $row->execute([$id]); $r=$row->fetch();
        if($r){ $path=__DIR__.'/../../'.$r['src']; if(is_file($path)) @unlink($path); }
        db()->prepare("DELETE FROM gallery WHERE id=?")->execute([$id]);
        Response::ok(null,'حذف شد');
    }
}
