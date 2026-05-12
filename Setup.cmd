@echo off
setlocal

if /I not "%~1"=="__run__" (
  start "Eastman Beta Setup" "%ComSpec%" /k ""%~f0" __run__"
  exit /b
)

shift

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
echo You can close this window.