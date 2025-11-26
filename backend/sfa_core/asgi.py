# sfa_core/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import chating.routing  # ← THIS IS CORRECT

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sfa_core.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            chating.routing.websocket_urlpatterns
        )
    ),
})