# backend/chating/urls.py → FINAL WORKING VERSION (NO MORE 500)
from django.urls import path
from . import views

urlpatterns = [
    # API ENDPOINTS — MUST HAVE /api/chat/ prefix
    path('api/chat/conversations/', views.get_conversations, name='get_conversations'),
    path('api/chat/messages/<int:order_id>/', views.send_message),  # ← This matches your POST
    path('api/chat/messages/<int:order_id>/', views.get_messages, name='get_messages'),
    path('api/chat/send/', views.send_message, name='send_message'),
    
    # Old template-based chat (keep if you use)
    path('chat/<int:order_id>/<str:username>/', views.Userchat, name='userchat'),
    path('get_messages/<int:order_id>/', views.get_messages_old, name='get_messages_old'),
]