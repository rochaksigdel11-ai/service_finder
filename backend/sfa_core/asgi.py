# sfa_core/asgi.py — FINAL CORRECT VERSION
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from chating.routing import websocket_urlpatterns  # ← lowercase "chating"

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sfa_core.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})