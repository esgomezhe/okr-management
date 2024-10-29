from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsersViewSet, RegisterView

router = DefaultRouter()
router.register(r'', UsersViewSet, basename='users')  # Registrar ViewSet principal

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),  # Definir primero
    path('', include(router.urls)),  # Incluir todas las rutas del router después
]
