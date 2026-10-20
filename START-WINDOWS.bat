@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Node.js is not installed. Install Node.js 22.13+ from https://nodejs.org/
 pause
 exit /b 1
)
echo Starting Viral Vision at http://localhost:3000
start "" "http://localhost:3000"
node server.mjs
pause
