# Services/views.py
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponseForbidden, JsonResponse
from django.forms import modelformset_factory
from django.utils import timezone
from datetime import timedelta
from .models import Overview, Package, Description, Question, Gallery, RatingService, Message
from .forms import OverviewForm, PackageForm, DescriptionForm, QuestionForm, GalleryForm
from Home.models import UserProfile
from core.decorators import is_buyer, is_seller
from django.contrib import messages
from .models import Booking
import requests
from django.conf import settings

# ────── Haversine Distance ──────
from math import radians, sin, cos, sqrt, atan2

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

# ────── SMS FUNCTION ──────
def send_sms(phone, message):
    if not getattr(settings, 'SPARROW_SMS_API_KEY', None):
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
@login_required
@is_buyer
def search_services(request):
    user_lat = float(request.GET.get('lat', 27.7172))
    user_lon = float(request.GET.get('lon', 85.3240))
    radius_km = float(request.GET.get('radius', 10))
    category = request.GET.get('category', '')

    overviews = []
    for overview in Overview.objects.filter(location_lat__isnull=False, location_lng__isnull=False):
        distance = haversine_distance(user_lat, user_lon, overview.location_lat, overview.location_lng)
        if distance <= radius_km:
            overview.distance_km = round(distance, 2)
            overviews.append(overview)

    if category:
        overviews = [o for o in overviews if o.category and o.category.name.lower() == category.lower()]

    context = {
        'overviews': overviews,
        'user_location': (user_lat, user_lon),
        'radius': radius_km,
        'category': category,
    }
    return render(request, 'services/search_results.html', context)

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

# ────── EDIT SERVICE (ADD THIS FUNCTION) ──────
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
    
@login_required
@is_seller
def delete_service(request, username, overview_id):
    overview = get_object_or_404(Overview, pk=overview_id, user=request.user)
    if request.user.username != username:
        return HttpResponseForbidden("Access Denied")

    if request.method == 'POST':
        overview.delete()
        messages.success(request, "Service deleted successfully!")
        return redirect('seller_bookings')  # or 'IntroHome'

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

        # SMS
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
@is_seller
def seller_bookings(request):
    bookings = Booking.objects.filter(overview__user=request.user).select_related('buyer', 'overview', 'package')
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

