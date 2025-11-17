from django.urls import path
from . import views
from django.contrib.auth import views as auth_views
from django.urls import path
from . import views
from .views import CustomTokenObtainPairView


urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('profile/', views.profile, name='profile'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),

]