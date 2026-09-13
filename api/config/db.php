<?php
// db.php — PDO singleton, utf8mb4, shared-host friendly (no persistent)
declare(strict_types=1);

function db(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $env = require __DIR__ . '/env.php';
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=%s',
        $env['DB_HOST'],
        $env['DB_NAME'],
        $env['DB_CHARSET']
    );
    $pdo = new PDO($dsn, $env['DB_USER'], $env['DB_PASS'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::ATTR_PERSISTENT         => false, // disabled: causes issues on shared hosting
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$env['DB_CHARSET']} COLLATE utf8mb4_unicode_ci",
    ]);
    return $pdo;
}
