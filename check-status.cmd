@echo off
echo 🔍 Fomora Status Check
echo.

echo 1. Checking .env file...
if exist .env (
    echo ✅ .env exists
) else (
    echo ❌ .env missing
)

echo.
echo 2. Checking dependencies...
if exist node_modules (
    echo ✅ Root dependencies installed
) else (
    echo ❌ Root dependencies missing
)

if exist apps\web\node_modules (
    echo ✅ Web app dependencies installed
) else (
    echo ❌ Web app dependencies missing
)

if exist packages\db\node_modules (
    echo ✅ Database dependencies installed
) else (
    echo ❌ Database dependencies missing
)

echo.
echo 3. Checking ports...
netstat -an | findstr :8000 >nul
if errorlevel 1 (
    echo ❌ Port 8000 is free (no server running)
) else (
    echo ✅ Port 8000 is in use (server might be running)
)

echo.
echo 4. Manual test steps:
echo    - Run: cd apps\web
echo    - Run: pnpm dev
echo    - Open: http://localhost:8000
echo.

pause
