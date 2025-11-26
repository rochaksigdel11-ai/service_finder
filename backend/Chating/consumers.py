# backend/chating/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from services.models import Booking, Message  # Make sure this import is correct
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.booking_id = self.scope['url_route']['kwargs']['booking_id']
        self.room_group_name = f'chat_{self.booking_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket (from frontend)
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_text = data['message']
        user = self.scope["user"]

        if user.is_anonymous:
            return

        # Save message to database
        saved_message = await self.save_message(user, message_text)

        if not saved_message:
            return

        # Send message to room group (broadcast)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message_text,
                'sender': user.username,
                'timestamp': saved_message.timestamp.isoformat()
            }
        )

    # Receive message from room group (send to WebSocket)
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
            'timestamp': event['timestamp']
        }))

    @database_sync_to_async
    def save_message(self, user, text):
        try:
            booking = Booking.objects.get(id=self.booking_id)
            # Determine who is the receiver
            receiver = booking.freelancer if user == booking.customer else booking.customer
            
            return Message.objects.create(
                booking=booking,
                sender=user,
                receiver=receiver,
                content=text
            )
        except Booking.DoesNotExist:
            return None