# backend/bookings/views.py   ← REPLACE EVERYTHING

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Booking
from .serializers import BookingSerializer

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Booking.objects.all()
        return Booking.objects.filter(freelancer=user) | Booking.objects.filter(customer=user)

    def perform_create(self, serializer):
        service = serializer.validated_data['service']
        serializer.save(
            customer=self.request.user,
            freelancer=service.user
        )

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        booking = self.get_object()
        status = request.data.get('status')
        if status in ['confirmed', 'rejected', 'completed']:
            booking.status = status
            booking.save()
            return Response({'message': f'Booking {status} successfully'})
        return Response({'error': 'Invalid status'}, status=400)
    
    
    
    
    
class FreelancerBookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    
    def get_queryset(self):
        # Return only bookings for the logged-in freelancer
        return Booking.objects.filter(freelancer=self.request.user)