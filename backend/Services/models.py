# Services/models.py
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from Home.models import UserProfile

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name

class Overview(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    titleOverview = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    overall_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    search_tags = models.CharField(max_length=200, blank=True)
    location_lat = models.FloatField(default=27.7)
    location_lng = models.FloatField(default=85.7)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if self.search_tags:
            tags = [tag.strip() for tag in self.search_tags.split(',') if tag.strip()]
            self.search_tags = ','.join(tags)
        super().save(*args, **kwargs)

    def update_rating(self):
        from django.db.models import Avg
        ratings = self.service_ratings.exclude(review_rating__isnull=True)
        if ratings.exists():
            avg = ratings.aggregate(avg=Avg('review_rating'))['avg']
            self.overall_rating = round(avg, 2)
        else:
            self.overall_rating = 0.00
        self.save()

    def __str__(self):
        return self.titleOverview

class Package(models.Model):
    PACKAGE_TYPE = [('basic', 'Basic'), ('standard', 'Standard'), ('premium', 'Premium')]
    overview = models.ForeignKey(Overview, on_delete=models.CASCADE, related_name='packages')
    package_type = models.CharField(max_length=10, choices=PACKAGE_TYPE)
    title = models.CharField(max_length=100)
    description = models.TextField()
    delivery_time = models.PositiveIntegerField(help_text="Days")
    revisions = models.CharField(max_length=20, choices=[(i, str(i)) for i in range(1, 10)] + [('unlimited', 'Unlimited')])
    source_file = models.BooleanField(default=False)
    price = models.IntegerField(validators=[MinValueValidator(50)])

    class Meta:
        unique_together = ['overview', 'package_type']

class Description(models.Model):
    overview = models.ForeignKey(Overview, on_delete=models.CASCADE, related_name='descriptions')
    description = models.TextField()

class Question(models.Model):
    overview = models.ForeignKey(Overview, on_delete=models.CASCADE, related_name='faqs')
    question_text = models.CharField(max_length=200)
    question_type = models.CharField(max_length=20, choices=[('text', 'Text'), ('textarea', 'Textarea'), ('choices', 'Multiple Choice')], default='text')
    answer_text = models.TextField(blank=True)
    choices = models.JSONField(default=list, blank=True)
    allow_multiple = models.BooleanField(default=False)

class Gallery(models.Model):
    overview = models.ForeignKey(Overview, on_delete=models.CASCADE, related_name='gallery')
    image1 = models.ImageField(upload_to='gallery/', blank=True, null=True)
    image2 = models.ImageField(upload_to='gallery/', blank=True, null=True)
    image3 = models.ImageField(upload_to='gallery/', blank=True, null=True)
    video = models.FileField(upload_to='videos/', blank=True, null=True)

class RatingService(models.Model):
    overview = models.ForeignKey(Overview, on_delete=models.CASCADE, related_name='service_ratings')
    review_rating = models.DecimalField(max_digits=3, decimal_places=2, validators=[MinValueValidator(0.5), MaxValueValidator(5.0)])
    reviewer = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='service_ratings_given')
    title = models.CharField(max_length=50)
    review = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['overview', 'reviewer']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.overview.update_rating()

# BOOKING MODEL — FIXED
class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'), ('confirmed', 'Confirmed'),
        ('completed', 'Completed'), ('cancelled', 'Cancelled'),
    ]
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='service_bookings')
    overview = models.ForeignKey(Overview, on_delete=models.CASCADE, related_name='service_bookings_received')
    package = models.ForeignKey(Package, on_delete=models.SET_NULL, null=True, blank=True)
    preferred_date = models.DateField()
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.buyer.username} → {self.overview.titleOverview}"
    
    
class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    overview = models.ForeignKey(Overview, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']