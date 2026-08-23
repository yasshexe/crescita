from django.contrib import messages
from django.shortcuts import redirect, render


def home(request):
    if request.method == "POST":
        name = request.POST.get("name", "").strip()
        email = request.POST.get("email", "").strip()
        message = request.POST.get("message", "").strip()

        if name and email and message:
            messages.success(request, "Thanks — we received your message.")
            return redirect("home")

        messages.error(request, "Please fill in all required fields.")

    return render(request, "website/home.html")
