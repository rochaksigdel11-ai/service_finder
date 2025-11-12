import uuid
from decimal import Decimal

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponseForbidden, JsonResponse
from django.utils import timezone
from datetime import timedelta

import requests
from django_esewa import generate_signature

# ────── MODELS ──────
from .models import (
    Transaction, PaymentMethod, Upi_id, Bank,
    SellerAccountBalance, PaymentWithdrawal
)
from Services.models import Overview, Package  # FIXED: Only Package
from Home.models import UserProfile
from Orders.models import Order


# ────── SMS FALLBACK (Sparrow) ──────
def send_sms(phone: str, message: str) -> None:
    if not getattr(settings, 'SPARROW_SMS_API_KEY', None):
        return
    url = 'https://api.sparrowsms.com/v1/send/'
    payload = {
        'token': settings.SPARROW_SMS_API_KEY,
        'to': f'98{phone}',
        'message': message,
        'sender': settings.SPARROW_SMS_SENDER or 'SFA',
    }
    try:
        requests.post(url, data=payload, timeout=5)
    except Exception:
        pass


# ────── PAYMENT INITIATION (eSewa) ──────
@login_required
def payments(request, overview_id, username):
    overview = get_object_or_404(Overview, pk=overview_id)
    user = get_object_or_404(User, username=username)
    current_user = request.user

    if username != current_user.username:
        return HttpResponseForbidden("Access Denied")

    pkg_id = request.GET.get('additional_data2')
    if pkg_id not in ['1', '2', '3']:
        return JsonResponse({"error": "Invalid package"}, status=400)

    # Map pkg_id → package_type
    pkg_type_map = {'1': 'basic', '2': 'standard', '3': 'premium'}
    package_type = pkg_type_map[pkg_id]

    # Get package
    package = Package.objects.filter(overview=overview, package_type=package_type).first()
    if not package:
        return JsonResponse({"error": "Package not found"}, status=404)

    actual_price = Decimal(package.price)
    buyer_fee = actual_price * Decimal('0.05')
    seller_fee = actual_price * Decimal('0.10')
    service_fee = buyer_fee + seller_fee
    total_price = actual_price + buyer_fee

    package_name = f"{package_type}_package"
    package_description = package.description

    # Create Transaction
    transaction = Transaction.objects.create(
        overview=overview,
        sender=current_user,
        receiver=overview.user,
        amount=actual_price,
        payment_id=f"TXN-{uuid.uuid4().hex[:12]}",
        package_name=package_name,
        service_fee=service_fee,
    )

    # eSewa signature
    signed_field = generate_signature(
        amount=total_price,
        transaction_uuid=transaction.payment_id,
        product_code=settings.ESEWA_MERCHANT_ID,
        secret_key=settings.ESEWA_SECRET_KEY,
    )

    # SMS
    buyer_phone = getattr(current_user.userprofile, 'phone', '') if hasattr(current_user, 'userprofile') else ''
    if buyer_phone:
        send_sms(buyer_phone, f"Payment initiated: NPR {total_price} for {package_name.replace('_', ' ')}")

    context = {
        'overview': overview,
        'price': total_price,
        'actual_price': actual_price,
        'transaction_id': transaction.id,
        'package_name': package_name.replace('_', ' ').title(),
        'package_description': package_description,
        'service_fee': service_fee,
        'total_amount': float(total_price),
        'transaction_uuid': transaction.payment_id,
        'product_code': settings.ESEWA_MERCHANT_ID,
        'success_url': f"{settings.ESEWA_SUCCESS_URL}{transaction.id}/{username}/",
        'failure_url': settings.ESEWA_FAILURE_URL,
        'signed_field': signed_field,
    }
    return render(request, 'payments/payment.html', context)


# ────── SUCCESS CALLBACK ──────
@login_required
def success(request, transaction_id, username):
    transaction = get_object_or_404(Transaction, id=transaction_id)
    if username != request.user.username or transaction.sender != request.user:
        return HttpResponseForbidden("Access Denied")

    transaction.payment_status = True
    transaction.save()

    # Get delivery days from Package
    package = Package.objects.filter(
        overview=transaction.overview,
        package_type=transaction.package_name.split('_')[0]
    ).first()

    days = package.delivery_time if package else 3

    # Create Order
    Order.objects.create(
        buyer=request.user,
        service=transaction.overview,
        status='pending',
        transaction=transaction,
        delivery_date=timezone.now() + timedelta(days=days),
        seller=transaction.receiver,
    )

    # SMS
    buyer_phone = getattr(request.user.userprofile, 'phone', '') if hasattr(request.user, 'userprofile') else ''
    if buyer_phone:
        send_sms(buyer_phone, f"Payment successful! Order for {transaction.package_name.replace('_', ' ')} confirmed.")

    return render(request, 'payments/package_selection.html', {'transaction_id': transaction_id})


# ────── FAILURE CALLBACK ──────
@login_required
def failure(request):
    phone = getattr(request.user.userprofile, 'phone', '') if hasattr(request.user, 'userprofile') else ''
    if phone:
        send_sms(phone, "Payment failed. Please try again.")
    return render(request, 'payments/payment_failed.html', {'message': 'Payment failed.'})


# ────── WITHDRAWAL DASHBOARD ──────
@login_required
def withdrawal(request, username):
    user = get_object_or_404(User, username=username)
    if request.user.username != username:
        return HttpResponseForbidden("Access Denied")

    balance = SellerAccountBalance.objects.filter(user=user).first()
    method, _ = PaymentMethod.objects.get_or_create(user=user)
    upi, _ = Upi_id.objects.get_or_create(user=user)
    bank, _ = Bank.objects.get_or_create(user=user)

    if request.method == "POST":
        if 'withdraw_method' in request.POST:
            method.withdrawal_method = request.POST['withdraw_method']
            method.save()
        elif 'upi_id' in request.POST:
            upi.upi = request.POST['upi_id']
            upi.save()
        elif 'account_number' in request.POST:
            bank.account_number = request.POST['account_number']
            bank.ifsc_code = request.POST['ifsc_code']
            bank.bank_name = request.POST['bank_name']
            bank.save()

    can_withdraw = not PaymentWithdrawal.objects.filter(
        user=user, status__in=['pending', 'processing']
    ).exists()

    context = {
        'user': user,
        'balance': balance.balance_amount if balance else Decimal('0'),
        'method': method,
        'upi': upi,
        'bank': bank,
        'can_withdraw': can_withdraw,
    }
    return render(request, 'payments/withdrawal.html', context)


@login_required
def conform_withdrawal(request, username):
    user = get_object_or_404(User, username=username)
    if request.user.username != username:
        return HttpResponseForbidden("Access Denied")

    balance = SellerAccountBalance.objects.filter(user=user).first()
    if not balance or balance.balance_amount <= 0:
        return redirect('withdrawal', username=username)

    if PaymentWithdrawal.objects.filter(user=user, status__in=['pending', 'processing']).exists():
        return redirect('withdrawal', username=username)

    PaymentWithdrawal.objects.create(
        user=user,
        amount=balance.balance_amount,
        withdrawal_method=PaymentMethod.objects.get(user=user).withdrawal_method,
    )
    return render(request, 'payments/conform_withdrawal.html')


# ────── BUYER DASHBOARD LINKS ──────
@login_required
def save_payment_method(request, username):
    user = get_object_or_404(User, username=username)
    if request.user.username != username:
        return HttpResponseForbidden("You can only access your own page.")

    method, _ = PaymentMethod.objects.get_or_create(user=user)
    upi, _ = Upi_id.objects.get_or_create(user=user)
    bank, _ = Bank.objects.get_or_create(user=user)

    if request.method == "POST":
        if 'withdraw_method' in request.POST:
            method.withdrawal_method = request.POST['withdraw_method']
            method.save()
        elif 'upi_id' in request.POST:
            upi.upi = request.POST['upi_id']
            upi.save()
        elif 'account_number' in request.POST:
            bank.account_number = request.POST['account_number']
            bank.ifsc_code = request.POST['ifsc_code']
            bank.bank_name = request.POST['bank_name']
            bank.save()

    context = {'method': method, 'upi': upi, 'bank': bank}
    return render(request, 'payments/save_payment_method.html', context)


@login_required
def refund(request, username):
    user = get_object_or_404(User, username=username)
    if request.user.username != username:
        return HttpResponseForbidden("Access Denied")

    orders = Order.objects.filter(buyer=user, status__in=['delivered', 'completed'])
    return render(request, 'payments/refund.html', {'orders': orders})


@login_required
def list_all_the_order(request, username):
    user = get_object_or_404(User, username=username)
    if request.user.username != username:
        return HttpResponseForbidden("Access Denied")

    orders = Order.objects.filter(buyer=user).order_by('-created_at')
    return render(request, 'payments/list_all_orders.html', {'orders': orders})