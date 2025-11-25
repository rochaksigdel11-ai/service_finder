"""
URL configuration for sfa_core project.
"""
from django.contrib import admin
from django.urls import path, include, re_path  # ← FIXED: re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView  # ← ADDED
from services.views import create_booking
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from accounts.views import profile_view  # ← CORRECT PATH
 

urlpatterns = [
    path('admin/', admin.site.urls),

    # === API ENDPOINTS ===
    # path('', include('Services.urls')),           # /api/, /api/1/, /api/book/
    path('api/auth/', include('accounts.urls')),
    path('api/chat/', include('chating.urls')),
    path('api/orders/', include('Orders.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/book/', create_booking, name='create_booking'),

    # === WEB PAGES (Legacy HTML) ===
    path('api/services/', include('services.urls')),   # ← lowercase 'services'   
    # path('', include('bookings.urls')),  # ← ADD THIS
    path('accounts/', include('accounts.urls')),
    path('dashboard/', include('UserDashboard.urls')),
    path('chat/', include('chating.urls')),
    path('api/auth/jwt/create/', TokenObtainPairView.as_view(), name='jwt-create'),
    path('api/auth/jwt/refresh/', TokenRefreshView.as_view(), name='jwt-refresh'),
    path('api/auth/token/', TokenObtainPairView.as_view()),
    path('api/auth/profile/', profile_view, name='profile'),
    path('api/bookings/', include('bookings.urls')),   # ← ONLY THIS LINE


    # === HOME ===
    path('', include('Home.urls')),

    # === REACT CATCH-ALL (FRONTEND) ===
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html'), name='react'),
]

# === SERVE MEDIA IN DEBUG ===
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)