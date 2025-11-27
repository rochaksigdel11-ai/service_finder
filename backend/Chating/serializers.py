# backend/chating/serializers.py
from rest_framework import serializers
from .models import Message
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    receiver_name = serializers.CharField(source='receiver.username', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 
            'sender', 
            'sender_name', 
            'receiver', 
            'receiver_name', 
            'order', 
            'service', 
            'message', 
            'timestamp', 
            'is_read'
        ]
        read_only_fields = ['timestamp', 'is_read']

class ConversationSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    order_id = serializers.IntegerField()
    service_title = serializers.CharField()
    other_user_name = serializers.CharField()
    other_user_avatar = serializers.CharField()
    last_message = serializers.CharField()
    unread_count = serializers.IntegerField()
    timestamp = serializers.DateTimeField()