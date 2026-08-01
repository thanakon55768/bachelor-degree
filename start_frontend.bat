@echo off
title RETC Frontend - Keep this window open
cd /d "%~dp0frontend"
if not exist "node_modules" (
  echo [ERROR] Frontend packages are missing.
  echo Please close this window and double-click setup_project.bat first.
  pause
  exit /b 1
)
where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js was not found.
  echo Please install Node.js LTS, then try again.
  pause
  exit /b 1
)
echo Frontend is starting at http://localhost:3000
echo Keep this window open while using the website.
echo.
call npm run dev
echo.
echo [ERROR] Frontend stopped. Read the message above for the cause.
pause
