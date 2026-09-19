from unittest.mock import patch

from django.contrib import admin
from django.test import TestCase
from django.urls import reverse

from .models import Lead


class LeadFlowTests(TestCase):
    def test_home_and_about_pages_render(self):
        self.assertEqual(self.client.get(reverse("home")).status_code, 200)
        self.assertEqual(self.client.get(reverse("about")).status_code, 200)

    @patch("website.views.send_lead_notification")
    def test_valid_lead_is_saved_and_redirects(self, notify):
        response = self.client.post(
            reverse("home"),
            {
                "name": "Test Client",
                "email": "client@example.com",
                "service": ["Website", "AI Chatbot"],
                "message": "Build us a new website.",
            },
        )

        self.assertRedirects(response, reverse("home"))
        lead = Lead.objects.get()
        self.assertEqual(lead.name, "Test Client")
        self.assertEqual(lead.services, ["Website", "AI Chatbot"])
        notify.assert_called_once_with(lead)

    def test_invalid_lead_is_not_saved(self):
        response = self.client.post(
            reverse("home"),
            {"name": "", "email": "not-an-email", "message": ""},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Lead.objects.count(), 0)

    @patch("website.services.EmailMessage.send")
    def test_notification_service_sends_email(self, send):
        lead = Lead.objects.create(
            name="Test Client",
            email="client@example.com",
            services=["Website"],
            message="Hello",
        )

        with self.settings(
            ANYMAIL={"RESEND_API_KEY": "test-key"},
            DEFAULT_FROM_EMAIL="studio@example.com",
            CONTACT_EMAIL="crescita@example.com",
        ):
            from .services import send_lead_notification

            self.assertTrue(send_lead_notification(lead))

        send.assert_called_once_with(fail_silently=False)

    def test_lead_is_registered_in_admin(self):
        self.assertIn(Lead, admin.site._registry)
