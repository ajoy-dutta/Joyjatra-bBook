"""
URL configuration for server project.
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API routes
    path('api/', include('stocks.urls')),
    path('api/', include('master.urls')),
    path('api/', include('purchase.urls')),
    path('api/', include('reports.urls')),
    path('api/', include('authentication.urls')),
    path('api/', include('people.urls')),
    path('api/', include('sales.urls')),
    path('api/', include('accounts.urls')),
    path('api/', include('income.urls')),
]

# ✅ SPA catch-all (MUST be after API & admin)
# This serves index.html for React routes like /dashboard, /login, etc.
urlpatterns += [
    re_path(
        r"^(?!api/|admin/|static/|media/).*$",
        TemplateView.as_view(template_name="index.html"),
    ),
]

# Media files in DEBUG only
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
