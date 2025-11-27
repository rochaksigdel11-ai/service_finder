# backend/chating/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # API endpoints
    path('conversations/', views.get_conversations, name='get_conversations'),
    path('messages/<int:order_id>/', views.get_messages, name='get_messages'),
    path('send/', views.send_message, name='send_message'),
    
    # Template-based endpoints (your existing ones)
    path('chat/<int:order_id>/<str:username>/', views.Userchat, name='userchat'),
    path('get_messages/<int:order_id>/', views.get_messages_old, name='get_messages_old'),
]