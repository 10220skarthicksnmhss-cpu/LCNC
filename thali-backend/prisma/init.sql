-- ============================================================
--  Thali — PostgreSQL 18 initial setup
--  Run as superuser ONCE before running Prisma migrations.
--
--  Usage:
--    psql -U postgres -f prisma/init.sql
-- ============================================================

-- 1. Create a dedicated app role (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'thali') THEN
    CREATE ROLE thali WITH LOGIN PASSWORD 'thali_local_dev';
    RAISE NOTICE 'Role "thali" created.';
  ELSE
    RAISE NOTICE 'Role "thali" already exists — skipped.';
  END IF;
END
$$;

-- 2. Create the database owned by the app role
--    (comment this out and run manually if it already exists)
CREATE DATABASE thali_db OWNER thali;

-- 3. Grant schema-level privileges so Prisma can manage tables
\connect thali_db

GRANT ALL PRIVILEGES ON DATABASE thali_db TO thali;
GRANT ALL ON SCHEMA public TO thali;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES    TO thali;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO thali;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON FUNCTIONS TO thali;

\echo '✅  thali_db is ready. Run: npx prisma migrate dev --name init'
