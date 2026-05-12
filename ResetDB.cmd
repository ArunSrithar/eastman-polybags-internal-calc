@echo off
setlocal

if /I not "%~1"=="__run__" (
  start "Eastman Beta Reset DB" "%ComSpec%" /k ""%~f0" __run__"
  exit /b
)

shift

cd /d "%~dp0"
echo ==================================================
echo Eastman Beta Reset DB
echo This will clear existing database data.
echo ==================================================
echo.

if not exist "server\node_modules\dotenv\package.json" (
  echo Dependencies are missing.
  echo Run Setup.cmd first, then retry ResetDB.cmd.
  echo.
  echo Press any key to close...
  pause >nul
  exit /b 1
)

set /p RESET_KEY=Enter reset key (DEV_RESET_DB_KEY): 

if "%RESET_KEY%"=="" (
  echo.
  echo Reset key is required.
  pause
  exit /b 1
)

echo.
echo Resetting database...
npm run dev:reset-db --prefix server -- --key "%RESET_KEY%"

if errorlevel 1 (
  echo.
  echo Reset failed. Please check the error above.
  echo.
  echo Press any key to close...
  pause >nul
  exit /b 1
)

echo.
echo Database reset completed.
echo You can close this window.
