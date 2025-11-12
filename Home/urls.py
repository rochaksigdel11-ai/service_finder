# Home/urls.py
from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth.views import LogoutView


urlpatterns = [
    # ROOT
    path('', views.IntroHome, name='IntroHome'),

    # SPECIFIC PATHS FIRST
    path('login/', views.login_view, name='login'),
    path('logout/', LogoutView.as_view(next_page='IntroHome'), name='logout'),
    path('become-freelancer/', views.become_freelancer, name='become_freelancer'),
    path('freelancer/bookings/', views.freelancer_bookings, name='freelancer_bookings'),

    # DYNAMIC PATHS LAST
    path('<str:identifier>/', views.home, name='home'),
    path('edit_profile/<str:identifier>/', views.edit_profile, name='edit_profile'),
    path('view_profile/<str:username>/', views.view_profile_public, name='view_profile_public'),
    
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)