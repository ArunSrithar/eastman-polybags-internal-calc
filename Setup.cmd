@echo off
setlocal

cd /d "%~dp0"
echo ==================================================
echo Eastman Beta Setup
echo Installing all dependencies (root, server, client)...
echo ==================================================

npm run install:all

if errorlevel 1 (
  echo.
  echo Setup failed. Please check the error above.
  pause
  exit /b 1
)

echo.
echo Setup completed successfully.
pause
