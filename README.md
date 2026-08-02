# RETC Academic Repository

ระบบคลังผลงานวิจัยที่แยกเป็น Backend และ Frontend เพื่อให้เรียนรู้และพัฒนาต่อได้ง่ายขึ้น

## ทำความเข้าใจก่อนเริ่ม

ลองนึกถึงร้านอาหาร:

- **Frontend** คือหน้าร้าน เมนู และปุ่มต่าง ๆ ที่ผู้ใช้มองเห็น
- **Backend** คือครัวและพนักงานที่ตรวจสิทธิ์ คำนวณ และจัดการข้อมูล
- **Database** คือตู้เก็บวัตถุดิบ ในโปรเจกต์นี้คือที่เก็บสมาชิกและผลงาน
- **API** คือพนักงานรับออเดอร์ที่นำคำขอจากหน้าร้านไปให้ครัว และนำคำตอบกลับมา
- **JSON** คือรูปแบบกระดาษออเดอร์ที่ Frontend และ Backend อ่านตรงกัน

API ในโปรเจกต์นี้เป็น API ที่เราสร้างเอง ไม่ต้องไปซื้อหรือขอ API key จากที่อื่น

## Tech stack

### Backend

- Python และ Django 5.2
- Django REST Framework สำหรับสร้าง API
- SQLite สำหรับทดลองในเครื่อง หรือ PostgreSQL เมื่อใช้งานจริง
- Django Session สำหรับ Login
- Local storage สำหรับ PDF ในเครื่อง หรือ Cloudinary เมื่อ Deploy

### Frontend

- Next.js 16 และ React 19
- TypeScript ช่วยตรวจชนิดข้อมูลก่อนเปิดระบบ
- Tailwind CSS สำหรับออกแบบหน้าเว็บ
- Lucide React สำหรับไอคอน
- Noto Sans Thai แบบเก็บในโปรเจกต์ ไม่ต้องโหลด Google Fonts ตอนเปิดเว็บ

## โครงสร้างโฟลเดอร์

```text
Project-Bachelordegree/
├── backend/                 Django, API, Models และฐานข้อมูล
│   ├── core/                การตั้งค่าและ URL หลัก
│   ├── research/            ระบบผลงานวิจัย
│   │   └── api/             จุดเชื่อมต่อที่ตอบข้อมูล JSON
│   └── manage.py            คำสั่งจัดการ Django
├── frontend/                หน้าเว็บ Next.js
│   └── src/
│       ├── app/             แต่ละโฟลเดอร์คือหนึ่งหน้าเว็บ
│       ├── components/      ชิ้นส่วนหน้าจอที่นำกลับมาใช้ซ้ำ
│       ├── lib/api.ts       ตัวกลางที่คุยกับ Backend
│       └── types/           รูปร่างข้อมูลที่ Frontend คาดว่าจะได้รับ
├── setup_project.bat        ติดตั้งโปรเจกต์ครั้งแรก
└── start_all.bat            เปิด Backend และ Frontend พร้อมกัน
```

## เริ่มใช้งานครั้งแรกบน Windows

ดับเบิลคลิก `setup_project.bat` หนึ่งครั้ง โปรแกรมจะ:

1. สร้างพื้นที่ Python แยกสำหรับโปรเจกต์
2. ติดตั้ง Django และส่วนเสริม
3. สร้างตารางฐานข้อมูล
4. ติดตั้ง Next.js และส่วนของ Frontend

จากนั้นเปิด Terminal ที่โฟลเดอร์โปรเจกต์และสร้าง Admin:

```powershell
.\.venv\Scripts\python.exe backend\manage.py createsuperuser
```

ระบบจะถามชื่อผู้ใช้ อีเมล และรหัสผ่าน ให้จดข้อมูลนี้ไว้สำหรับหน้า Admin

## เปิดระบบ

ดับเบิลคลิก `start_all.bat` แล้วเปิด:

- หน้าเว็บใหม่: http://localhost:3000
- Backend เดิม: http://localhost:8000
- Django Admin: http://localhost:8000/admin
- API รายการผลงาน: http://localhost:8000/api/v1/projects/

ต้องเปิดหน้าต่าง Backend และ Frontend ค้างไว้ทั้งสองหน้าต่างระหว่างใช้งาน

## ตัวอย่างการทำงานของ API

เมื่อหน้าแรกต้องการรายการผลงาน Frontend จะขอ:

```text
GET /api/v1/projects/
```

Backend จะค้นฐานข้อมูล แล้วตอบกลับประมาณนี้:

```json
{
  "count": 1,
  "results": [
    {
      "id": 1,
      "title_th": "ระบบตรวจวัดคุณภาพอากาศ",
      "department": "CT",
      "program": "BTECH_COMPUTER",
      "academic_year": 2556,
      "is_approved": true
    }
  ]
}
```

Frontend นำข้อมูลนี้ไปแสดงเป็นการ์ดผลงาน ผู้ใช้ไม่ต้องเห็น JSON นี้โดยตรง

## บริการภายนอกที่อาจต้องใช้ภายหลัง

ตอนทดลองในเครื่อง **ยังไม่ต้องสมัครบริการหรือขอ API key ใด ๆ**

เมื่อจะนำเว็บขึ้นอินเทอร์เน็ตจึงค่อยเตรียม:

- PostgreSQL: ฐานข้อมูลสำหรับระบบจริง
- Cloudinary: เก็บ PDF ไม่ให้หายเมื่อ Server restart
- SMTP Email: ส่งลิงก์รีเซ็ตรหัสผ่านทางอีเมล
- Hosting: ที่อยู่สำหรับ Backend และ Frontend

ค่าของบริการเหล่านี้จะใส่ใน `backend/.env` และห้าม Commit ไฟล์นี้ขึ้น Git

## คำสั่งตรวจระบบสำหรับผู้พัฒนา

```powershell
# ตรวจและทดสอบ Backend
cd backend
..\.venv\Scripts\python.exe manage.py check
..\.venv\Scripts\python.exe manage.py test

# ตรวจ Frontend
cd ..\frontend
npm run lint
npm run build
```

## สถานะฟีเจอร์

- สมัครสมาชิกนักศึกษาและบุคคลภายนอก
- Login/Logout และรีเซ็ตรหัสผ่านผ่าน Django
- อัปโหลด PDF ไม่เกิน 10 MB พร้อมตรวจเนื้อไฟล์
- เลือกได้ครบ 12 แผนก, 32 สาขาตามหลักสูตร และตัวเลือกผลงานสำหรับแผนกเทคนิคพื้นฐาน/สามัญสัมพันธ์
- รองรับปีการศึกษาย้อนหลังตั้งแต่ พ.ศ. 2481 และค้นหา/กรองตามแผนก สาขา หรือปี
- ผลงานของฉัน แก้ไข และลบ
- Favorite, Rating, Comment และ Reply
- Admin อนุมัติผลงาน จัดการสมาชิก และ Export CSV
- หน้าสถิติและอันดับผลงาน

เว็บ Django แบบเดิมยังอยู่ใน `backend/research/templates/` เพื่อใช้เทียบหรือเป็นระบบสำรองระหว่างย้ายระบบ
