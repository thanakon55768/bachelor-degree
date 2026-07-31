from django.apps import AppConfig


class ResearchConfig(AppConfig):
    """Configuration for the research application."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "research"

    def ready(self):
        # Register signal handlers. Do not create users or reset passwords here.
        import research.signals  # noqa: F401
