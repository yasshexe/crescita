import re

from django.contrib import messages
from django.shortcuts import redirect, render


PROJECT_LINK_REPLACEMENTS = [
    (
        r'(<h3>\s*BHAUCHA\s*<br>\s*DHAKKA\s*</h3>.*?<a\s+)href="#contact"',
        'https://bhaucha-dhakka.onrender.com/',
    ),
    (
        r'(<h3>\s*TUPE\s*<br>\s*BROTHERS\s*<br>\s*ASSOCIATES\s*</h3>.*?<a\s+)href="#contact"',
        'https://tupe-brothers-associates.onrender.com/',
    ),
    (
        r'(<a\s+href=")#"(\s+class="social-card social-instagram")',
        'https://www.instagram.com/crescitamedia/',
    ),
]


def _add_project_links(response):
    html = response.content.decode(response.charset)

    for pattern, url in PROJECT_LINK_REPLACEMENTS:
        if 'social-' in pattern:
            replacement = rf'\1{url}" target="_blank" rel="noopener noreferrer"\2'
        else:
            replacement = rf'\1href="{url}" target="_blank" rel="noopener noreferrer"'

        html = re.sub(
            pattern,
            replacement,
            html,
            count=1,
            flags=re.DOTALL,
        )

    response.content = html.encode(response.charset)
    return response


def home(request):
    if request.method == "POST":
        name = request.POST.get("name", "").strip()
        email = request.POST.get("email", "").strip()
        message = request.POST.get("message", "").strip()

        if name and email and message:
            messages.success(request, "Thanks — we received your message.")
            return redirect("home")

        messages.error(request, "Please fill in all required fields.")

    response = render(request, "website/home.html")
    return _add_project_links(response)
