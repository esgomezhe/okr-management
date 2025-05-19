from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.decorators import action
from django.contrib.auth.models import update_last_login
from .serializers import (
    RegisterSerializer,
    UsersReadSerializer,
    UsersUpdateSerializer,
    ChangePasswordSerializer
)
from .models import Users
from django.http import JsonResponse

User = get_user_model()

@method_decorator(ensure_csrf_cookie, name='dispatch')
class RegisterView(generics.CreateAPIView):
    queryset = Users.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)

class LoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        user = User.objects.filter(username=username).first()
        if user is None:
            return Response({'detail': 'Usuario no registrado.'}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.check_password(password):
            return Response({'detail': 'Contraseña incorrecta.'}, status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)
        update_last_login(None, user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'id': user.id
        })

class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'detail': 'Cerraste sesión exitosamente.'}, status=status.HTTP_200_OK)
        except Exception as e:
            # Si hay algún error, aún así permitimos el cierre de sesión
            return Response({'detail': 'Cerraste sesión exitosamente.'}, status=status.HTTP_200_OK)

class UserDetailsView(APIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UsersReadSerializer

    def get(self, request, *args, **kwargs):
        try:
            profile = request.user.users
            serializer = self.serializer_class(profile)
            return Response(serializer.data)
        except Users.DoesNotExist:
            return Response(
                {'detail': 'Perfil de usuario no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        user = User.objects.filter(email=email).first()
        if user:
            # Aquí deberías generar un token y enviar un correo con el enlace de restablecimiento
            # Por simplicidad, se omitirá la implementación completa
            return Response({"message": "Si el correo está registrado, te enviaremos un enlace para restablecer tu contraseña."})
        return Response({"message": "Si el correo está registrado, te enviaremos un enlace para restablecer tu contraseña."})

class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    model = User
    permission_classes = (IsAuthenticated,)

    def get_object(self, queryset=None):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            # Cambiar la contraseña
            self.object.set_password(serializer.validated_data['new_password'])
            self.object.save()
            update_last_login(None, self.object)
            return Response({'detail': 'Contraseña cambiada exitosamente.'}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UsersViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Users.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'me':
            return UsersReadSerializer
        return UsersReadSerializer

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        user = request.user
        try:
            profile = user.users
        except Users.DoesNotExist:
            return Response({'detail': 'Perfil de usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        
        if request.method == 'GET':
            serializer = UsersReadSerializer(profile)
            return Response(serializer.data)
        elif request.method in ['PUT', 'PATCH']:
            serializer = UsersUpdateSerializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'detail': 'CSRF cookie set'})