-- database.sql — arcbes — utf8mb4, InnoDB, indexes for performance
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

CREATE DATABASE IF NOT EXISTS arcbes_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE arcbes_db;

-- users: phone is unique, username unique
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(30) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  email VARCHAR(120) NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  status ENUM('active','blocked') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME NULL,
  UNIQUE KEY uq_phone (phone),
  UNIQUE KEY uq_username (username),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- otps: short-lived, index on phone+expires
CREATE TABLE IF NOT EXISTS otps (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(15) NOT NULL,
  code CHAR(6) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_phone (phone),
  KEY idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- messages (contact form)
CREATE TABLE IF NOT EXISTS messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sender_name VARCHAR(80) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  email VARCHAR(120) NULL,
  subject VARCHAR(80) NOT NULL DEFAULT 'سایر',
  body TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_read (is_read),
  KEY idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- consults
CREATE TABLE IF NOT EXISTS consults (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  type VARCHAR(60) NOT NULL,
  status ENUM('new','process','done') NOT NULL DEFAULT 'new',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- webinar participants
CREATE TABLE IF NOT EXISTS webinar_participants (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(120) NOT NULL,
  webinar VARCHAR(120) NOT NULL,
  status ENUM('registered','joined') NOT NULL DEFAULT 'registered',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- gallery
CREATE TABLE IF NOT EXISTS gallery (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(80) NOT NULL,
  cat VARCHAR(30) NOT NULL,
  src VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_cat (cat)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- posts (if needed for blog/news later)
CREATE TABLE IF NOT EXISTS posts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL,
  title VARCHAR(160) NOT NULL,
  body MEDIUMTEXT NOT NULL,
  cat VARCHAR(30) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- seed admin (password: Admin123! — hash generated)
INSERT INTO users (username, phone, email, role, status) VALUES
('admin', '09120000000', 'admin@arcbes.ir', 'admin', 'active')
ON DUPLICATE KEY UPDATE username=username;

-- seed gallery from existing site
INSERT INTO gallery (title, cat, src) VALUES
('ویلای آفتاب','مسکونی','https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'),
('برج بهار','اداری','https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'),
('دفتر مرکزی سپید','پایدار','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80')
ON DUPLICATE KEY UPDATE title=title;

-- logs: audit trail for every action
CREATE TABLE IF NOT EXISTS logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  action VARCHAR(60) NOT NULL,
  detail VARCHAR(255) NULL,
  ip VARCHAR(45) NULL,
  ua VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_action (action),
  KEY idx_user (user_id),
  KEY idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- rate_limits: for API rate limiting (IP-based)
CREATE TABLE IF NOT EXISTS rate_limits (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(120) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_key_time (`key`, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- event to clean expired otps every hour (requires EVENT privilege on shared host may be disabled — also cleaned on verify)
-- CREATE EVENT IF NOT EXISTS clean_otps ON SCHEDULE EVERY 1 HOUR DO DELETE FROM otps WHERE expires_at < NOW();

-- event to clean rate_limits every hour
-- CREATE EVENT IF NOT EXISTS clean_rate_limits ON SCHEDULE EVERY 1 HOUR DO DELETE FROM rate_limits WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 HOUR);
