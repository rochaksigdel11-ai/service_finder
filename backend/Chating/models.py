from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from services.models import Overview
from Orders.models import Order

class Message(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='messages_sent'
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='messages_received'
    )
    service = models.ForeignKey(Overview, related_name='service_profile', on_delete=models.CASCADE, null=True, blank=True)
    order = models.ForeignKey(Order, related_name='order_of_user',on_delete=models.CASCADE)
    message = models.TextField()
    status = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='message_images/', null=True, blank=True)
    video = models.FileField(upload_to='message_videos/', null=True, blank=True)
    
    def __str__(self):
        return f"{self.sender} → {self.receiver}"

    
