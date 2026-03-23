DROP DATABASE IF EXISTS judge_platform; 
CREATE DATABASE judge_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; 
USE judge_platform; 
CREATE TABLE departments ( 
id INT AUTO_INCREMENT PRIMARY KEY, 
name VARCHAR(100) NOT NULL UNIQUE 
); 
CREATE TABLE users ( 
id INT AUTO_INCREMENT PRIMARY KEY, 
name VARCHAR(150) NOT NULL, 
email VARCHAR(150) NOT NULL UNIQUE, 
password VARCHAR(255) NOT NULL, 
role ENUM('user','faculty','admin') NOT NULL DEFAULT 'user', 
department_id INT NULL, 
batch VARCHAR(50) NULL, 
rating INT DEFAULT 1000, 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL 
); 
CREATE TABLE problems ( 
id INT AUTO_INCREMENT PRIMARY KEY, 
title VARCHAR(255) NOT NULL, 
statement TEXT NOT NULL, 
difficulty ENUM('easy','medium','hard') NOT NULL, 
visible BOOLEAN DEFAULT TRUE, 
created_by INT NULL, 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL 
); 
CREATE TABLE tags ( 
id INT AUTO_INCREMENT PRIMARY KEY, 
name VARCHAR(100) NOT NULL UNIQUE 
); 
CREATE TABLE problem_tags ( 
problem_id INT NOT NULL, 
tag_id INT NOT NULL, 
PRIMARY KEY (problem_id, tag_id), 
FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE, 
FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE 
); 
CREATE TABLE contests ( 
id INT AUTO_INCREMENT PRIMARY KEY, 
title VARCHAR(255) NOT NULL, 
department_id INT NULL, 
start_time DATETIME NOT NULL, 
end_time DATETIME NOT NULL, 
created_by INT NULL, 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL, 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL 
); 
CREATE TABLE contest_problems ( 
id INT AUTO_INCREMENT PRIMARY KEY, 
contest_id INT NOT NULL, 
problem_id INT NOT NULL, 
FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE, 
FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE 
); 
CREATE TABLE submissions ( 
id INT AUTO_INCREMENT PRIMARY KEY, 
user_id INT NOT NULL, 
contest_id INT NULL, 
problem_id INT NOT NULL, 
verdict ENUM('AC','WA','TLE','RE','CE') NOT NULL, 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, 
FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE SET NULL, 
FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE 
); 
CREATE TABLE contest_participants ( 
id INT AUTO_INCREMENT PRIMARY KEY, 
contest_id INT NOT NULL, 
user_id INT NOT NULL, 
rating_before INT, 
rating_after INT, 
FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE, 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE 
); 
CREATE TABLE testcases ( 
id INT AUTO_INCREMENT PRIMARY KEY, 
problem_id INT NOT NULL, 
input TEXT NOT NULL, 
expected_output TEXT NOT NULL, 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE 
); 
-- indexes for faster filtering 
CREATE INDEX idx_problems_diff ON problems (difficulty); 
CREATE INDEX idx_sub_contest_time ON submissions (contest_id, created_at); 
CREATE INDEX idx_sub_user ON submissions (user_id); 
CREATE INDEX idx_cp_contest_user ON contest_participants (contest_id, user_id);