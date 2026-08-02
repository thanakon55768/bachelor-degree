from django.contrib import admin
from .models import Project # ดึงชื่อตาราง Project มา

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    # เพิ่ม 'department' ลงไปในวงเล็บนี้
    list_display = ('title_th', 'department', 'program', 'student_name', 'academic_year', 'is_approved')
    list_filter = ('department', 'program', 'academic_year', 'is_approved')
    search_fields = ('title_th', 'student_name')
