from django.urls import path
from . import views
from .views import CustomTokenObtainPairView  # only import once
from accounts.views import profile_view

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    # path('profile/', views.profile, name='profile'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/profile/', profile_view, name='profile'),

]