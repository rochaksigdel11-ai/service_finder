from django.contrib import admin
from .models import Category, Overview, Package, Description, Question, Gallery, Review, Booking, Payout


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
    

@admin.register(Overview)
class OverviewAdmin(admin.ModelAdmin):
    list_display = ('titleOverview', 'user', 'category', 'overall_rating', 'is_active')
    list_filter = ('is_active', 'category')
    search_fields = ('titleOverview', 'user__username')


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ('overview', 'package_type', 'title', 'price', 'delivery_time')
    list_filter = ('package_type',)
    search_fields = ('title', 'overview__titleOverview')


@admin.register(Description)
class DescriptionAdmin(admin.ModelAdmin):
    list_display = ('overview', 'description_preview')
    search_fields = ('overview__titleOverview',)
    
    def description_preview(self, obj):
        return obj.description[:100] + '...' if len(obj.description) > 100 else obj.description
    description_preview.short_description = 'Description'


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('overview', 'question_text', 'question_type')
    list_filter = ('question_type',)
    search_fields = ('question_text', 'overview__titleOverview')


@admin.register(Gallery)
class GalleryAdmin(admin.ModelAdmin):
    list_display = ('overview', 'has_images', 'has_video')
    search_fields = ('overview__titleOverview',)
    
    def has_images(self, obj):
        return any([obj.image1, obj.image2, obj.image3])
    has_images.boolean = True
    has_images.short_description = 'Has Images'
    
    def has_video(self, obj):
        return bool(obj.video)
    has_video.boolean = True
    has_video.short_description = 'Has Video'


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('service', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('service__titleOverview', 'user__username', 'comment')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('overview', 'buyer', 'status', 'preferred_date', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('overview__titleOverview', 'buyer__username')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Payout)
class PayoutAdmin(admin.ModelAdmin):
    list_display = ('seller', 'amount', 'esewa_id', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('seller__username', 'esewa_id')