from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name


class Overview(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
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
        reviews = self.reviews.all()
        if reviews.exists():
            avg = sum(review.rating for review in reviews) / reviews.count()
            self.overall_rating = round(avg, 2)
        else:
            self.overall_rating = 0.00
        self.save()

    def __str__(self):
        return self.titleOverview


class Package(models.Model):
    PACKAGE_TYPE = [
        ('basic', 'Basic'),
        ('standard', 'Standard'), 
        ('premium', 'Premium')
    ]
    
    overview = models.ForeignKey(Overview, on_delete=models.CASCADE, related_name='packages')
    package_type = models.CharField(max_length=10, choices=PACKAGE_TYPE)
    title = models.CharField(max_length=100)
    description = models.TextField()
    delivery_time = models.PositiveIntegerField(help_text="Days")
    revisions = models.CharField(max_length=20)
    source_file = models.BooleanField(default=False)
    price = models.IntegerField(validators=[MinValueValidator(50)])

    class Meta:
        unique_together = ['overview', 'package_type']
    
    def __str__(self):
        return f"{self.overview.titleOverview} - {self.package_type}"


class Description(models.Model):
    overview = models.ForeignKey(Overview, on_delete=models.CASCADE, related_name='descriptions')
    description = models.TextField()
    
    def __str__(self):
        return f"Description for {self.overview.titleOverview}"


class Question(models.Model):
    QUESTION_TYPES = [
        ('text', 'Text'),
        ('textarea', 'Textarea'), 
        ('choices', 'Multiple Choice')
    ]
    
    overview = models.ForeignKey(Overview, on_delete=models.CASCADE, related_name='faqs')
    question_text = models.CharField(max_length=200)
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='text')
    answer_text = models.TextField(blank=True)
    choices = models.JSONField(default=list, blank=True)
    allow_multiple = models.BooleanField(default=False)
    
    def __str__(self):
        return self.question_text


class Gallery(models.Model):
    overview = models.ForeignKey(Overview, on_delete=models.CASCADE, related_name='gallery')
    image1 = models.ImageField(upload_to='gallery/', blank=True, null=True)
    image2 = models.ImageField(upload_to='gallery/', blank=True, null=True)
    image3 = models.ImageField(upload_to='gallery/', blank=True, null=True)
    video = models.FileField(upload_to='videos/', blank=True, null=True)
    
    def __str__(self):
        return f"Gallery for {self.overview.titleOverview}"


class Review(models.Model):
    service = models.ForeignKey(Overview, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars"
    )
    comment = models.TextField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['service', 'user']
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update the service's overall rating
        self.service.update_rating()

    def __str__(self):
        return f"{self.user.username} - {self.rating} stars for {self.service.titleOverview}"


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'), 
        ('cancelled', 'Cancelled'),
    ]
    
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='service_bookings')
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

    @property
    def freelancer(self):
        return self.overview.user


class Payout(models.Model):
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    esewa_id = models.CharField(max_length=20)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Payout ${self.amount} for {self.seller.username}"