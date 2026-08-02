from django.db import models
from django.core.validators import FileExtensionValidator
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User


# ─── User Profile ──────────────────────────────────────────────────────────────
class UserProfile(models.Model):
    USER_TYPES = [
        ('student', 'นักศึกษา'),
        ('guest', 'บุคคลภายนอก'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='guest')
    student_id = models.CharField(max_length=11, blank=True, null=True, verbose_name="รหัสนักศึกษา")
    phone = models.CharField(max_length=10, blank=True, null=True, verbose_name="เบอร์โทรศัพท์")  # ✅ เพิ่มใหม่
    email_verified = models.BooleanField(default=False, verbose_name="ยืนยันอีเมลแล้ว")
    notify_new_project = models.BooleanField(default=False, verbose_name="แจ้งเตือนผลงานใหม่")

    class Meta:
        verbose_name = "โปรไฟล์ผู้ใช้งาน"
        verbose_name_plural = "โปรไฟล์ผู้ใช้งาน"

    def __str__(self):
        return f"{self.user.username} ({self.get_user_type_display()})"


# ─── ฟังก์ชันตรวจสอบขนาดไฟล์ (ไม่เกิน 10MB) ────────────────────────────────
def validate_file_size(value):
    filesize = value.size
    if filesize > 10 * 1024 * 1024:
        raise ValidationError("ขนาดไฟล์ PDF ต้องไม่เกิน 10MB")
    return value


# ─── Project ───────────────────────────────────────────────────────────────────
class Project(models.Model):
    DEPARTMENTS = [
        ('PT', 'แผนกวิชาช่างกลโรงงาน'),
        ('CV', 'แผนกวิชาช่างก่อสร้างและโยธา'),
        ('WL', 'แผนกวิชาช่างโลหะการ'),
        ('MT', 'แผนกวิชาช่างยนต์'),
        ('EE', 'แผนกวิชาช่างไฟฟ้ากำลัง'),
        ('ET', 'แผนกวิชาช่างอิเล็กทรอนิกส์'),
        ('MR', 'แผนกวิชาช่างเมคคาทรอนิกส์และหุ่นยนต์'),
        ('BF', 'แผนกวิชาช่างเทคนิคพื้นฐาน'),
        ('IT', 'แผนกวิชาช่างเทคนิคอุตสาหกรรม'),
        ('AR', 'แผนกวิชาช่างเทคนิคสถาปัตยกรรม'),
        ('CT', 'แผนกวิชาเทคโนโลยีคอมพิวเตอร์'),
        ('GE', 'แผนกวิชาสามัญสัมพันธ์'),
    ]

    PROGRAMS = [
        ('VC_AUTO', '[ปวช.] ช่างยนต์'),
        ('VC_EV', '[ปวช.] ยานยนต์ไฟฟ้า'),
        ('VC_BODY', '[ปวช.] ตัวถังและสีรถยนต์'),
        ('VC_MACHINE', '[ปวช.] ช่างกลโรงงาน'),
        ('VC_WELD', '[ปวช.] ช่างเชื่อมโลหะ'),
        ('VC_MAINT', '[ปวช.] ช่างซ่อมบำรุง'),
        ('VC_ELEC', '[ปวช.] ช่างไฟฟ้า'),
        ('VC_ELECTRONICS', '[ปวช.] อิเล็กทรอนิกส์'),
        ('VC_CONSTRUCTION', '[ปวช.] ช่างก่อสร้าง'),
        ('VC_ARCH', '[ปวช.] สถาปัตยกรรม'),
        ('VC_SURVEY', '[ปวช.] เทคนิควิศวกรรมสำรวจ'),
        ('VC_CIVIL', '[ปวช.] โยธา'),
        ('VC_COMPUTER', '[ปวช.] ช่างเทคนิคคอมพิวเตอร์'),
        ('VC_MECHATRONICS', '[ปวช.] เมคคาทรอนิกส์และหุ่นยนต์'),
        ('HVC_MECHANICAL', '[ปวส.] เทคนิคเครื่องกล'),
        ('HVC_EV', '[ปวส.] เทคนิคยานยนต์ไฟฟ้า'),
        ('HVC_BODY', '[ปวส.] เทคโนโลยีอุตสาหกรรมตัวถังและสีรถยนต์'),
        ('HVC_PRODUCTION', '[ปวส.] เทคนิคการผลิต'),
        ('HVC_METAL', '[ปวส.] เทคนิคโลหะ'),
        ('HVC_INDUSTRIAL', '[ปวส.] เทคนิคอุตสาหกรรม'),
        ('HVC_ELEC', '[ปวส.] ไฟฟ้า'),
        ('HVC_ELECTRONICS', '[ปวส.] เทคโนโลยีอิเล็กทรอนิกส์'),
        ('HVC_CIVIL', '[ปวส.] โยธา'),
        ('HVC_SURVEY', '[ปวส.] เทคนิควิศวกรรมสำรวจ'),
        ('HVC_ARCH', '[ปวส.] เทคนิคสถาปัตยกรรม'),
        ('HVC_MECHATRONICS', '[ปวส.] เมคคาทรอนิกส์และหุ่นยนต์'),
        ('HVC_COMPUTER', '[ปวส.] เทคโนโลยีคอมพิวเตอร์'),
        ('BTECH_ELECTRONICS', '[ทล.บ.] เทคโนโลยีอิเล็กทรอนิกส์'),
        ('BTECH_PRODUCTION', '[ทล.บ.] เทคโนโลยีการผลิต'),
        ('BTECH_MECHANICAL', '[ทล.บ.] เทคโนโลยีเครื่องกล'),
        ('BTECH_ELECTRICAL', '[ทล.บ.] เทคโนโลยีไฟฟ้า'),
        ('BTECH_COMPUTER', '[ทล.บ.] เทคโนโลยีคอมพิวเตอร์'),
        ('BASIC', 'ผลงานแผนกวิชาช่างเทคนิคพื้นฐาน'),
        ('GENERAL', 'ผลงานแผนกวิชาสามัญสัมพันธ์'),
    ]

    PROGRAM_DEPARTMENTS = {
        'VC_AUTO': 'MT', 'VC_EV': 'MT', 'VC_BODY': 'MT',
        'VC_MACHINE': 'PT', 'VC_WELD': 'WL', 'VC_MAINT': 'PT',
        'VC_ELEC': 'EE', 'VC_ELECTRONICS': 'ET',
        'VC_CONSTRUCTION': 'CV', 'VC_ARCH': 'AR', 'VC_SURVEY': 'CV', 'VC_CIVIL': 'CV',
        'VC_COMPUTER': 'CT', 'VC_MECHATRONICS': 'MR',
        'HVC_MECHANICAL': 'MT', 'HVC_EV': 'MT', 'HVC_BODY': 'MT',
        'HVC_PRODUCTION': 'PT', 'HVC_METAL': 'WL', 'HVC_INDUSTRIAL': 'IT',
        'HVC_ELEC': 'EE', 'HVC_ELECTRONICS': 'ET',
        'HVC_CIVIL': 'CV', 'HVC_SURVEY': 'CV', 'HVC_ARCH': 'AR',
        'HVC_MECHATRONICS': 'MR', 'HVC_COMPUTER': 'CT',
        'BTECH_ELECTRONICS': 'ET', 'BTECH_PRODUCTION': 'PT',
        'BTECH_MECHANICAL': 'MT', 'BTECH_ELECTRICAL': 'EE', 'BTECH_COMPUTER': 'CT',
        'BASIC': 'BF', 'GENERAL': 'GE',
    }

    RESEARCH_TYPES = [
        ('classroom', 'วิจัยในชั้นเรียน'),
        ('r_d', 'วิจัยและพัฒนา (R&D)'),
        ('innovation', 'นวัตกรรมและสิ่งประดิษฐ์'),
        ('survey', 'วิจัยเชิงสำรวจ'),
        ('other', 'อื่นๆ'),
    ]

    # --- ส่วนที่ 1: ข้อมูลพื้นฐาน ---
    title_th = models.CharField(max_length=500, verbose_name="ชื่อผลงานวิจัย (ภาษาไทย)")
    title_en = models.CharField(max_length=500, verbose_name="ชื่อผลงานวิจัย (ภาษาอังกฤษ)", blank=True, null=True)
    department = models.CharField(max_length=2, choices=DEPARTMENTS, default='CT', verbose_name="แผนกวิชา")
    program = models.CharField(max_length=32, choices=PROGRAMS, blank=True, default='', verbose_name="สาขาวิชา")
    academic_year = models.IntegerField(
        validators=[MinValueValidator(2481)],
        verbose_name="ปีที่ผลงานวิจัยเสร็จ (พ.ศ.)",
    )
    research_type = models.CharField(max_length=50, choices=RESEARCH_TYPES, default='innovation', verbose_name="ประเภทของงานวิจัย")

    # --- ส่วนที่ 2: ทีมผู้วิจัยและหน่วยงาน ---
    student_name = models.CharField(max_length=255, verbose_name="ชื่อนักวิจัยหลัก")
    researcher_co1 = models.CharField(max_length=255, verbose_name="ชื่อนักวิจัยร่วมคนที่ 1", blank=True, null=True)
    researcher_co2 = models.CharField(max_length=255, verbose_name="ชื่อนักวิจัยร่วมคนที่ 2", blank=True, null=True)
    organization = models.CharField(max_length=255, verbose_name="หน่วยงาน", default="วิทยาลัยเทคนิคร้อยเอ็ด")
    funding_by = models.CharField(max_length=255, verbose_name="ผู้สนับสนุนทุนวิจัย", blank=True, null=True)
    awards = models.TextField(verbose_name="รางวัลที่เคยได้รับ", blank=True, null=True)

    # --- ส่วนที่ 3: เนื้อหาทางวิชาการ ---
    abstract = models.TextField(verbose_name="บทคัดย่อ")
    keywords = models.CharField(max_length=255, verbose_name="คำสำคัญ (Keywords)", blank=True)
    background = models.TextField(verbose_name="ความเป็นมา/หลักการและเหตุผล", blank=True)
    objectives = models.TextField(verbose_name="วัตถุประสงค์การวิจัย", blank=True)
    scope = models.TextField(verbose_name="ขอบเขตของการวิจัย", blank=True)
    theory = models.TextField(verbose_name="ทฤษฎีที่ใช้ในการศึกษา/ที่เกี่ยวข้อง", blank=True)
    methodology = models.TextField(verbose_name="วิธีการวิจัย", blank=True)
    results = models.TextField(verbose_name="ผลการวิจัย", blank=True)
    discussion = models.TextField(verbose_name="อภิปรายผล", blank=True)
    suggestions_use = models.TextField(verbose_name="ข้อเสนอแนะในการใช้ประโยชน์", blank=True)
    suggestions_next = models.TextField(verbose_name="ข้อเสนอแนะในการทำวิจัยครั้งต่อไป", blank=True)
    other_info = models.TextField(verbose_name="อื่นๆ", blank=True, null=True)

    # --- ส่วนที่ 4: ไฟล์และการอนุมัติ ---
    pdf_file = models.FileField(
        upload_to='pdfs/',
        verbose_name="ไฟล์ PDF ฉบับเต็ม",
        validators=[FileExtensionValidator(allowed_extensions=['pdf']), validate_file_size]
    )
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='uploaded_projects', verbose_name="ผู้เข้าใช้งานที่อัปโหลด")
    is_approved = models.BooleanField(default=False, verbose_name="อนุมัติการเผยแพร่")
    views_count = models.PositiveIntegerField(default=0, verbose_name="ยอดเข้าชม")
    download_count = models.PositiveIntegerField(default=0, verbose_name="ยอดดาวน์โหลด")

    class Meta:
        verbose_name = "โครงงาน/ผลงานวิชาการ"
        verbose_name_plural = "โครงงาน/ผลงานวิชาการ"
        ordering = ['-academic_year']

    def __str__(self):
        return f"{self.title_th} ({self.get_department_display()})"

    @property
    def average_rating(self):
        from django.db.models import Avg
        result = self.ratings.aggregate(Avg('score'))['score__avg']
        return round(result, 1) if result else 0.0

    @property
    def total_ratings(self):
        return self.ratings.count()


# ─── Comment ✅ เพิ่มใหม่ ──────────────────────────────────────────────────────
class Comment(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    body = models.TextField(verbose_name="ความคิดเห็น")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "ความคิดเห็น"
        verbose_name_plural = "ความคิดเห็น"

    def __str__(self):
        return f"{self.user.username} on {self.project.title_th[:30]}"




# ─── Rating ✅ เพิ่มใหม่ ────────────────────────────────────────────────────────
class Rating(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    score = models.IntegerField(default=5, choices=[(i, i) for i in range(1, 6)], verbose_name="คะแนน")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'project')
        verbose_name = "การให้คะแนน"
        verbose_name_plural = "การให้คะแนน"

    def __str__(self):
        return f"{self.user.username} rated {self.project.title_th[:20]} as {self.score}"


# ─── Favorite ✅ เพิ่มใหม่ ──────────────────────────────────────────────────────
class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'project')
        verbose_name = "รายการโปรด"
        verbose_name_plural = "รายการโปรด"

    def __str__(self):
        return f"{self.user.username} - {self.project.title_th[:30]}"
