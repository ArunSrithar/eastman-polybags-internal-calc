@echo off
setlocal

cd /d "%~dp0"
echo ==================================================
echo Eastman Beta Start
echo Starting server and client...
echo ==================================================

npm start

echo.
echo App stopped.
pause
