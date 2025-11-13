from django.db import models  # ← ADD THIS
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout, authenticate, login
from django.http import HttpResponseForbidden
from django.core.exceptions import PermissionDenied
from django.contrib import messages
from django.shortcuts import render, redirect, get_object_or_404
from django.forms import inlineformset_factory

from .forms import UserProfileForm, CertificationForm, LanguageForm
from .models import UserProfile, Certification, Language, RatingSeller
from Services.models import Overview, Category, Booking, Package  # ← All needed


def intro_home(request):
    services = Overview.objects.filter(is_active=True).select_related('user')
    categories = Overview.objects.values_list('category', flat=True).distinct()

    # Search
    q = request.GET.get('q')
    if q:
        services = services.filter(
            models.Q(title__icontains=q) | 
            models.Q(description__icontains=q)
        )

    # Category filter
    cat = request.GET.get('category')
    if cat and cat != 'all':
        services = services.filter(category__iexact=cat)

    context = {
        'services': services,
        'categories': ['All'] + list(categories),
        'search_query': q,
        'current_category': cat,
    }
    return render(request, 'home/intro.html', context)


@login_required
def home(request, identifier):
    user = get_object_or_404(User, username=identifier)
    if identifier != request.user.username:
        return HttpResponseForbidden("Access Denied")

    user_profile, created = UserProfile.objects.get_or_create(user=user)
    categories = Category.objects.all()

    context = {
        'user': user,
        'current_user': request.user,
        'user_profile': user_profile,
        'category': categories,
    }
    return render(request, 'home/home.html', context)


@login_required
def edit_profile(request, identifier):
    user = get_object_or_404(User, username=identifier)
    user_profile, created = UserProfile.objects.get_or_create(user=user)

    if request.user != user:
        raise PermissionDenied("You are not authorized to edit this profile.")

    user_form = UserProfileForm(request.POST or None, request.FILES or None, instance=user_profile)
    CertificationFormSet = inlineformset_factory(UserProfile, Certification, form=CertificationForm, extra=1, can_delete=True)
    LanguageFormSet = inlineformset_factory(UserProfile, Language, form=LanguageForm, extra=1, can_delete=True)

    certification_formset = CertificationFormSet(request.POST or None, instance=user_profile, prefix='certifications')
    language_formset = LanguageFormSet(request.POST or None, instance=user_profile, prefix='languages')

    username_taken = email_taken = False

    if request.method == 'POST':
        new_username = request.POST.get('username', '')
        new_email = request.POST.get('email', '')

        username_taken = User.objects.filter(username=new_username).exclude(pk=user.pk).exists()
        email_taken = User.objects.filter(email=new_email).exclude(pk=user.pk).exists()

        if not (username_taken or email_taken):
            user.username = new_username
            user.email = new_email
            user.first_name = request.POST.get('first_name', '')
            user.last_name = request.POST.get('last_name', '')
            user.save()

            if user_form.is_valid() and certification_formset.is_valid() and language_formset.is_valid():
                user_form.save()
                certification_formset.save()
                language_formset.save()
                messages.success(request, "Profile updated successfully!")
                return redirect('home', identifier=user.username)

    context = {
        'user': user,
        'user_profile': user_profile,
        'user_form': user_form,
        'certification_formset': certification_formset,
        'language_formset': language_formset,
        'username_taken': username_taken,
        'email_taken': email_taken,
    }
    return render(request, 'edit_profile.html', context)


@login_required
def view_profile_public(request, username):
    user = get_object_or_404(User, username=username)
    user_profile, created = UserProfile.objects.get_or_create(user=user)
    user_service_profiles = Overview.objects.filter(user=user)
    seller_profile = user_profile

    profile_reviews = RatingSeller.objects.filter(seller=seller_profile)
    total_review_sum = sum(r.review_rating for r in profile_reviews if r.review_rating)
    reviewer_usernames = [r.reviewer.user.username for r in profile_reviews]

    if profile_reviews.exists():
        user_profile.overall_rating = round(total_review_sum / profile_reviews.count(), 1)
        user_profile.save()

    if request.method == 'POST' and request.user.is_authenticated:
        rating_value = request.POST.get('rg1')
        title = request.POST.get('review_title')
        review_text = request.POST.get('review_message')
        re_profile, _ = UserProfile.objects.get_or_create(user=request.user)

        existing = RatingSeller.objects.filter(seller=seller_profile, reviewer=re_profile).first()
        if existing:
            existing.review_rating = rating_value
            existing.title = title
            existing.review = review_text
            existing.save()
        else:
            RatingSeller.objects.create(
                seller=seller_profile,
                reviewer=re_profile,
                review_rating=rating_value,
                title=title,
                review=review_text
            )
        return redirect('view_profile_public', username=username)

    context = {
        'user_profile': user_profile,
        'user_service_profiles': user_service_profiles,
        'profile_reviews': profile_reviews,
        'count_review': profile_reviews.count(),
        'reviewer_profile_usr': reviewer_usernames,
    }
    return render(request, 'profiles/view_profile_public.html', context)

@login_required
def become_freelancer(request):
    profile = request.user.userprofile
    if profile.role == 'customer':
        profile.role = 'freelancer'
        profile.save()
        messages.success(request, "You are now a Freelancer!")
    elif profile.role == 'freelancer':
        messages.info(request, "You are already a Freelancer.")
    else:
        messages.error(request, "Admins cannot become freelancers.")
    
    return redirect('create_job_profile', request.user.username)

@login_required
def freelancer_bookings(request):
    if request.user.userprofile.role != 'freelancer':
        return HttpResponseForbidden("Only Freelancers can access this page.")
    
    bookings = Booking.objects.filter(overview__user=request.user).select_related(
        'buyer__user', 'overview', 'package'
    ).order_by('-created_at')

    context = { 'bookings': bookings }
    return render(request, 'services/freelancer_bookings.html', context)


def login_view(request):
    if request.user.is_authenticated:
        profile = request.user.userprofile
        if profile.role == 'admin':
            return redirect('/admin/')
        elif profile.role == 'freelancer':
            return redirect('_bookings')
        else:
            return redirect('search_services')
    
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            profile = user.userprofile
            if profile.role == 'admin':
                return redirect('/admin/')
            elif profile.role == 'freelancer':
                return redirect('freelancer_bookings')
            else:
                return redirect('search_services')
        else:
            messages.error(request, "Invalid username or password.")
    
    return render(request, 'registration/login.html')

def redirect_based_on_role(user):
    try:
        profile = user.userprofile
        if profile.role == 'admin':
            return redirect('/admin/')
        elif profile.role == 'freelancer':
            return redirect('seller_bookings')  # ← From Services
        else:
            return redirect('search_services')
    except UserProfile.DoesNotExist:
        return redirect('search_services')
    
def logout_view(request):
    logout(request)
    return redirect('IntroHome')    