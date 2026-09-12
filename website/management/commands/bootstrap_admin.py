import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Create or reset the Django admin user from environment variables."

    def handle(self, *args, **options):
        username = os.environ.get("DJANGO_ADMIN_USERNAME", "").strip()
        email = os.environ.get("DJANGO_ADMIN_EMAIL", "").strip()
        password = os.environ.get("DJANGO_ADMIN_PASSWORD", "")

        if not username or not password:
            self.stdout.write("Admin bootstrap skipped: admin credentials are not configured.")
            return

        User = get_user_model()
        user, created = User.objects.get_or_create(
            username=username,
            defaults={"email": email},
        )

        if email:
            user.email = email
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.save(update_fields=["email", "password", "is_staff", "is_superuser"])

        action = "created" if created else "updated"
        self.stdout.write(self.style.SUCCESS(f"Admin user {action}: {username}"))
