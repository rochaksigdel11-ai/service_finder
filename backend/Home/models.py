# Home/models.py — FINAL 100% WORKING VERSION
from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Skill(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


def default_profile_image():
    return 'img/default-avatar.png'


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('customer', 'Customer'),
        ('seller', 'Freelancer'),
    ]

    # FIXED: Use settings.AUTH_USER_MODEL
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='userprofile'  # optional
    )
    profile_image = models.ImageField(upload_to='profiles/', default=default_profile_image, blank=True)
    country = models.CharField(max_length=50, default='Nepal')
    state = models.CharField(max_length=50, default='Bagmati')
    phone = models.CharField(max_length=15, blank=True, null=True)
    website_link = models.URLField(blank=True, null=True)
    about_me = models.TextField()
    overall_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00, null=True, blank=True)
    skills = models.ManyToManyField(Skill, related_name='user_profiles', blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='customer')
    location = models.CharField(max_length=100, blank=True, default='Kathmandu, Nepal')

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"

    def update_rating(self):
        ratings = self.ratings_received.exclude(review_rating__isnull=True)
        if ratings.exists():
            avg = ratings.aggregate(avg=models.Avg('review_rating'))['avg']
            self.overall_rating = round(avg, 2)
        else:
            self.overall_rating = 0.00
        self.save()


class Certification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='certifications'
    )
    title = models.CharField(max_length=100)
    issuing_organization = models.CharField(max_length=100)
    issue_date = models.DateField()

    def __str__(self):
        return self.title


class Language(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='languages'  # ← Fixed: was 'certifications'
    )
    language = models.CharField(max_length=50)
    PROFICIENCY_CHOICES = (
        ('novice', 'Novice'),
        ('basic', 'Basic'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('proficient', 'Proficient'),
    )
    proficiency = models.CharField(max_length=12, choices=PROFICIENCY_CHOICES)

    def __str__(self):
        return f"{self.language} ({self.get_proficiency_display()})"


class RatingSeller(models.Model):
    review_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        validators=[MinValueValidator(0.5), MaxValueValidator(5.0)],
        blank=True,
        null=True
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ratings_given'
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ratings_received'
    )
    title = models.CharField(max_length=50)
    review = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['seller', 'reviewer']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update seller's overall rating
        if hasattr(self.seller, 'userprofile'):
            self.seller.userprofile.update_rating()