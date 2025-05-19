from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UsersViewSet,
    RegisterView,
    LoginView,
    LogoutView,
    PasswordResetRequestView,
    ChangePasswordView,
    UserDetailsView,
    get_csrf_token
)

router = DefaultRouter()
router.register(r'', UsersViewSet, basename='users')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('me/', UserDetailsView.as_view(), name='user_details'),
    path('csrf/', get_csrf_token, name='get_csrf_token'),
    path('', include(router.urls)),
]
