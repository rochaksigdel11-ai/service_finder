from django.urls import path, include
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import profile_api 
from accounts.views import profile_view
from .views import (
    service_list, service_detail, nearby_services_api,
    create_booking, user_orders, seller_bookings_api,
    get_conversations, get_messages,
    service_reviews, profile_api,
    update_booking_status_api, admin_stats_api
)
    


urlpatterns = [
    # === PUBLIC API (REACT FRONTEND) ===
    path('api/', views.service_list, name='service_list_api'),
    path('api/<int:pk>/', views.service_detail, name='service_detail_api'),
    path('api/nearby/', views.nearby_services_api, name='nearby_services_api'),
    

    # === BOOKING API ===
    path('api/book/', views.create_booking, name='create_booking'),  # POST
    path('api/orders/',user_orders, name='user_orders'),  # Buyer
    path('api/seller/bookings/', views.seller_bookings_api, name='seller_bookings_api'),  # Seller
    

    # REAL-TIME CHAT API — BOOKING-BASED (FINAL)
    path('api/chat/conversations/', views.get_conversations, name='get_conversations'),
    path('api/chat/messages/<int:booking_id>/', views.get_messages, name='get_messages'),
    # === REVIEWS API ===
    path('api/reviews/<int:service_id>/', views.service_reviews, name='service_reviews'),
    path('api/auth/profile/', profile_view, name='profile'),  # This should exist


    # === JWT AUTH ===
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # path('api/admin/bookings/', views.admin_all_bookings),
    path('api/admin/stats/', views.admin_stats_api),



    # === LEGACY HTML VIEWS (Keep only if needed) ===
    path('view/<int:overview_id>/', views.view_service_profile, name='view_service_profile'),
    path('book/<int:overview_id>/', views.book_service, name='book_service_web'),
    path('seller-bookings/', views.seller_bookings, name='seller_bookings_web'),
    path('create/<str:identifier>/', views.create_job_profile, name='create_job_profile_web'),
    path('edit/<str:username>/<int:overview_id>/', views.edit_service, name='edit_service_web'),
    path('delete/<str:username>/<int:overview_id>/', views.delete_service, name='delete_service_web'),
    # path('esewa/success/', views.esewa_success, name='esewa_success'),
    # path('esewa/failure/', views.esewa_failure, name='esewa_failure'),
    path('api/profile/', profile_api),
    path('api/bookings/<int:booking_id>/update_status/', views.update_booking_status_api, name='update_booking_status_api'),
    path('admin/stats/', views.admin_stats_api, name='admin_stats'),
    path('api/reviews/<int:service_id>/', views.service_reviews),      # GET
    path('api/reviews/<int:service_id>/', views.submit_review),  
]
