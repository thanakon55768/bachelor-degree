import csv
from datetime import date

from django.contrib.auth import authenticate, login as django_login, logout as django_logout
from django.contrib.auth.models import User
from django.db.models import Avg, Count, F, Q, Sum
from django.http import FileResponse, HttpResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from research.models import Comment, Favorite, Project, Rating

from .permissions import IsCommentOwnerOrStaff, IsOwnerOrStaff, IsStudentOrStaff
from .serializers import CommentSerializer, ProjectSerializer, RegisterSerializer, UserSerializer


@ensure_csrf_cookie
@api_view(["GET"])
@permission_classes([AllowAny])
def csrf_token(request):
    """Set the CSRF cookie before login or another write request."""
    return Response({"csrfToken": get_token(request)})


@csrf_protect
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username", "").strip()
    password = request.data.get("password", "")
    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response(
            {"detail": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    django_login(request, user)
    return Response({"user": UserSerializer(user).data})


@csrf_protect
@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response({"user": UserSerializer(user).data}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    django_logout(request)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def me_view(request):
    if request.method == "PATCH":
        email = request.data.get("email", request.user.email).strip().lower()
        phone = request.data.get("phone", request.user.profile.phone or "").strip()
        if not email:
            return Response({"email": ["กรุณาระบุอีเมล"]}, status=400)
        if User.objects.exclude(pk=request.user.pk).filter(email__iexact=email).exists():
            return Response({"email": ["อีเมลนี้ถูกใช้งานแล้ว"]}, status=400)
        if phone and (not phone.isdigit() or len(phone) != 10):
            return Response({"phone": ["เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก"]}, status=400)
        request.user.email = email
        request.user.save(update_fields=["email"])
        request.user.profile.phone = phone
        request.user.profile.save(update_fields=["phone"])
    return Response({"user": UserSerializer(request.user).data})


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer

    def get_queryset(self):
        queryset = Project.objects.select_related("uploaded_by").prefetch_related(
            "ratings", "favorited_by", "comments__user"
        )
        user = self.request.user
        if user.is_authenticated and user.is_staff:
            pass
        elif user.is_authenticated:
            queryset = queryset.filter(Q(is_approved=True) | Q(uploaded_by=user))
        else:
            queryset = queryset.filter(is_approved=True)

        query = self.request.query_params.get("q", "").strip()
        department = self.request.query_params.get("department", "").strip()
        academic_year = self.request.query_params.get("academic_year", "").strip()
        research_type = self.request.query_params.get("research_type", "").strip()
        approved = self.request.query_params.get("approved", "").strip().lower()

        if query:
            queryset = queryset.filter(
                Q(title_th__icontains=query)
                | Q(title_en__icontains=query)
                | Q(student_name__icontains=query)
                | Q(keywords__icontains=query)
            )
        if department:
            queryset = queryset.filter(department=department)
        if academic_year:
            queryset = queryset.filter(academic_year=academic_year)
        if research_type:
            queryset = queryset.filter(research_type=research_type)
        if user.is_authenticated and user.is_staff and approved in ("true", "false"):
            queryset = queryset.filter(is_approved=approved == "true")

        ordering = self.request.query_params.get("ordering", "-academic_year")
        allowed_orderings = {
            "academic_year",
            "-academic_year",
            "views_count",
            "-views_count",
            "download_count",
            "-download_count",
            "id",
            "-id",
        }
        if ordering not in allowed_orderings:
            ordering = "-academic_year"
        return queryset.order_by(ordering, "-id")

    def get_permissions(self):
        if self.action == "create":
            classes = [IsStudentOrStaff]
        elif self.action in ("update", "partial_update", "destroy"):
            classes = [IsAuthenticated, IsOwnerOrStaff]
        elif self.action == "approve":
            classes = [IsAdminUser]
        elif self.action in ("favorite", "rate", "comments", "mine", "favorites"):
            classes = [IsAuthenticated]
        else:
            classes = [AllowAny]
        return [permission() for permission in classes]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user, is_approved=False)

    def retrieve(self, request, *args, **kwargs):
        project = self.get_object()
        session_key = f"api_viewed_project_{project.id}"
        if not request.session.get(session_key):
            Project.objects.filter(pk=project.pk).update(views_count=F("views_count") + 1)
            request.session[session_key] = True
            project.refresh_from_db()
        return Response(self.get_serializer(project).data)

    @action(detail=False, methods=["get"])
    def options(self, request):
        years = list(
            Project.objects.filter(is_approved=True)
            .values_list("academic_year", flat=True)
            .distinct()
            .order_by("-academic_year")
        )
        return Response(
            {
                "departments": [
                    {"value": value, "label": label} for value, label in Project.DEPARTMENTS
                ],
                "research_types": [
                    {"value": value, "label": label} for value, label in Project.RESEARCH_TYPES
                ],
                "academic_years": years or [date.today().year + 543],
            }
        )

    @action(detail=False, methods=["get"])
    def mine(self, request):
        projects = self.get_queryset().filter(uploaded_by=request.user)
        page = self.paginate_queryset(projects)
        serializer = self.get_serializer(page if page is not None else projects, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def favorites(self, request):
        projects = self.get_queryset().filter(favorited_by__user=request.user, is_approved=True)
        page = self.paginate_queryset(projects)
        serializer = self.get_serializer(page if page is not None else projects, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        project = self.get_object()
        project.is_approved = True
        project.save(update_fields=["is_approved"])
        return Response(self.get_serializer(project).data)

    @action(detail=True, methods=["post"])
    def favorite(self, request, pk=None):
        project = self.get_object()
        favorite = Favorite.objects.filter(user=request.user, project=project)
        if favorite.exists():
            favorite.delete()
            return Response({"is_favorited": False})
        Favorite.objects.create(user=request.user, project=project)
        return Response({"is_favorited": True}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def rate(self, request, pk=None):
        project = self.get_object()
        try:
            score = int(request.data.get("score", 0))
        except (TypeError, ValueError):
            return Response({"score": ["คะแนนไม่ถูกต้อง"]}, status=400)
        if score == 0:
            Rating.objects.filter(user=request.user, project=project).delete()
        elif 1 <= score <= 5:
            Rating.objects.update_or_create(
                user=request.user, project=project, defaults={"score": score}
            )
        else:
            return Response({"score": ["คะแนนต้องอยู่ระหว่าง 1 ถึง 5"]}, status=400)
        project.refresh_from_db()
        return Response(
            {
                "user_rating": score,
                "average_rating": project.average_rating,
                "total_ratings": project.total_ratings,
            }
        )

    @action(detail=True, methods=["post"])
    def comments(self, request, pk=None):
        project = self.get_object()
        body = request.data.get("body", "").strip()
        if not body:
            return Response({"body": ["กรุณาพิมพ์ความคิดเห็น"]}, status=400)
        if len(body) > 2000:
            return Response({"body": ["ความคิดเห็นยาวเกิน 2,000 ตัวอักษร"]}, status=400)
        parent = None
        parent_id = request.data.get("parent")
        if parent_id:
            try:
                parent = project.comments.get(pk=parent_id)
            except Comment.DoesNotExist:
                return Response({"parent": ["ไม่พบความคิดเห็นต้นทาง"]}, status=400)
        comment = Comment.objects.create(
            project=project, user=request.user, parent=parent, body=body
        )
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)

    def _file_response(self, request, project, as_attachment):
        if not project.pdf_file:
            return Response({"detail": "ผลงานนี้ไม่มีไฟล์ PDF"}, status=404)
        if as_attachment:
            session_key = f"api_downloaded_project_{project.id}"
            if not request.session.get(session_key):
                Project.objects.filter(pk=project.pk).update(
                    download_count=F("download_count") + 1
                )
                request.session[session_key] = True
        try:
            return FileResponse(
                project.pdf_file.open("rb"),
                content_type="application/pdf",
                as_attachment=as_attachment,
                filename=f"project-{project.id}.pdf" if as_attachment else None,
            )
        except (FileNotFoundError, OSError):
            return Response({"detail": "ไม่พบไฟล์ PDF ในระบบจัดเก็บ"}, status=404)

    @action(detail=True, methods=["get"])
    def preview(self, request, pk=None):
        return self._file_response(request, self.get_object(), False)

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        return self._file_response(request, self.get_object(), True)


class CommentViewSet(viewsets.GenericViewSet):
    queryset = Comment.objects.select_related("user", "project")
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, IsCommentOwnerOrStaff]
    http_method_names = ["delete"]

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        self.check_object_permissions(request, comment)
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class StatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        projects = Project.objects.filter(is_approved=True)
        department_counts = list(
            projects.values("department").annotate(count=Count("id")).order_by("-count")
        )
        department_names = dict(Project.DEPARTMENTS)
        for item in department_counts:
            item["department_name"] = department_names.get(
                item["department"], item["department"]
            )
        top_rated = projects.annotate(average=Avg("ratings__score")).filter(
            average__isnull=False
        ).order_by("-average", "-download_count")[:5]
        return Response(
            {
                "total_projects": projects.count(),
                "total_views": projects.aggregate(total=Sum("views_count"))["total"] or 0,
                "total_downloads": projects.aggregate(total=Sum("download_count"))["total"] or 0,
                "department_counts": department_counts,
                "top_viewed": ProjectSerializer(
                    projects.order_by("-views_count")[:5], many=True, context={"request": request}
                ).data,
                "top_downloaded": ProjectSerializer(
                    projects.order_by("-download_count")[:5], many=True, context={"request": request}
                ).data,
                "top_rated": ProjectSerializer(
                    top_rated, many=True, context={"request": request}
                ).data,
            }
        )


class UserAdminViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = User.objects.select_related("profile").order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=["post"])
    def toggle_staff(self, request, pk=None):
        target = self.get_object()
        if target == request.user:
            return Response({"detail": "ไม่สามารถเปลี่ยนสิทธิ์ของตัวเอง"}, status=400)
        target.is_staff = not target.is_staff
        target.save(update_fields=["is_staff"])
        return Response(self.get_serializer(target).data)

    @action(detail=True, methods=["post"])
    def reset_password(self, request, pk=None):
        target = self.get_object()
        password = request.data.get("password", "")
        if len(password) < 8:
            return Response({"password": ["รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"]}, status=400)
        target.set_password(password)
        target.save(update_fields=["password"])
        return Response({"detail": "เปลี่ยนรหัสผ่านแล้ว"})

    def destroy(self, request, *args, **kwargs):
        target = self.get_object()
        if target == request.user:
            return Response({"detail": "ไม่สามารถลบบัญชีตัวเอง"}, status=400)
        target.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ExportCsvView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        response = HttpResponse(content_type="text/csv; charset=utf-8-sig")
        response["Content-Disposition"] = 'attachment; filename="research-projects.csv"'
        writer = csv.writer(response)
        writer.writerow(
            ["ชื่อผลงาน", "ผู้วิจัย", "สาขา", "ปีการศึกษา", "ยอดชม", "ยอดดาวน์โหลด", "สถานะ"]
        )
        for project in Project.objects.order_by("-academic_year"):
            writer.writerow(
                [
                    project.title_th,
                    project.student_name,
                    project.get_department_display(),
                    project.academic_year,
                    project.views_count,
                    project.download_count,
                    "อนุมัติแล้ว" if project.is_approved else "รอตรวจสอบ",
                ]
            )
        return response
