from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse, HttpResponseForbidden
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import uuid
import hashlib
import hmac

# Models
from .models import Transaction, PaymentMethod, Upi_id, Bank, SellerAccountBalance, PaymentWithdrawal
from Services.models import Overview, BasicPackage, StandardPackage, PremiumPackage
from Home.models import UserProfile
from Orders.models import Order


# ==================== PAYMENT WITH eSEWA ====================

@login_required
def payments(request, overview_id, username):
    overview = get_object_or_404(Overview, pk=overview_id)
    user = get_object_or_404(User, username=username)
    current_user = request.user

    if username != current_user.username:
        return HttpResponseForbidden("Access Denied")

    additional_data2 = request.GET.get('additional_data2')
    user_profile = UserProfile.objects.get(user=overview.user.id)

    # Get package
    package = None
    price = actual_price = service_fee = buyer_fee = 0
    package_name = package_description = ""

    if additional_data2 == '1':
        package = BasicPackage.objects.filter(overview=overview).first()
        price_field = 'Basic_price'
        desc_field = 'Basic_description'
    elif additional_data2 == '2':
        package = StandardPackage.objects.filter(overview=overview).first()
        price_field = 'Standard_price'
        desc_field = 'Standard_description'
    elif additional_data2 == '3':
        package = PremiumPackage.objects.filter(overview=overview).first()
        price_field = 'Premium_price'
        desc_field = 'Premium_description'

    if not package:
        return JsonResponse({"error": "Package not found"}, status=404)

    actual_price = getattr(package, price_field)
    buyer_fee = actual_price * Decimal('0.05')
    seller_fee = actual_price * Decimal('0.10')
    service_fee = buyer_fee + seller_fee
    price = actual_price + buyer_fee
    package_name = f"{additional_data2}_package"
    package_description = getattr(package, desc_field)

    # Create Transaction
    transaction = Transaction.objects.create(
        overview=overview,
        sender=current_user,
        receiver=user_profile.user,
        amount=actual_price,
        payment_id=f"TXN-{uuid.uuid4().hex[:12]}",
        package_name=package_name,
        service_fee=service_fee
    )

    # eSewa Params
    total_amount = float(price)
    transaction_uuid = transaction.payment_id
    product_code = settings.ESEWA_MERCHANT_ID
    success_url = f"{settings.ESEWA_SUCCESS_URL}{transaction.id}/{username}/"
    failure_url = settings.ESEWA_FAILURE_URL

    message = f"total_amount={total_amount},transaction_uuid={transaction_uuid},product_code={product_code}"
    signature = hmac.new(b"8gBm/:&EnhH.1/q", message.encode(), hashlib.sha256).digest()
    import base64
    signed_field = base64.b64encode(signature).decode()

    context = {
        'overview': overview,
        'price': price,
        'actual_price': actual_price,
        'transaction_id': transaction.id,
        'package_name': package_name.replace('_', ' ').title(),
        'package_description': package_description,
        'service_fee': service_fee,
        'total_amount': total_amount,
        'transaction_uuid': transaction_uuid,
        'product_code': product_code,
        'success_url': success_url,
        'failure_url': failure_url,
        'signed_field': signed_field,
    }
    return render(request, 'payment.html', context)


@login_required
def success(request, transaction_id, username):
    transaction = get_object_or_404(Transaction, id=transaction_id)
    if username != request.user.username or transaction.sender != request.user:
        return HttpResponseForbidden("Access Denied")

    transaction.payment_status = True
    transaction.save()

    overview = transaction.overview
    days = 3
    if "basic" in transaction.package_name:
        days = BasicPackage.objects.get(overview=overview).Basic_delivery_time
    elif "standard" in transaction.package_name:
        days = StandardPackage.objects.get(overview=overview).Standard_delivery_time
    elif "premium" in transaction.package_name:
        days = PremiumPackage.objects.get(overview=overview).Premium_delivery_time

    Order.objects.create(
        buyer=request.user,
        service=overview,
        status='pending',
        transaction=transaction,
        delivery_date=timezone.now() + timedelta(days=days),
        seller=transaction.receiver,
    )
    return render(request, 'package_selection.html', {'transaction_id': transaction_id})


@login_required
def failure(request):
    return render(request, 'payment_failed.html', {'message': 'Payment failed.'})


# ==================== WITHDRAWAL (SIMPLIFIED) ====================

@login_required
def withdrawal(request, username):
    user = get_object_or_404(User, username=username)
    if username != request.user.username:
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
        'balance': balance.balance_amount if balance else 0,
        'method': method,
        'upi': upi,
        'bank': bank,
        'can_withdraw': can_withdraw
    }
    return render(request, 'withdrawal.html', context)


@login_required
def Conform_withdrawal(request, username):
    user = get_object_or_404(User, username=username)
    if username != request.user.username:
        return HttpResponseForbidden("Access Denied")

    balance = SellerAccountBalance.objects.filter(user=user).first()
    method, _ = PaymentMethod.objects.get_or_create(user=user)

    if balance and not PaymentWithdrawal.objects.filter(user=user, status__in=['pending', 'processing']).exists():
        PaymentWithdrawal.objects.create(
            user=user,
            amount=balance.balance_amount,
            withdrawal_method=method.withdrawal_method
        )

    return render(request, 'conform_withdrawal.html')