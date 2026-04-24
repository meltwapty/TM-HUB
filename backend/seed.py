import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tm_hub_backend.settings')
django.setup()

from api.models import Function

functions = [
    ("Finance & legalities", "F&L"),
    ("Talent Management", "TM"),
    ("Business Development", "BD"),
    ("B2B", "B2B"),
    ("B2C", "B2C"),
    ("Outgoing Global Volunteer", "OGV"),
    ("Outgoing Global Talent", "OGT"),
    ("Incoming Global Volunteer", "IGV"),
    ("Incoming Global Talent", "IGT"),
    ("Customer Experience", "CXP"),
]

for name, code in functions:
    Function.objects.get_or_create(name=name, code=code)
    print(f"Created function {name} ({code})")

print("Seeding complete.")
