from django.urls import path
from . import views

urlpatterns = [
    # eSewa Payment
    path('', views.payments, name='payments'),
    path('success/<int:transaction_id>/<str:username>/', views.success, name='payment_success'),
    path('failure/', views.failure, name='payment_failure'),

    # Withdrawal
    path('withdrawal/<str:username>/', views.withdrawal, name='withdrawal'),
    path('conform_withdrawal/<str:username>/', views.Conform_withdrawal, name='conform_withdrawal'),
]
