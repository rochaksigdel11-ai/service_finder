from django.urls import path
from . import views

urlpatterns = [
    # eSewa Payment
    path('', views.payments, name='payments'),
    path('success/<int:transaction_id>/<str:username>/', views.success, name='payment_success'),
    path('failure/', views.failure, name='payment_failure'),

    # Withdrawal
    path('withdrawal/<str:username>/', views.withdrawal, name='withdrawal'),
    path('conform_withdrawal/<str:username>/', views.conform_withdrawal, name='conform_withdrawal'),
    path('save-payment-method/<str:username>/', views.save_payment_method, name='save_payment_method'),
    path('refund/<str:username>/', views.refund, name='refund'),
    path('list-all-orders/<str:username>/', views.list_all_the_order, name='list_all_the_order'),
]
