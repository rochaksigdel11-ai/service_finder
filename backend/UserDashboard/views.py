from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.contrib.auth.models import User
from django.http import HttpResponseForbidden
from django.contrib.auth.decorators import user_passes_test
from django.db.models import Count, Q, Sum
from Home.models import UserProfile
from payments.models import Transaction, SellerAccountBalance, PaymentWithdrawal, Refund_details
from Orders.models import Order
from Services.models import Overview


def Seller_Dashboard(request, username):
    user = get_object_or_404(User, username=username)
    if request.user.username != username:
        return HttpResponseForbidden("Access Denied")

    profile = UserProfile.objects.get(user=user)
    services = Overview.objects.filter(user=user)
    orders = Order.objects.filter(seller=user)
    withdrawals = PaymentWithdrawal.objects.filter(user=user)

    # Earnings per service
    earnings = {}
    completed_counts = {}
    total_orders = {}

    for order in orders:
        transaction = Transaction.objects.filter(order=order).first()
        if not transaction:
            continue

        overview = transaction.overview
        total_orders[overview] = total_orders.get(overview, 0) + 1

        if order.status == "completed" and transaction:
            earnings[overview] = earnings.get(overview, 0) + transaction.amount
            completed_counts[overview] = completed_counts.get(overview, 0) + 1

    # Attach to service
    for service in services:
        service.amount_earned = earnings.get(service, 0)
        service.order_completed = completed_counts.get(service, 0)
        service.total_orders = total_orders.get(service, 0)

    # Order status counts
    order_counts = orders.aggregate(
        all_count=Count('id'),
        pending_count=Count('id', filter=Q(status='pending')),
        active_count=Count('id', filter=Q(status='in_progress')),
        return_count=Count('id', filter=Q(status='return')),
        expired_count=Count('id', filter=Q(status='expired')),
        delivered_count=Count('id', filter=Q(status='delivered')),
        completed_count=Count('id', filter=Q(status='completed')),
        cancelled_count=Count('id', filter=Q(status='cancelled'))
    )

    # Calculate balance
    total_earned = sum(earnings.values())
    fee = total_earned * 0.1
    net_earned = total_earned - fee

    withdrawal_total = withdrawals.filter(status='completed').aggregate(Sum('amount'))['amount__sum'] or 0
    balance = net_earned - withdrawal_total

    # Update or create balance
    balance_obj, _ = SellerAccountBalance.objects.get_or_create(user=user)
    balance_obj.balance_amount = balance
    balance_obj.save()

    context = {
        'user': user,
        'user_profile': profile,
        'service_overview': services,
        'order_counts': order_counts,
        'seller_balance_total': balance
    }
    return render(request, 'seller_dashboard.html', context)


def Buyer_Dashboard(request, username):
    user = get_object_or_404(User, username=username)
    if request.user.username != username:
        return redirect('IntroHome')

    profile = UserProfile.objects.get(user=user)
    orders = Order.objects.filter(buyer=user)

    order_data = []
    for order in orders:
        try:
            service = Overview.objects.get(id=order.service_id)
            transactions = Transaction.objects.filter(overview=order.service_id)
            order_data.append((order, service, transactions))
        except Overview.DoesNotExist:
            continue

    order_counts = orders.aggregate(
        all_count=Count('id'),
        pending_count=Count('id', filter=Q(status='pending')),
        active_count=Count('id', filter=Q(status='in_progress')),
        return_count=Count('id', filter=Q(status='return')),
        expired_count=Count('id', filter=Q(status='expired')),
        delivered_count=Count('id', filter=Q(status='delivered')),
        completed_count=Count('id', filter=Q(status='completed')),
        cancelled_count=Count('id', filter=Q(status='cancelled'))
    )

    context = {
        'user': user,
        'user_profile': profile,
        'orders_services_transactions': order_data,
        'order_counts': order_counts,
    }
    return render(request, 'buyer_dashboard.html', context)


def is_superuser(user):
    return user.is_superuser


@user_passes_test(is_superuser, login_url='IntroHome')
def Admin_Dashboard(request, username):
    user = get_object_or_404(User, username=username)
    if request.user.username != username:
        return HttpResponseForbidden("Access Denied")

    all_users = User.objects.all()
    all_services = Overview.objects.all()
    all_orders = Order.objects.all()

    order_stats = all_orders.aggregate(
        pending=Count('id', filter=Q(status='pending')),
        active=Count('id', filter=Q(status='in_progress')),
        returned=Count('id', filter=Q(status='return')),
        expired=Count('id', filter=Q(status='expired')),
        delivered=Count('id', filter=Q(status='delivered')),
        completed=Count('id', filter=Q(status='completed')),
        cancelled=Count('id', filter=Q(status='cancelled'))
    )

    refunds = Refund_details.objects.all()
    refund_stats = refunds.aggregate(
        total=Count('id'),
        pending=Count('id', filter=Q(status='pending')),
        processing=Count('id', filter=Q(status='processing')),
        rejected=Count('id', filter=Q(status='rejected')),
        refunded=Count('id', filter=Q(status='refunded'))
    )

    withdrawals = PaymentWithdrawal.objects.all()
    withdrawal_stats = withdrawals.aggregate(
        total=Count('id'),
        pending=Count('id', filter=Q(status='pending')),
        processing=Count('id', filter=Q(status='processing')),
        rejected=Count('id', filter=Q(status='rejected')),
        completed=Count('id', filter=Q(status='completed'))
    )

    search_results = None
    if request.method == 'POST' and 'search_user' in request.POST:
        q = request.POST.get('search_query', '').strip()
        if q:
            search_results = User.objects.filter(Q(username__icontains=q))

    context = {
        'user': user,
        'all_user': all_users,
        'search_results': search_results,
        'all_services': all_services,
        'all_order': all_orders,
        **order_stats,
        'all_refund': refunds,
        **refund_stats,
        'all_withdrawals': withdrawals,
        **withdrawal_stats,
    }
    return render(request, 'admin_dashboard.html', context)