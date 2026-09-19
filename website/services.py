import logging

from django.conf import settings
from django.core.mail import EmailMessage


logger = logging.getLogger(__name__)


def send_lead_notification(lead):
    if not settings.ANYMAIL.get("RESEND_API_KEY"):
        logger.warning("Lead notification skipped: RESEND_API_KEY is not configured.")
        return False

    services = ", ".join(lead.services) if lead.services else "Not specified"
    body = (
        "A new lead has been submitted on Crescita Media.\n\n"
        f"Name: {lead.name}\n"
        f"Email: {lead.email}\n"
        f"Services: {services}\n"
        f"Submitted: {lead.created_at:%d %b %Y, %I:%M %p}\n\n"
        "Message:\n"
        f"{lead.message}\n"
    )

    email = EmailMessage(
        subject=f"New Crescita Lead — {lead.name}",
        body=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[settings.CONTACT_EMAIL],
        reply_to=[lead.email],
    )

    try:
        email.send(fail_silently=False)
    except Exception:
        logger.exception("Lead notification failed for lead %s.", lead.pk)
        return False

    return True
