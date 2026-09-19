from django import forms


class LeadForm(forms.Form):
    SERVICE_CHOICES = (
        ("Website", "Website"),
        ("WhatsApp Automation", "WhatsApp Automation"),
        ("AI Chatbot", "AI Chatbot"),
        ("Automation", "Automation"),
    )

    name = forms.CharField(max_length=120)
    email = forms.EmailField()
    services = forms.MultipleChoiceField(
        choices=SERVICE_CHOICES,
        required=False,
    )
    message = forms.CharField(widget=forms.Textarea, max_length=5000)
