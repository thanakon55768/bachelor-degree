from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CommentViewSet,
    ExportCsvView,
    ProjectViewSet,
    StatsView,
    UserAdminViewSet,
    csrf_token,
    login_view,
    logout_view,
    me_view,
    register_view,
)

router = DefaultRouter()
router.register("projects", ProjectViewSet, basename="api-project")
router.register("comments", CommentViewSet, basename="api-comment")
router.register("admin/users", UserAdminViewSet, basename="api-admin-user")

urlpatterns = [
    path("auth/csrf/", csrf_token, name="api-csrf"),
    path("auth/login/", login_view, name="api-login"),
    path("auth/register/", register_view, name="api-register"),
    path("auth/logout/", logout_view, name="api-logout"),
    path("auth/me/", me_view, name="api-me"),
    path("stats/", StatsView.as_view(), name="api-stats"),
    path("admin/export-csv/", ExportCsvView.as_view(), name="api-export-csv"),
    path("", include(router.urls)),
]
