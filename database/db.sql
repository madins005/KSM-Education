CREATE DATABASE IF NOT EXISTS journal_system CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE journal_system;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(200),
  role ENUM('admin','user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE uploads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(512) NOT NULL,
  original_name VARCHAR(512),
  mime VARCHAR(100),
  size INT,
  url VARCHAR(1024) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE journals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(512) NOT NULL,
  abstract TEXT,
  file_upload_id INT,
  cover_upload_id INT,
  authors JSON NULL,
  tags JSON NULL,
  pengurus TEXT NULL,              
  email VARCHAR(255),
  contact VARCHAR(100),
  volume VARCHAR(100) NULL,       
  views INT DEFAULT 0,
  client_temp_id VARCHAR(255) DEFAULT NULL,
  client_updated_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (file_upload_id) REFERENCES uploads(id) ON DELETE SET NULL,
  FOREIGN KEY (cover_upload_id) REFERENCES uploads(id) ON DELETE SET NULL
);


CREATE TABLE opinions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(512) NOT NULL,
  description TEXT,
  file_upload_id INT,
  cover_upload_id INT,
  authors JSON NULL,
  tags JSON NULL,
  email VARCHAR(255),
  contact VARCHAR(100),
  client_temp_id VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (file_upload_id) REFERENCES uploads(id) ON DELETE SET NULL,
  FOREIGN KEY (cover_upload_id) REFERENCES uploads(id) ON DELETE SET NULL
);

CREATE TABLE sync_queue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id VARCHAR(255),
  payload JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
