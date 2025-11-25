# accounts/models.py — 100% CORRECT & WORKING
from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    # Role choices
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('seller', 'Seller'),        # or 'freelancer'
        ('admin', 'Admin'),
    ]

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='customer',
        help_text="User role in the platform"
    )

    full_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Full name of the user"
    )

    phone = models.CharField(
        max_length=15,
        blank=True,
        null=True
    )

    address = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)

    # Make sure these are included
    date_joined = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    def __str__(self):
        return self.username

    # Optional: Make email unique
    # email = models.EmailField(unique=True, blank=True, null=True)