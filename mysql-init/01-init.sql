-- Create production database and user
CREATE DATABASE IF NOT EXISTS fundtran_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create development database (matches your knex config)
CREATE DATABASE IF NOT EXISTS fundtran_db_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create test database
CREATE DATABASE IF NOT EXISTS fundtran_db_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create restricted root user (for Adminer access)
CREATE USER IF NOT EXISTS 'fundtran_admin'@'%' IDENTIFIED BY 'fundtran_admin';
GRANT ALL PRIVILEGES ON *.* TO 'fundtran_admin'@'%' WITH GRANT OPTION;

-- Create dedicated dev user (matches knex config)
CREATE USER IF NOT EXISTS 'fundtran_dev'@'%' IDENTIFIED BY 'fundtran_dev';
GRANT ALL PRIVILEGES ON fundtran_db_dev.* TO 'fundtran_dev'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON fundtran_db.* TO 'fundtran_dev'@'%';

-- Create dedicated test user
CREATE USER IF NOT EXISTS 'fundtran_test'@'%' IDENTIFIED BY 'fundtran_test';
GRANT ALL PRIVILEGES ON fundtran_db_test.* TO 'fundtran_test'@'%';

-- Create application user with least privileges
CREATE USER IF NOT EXISTS 'appuser'@'%' IDENTIFIED BY 'apppassword';
GRANT SELECT, INSERT, UPDATE, DELETE ON fundtran_db_dev.* TO 'appuser'@'%';

-- Financial database optimizations
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL innodb_flush_log_at_trx_commit = 1; -- ACID compliance
SET GLOBAL sync_binlog = 1; -- Crash safety
SET GLOBAL transaction_isolation = 'READ-COMMITTED'; -- Balance consistency vs performance

-- Enable slow query logging for optimization
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;
SET GLOBAL log_queries_not_using_indexes = 'ON';

FLUSH PRIVILEGES;