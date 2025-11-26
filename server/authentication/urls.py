# authentication/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import *

router = DefaultRouter()
router.register(r'staffs', StaffViewSet, basename='staff') 

urlpatterns = [
    path('user/', UserProfileView.as_view(), name='user-profile'),
    path("user/<int:pk>/", UpdateUserByIdView.as_view(), name="user-update"),
    path('change-password/', PasswordChangeView.as_view(), name='change-password'),

    # JWT auth
    path("login/", TokenObtainPairView.as_view(), name="jwt-login"),
    path("refresh/", TokenRefreshView.as_view(), name="jwt-refresh"),

    # include router urls for staffs
    path("", include(router.urls)),
]