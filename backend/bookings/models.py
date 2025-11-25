# backend/bookings/models.py — FINAL 100% WORKING

from django.db import models
from django.conf import settings

class Booking(models.Model):
    PACKAGE_CHOICES = [('basic', 'Basic'), ('standard', 'Standard'), ('premium', 'Premium')]
    STATUS_CHOICES = [('pending', 'Pending'), ('confirmed', 'Confirmed'), ('rejected', 'Rejected'), ('completed', 'Completed')]

    # FIXED: YOUR MODEL IS Overview, NOT Service
    service = models.ForeignKey(
        'services.Overview', 
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='customer_bookings'
    )
    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='freelancer_bookings'
    )

    package_type = models.CharField(max_length=20, choices=PACKAGE_CHOICES)
    booking_date = models.DateField()
    booking_time = models.TimeField()
    customer_name = models.CharField(max_length=100)
    customer_phone = models.CharField(max_length=15)
    message = models.TextField(blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer} → {self.service.titleOverview}"