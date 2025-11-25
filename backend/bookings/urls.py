# backend/bookings/urls.py   ← REPLACE ENTIRE FILE

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet
from .views import FreelancerBookingViewSet


# Router creates all URLs automatically
router = DefaultRouter()
router.register(r'', BookingViewSet)   # This creates /bookings/ and /bookings/{id}/

router = DefaultRouter()
router.register(r'my-bookings', FreelancerBookingViewSet, basename='freelancer-bookings')

urlpatterns = [
    path('', include(router.urls)),   # ← THIS LINE IS REQUIRED
]