# backend/chating/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Message
from Orders.models import Order

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.order_id = self.scope['url_route']['kwargs']['order_id']
        self.room_group_name = f'chat_{self.order_id}'

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

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_text = data['message']
        user = self.scope["user"]

        if user.is_anonymous:
            await self.close()
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

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
            'timestamp': event['timestamp']
        }))

    @database_sync_to_async
    def save_message(self, user, text):
        try:
            order = Order.objects.get(id=self.order_id)
            
            # Determine receiver based on who sent the message
            if user == order.buyer:
                receiver = order.seller
            else:
                receiver = order.buyer
            
            return Message.objects.create(
                sender=user,
                receiver=receiver,
                order=order,
                service=order.service,
                message=text
            )
        except Order.DoesNotExist:
            return None