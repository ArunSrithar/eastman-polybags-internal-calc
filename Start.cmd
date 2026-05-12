@echo off
setlocal

if /I not "%~1"=="__run__" (
	start "Eastman Beta Start" "%ComSpec%" /k ""%~f0" __run__"
	exit /b
)

shift

cd /d "%~dp0"
echo ==================================================
echo Eastman Beta Start
echo Starting server and client...
echo ==================================================

npm start

echo.
echo App stopped.
echo You can close this window.
