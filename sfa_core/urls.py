"""
URL configuration for jobnest project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# YourProjectName/urls.py
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from Home import views as Home_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('services/',include('Services.urls')),
    path('payments/', include('payments.urls')),
    path('order/', include('Orders.urls')),
    path('dashboard/', include('UserDashboard.urls')),
    path('chat/', include('Chating.urls')),
    path('', include('Home.urls')),
   
    
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    
    # Your existing home
    path('', Home_views.IntroHome, name='IntroHome'),
    path('<str:identifier>/', Home_views.home, name='home'),
]


