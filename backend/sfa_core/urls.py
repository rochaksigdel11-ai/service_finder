"""
URL configuration for sfa_core project.
"""
from django.contrib import admin
from django.urls import path, include, re_path  # ← FIXED: re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView  # ← ADDED
from Services.views import create_booking


urlpatterns = [
    path('admin/', admin.site.urls),

    # === API ENDPOINTS ===
    path('', include('Services.urls')),           # /api/, /api/1/, /api/book/
    path('api/auth/', include('accounts.urls')),
    path('api/chat/', include('chating.urls')),
    path('api/orders/', include('Orders.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/book/', create_booking, name='create_booking'),

    # === WEB PAGES (Legacy HTML) ===
    path('services/', include('Services.urls')),  # /services/view/1/
    path('accounts/', include('accounts.urls')),
    path('dashboard/', include('UserDashboard.urls')),
    path('chat/', include('chating.urls')),

    # === HOME ===
    path('', include('Home.urls')),

    # === REACT CATCH-ALL (FRONTEND) ===
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html'), name='react'),
]

# === SERVE MEDIA IN DEBUG ===
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)