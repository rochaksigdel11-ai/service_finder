from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # === PUBLIC API (REACT FRONTEND) ===
    path('api/', views.service_list, name='service_list_api'),
    path('api/<int:pk>/', views.service_detail, name='service_detail_api'),
    path('api/nearby/', views.nearby_services_api, name='nearby_services_api'),

    # === BOOKING API ===
    path('api/book/', views.create_booking, name='create_booking'),  # POST
    path('api/orders/', views.user_orders, name='user_orders_api'),  # Buyer
    path('api/seller/bookings/', views.seller_bookings_api, name='seller_bookings_api'),  # Seller

    # === CHAT API ===
    path('api/chat/conversations/', views.chat_conversations, name='chat_conversations'),
    path('api/chat/messages/<int:convo_id>/', views.chat_messages, name='chat_messages'),

    # === REVIEWS API ===
    path('api/reviews/<int:service_id>/', views.service_reviews, name='service_reviews'),

    # === JWT AUTH ===
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # === LEGACY HTML VIEWS (Keep only if needed) ===
    path('view/<int:overview_id>/', views.view_service_profile, name='view_service_profile'),
    path('book/<int:overview_id>/', views.book_service, name='book_service_web'),
    path('seller-bookings/', views.seller_bookings, name='seller_bookings_web'),
    path('create/<str:identifier>/', views.create_job_profile, name='create_job_profile_web'),
    path('edit/<str:username>/<int:overview_id>/', views.edit_service, name='edit_service_web'),
    path('delete/<str:username>/<int:overview_id>/', views.delete_service, name='delete_service_web'),
    path('esewa/success/', views.esewa_success, name='esewa_success'),
    path('esewa/failure/', views.esewa_failure, name='esewa_failure'),
]