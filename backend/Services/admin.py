# Services/admin.py
from django.contrib import admin
from .models import Overview, Package, Description, Question, Gallery, RatingService, Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
    
@admin.register(Overview)
class OverviewAdmin(admin.ModelAdmin):
    list_display = ('titleOverview', 'user', 'category', 'overall_rating', 'is_active')
    list_filter = ('is_active', 'category')
    search_fields = ('titleOverview', 'user__username')

# Optional: Register others
admin.site.register(Package)
admin.site.register(Description)
admin.site.register(Question)
admin.site.register(Gallery)
admin.site.register(RatingService)