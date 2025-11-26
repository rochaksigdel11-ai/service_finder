# backend/chating/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # ws://127.0.0.1:8001/ws/chat/5/
    re_path(r'ws/chat/(?P<booking_id>\d+)/$', consumers.ChatConsumer.as_asgi()),
]