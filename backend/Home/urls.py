from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ROOT
    path('', views.intro_home, name='IntroHome'),

    # AUTH
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),  # ← COMMA FIXED

    # ROLE CHANGE
    path('become-freelancer/', views.become_freelancer, name='become_freelancer'),

    # PROFILE
    path('<str:identifier>/', views.home, name='home'),
    path('edit_profile/<str:identifier>/', views.edit_profile, name='edit_profile'),
    path('view_profile/<str:username>/', views.view_profile_public, name='view_profile_public'),
]

# REMOVE THIS — Already in sfa_core/urls.py
# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)