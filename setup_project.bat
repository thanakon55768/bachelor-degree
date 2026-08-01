@echo off
setlocal
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" python -m venv .venv
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r backend\requirements.txt

if not exist "backend\.env" copy "backend\.env.example" "backend\.env"
python backend\manage.py migrate

pushd frontend
call npm install
popd

echo.
echo Setup finished.
echo Create an admin with: .venv\Scripts\python.exe backend\manage.py createsuperuser
echo Start everything with: start_all.bat
endlocal
