# backend/chating/views.py
from django.shortcuts import get_object_or_404, render, redirect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth.models import User
from django.http import HttpResponseForbidden, JsonResponse
from .models import Message
from Orders.models import Order
from services.models import Overview
from .forms import MessageForm
from Home.models import UserProfile
import datetime

# Temporarily comment out serializer imports to fix migrations
# from .serializers import MessageSerializer, ConversationSerializer

# Simple serializer classes for now
class MessageSerializer:
    def __init__(self, messages, many=False):
        self.messages = messages
        self.many = many
    
    @property
    def data(self):
        if self.many:
            return [self.serialize_message(msg) for msg in self.messages]
        else:
            return self.serialize_message(self.messages)
    
    def serialize_message(self, message):
        return {
            'id': message.id,
            'sender': message.sender.id,
            'sender_name': message.sender.username,
            'receiver': message.receiver.id,
            'receiver_name': message.receiver.username,
            'order': message.order.id if message.order else None,
            'service': message.service.id if message.service else None,
            'message': message.message,
            'timestamp': message.timestamp.isoformat(),
            'is_read': message.is_read
        }

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversations(request):
    """Get all conversations for the current user"""
    user = request.user
    
    # Get all orders where user is either buyer or seller
    orders = Order.objects.filter(
        Q(buyer=user) | Q(seller=user)
    ).distinct()
    
    conversations = []
    for order in orders:
        # Get last message in this conversation
        last_message = Message.objects.filter(order=order).order_by('-timestamp').first()
        
        # Determine the other user in conversation
        if user == order.buyer:
            other_user = order.seller
        else:
            other_user = order.buyer
        
        conversations.append({
            'id': order.id,  # Using order ID as conversation ID
            'order_id': order.id,
            'service_title': order.service.titleOverview if order.service else 'Service',
            'other_user_name': other_user.username,
            'other_user_avatar': other_user.username[0].upper(),  # First letter as avatar
            'last_message': last_message.message if last_message else 'No messages yet',
            'unread_count': Message.objects.filter(order=order, receiver=user, is_read=False).count(),
            'timestamp': last_message.timestamp if last_message else order.created_at
        })
    
    # Sort by last message timestamp
    conversations.sort(key=lambda x: x['timestamp'], reverse=True)
    
    return Response(conversations)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_messages(request, order_id):
    """Get all messages for a specific order/conversation"""
    try:
        order = Order.objects.get(id=order_id)
        user = request.user
        
        # Check if user is part of this order
        if user not in [order.buyer, order.seller]:
            return Response({'error': 'Access denied'}, status=403)
        
        messages = Message.objects.filter(order=order).order_by('timestamp')
        
        # Mark messages as read
        Message.objects.filter(order=order, receiver=user, is_read=False).update(is_read=True)
        
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
        
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    """Send a new message"""
    user = request.user
    order_id = request.data.get('order_id')
    message_text = request.data.get('message')
    
    if not order_id or not message_text:
        return Response({'error': 'Order ID and message are required'}, status=400)
    
    try:
        order = Order.objects.get(id=order_id)
        
        # Check if user is part of this order
        if user not in [order.buyer, order.seller]:
            return Response({'error': 'Access denied'}, status=403)
        
        # Determine receiver
        if user == order.buyer:
            receiver = order.seller
        else:
            receiver = order.buyer
        
        # Create message
        message = Message.objects.create(
            sender=user,
            receiver=receiver,
            order=order,
            service=order.service,
            message=message_text
        )
        
        serializer = MessageSerializer(message)
        return Response(serializer.data)
        
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)

# Your existing template-based views
def Userchat(request, order_id, username):
    """Template-based chat view"""
    user = get_object_or_404(User, username=username)
    order = get_object_or_404(Order, id=order_id)
    form = MessageForm()
    current_user = request.user
    
    if username != current_user.username:
        return HttpResponseForbidden("Access Denied")

    # Determining the receiver based on the order and user roles
    if user == order.seller:
        receiver = order.buyer
    else:
        receiver = order.seller

    # Getting receiver and sender profiles
    reciver_profile = UserProfile.objects.filter(user=receiver)
    sender_profile = UserProfile.objects.filter(user=user)

    # Handling form submission
    if request.method == 'POST':
        form = MessageForm(request.POST, request.FILES)
        if form.is_valid():
            # Saving the message object
            message = form.save(commit=False)
            message.sender = request.user
            message.receiver = receiver
            message.service = order.service
            message.order = order
            message.save()
            return redirect('userchat', order.id, request.user)

    # Retrieving messages related to the order
    messages = Message.objects.filter(order=order)
    
    context = {
        'order': order,
        'user': user,
        'form': form,
        'receiver': receiver,
        'messages': messages,
        'reciver_profile': reciver_profile,
        'sender_profile': sender_profile
    }
   
    return render(request, 'Userchat.html', context)

def get_messages_old(request, order_id):
    """Old get_messages function for template-based chat"""
    order = get_object_or_404(Order, id=order_id)
    messages = Message.objects.filter(order=order)
    message_data = []

    for message in messages:
        formatted_timestamp = message.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        if request.user == message.sender:
            message_data.append(f"<p class='message sender'><span class='username'>{formatted_timestamp}</span><br>{message.message}</p>")
        else:
            message_data.append(f"<p class='message receiver'><span class='username'>{formatted_timestamp}</span> <br> {message.message}</p>")

    return JsonResponse({"messages": "\n".join(message_data)})