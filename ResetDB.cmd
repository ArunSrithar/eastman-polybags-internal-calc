@echo off
setlocal

cd /d "%~dp0"
echo ==================================================
echo Eastman Beta Reset DB
echo This will clear existing database data.
echo ==================================================
echo.

set /p RESET_KEY=Enter reset key (DEV_RESET_DB_KEY): 

if "%RESET_KEY%"=="" (
  echo.
  echo Reset key is required.
  pause
  exit /b 1
)

echo.
echo Resetting database...
npm run reset-db -- --key "%RESET_KEY%"

if errorlevel 1 (
  echo.
  echo Reset failed. Please check the error above.
  pause
  exit /b 1
)

echo.
echo Database reset completed.
pause
