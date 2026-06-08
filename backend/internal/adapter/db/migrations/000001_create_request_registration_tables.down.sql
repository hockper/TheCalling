-- 000001_create_request_registration_tables.down.sql
-- Drops tables in reverse order to respect foreign key constraints.

DROP TABLE IF EXISTS service_requests;
DROP TABLE IF EXISTS users;
