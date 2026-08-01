@echo off
title RETC Backend - Keep this window open
cd /d "%~dp0backend"
if not exist "..\.venv\Scripts\python.exe" (
  echo [ERROR] Python environment is missing.
  echo Please close this window and double-click setup_project.bat first.
  pause
  exit /b 1
)
echo Backend is starting at http://127.0.0.1:8000
echo Keep this window open while using the website.
echo.
..\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
echo.
echo [ERROR] Backend stopped. Read the message above for the cause.
pause
