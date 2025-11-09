from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required  # ← ADD THIS LINE
from .forms import (
    OverviewForm, BasicPackageForm, StandardPackageForm, PremiumPackageForm,
    DescriptionForm, QuestionForm, GalleryForm
)
from Home.models import UserProfile
from django.shortcuts import render, redirect, get_object_or_404
from .models import (
    Overview, BasicPackage, StandardPackage, PremiumPackage,
    Description, Question, Gallery, RatingService
)
from django.http import HttpResponseForbidden
from django.forms import modelformset_factory  # ← Also make sure this is here

@login_required
def create_job_profile(request, identifier):
    user = get_object_or_404(User, username=identifier)
    if request.user.username != identifier:
        return HttpResponseForbidden("Access Denied")

    # Create formset dynamically
    QuestionFormSet = modelformset_factory(Question, form=QuestionForm, extra=1, can_delete=True)

    if request.method == 'POST':
        overview_form = OverviewForm(request.POST)
        basic_form = BasicPackageForm(request.POST, prefix='basic')
        standard_form = StandardPackageForm(request.POST, prefix='standard')
        premium_form = PremiumPackageForm(request.POST, prefix='premium')
        description_form = DescriptionForm(request.POST)
        question_formset = QuestionFormSet(request.POST, prefix='questions')
        gallery_form = GalleryForm(request.POST, request.FILES)

        if (overview_form.is_valid() and basic_form.is_valid() and
            standard_form.is_valid() and premium_form.is_valid() and
            description_form.is_valid() and question_formset.is_valid() and
            gallery_form.is_valid()):

            overview = overview_form.save(commit=False)
            overview.user = request.user
            overview.save()

            # Save packages
            for form, Model in [
                (basic_form, BasicPackage),
                (standard_form, StandardPackage),
                (premium_form, PremiumPackage)
            ]:
                pkg = form.save(commit=False)
                pkg.overview = overview
                pkg.save()

            # Save description
            desc = description_form.save(commit=False)
            desc.overview = overview
            desc.save()

            # Save gallery
            gallery = gallery_form.save(commit=False)
            gallery.overview = overview
            gallery.save()

            # Save questions
            for q_form in question_formset:
                if q_form.cleaned_data and not q_form.cleaned_data.get('DELETE', False):
                    question = q_form.save(commit=False)
                    question.overview = overview
                    question.save()

            return redirect('view_service_profile', overview.id)

    else:
        overview_form = OverviewForm()
        basic_form = BasicPackageForm(prefix='basic')
        standard_form = StandardPackageForm(prefix='standard')
        premium_form = PremiumPackageForm(prefix='premium')
        description_form = DescriptionForm()
        question_formset = QuestionFormSet(queryset=Question.objects.none(), prefix='questions')
        gallery_form = GalleryForm()

    context = {
        'overview_form': overview_form,
        'basic_form': basic_form,
        'standard_form': standard_form,
        'premium_form': premium_form,
        'description_form': description_form,
        'question_formset': question_formset,
        'gallery_form': gallery_form,
    }
    return render(request, 'services/create.html', context)


@login_required
def edit_service(request, username, overview_id):
    overview = get_object_or_404(Overview, pk=overview_id, user=request.user)
    if request.user.username != username:
        return HttpResponseForbidden("Access Denied")

    QuestionFormSet = modelformset_factory(Question, form=QuestionForm, extra=1, can_delete=True)

    # Get related objects safely
    basic = BasicPackage.objects.filter(overview=overview).first()
    standard = StandardPackage.objects.filter(overview=overview).first()
    premium = PremiumPackage.objects.filter(overview=overview).first()
    description = Description.objects.filter(overview=overview).first()
    gallery = Gallery.objects.filter(overview=overview).first()

    if request.method == 'POST':
        overview_form = OverviewForm(request.POST, instance=overview)
        basic_form = BasicPackageForm(request.POST, instance=basic, prefix='basic')
        standard_form = StandardPackageForm(request.POST, instance=standard, prefix='standard')
        premium_form = PremiumPackageForm(request.POST, instance=premium, prefix='premium')
        description_form = DescriptionForm(request.POST, instance=description)
        question_formset = QuestionFormSet(request.POST, queryset=Question.objects.filter(overview=overview), prefix='questions')
        gallery_form = GalleryForm(request.POST, request.FILES, instance=gallery)

        if all([overview_form.is_valid(), basic_form.is_valid(), standard_form.is_valid(),
                premium_form.is_valid(), description_form.is_valid(), question_formset.is_valid(), gallery_form.is_valid()]):
            
            overview_form.save()
            basic_form.save()
            standard_form.save()
            premium_form.save()
            description_form.save()
            gallery_form.save()

            for q_form in question_formset:
                if q_form.cleaned_data:
                    if q_form.cleaned_data.get('DELETE'):
                        if q_form.instance.pk:
                            q_form.instance.delete()
                    else:
                        q = q_form.save(commit=False)
                        q.overview = overview
                        q.save()

            return redirect('view_service_profile', overview.id)

    else:
        overview_form = OverviewForm(instance=overview)
        basic_form = BasicPackageForm(instance=basic, prefix='basic')
        standard_form = StandardPackageForm(instance=standard, prefix='standard')
        premium_form = PremiumPackageForm(instance=premium, prefix='premium')
        description_form = DescriptionForm(instance=description)
        question_formset = QuestionFormSet(queryset=Question.objects.filter(overview=overview), prefix='questions')
        gallery_form = GalleryForm(instance=gallery)

    context = {
        'overview_form': overview_form,
        'basic_form': basic_form,
        'standard_form': standard_form,
        'premium_form': premium_form,
        'description_form': description_form,
        'question_formset': question_formset,
        'gallery_form': gallery_form,
        'overview': overview,
    }
    return render(request, 'services/edit.html', context)


@login_required
def delete_service(request, username, overview_id):
    overview = get_object_or_404(Overview, pk=overview_id, user=request.user)
    if request.user.username != username:
        return HttpResponseForbidden("Access Denied")

    if request.method == 'POST':
        overview.delete()
        return redirect('IntroHome')  # Change to your home URL

    return render(request, 'services/delete.html', {'overview': overview})

def view_service_profile(request, overview_id):
    overview = get_object_or_404(Overview, pk=overview_id)
    user_profile = UserProfile.objects.get(user=overview.user)
    basic_packages = BasicPackage.objects.filter(overview=overview)
    standard_packages = StandardPackage.objects.filter(overview=overview)
    premium_packages = PremiumPackage.objects.filter(overview=overview)
    description = Description.objects.filter(overview=overview).first()
    questions = Question.objects.filter(overview=overview)
    gallery = Gallery.objects.filter(overview=overview).first()
    ratings = RatingService.objects.filter(overview=overview)
    reviewer_profile = UserProfile.objects.get(user=request.user)

    # Update overall rating
    if ratings.exists():
        total = sum(r.review_rating for r in ratings if r.review_rating)
        overview.overall_rating = round(total / ratings.count(), 2)
    else:
        overview.overall_rating = 0
    overview.save()

    if request.method == 'POST' and request.user.is_authenticated:
        rating_value = request.POST.get('rating')
        title = request.POST.get('title')
        review_text = request.POST.get('review')

        existing = RatingService.objects.filter(overview=overview, reviewer=reviewer_profile).first()
        if existing:
            existing.review_rating = rating_value
            existing.title = title
            existing.review = review_text
            existing.save()
        else:
            RatingService.objects.create(
                overview=overview,
                reviewer=reviewer_profile,
                review_rating=rating_value,
                title=title,
                review=review_text
            )

    context = {
        'service': overview,
        'user_profile': user_profile,
        'basic_packages': basic_packages,
        'standard_packages': standard_packages,
        'premium_packages': premium_packages,
        'description': description,
        'questions': questions,
        'gallery': gallery,
        'ratings': ratings,
        'reviewer_profile': reviewer_profile,
        'review_count': ratings.count(),
    }
    return render(request, 'services/view.html', context)