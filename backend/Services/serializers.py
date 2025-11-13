from rest_framework import serializers
from .models import Overview  # Your model

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Overview
        fields = ('id', 'titleOverview', 'basic_price', 'avg_rating', 'review_count', 'freelancer_name', 'freelancer_location')