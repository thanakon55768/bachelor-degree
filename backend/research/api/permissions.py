from rest_framework import permissions


class IsStudentOrStaff(permissions.BasePermission):
    """Only student accounts and staff can upload research projects."""

    message = "เฉพาะนักศึกษาหรือเจ้าหน้าที่เท่านั้นที่เพิ่มผลงานได้"

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_staff:
            return True
        profile = getattr(request.user, "profile", None)
        return bool(profile and profile.user_type == "student")


class IsOwnerOrStaff(permissions.BasePermission):
    """A project can be changed only by its uploader or a staff member."""

    message = "คุณไม่มีสิทธิ์แก้ไขหรือลบผลงานนี้"

    def has_object_permission(self, request, view, obj):
        return bool(request.user.is_staff or obj.uploaded_by_id == request.user.id)


class IsCommentOwnerOrStaff(permissions.BasePermission):
    message = "คุณไม่มีสิทธิ์ลบความคิดเห็นนี้"

    def has_object_permission(self, request, view, obj):
        return bool(request.user.is_staff or obj.user_id == request.user.id)
