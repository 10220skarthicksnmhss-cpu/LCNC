# ============================================================
#  Thali — One-shot database setup script (Windows / PowerShell)
#
#  Run this ONCE after installing PostgreSQL 18:
#    cd thali-backend
#    .\scripts\setup-db.ps1
#
#  What it does:
#    1. Creates the 'thali' role and 'thali_db' database
#    2. npm install
#    3. prisma generate
#    4. prisma migrate dev --name init  (creates all tables)
#    5. prisma seed                     (loads sample data)
# ============================================================

param(
  [string]$PgBin      = "C:\Program Files\PostgreSQL\18\bin",
  [string]$PgUser     = "postgres",
  [string]$PgPassword = "Cronin@33"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== Thali DB Setup ===" -ForegroundColor Cyan

# ── Step 1: PostgreSQL setup ────────────────────────────────────────────
$psql = Join-Path $PgBin "psql.exe"

if (-not (Test-Path $psql)) {
  Write-Error "psql not found at '$PgBin'. Pass -PgBin to point to your PostgreSQL 18 bin folder."
  exit 1
}

$env:PGPASSWORD = $PgPassword

Write-Host "`n[1/5] Creating role 'thali'..." -ForegroundColor Yellow
& $psql -U $PgUser -c @"
DO `$`$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'thali') THEN
    CREATE ROLE thali WITH LOGIN PASSWORD 'thali_local_dev';
    RAISE NOTICE 'Role thali created.';
  ELSE
    RAISE NOTICE 'Role thali already exists.';
  END IF;
END
`$`$;
"@

Write-Host "`n[2/5] Creating database 'thali_db'..." -ForegroundColor Yellow
$dbExists = & $psql -U $PgUser -tAc "SELECT 1 FROM pg_database WHERE datname='thali_db';"
if ($dbExists -eq "1") {
  Write-Host "  Database 'thali_db' already exists — skipped." -ForegroundColor DarkYellow
} else {
  & $psql -U $PgUser -c "CREATE DATABASE thali_db OWNER thali;"
  Write-Host "  Created." -ForegroundColor Green
}

Write-Host "`n[3/5] Granting schema privileges..." -ForegroundColor Yellow
& $psql -U $PgUser -d thali_db -c @"
GRANT ALL PRIVILEGES ON DATABASE thali_db TO thali;
GRANT ALL ON SCHEMA public TO thali;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO thali;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO thali;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO thali;
"@

Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue

# ── Step 2: Node dependencies ───────────────────────────────────────────
Write-Host "`n[4/5] Installing Node dependencies..." -ForegroundColor Yellow
npm install

# ── Step 3: Prisma ─────────────────────────────────────────────────────
Write-Host "`n[5/5] Running Prisma generate + migrate + seed..." -ForegroundColor Yellow
npx prisma generate

$migrationName = "init"
npx prisma migrate dev --name $migrationName

Write-Host "`n      Seeding sample data..." -ForegroundColor Yellow
npm run db:seed

# ── Done ────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Database ready!" -ForegroundColor Green
Write-Host "  Start the backend with:  npm run dev" -ForegroundColor Green
Write-Host "  API docs at:             http://localhost:3000/docs" -ForegroundColor Green
Write-Host "  DB Studio at:            npx prisma studio" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
