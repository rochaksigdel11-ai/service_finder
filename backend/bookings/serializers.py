# backend/bookings/serializers.py

from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    service_title = serializers.CharField(source='service.title', read_only=True)
    freelancer_name = serializers.CharField(source='freelancer.username', read_only=True)
    customer_name = serializers.CharField(source='customer.username', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['customer', 'freelancer', 'created_at', 'status']