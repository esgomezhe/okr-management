# wirktools/urls.py

from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf.urls.static import static
from django.conf import settings
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from users.views import UserDetailsView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Incluir las URLs de cada aplicación
    path('api/users/', include('users.urls')),
    path('api/okrs/', include('okrs.urls')),
    path('api/projects/', include('project.urls')),
    
    # Autenticación JWT
    path('api/users/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/users/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/users/me/', UserDetailsView.as_view(), name='user_details'),
]

# Servir archivos de medios y estáticos en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

    # Asegúrate de que esta ruta esté al final de todas tus URL patterns
    urlpatterns += [re_path(r'^.*', TemplateView.as_view(template_name='index.html'))]