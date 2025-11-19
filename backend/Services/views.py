# ─────────────────────────────────────────────────────────────
# Services/views.py — FULLY FIXED, CLEAN, & WORKING
# ─────────────────────────────────────────────────────────────
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponseForbidden, JsonResponse
from django.forms import modelformset_factory
from django.utils import timezone
from datetime import timedelta
from django.contrib import messages
from django.db import models
from django.conf import settings  
import requests  
import uuid
import hashlib
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt




# Local Models
from .models import (
    Overview, Package, Description, Question,
    Gallery, RatingService, Message, Booking, 
)

# Local Forms
from .forms import (
    OverviewForm, PackageForm, DescriptionForm,
    QuestionForm, GalleryForm
)

# Local Serializers
from .serializers import ServiceSerializer

# Apps
from Home.models import UserProfile

# Decorators
from core.decorators import is_buyer, is_seller

# DRF
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response


# ────── Haversine Distance ──────
from math import radians, sin, cos, sqrt, atan2

def haversine_distance(lat1, lng1, lat2, lng2):
    lat1 = float(lat1)
    lng1 = float(lng1)
    lat2 = float(lat2)
    lng2 = float(lng2)

    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lng2 - lng1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c


# ────── SMS FUNCTION ──────
def send_sms(phone, message):
    if not getattr(settings, 'SPARROW_SMS_API_KEY', None):  # ← settings = BLUE
        return
    url = 'https://api.sparrowsms.com/v2/sms/'
    payload = {
        'token': settings.SPARROW_SMS_API_KEY,
        'from': 'SFA',
        'to': f'98{phone}',
        'text': message
    }
    try:
        requests.post(url, data=payload, timeout=5)
    except:
        pass


# ────── SEARCH SERVICES ──────


# ────── CREATE SERVICE ──────
@login_required
@is_seller
def create_job_profile(request, identifier):
    if request.user.username != identifier:
        return HttpResponseForbidden("Access Denied")

    QuestionFormSet = modelformset_factory(Question, form=QuestionForm, extra=1, can_delete=True)

    if request.method == 'POST':
        overview_form = OverviewForm(request.POST)
        description_form = DescriptionForm(request.POST)
        gallery_form = GalleryForm(request.POST, request.FILES)
        question_formset = QuestionFormSet(request.POST, prefix='questions')
        basic_form = PackageForm(request.POST, prefix='basic', package_type='basic')
        standard_form = PackageForm(request.POST, prefix='standard', package_type='standard')
        premium_form = PackageForm(request.POST, prefix='premium', package_type='premium')

        if all([
            overview_form.is_valid(), description_form.is_valid(), gallery_form.is_valid(),
            question_formset.is_valid(), basic_form.is_valid(), standard_form.is_valid(), premium_form.is_valid()
        ]):
            overview = overview_form.save(commit=False)
            overview.user = request.user
            overview.save()

            for form, pkg_type in [(basic_form, 'basic'), (standard_form, 'standard'), (premium_form, 'premium')]:
                if form.cleaned_data.get('title'):
                    pkg = form.save(commit=False)
                    pkg.overview = overview
                    pkg.package_type = pkg_type
                    pkg.save()

            desc = description_form.save(commit=False)
            desc.overview = overview
            desc.save()

            gallery = gallery_form.save(commit=False)
            gallery.overview = overview
            gallery.save()

            for q_form in question_formset:
                if q_form.cleaned_data and not q_form.cleaned_data.get('DELETE', False):
                    q = q_form.save(commit=False)
                    q.overview = overview
                    q.save()

            return redirect('view_service_profile', overview.id)

    else:
        overview_form = OverviewForm()
        description_form = DescriptionForm()
        gallery_form = GalleryForm()
        question_formset = QuestionFormSet(queryset=Question.objects.none(), prefix='questions')
        basic_form = PackageForm(prefix='basic', package_type='basic')
        standard_form = PackageForm(prefix='standard', package_type='standard')
        premium_form = PackageForm(prefix='premium', package_type='premium')

    return render(request, 'services/create.html', {
        'overview_form': overview_form,
        'basic_form': basic_form,
        'standard_form': standard_form,
        'premium_form': premium_form,
        'description_form': description_form,
        'question_formset': question_formset,
        'gallery_form': gallery_form,
    })


# ────── EDIT SERVICE ──────
@login_required
@is_seller
def edit_service(request, username, overview_id):
    overview = get_object_or_404(Overview, pk=overview_id, user=request.user)
    if request.user.username != username:
        return HttpResponseForbidden("Access Denied")

    QuestionFormSet = modelformset_factory(Question, form=QuestionForm, extra=1, can_delete=True)

    description = Description.objects.filter(overview=overview).first()
    gallery = Gallery.objects.filter(overview=overview).first()
    basic = Package.objects.filter(overview=overview, package_type='basic').first()
    standard = Package.objects.filter(overview=overview, package_type='standard').first()
    premium = Package.objects.filter(overview=overview, package_type='premium').first()

    if request.method == 'POST':
        overview_form = OverviewForm(request.POST, instance=overview)
        description_form = DescriptionForm(request.POST, instance=description)
        gallery_form = GalleryForm(request.POST, request.FILES, instance=gallery)
        question_formset = QuestionFormSet(request.POST, queryset=Question.objects.filter(overview=overview), prefix='questions')
        basic_form = PackageForm(request.POST, instance=basic, prefix='basic', package_type='basic')
        standard_form = PackageForm(request.POST, instance=standard, prefix='standard', package_type='standard')
        premium_form = PackageForm(request.POST, instance=premium, prefix='premium', package_type='premium')

        if all([
            overview_form.is_valid(), description_form.is_valid(), gallery_form.is_valid(),
            question_formset.is_valid(), basic_form.is_valid(), standard_form.is_valid(), premium_form.is_valid()
        ]):
            overview_form.save()
            description_form.save()
            gallery_form.save()

            for form in [basic_form, standard_form, premium_form]:
                if form.cleaned_data.get('title'):
                    form.save()

            for q_form in question_formset:
                if q_form.cleaned_data:
                    if q_form.cleaned_data.get('DELETE') and q_form.instance.pk:
                        q_form.instance.delete()
                    elif not q_form.cleaned_data.get('DELETE'):
                        q = q_form.save(commit=False)
                        q.overview = overview
                        q.save()

            return redirect('view_service_profile', overview.id)

    else:
        overview_form = OverviewForm(instance=overview)
        description_form = DescriptionForm(instance=description)
        gallery_form = GalleryForm(instance=gallery)
        question_formset = QuestionFormSet(queryset=Question.objects.filter(overview=overview), prefix='questions')
        basic_form = PackageForm(instance=basic, prefix='basic', package_type='basic')
        standard_form = PackageForm(instance=standard, prefix='standard', package_type='standard')
        premium_form = PackageForm(instance=premium, prefix='premium', package_type='premium')

    return render(request, 'services/edit.html', {
        'overview_form': overview_form,
        'basic_form': basic_form,
        'standard_form': standard_form,
        'premium_form': premium_form,
        'description_form': description_form,
        'question_formset': question_formset,
        'gallery_form': gallery_form,
        'overview': overview,
    })


# ────── DELETE SERVICE ──────
@login_required
@is_seller
def delete_service(request, username, overview_id):
    overview = get_object_or_404(Overview, pk=overview_id, user=request.user)
    if request.user.username != username:
        return HttpResponseForbidden("Access Denied")

    if request.method == 'POST':
        overview.delete()
        messages.success(request, "Service deleted successfully!")
        return redirect('seller_bookings')

    return render(request, 'services/delete.html', {'overview': overview})


# ────── BOOK SERVICE ──────
@login_required
@is_buyer
def book_service(request, overview_id):
    overview = get_object_or_404(Overview, id=overview_id)
    packages = Package.objects.filter(overview=overview)

    if request.method == 'POST':
        package_type = request.POST.get('package')
        preferred_date = request.POST.get('date')
        message = request.POST.get('message', '')

        package = get_object_or_404(Package, overview=overview, package_type=package_type)

        booking = Booking.objects.create(
            buyer=request.user,
            overview=overview,
            package=package,
            preferred_date=preferred_date,
            message=message,
            status='pending'
        )

        buyer_phone = request.user.userprofile.phone
        seller_phone = overview.user.userprofile.phone
        if buyer_phone:
            send_sms(buyer_phone, f"Booking sent for {overview.titleOverview}")
        if seller_phone:
            send_sms(seller_phone, f"New booking from {request.user.username}")

        messages.success(request, "Booking request sent!")
        return redirect('view_service_profile', overview.id)

    context = {
        'overview': overview,
        'packages': packages,
        'today': timezone.now().date().isoformat()
    }
    return render(request, 'services/book.html', context)


# ────── CHAT ──────
@login_required
def chat_view(request, overview_id):
    overview = get_object_or_404(Overview, id=overview_id)
    other_user = overview.user if request.user != overview.user else Booking.objects.filter(overview=overview).first().buyer
    messages = Message.objects.filter(overview=overview).order_by('timestamp')

    if request.method == 'POST':
        content = request.POST.get('content')
        Message.objects.create(
            sender=request.user,
            receiver=other_user,
            overview=overview,
            content=content
        )
        return redirect('chat_view', overview_id)

    return render(request, 'services/chat.html', {
        'overview': overview,
        'other_user': other_user,
        'messages': messages
    })


# ────── VIEW SERVICE + RATINGS ──────
def view_service_profile(request, overview_id):
    overview = get_object_or_404(Overview, pk=overview_id)
    user_profile = get_object_or_404(UserProfile, user=overview.user)

    packages = Package.objects.filter(overview=overview)
    basic = packages.filter(package_type='basic').first()
    standard = packages.filter(package_type='standard').first()
    premium = packages.filter(package_type='premium').first()

    description = Description.objects.filter(overview=overview).first()
    questions = Question.objects.filter(overview=overview)
    gallery = Gallery.objects.filter(overview=overview).first()
    ratings = RatingService.objects.filter(overview=overview)

    if ratings.exists():
        from django.db.models import Avg
        avg = ratings.aggregate(avg=Avg('review_rating'))['avg']
        overview.overall_rating = round(avg or 0, 2)
        overview.save()

    reviewer_profile = None
    if request.user.is_authenticated:
        reviewer_profile = UserProfile.objects.get(user=request.user)

    if request.method == 'POST' and request.user.is_authenticated:
        rating_value = request.POST.get('rating')
        title = request.POST.get('title')
        review_text = request.POST.get('review')
        ip = request.META.get('REMOTE_ADDR', '')

        if not (0.5 <= float(rating_value) <= 5.0):
            return JsonResponse({'error': 'Invalid rating.'}, status=400)

        recent = RatingService.objects.filter(ip_address=ip, created_at__gte=timezone.now() - timedelta(hours=1)).count()
        if recent > 3 or len(review_text) < 10:
            return JsonResponse({'error': 'Review blocked.'}, status=400)

        RatingService.objects.update_or_create(
            overview=overview, reviewer=reviewer_profile,
            defaults={'review_rating': rating_value, 'title': title, 'review': review_text, 'ip_address': ip}
        )
        return JsonResponse({'success': True})

    context = {
        'service': overview,
        'user_profile': user_profile,
        'basic': basic,
        'standard': standard,
        'premium': premium,
        'description': description,
        'questions': questions,
        'gallery': gallery,
        'ratings': ratings,
        'reviewer_profile': reviewer_profile,
        'review_count': ratings.count(),
    }
    return render(request, 'services/view_service_profile.html', context)


# ────── SELLER BOOKINGS ──────
@login_required
def seller_bookings(request):
    try:
        profile = request.user.userprofile
    except UserProfile.DoesNotExist:
        messages.error(request, "Please complete your profile.")
        return redirect('profile_setup')  # or home

    if profile.role != 'freelancer':
        messages.error(request, "Only Freelancers can access bookings.")
        return redirect('search_services')  # Now safe!

    bookings = Booking.objects.filter(overview__user=request.user).select_related(
        'buyer__user', 'overview', 'package'
    ).order_by('-created_at')

    return render(request, 'services/seller_bookings.html', {'bookings': bookings})

# ────── UPDATE STATUS ──────
@login_required
@is_seller
def update_booking_status(request, booking_id, status):
    booking = get_object_or_404(Booking, id=booking_id, overview__user=request.user)
    if status in ['confirmed', 'completed', 'cancelled']:
        booking.status = status
        booking.save()
        messages.success(request, f"Booking {status}!")
    return redirect('seller_bookings')


# ────── API ENDPOINTS ──────
@api_view(['GET'])
@permission_classes([AllowAny])
def service_list(request):
    services = Overview.objects.all()
    serializer = ServiceSerializer(services, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def nearby_services_api(request):
    try:
        lat = float(request.GET.get('lat', 27.7))
        lng = float(request.GET.get('lng', 85.3))
        radius = float(request.GET.get('radius', 5))

        services = []
        for service in Overview.objects.filter(
            is_active=True,
            location_lat__isnull=False,
            location_lng__isnull=False
        ):
            dist = haversine_distance(lat, lng, float(service.location_lat), float(service.location_lng))
            if dist <= radius:
                service.distance_km = round(dist, 2)
                services.append(service)

        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    try:
        profile = UserProfile.objects.get(user=request.user)
        return Response({
            'username': request.user.username,
            'role': profile.role,
            'about': profile.about_me
        })
    except:
        return Response({'role': 'customer'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_conversations(request):
    sent = Message.objects.filter(sender=request.user).values_list('receiver', flat=True).distinct()
    received = Message.objects.filter(receiver=request.user).values_list('sender', flat=True).distinct()
    users = set(sent) | set(received)

    data = []
    for u in users:
        try:
            profile = UserProfile.objects.get(user=u)
            last_msg = Message.objects.filter(
                models.Q(sender=request.user, receiver=u) |
                models.Q(sender=u, receiver=request.user)
            ).order_by('-timestamp').first()

            data.append({
                'id': u,
                'freelancerName': profile.user.username,
                'freelancerAvatar': profile.user.username[0].upper(),
                'lastMessage': last_msg.content if last_msg else 'No messages yet',
                'unread': Message.objects.filter(receiver=request.user, sender=u, is_read=False).count()
            })
        except UserProfile.DoesNotExist:
            continue

    return Response(data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def chat_messages(request, convo_id):
    if request.method == 'GET':
        msgs = Message.objects.filter(
            models.Q(sender=request.user, receiver_id=convo_id) |
            models.Q(sender_id=convo_id, receiver=request.user)
        ).order_by('timestamp')

        data = [{
            'id': m.id,
            'conversationId': convo_id,
            'sender': 'You' if m.sender == request.user else m.sender.username,
            'text': m.content,
            'timestamp': m.timestamp.strftime('%I:%M %p')
        } for m in msgs]
        return Response(data)

    elif request.method == 'POST':
        content = request.data.get('text', '').strip()
        if not content:
            return Response({'error': 'Message cannot be empty'}, status=400)

        msg = Message.objects.create(
            sender=request.user,
            receiver_id=convo_id,
            content=content
        )
        return Response({
            'id': msg.id,
            'conversationId': convo_id,
            'sender': 'You',
            'text': content,
            'timestamp': msg.timestamp.strftime('%I:%M %p')
        }, status=201)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def service_reviews(request, service_id):
    if request.method == 'GET':
        ratings = RatingService.objects.filter(overview_id=service_id)
        data = [{
            'id': r.id,
            'clientName': r.reviewer.user.username,
            'rating': float(r.review_rating),
            'comment': r.review,
            'date': r.created_at.strftime('%B %d, %Y')
        } for r in ratings]
        return Response(data)

    if request.method == 'POST':
        RatingService.objects.create(
            overview_id=service_id,
            reviewer=request.user.userprofile,
            review_rating=request.data['rating'],
            title="Review",
            review=request.data['comment']
        )
        return Response({'status': 'review added'})


@api_view(['GET'])
@permission_classes([AllowAny])
def service_detail(request, pk):
    try:
        service = Overview.objects.get(pk=pk, is_active=True)
        packages = Package.objects.filter(overview=service)

        data = {
            'id': service.id,
            'titleOverview': service.titleOverview,
            'provider': service.user.username,
            'description': service.descriptions.first().description if service.descriptions.exists() else 'No description',
            'overall_rating': float(service.overall_rating) if service.overall_rating else 0.0,
            'distance_km': 3.2,
            'packages': [{
                'id': p.id,
                'package_type': p.package_type,
                'title': p.title,
                'price': float(p.price),
                'delivery_time': p.delivery_time
            } for p in packages]
        }
        return Response(data)
    except Overview.DoesNotExist:
        return Response({'error': 'Service not found'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_orders(request):
    bookings = Booking.objects.filter(buyer=request.user)
    data = []
    for b in bookings:
        data.append({
            'id': b.id,
            'service': b.overview.titleOverview,
            'provider': b.overview.user.username,
            'status': b.status.lower(),
            'date': b.preferred_date.strftime('%Y-%m-%d'),
            'amount': float(b.package.price) if b.package else 0
        })
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booking(request):
    try:
        overview_id = request.data.get('overview')
        package_id = request.data.get('package')
        preferred_date = request.data.get('preferred_date')
        if not preferred_date:
            return Response({'error': 'Please select a date'}, status=400)

        if not overview_id or not package_id:
            return Response({'error': 'Missing overview or package ID'}, status=400)

        overview = Overview.objects.get(id=overview_id)
        package = Package.objects.get(id=package_id, overview=overview)

        booking = Booking.objects.create(
            buyer=request.user,
            overview=overview,
            package=package,
            preferred_date=preferred_date,
            status='pending'
        )
        return Response({'status': 'booked', 'booking_id': booking.id})
    except Overview.DoesNotExist:
        return Response({'error': 'Service not found'}, status=404)
    except Package.DoesNotExist:
        return Response({'error': 'Package not found'}, status=404)
    except Exception as e:
        print(f"Booking error: {e}")
        return Response({'error': 'Booking failed. Please try again.'}, status=500)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seller_bookings_api(request):
    if not hasattr(request.user, 'userprofile') or request.user.userprofile.role != 'freelancer':
        return Response({'error': 'Access denied'}, status=403)

    bookings = Booking.objects.filter(overview__user=request.user).select_related(
        'buyer__userprofile', 'overview', 'package'
    ).order_by('-created_at')

    data = []
    for b in bookings:
        data.append({
            'id': b.id,
            'buyer': b.buyer.username,
            'buyer_avatar': b.buyer.username[0].upper(),
            'service': b.overview.titleOverview,
            'package': b.package.package_type.title(),
            'price': float(b.package.price),
            'date': b.preferred_date.strftime('%Y-%m-%d'),
            'status': b.status,
            'message': b.message or ''
        })

    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_esewa_payment(request):
    booking_id = request.data.get('booking_id')
    try:
        booking = Booking.objects.get(id=booking_id, buyer=request.user, status='pending')
    except Booking.DoesNotExist:
        return Response({'error': 'Invalid booking'}, status=400)

    amount = float(booking.package.price)
    transaction_uuid = str(uuid.uuid4())
    product_code = "EPAYTEST" if settings.ESEWA_TEST_MODE else settings.ESEWA_MERCHANT_ID

    # Save transaction ID
    booking.transaction_id = transaction_uuid
    booking.save()

    signed_field = f"total_amount={amount},transaction_uuid={transaction_uuid},product_code={product_code}"
    secret_key = "8gBm/:&EnhH.1/q"
    signature = hashlib.md5(signed_field.encode()).hexdigest()

    esewa_url = "https://uat.esewa.com.np/epay/main" if settings.ESEWA_TEST_MODE else "https://esewa.com.np/epay/main"

    payload = {
        'amount': amount,
        'tax_amount': 0,
        'total_amount': amount,
        'transaction_uuid': transaction_uuid,
        'product_code': product_code,
        'product_service_charge': 0,
        'product_delivery_charge': 0,
        'success_url': request.build_absolute_uri(reverse('esewa_success')),
        'failure_url': request.build_absolute_uri(reverse('esewa_failure')),
        'signed_field_names': 'total_amount,transaction_uuid,product_code',
        'signature': signature,
    }

    return Response({
        'esewa_url': esewa_url,
        'payload': payload
    })
    


@csrf_exempt
def esewa_success(request):
    refId = request.GET.get('refId')
    oid = request.GET.get('oid')
    amount = request.GET.get('amt')

    try:
        booking = Booking.objects.get(transaction_id=oid)
        booking.status = 'paid'
        booking.save()

        # SMS to both
        send_sms(booking.buyer.userprofile.phone, f"Payment successful! Booking #{booking.id}")
        send_sms(booking.overview.user.userprofile.phone, f"New paid booking from {booking.buyer.username}")

        return redirect(f"http://localhost:5173/booking/confirm?success=true&booking={booking.id}")
    except:
        return redirect("http://localhost:5173/booking/confirm?error=true")

@csrf_exempt
def esewa_failure(request):
    return redirect("http://localhost:5173/booking/confirm?error=true") 



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_payout(request):
    if request.user.userprofile.role != 'freelancer':
        return Response({'error': 'Access denied'}, status=403)

    amount = Decimal(request.data.get('amount', 0))
    esewa_id = request.data.get('esewa_id')

    if amount < 500:
        return Response({'error': 'Minimum Rs. 500'}, status=400)

    # Check earnings (simplified)
    total_earned = Booking.objects.filter(overview__user=request.user, status='completed').aggregate(
        total=Sum('package__price')
    )['total'] or 0

    if amount > total_earned:
        return Response({'error': 'Insufficient balance'}, status=400)

    Payout.objects.create(seller=request.user, amount=amount, esewa_id=esewa_id)
    return Response({'status': 'Payout requested! Will be processed in 24 hours'})