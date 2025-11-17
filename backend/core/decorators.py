# core/decorators.py
from django.http import HttpResponseForbidden
from django.shortcuts import redirect
from functools import wraps
from Home.models import UserProfile  # ADD THIS

def role_required(allowed_roles):
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect('login')

            # SAFE: Create UserProfile if not exists
            profile, created = UserProfile.objects.get_or_create(user=request.user)
            if created:
                profile.role = 'customer'  # default
                if request.user.username in ['sita', 'raju']:
                    profile.role = 'seller'
                profile.save()

            if profile.role not in allowed_roles:
                return HttpResponseForbidden(
                    f"Access denied. You are {profile.get_role_display()}. "
                    f"Required: {', '.join([r.title() for r in allowed_roles])}"
                )
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator

# Role Decorators
is_buyer = role_required(['customer', 'both'])
is_seller = role_required(['seller', 'both'])
is_admin = role_required(['admin'])