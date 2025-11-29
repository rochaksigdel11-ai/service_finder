# backend/chating/models.py
from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from services.models import Overview
from Orders.models import Order

class Message(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_messages_sent'  # Changed from 'messages_sent'
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_messages_received'  # Changed from 'messages_received'
    )
    service = models.ForeignKey(
        Overview, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='chat_messages'  # Added unique related_name
    )
    order = models.ForeignKey(
        Order, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='chat_messages'  # Added unique related_name
    )
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.sender} → {self.receiver}: {self.message[:50]}"
    
    
