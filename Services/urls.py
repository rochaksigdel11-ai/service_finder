from django.urls import path
from . import views

urlpatterns = [
    path('create/<str:identifier>/', views.create_job_profile, name='create_job_profile'),
    path('edit/<str:username>/<int:overview_id>/', views.edit_service, name='edit_service'),
    path('delete/<str:username>/<int:overview_id>/', views.delete_service, name='delete_service'),
    path('view/<int:overview_id>/', views.view_service_profile, name='view_service_profile'),
]