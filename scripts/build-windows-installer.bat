@echo off
REM Build Veraglo-ERP-Setup.exe on Windows (recommended).
setlocal
cd /d "%~dp0\.."

echo ==^> Installing API dependencies...
cd server
call npm install --omit=dev
if errorlevel 1 exit /b 1
cd ..

echo ==^> Installing Electron builder...
cd desktop
call npm install
if errorlevel 1 exit /b 1

echo ==^> Building Windows installer...
call npm run dist:win
if errorlevel 1 exit /b 1
cd ..

echo.
echo Done. Installer:
dir /b desktop\dist\*.exe
echo.
echo Copy the .exe to other laptops and run Setup.
pause
