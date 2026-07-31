# แนวทางเรียนรู้โปรเจกต์ทีละส่วน

## 1. เริ่มจากเส้นทางหน้าเว็บ

เปิด `core/urls.py` แล้วเลือก URL หนึ่งรายการ เช่นหน้าแรก:

```python
path('', views.project_list, name='project_list')
```

จากนั้นไปที่ `research/views.py` หา `project_list()` เพื่อดูว่าดึงข้อมูลอะไร แล้วดูไฟล์ `research/templates/research/list.html` ว่าแสดงข้อมูลอย่างไร

## 2. เรียนรู้ฐานข้อมูล

เปิด `research/models.py`

- `UserProfile` — ข้อมูลเพิ่มเติมของผู้ใช้
- `Project` — ผลงานวิจัยและตำแหน่ง PDF
- `Comment` — ความคิดเห็น
- `Rating` — คะแนน
- `Favorite` — รายการโปรด

Django สร้างตารางจริงจาก models ผ่านไฟล์ใน `research/migrations/`

## 3. ทดลองด้วย Django shell

```powershell
python manage.py shell
```

```python
from research.models import Project
Project.objects.count()
Project.objects.filter(is_approved=True)
```

## 4. จุดเริ่มแก้ไขที่แนะนำ

1. เปลี่ยนข้อความหรือหน้าตาใน `research/templates/research/`
2. ปรับแบบฟอร์มใน `research/forms.py`
3. เพิ่ม field ใน `research/models.py`
4. รัน `python manage.py makemigrations`
5. รัน `python manage.py migrate`
6. ปรับ logic ใน `research/views.py`

## 5. การไหลของข้อมูลอัปโหลด

`upload.html` → `ProjectForm` → `project_upload()` → `Project` → `db.sqlite3` และ `media/pdfs/`

ฐานข้อมูลเก็บรายละเอียดและชื่อเส้นทางไฟล์ ส่วน PDF จริงเก็บใน `media/pdfs/` หรือ Cloudinary เมื่อกำหนด `CLOUDINARY_URL`
