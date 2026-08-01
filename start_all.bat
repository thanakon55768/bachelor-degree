@echo off
setlocal
title RETC Project Launcher
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
  echo [ERROR] Python environment is missing.
  echo Please double-click setup_project.bat first.
  echo.
  pause
  exit /b 1
)

if not exist "frontend\node_modules" (
  echo [ERROR] Frontend packages are missing.
  echo Please double-click setup_project.bat first.
  echo.
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js was not found.
  echo Please install Node.js LTS, then try again.
  echo.
  pause
  exit /b 1
)

echo Starting Backend and Frontend...
start "RETC Backend" cmd /k call "%~dp0start_backend.bat"
start "RETC Frontend" cmd /k call "%~dp0start_frontend.bat"

echo Please keep the two server windows open while using the website.
echo The browser will open at http://localhost:3000
timeout /t 4 /nobreak >nul

if /i not "%~1"=="--no-browser" start "" "http://localhost:3000"

echo.
echo If the page is not ready yet, wait a moment and refresh it.
timeout /t 4 /nobreak >nul
endlocal
