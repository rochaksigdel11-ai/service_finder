from django.urls import path
from . import views

urlpatterns = [
    path('search/', views.search_services, name='search_services'),
    path('create/<str:identifier>/', views.create_job_profile, name='create_job_profile'),
    path('edit/<str:username>/<int:overview_id>/', views.edit_service, name='edit_service'),
    path('delete/<str:username>/<int:overview_id>/', views.delete_service, name='delete_service'),
    path('view/<int:overview_id>/', views.view_service_profile, name='view_service_profile'),
    path('book/<int:overview_id>/', views.book_service, name='book_service'),
    path('seller/bookings/', views.seller_bookings, name='seller_bookings'),
    path('booking/update/<int:booking_id>/<str:status>/', views.update_booking_status, name='update_booking_status'),
    path('chat/<int:overview_id>/', views.chat_view, name='chat_view'),
    path('services/', views.service_list, name='service_list'),
    path('services/<int:id>/', views.service_detail, name='service_detail'),
]