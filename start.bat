@echo off
setlocal
cd /d "%~dp0"

where npm >nul 2>&1
if errorlevel 1 (
  echo ERROR: npm not found. Install Node.js LTS from https://nodejs.org/
  exit /b 1
)

if not exist index.html (
  echo ERROR: index.html not found. Run this from the Veraglo ERP repo root.
  exit /b 1
)

if not exist server\.env (
  copy server\.env.example server\.env >nul
  echo Created server\.env
)

REM Easiest local run without Docker
findstr /B "USE_FILE_STORAGE=1" server\.env >nul 2>&1
if errorlevel 1 (
  echo USE_FILE_STORAGE=1>> server\.env
  echo Using local file storage ^(no Docker required^).
)

echo Installing server dependencies...
cd server
call npm install
if errorlevel 1 exit /b 1

echo.
echo Starting Veraglo ERP on http://localhost:3000
echo Press Ctrl+C to stop.
echo.
call npm start
