@echo off
setlocal
py -m venv .venv
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
if not exist .env copy .env.example .env
python manage.py migrate
echo.
echo Setup complete. Create an admin with: python manage.py createsuperuser
echo Start the server with: python manage.py runserver
endlocal
