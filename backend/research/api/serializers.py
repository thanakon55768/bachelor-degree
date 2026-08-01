from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from research.models import Comment, Project, UserProfile


class UserSerializer(serializers.ModelSerializer):
    user_type = serializers.CharField(source="profile.user_type", read_only=True)
    student_id = serializers.CharField(source="profile.student_id", read_only=True)
    phone = serializers.CharField(source="profile.phone", read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "is_staff",
            "user_type",
            "student_id",
            "phone",
        )


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    user_type = serializers.ChoiceField(choices=UserProfile.USER_TYPES)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=10)

    def validate_username(self, value):
        value = value.strip()
        user_type = self.initial_data.get("user_type")
        if user_type == "student" and (not value.isdigit() or len(value) != 11):
            raise serializers.ValidationError("รหัสนักศึกษาต้องเป็นตัวเลข 11 หลัก")
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("ชื่อผู้ใช้นี้ถูกใช้งานแล้ว")
        return value

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("อีเมลนี้ถูกใช้งานแล้ว")
        return value

    def validate_phone(self, value):
        if value and (not value.isdigit() or len(value) != 10):
            raise serializers.ValidationError("เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก")
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        user_type = validated_data.pop("user_type")
        phone = validated_data.pop("phone", "")
        user = User.objects.create_user(**validated_data)
        profile = user.profile
        profile.user_type = user_type
        profile.phone = phone
        profile.student_id = user.username if user_type == "student" else None
        profile.save()
        return user


class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ("id", "username", "body", "parent", "created_at", "replies")
        read_only_fields = ("id", "username", "created_at", "replies")

    def get_replies(self, obj):
        return CommentSerializer(obj.replies.select_related("user").all(), many=True).data


class ProjectSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="get_department_display", read_only=True)
    research_type_name = serializers.CharField(source="get_research_type_display", read_only=True)
    uploaded_by_name = serializers.CharField(source="uploaded_by.username", read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    total_ratings = serializers.IntegerField(read_only=True)
    is_favorited = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()
    pdf_url = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = (
            "id",
            "title_th",
            "title_en",
            "department",
            "department_name",
            "academic_year",
            "research_type",
            "research_type_name",
            "student_name",
            "researcher_co1",
            "researcher_co2",
            "organization",
            "funding_by",
            "awards",
            "abstract",
            "keywords",
            "background",
            "objectives",
            "scope",
            "theory",
            "methodology",
            "results",
            "discussion",
            "suggestions_use",
            "suggestions_next",
            "other_info",
            "pdf_file",
            "pdf_url",
            "uploaded_by",
            "uploaded_by_name",
            "is_approved",
            "views_count",
            "download_count",
            "average_rating",
            "total_ratings",
            "is_favorited",
            "user_rating",
            "comments",
        )
        read_only_fields = (
            "uploaded_by",
            "is_approved",
            "views_count",
            "download_count",
        )
        extra_kwargs = {"pdf_file": {"write_only": True}}

    def get_pdf_url(self, obj):
        if not obj.pdf_file:
            return None
        try:
            url = obj.pdf_file.url
        except (ValueError, OSError):
            return None
        request = self.context.get("request")
        if request and url.startswith("/"):
            return request.build_absolute_uri(url)
        return url

    def get_is_favorited(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.favorited_by.filter(user=request.user).exists()

    def get_user_rating(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return 0
        rating = obj.ratings.filter(user=request.user).first()
        return rating.score if rating else 0

    def get_comments(self, obj):
        request = self.context.get("request")
        parser_context = (getattr(request, "parser_context", None) or {}) if request else {}
        if not request or parser_context.get("kwargs", {}).get("pk") is None:
            return []
        roots = obj.comments.filter(parent__isnull=True).select_related("user")
        return CommentSerializer(roots, many=True).data

    def validate_pdf_file(self, value):
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("ไฟล์ PDF ต้องมีขนาดไม่เกิน 10 MB")
        if not value.name.lower().endswith(".pdf"):
            raise serializers.ValidationError("รองรับเฉพาะไฟล์นามสกุล .pdf")
        content_type = getattr(value, "content_type", "")
        if content_type and content_type not in ("application/pdf", "application/x-pdf"):
            raise serializers.ValidationError("ชนิดไฟล์ไม่ใช่ PDF")
        signature = value.read(5)
        value.seek(0)
        if signature != b"%PDF-":
            raise serializers.ValidationError("เนื้อหาภายในไฟล์ไม่ใช่ PDF ที่ถูกต้อง")
        return value
