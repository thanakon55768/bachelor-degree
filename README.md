# RTC BTech AIS 2026 — Clean Learning Repository

สำเนาที่จัดโครงสร้างใหม่สำหรับเปิดศึกษาและแก้ไขใน Visual Studio Code โดยแยกเฉพาะเว็บ Django ที่จำเป็นออกจาก `venv`, `.git` เดิม, ฐานข้อมูลจริง, PDF จริง, React ตัวอย่าง และไฟล์ PlatformIO

## ระบบนี้ทำอะไร

เว็บคลังผลงานวิจัย/โครงงาน มีระบบสมัครสมาชิก เข้าสู่ระบบ อัปโหลด PDF ค้นหา แสดงความคิดเห็น ให้คะแนน รายการโปรด และหน้าเจ้าหน้าที่อนุมัติผลงาน

## เปิดโปรเจกต์บน Windows

1. ติดตั้ง Python 3.11 หรือใหม่กว่า, Git และ Visual Studio Code
2. เปิดโฟลเดอร์นี้ใน VS Code
3. เปิด Terminal แล้วรัน:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

เปิด `http://127.0.0.1:8000/`

หาก PowerShell ไม่ยอม Activate ให้รันครั้งเดียว:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## เพิ่มข้อมูลจำลอง

หลัง `migrate` แล้ว สามารถสร้างข้อมูลตัวอย่าง 105 รายการได้ด้วย:

```powershell
python generate_dummy_data.py
```

ข้อมูลตัวอย่างไม่มี PDF จริง ใช้สำหรับทดลองหน้าแสดงรายการและการค้นหา

## ตำแหน่งสำคัญ

- `core/settings.py` — ตั้งค่าระบบ ฐานข้อมูล static/media และอีเมล
- `core/urls.py` — URL ทั้งหมดของเว็บ
- `research/models.py` — ตารางฐานข้อมูล
- `research/views.py` — การทำงานของแต่ละหน้า
- `research/forms.py` — แบบฟอร์มและการตรวจข้อมูล
- `research/templates/` — HTML ของหน้าเว็บ
- `static/` — รูปภาพ/CSS/JS แบบคงที่
- `media/` — PDF ที่อัปโหลดในเครื่อง ไม่ถูกเก็บใน Git
- `research/migrations/` — ประวัติโครงสร้างฐานข้อมูล

อ่านรายละเอียดเพิ่มใน `LEARNING_GUIDE_TH.md` และ `SECURITY_NOTES.md`

## Git

Repository นี้ถูกสร้างเป็น Git ใหม่และไม่มีประวัติเดิมที่เคยมีไฟล์ลับ

```powershell
git status
git log --oneline
git switch -c feature/my-change
```

อย่า Commit `.env`, `db.sqlite3` หรือไฟล์ใน `media/`
