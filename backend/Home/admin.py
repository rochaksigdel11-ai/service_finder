# Home/admin.py
from django.contrib import admin
from .models import UserProfile, Skill, Certification, Language, RatingSeller

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'country', 'state', 'overall_rating')
    list_filter = ('role', 'country', 'state')
    search_fields = ('user__username', 'user__email', 'country', 'state')
    readonly_fields = ('overall_rating',)

    fieldsets = (
        ('User', {
            'fields': ('user', 'role')
        }),
        ('Profile Image', {
            'fields': ('profile_image',),
            'description': 'Upload a profile picture'
        }),
        ('Location', {
            'fields': ('country', 'state')
        }),
        ('About', {
            'fields': ('website_link', 'about_me')
        }),
        ('Skills & Ratings', {
            'fields': ('skills', 'overall_rating'),
            'classes': ('collapse',)
        }),
    )

    filter_horizontal = ('skills',)


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'issuing_organization', 'issue_date')
    list_filter = ('issue_date',)
    search_fields = ('title', 'issuing_organization')


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ('user', 'language', 'proficiency')
    list_filter = ('proficiency', 'language')
    search_fields = ('language',)


@admin.register(RatingSeller)
class RatingSellerAdmin(admin.ModelAdmin):
    list_display = ('seller', 'reviewer', 'review_rating', 'title', 'created_at')
    list_filter = ('review_rating', 'created_at')
    search_fields = ('seller__user__username', 'reviewer__user__username', 'title')
    readonly_fields = ('created_at',)