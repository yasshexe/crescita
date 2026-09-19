import logging

from django.contrib import messages
from django.shortcuts import redirect, render

from .forms import LeadForm
from .models import Lead
from .services import send_lead_notification


logger = logging.getLogger(__name__)


def home(request):
    form = LeadForm(request.POST or None)

    if request.method == "POST":
        if form.is_valid():
            lead = Lead.objects.create(
                name=form.cleaned_data["name"],
                email=form.cleaned_data["email"],
                services=form.cleaned_data["service"],
                message=form.cleaned_data["message"],
            )
            send_lead_notification(lead)
            messages.success(request, "Thanks — we received your message.")
            return redirect("home")

        messages.error(request, "Please check the required fields and try again.")

    return render(request, "website/home.html", {"form": form})


def about(request):
    return render(request, "website/about.html")
