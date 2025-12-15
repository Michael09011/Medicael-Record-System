-- Create EMR database for the project
CREATE DATABASE IF NOT EXISTS EMR CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Example: grant privileges to root@localhost (root user typically already has privileges)
-- GRANT ALL ON EMR.* TO 'root'@'localhost';
