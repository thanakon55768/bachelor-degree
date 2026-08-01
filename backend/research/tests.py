from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APITestCase

from .models import Comment, Favorite, Project, Rating


def sample_pdf(name="research.pdf"):
    return SimpleUploadedFile(
        name,
        b"%PDF-1.4\n% simple test document\n%%EOF",
        content_type="application/pdf",
    )


def create_project(**overrides):
    values = {
        "title_th": "ระบบทดสอบงานวิจัย",
        "student_name": "นักศึกษาทดสอบ",
        "department": "CT",
        "academic_year": 2569,
        "research_type": "innovation",
        "abstract": "บทคัดย่อสำหรับทดสอบระบบ API",
        "pdf_file": sample_pdf(),
    }
    values.update(overrides)
    return Project.objects.create(**values)


class ProjectApiTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username="12345678901", password="StrongPass123!", email="student@example.com"
        )
        self.student.profile.user_type = "student"
        self.student.profile.student_id = self.student.username
        self.student.profile.save()
        self.staff = User.objects.create_user(
            username="admin", password="StrongPass123!", email="admin@example.com", is_staff=True
        )

    def test_public_list_hides_pending_projects(self):
        create_project(title_th="เผยแพร่แล้ว", is_approved=True)
        create_project(title_th="กำลังรอ", is_approved=False, uploaded_by=self.student)

        response = self.client.get(reverse("api-project-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title_th"], "เผยแพร่แล้ว")

    def test_student_can_upload_and_project_starts_pending(self):
        self.client.force_authenticate(self.student)
        response = self.client.post(
            reverse("api-project-list"),
            {
                "title_th": "ผลงานใหม่",
                "student_name": "นักศึกษาทดสอบ",
                "department": "CT",
                "academic_year": 2569,
                "research_type": "innovation",
                "abstract": "เนื้อหาบทคัดย่อ",
                "pdf_file": sample_pdf("upload.pdf"),
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, 201, response.data)
        project = Project.objects.get(pk=response.data["id"])
        self.assertEqual(project.uploaded_by, self.student)
        self.assertFalse(project.is_approved)

    def test_staff_can_approve_project(self):
        project = create_project(is_approved=False, uploaded_by=self.student)
        self.client.force_authenticate(self.staff)

        response = self.client.post(reverse("api-project-approve", args=[project.pk]))

        self.assertEqual(response.status_code, 200)
        project.refresh_from_db()
        self.assertTrue(project.is_approved)

    def test_member_can_favorite_rate_and_comment(self):
        project = create_project(is_approved=True)
        self.client.force_authenticate(self.student)

        favorite_response = self.client.post(reverse("api-project-favorite", args=[project.pk]))
        rating_response = self.client.post(
            reverse("api-project-rate", args=[project.pk]), {"score": 5}, format="json"
        )
        comment_response = self.client.post(
            reverse("api-project-comments", args=[project.pk]),
            {"body": "ผลงานนี้มีประโยชน์มาก"},
            format="json",
        )

        self.assertEqual(favorite_response.status_code, 201)
        self.assertEqual(rating_response.status_code, 200)
        self.assertEqual(comment_response.status_code, 201)
        self.assertTrue(Favorite.objects.filter(user=self.student, project=project).exists())
        self.assertTrue(Rating.objects.filter(user=self.student, project=project, score=5).exists())
        self.assertTrue(Comment.objects.filter(user=self.student, project=project).exists())


class AuthApiTests(APITestCase):
    def test_register_creates_student_profile(self):
        response = self.client.post(
            reverse("api-register"),
            {
                "username": "98765432109",
                "email": "new-student@example.com",
                "password": "StrongPass123!",
                "user_type": "student",
                "phone": "0812345678",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201, response.data)
        user = User.objects.get(username="98765432109")
        self.assertEqual(user.profile.user_type, "student")
        self.assertEqual(user.profile.student_id, user.username)
