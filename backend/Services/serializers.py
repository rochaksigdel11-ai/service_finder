# backend/Services/serializers.py
from rest_framework import serializers
from .models import Overview, Package

class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = ['id', 'package_type', 'title', 'price', 'delivery_time', 'revisions']

class ServiceSerializer(serializers.ModelSerializer):
    provider = serializers.CharField(source='user.username')
    category = serializers.CharField(source='category.name')
    packages = PackageSerializer(many=True, read_only=True)

    # ADD THIS LINE
    distance_km = serializers.SerializerMethodField()

    class Meta:
        model = Overview
        fields = [
            'id', 'titleOverview', 'provider', 'category', 'overall_rating',
            'location_lat', 'location_lng', 'packages', 'distance_km'
        ]

    # ADD THIS METHOD
    def get_distance_km(self, obj):
        return getattr(obj, 'distance_km', None)