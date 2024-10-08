from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework.views import APIView
from rest_framework import permissions
from users.models import UserProfile
from django.contrib.auth.models import User
from rest_framework.response import Response
from django.utils.decorators import method_decorator
from django.contrib import auth
from .serializers import UserSerializer


@method_decorator(csrf_protect, name='dispatch')
class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        data = self.request.data

        username = data['username']
        password = data["password"]

        try:
            user = auth.authenticate(username=username, password=password)

            if user is not None:
                auth.login(request, user)
                return Response({'success': 'User authenticated'})
            else:
                return Response({'error': 'Error Authenticating'})
        except:
            return Response({'error': 'Something went wrong when logging in'})


@method_decorator(csrf_protect, name='dispatch')
class LogoutView(APIView):
    def post(self, request, format=None):
        try:
            auth.logout(request)
            return Response({'success': 'Successfully logged out'})
        except:
            return Response({'error': 'Something went wrong when logging out'})


class CheckAuthenticatedView(APIView):
    def get(self, requset, format=None):
        user = self.request.user
        try:
            isAuthenticated = user.is_authenticated
            if isAuthenticated:
                return Response({'isAuthenticated': 'success'})
            else:
                return Response({'isAuthenticated': 'error'})

        except:
            return Response({'isAuthenticated': 'error'})


@method_decorator(csrf_protect, name='dispatch')
class SignUpView(APIView):
    """
    using postman inside headers you need to add
    X-CSRFToken : your csrf token
    and
    Content-Type : application/json

    and inside body raw
        {
        "username":your_username",
        "password":"pass",
        "re_password":"pass"
        }
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, requset, format=None):
        data = self.request.data
        username = data['username']
        password = data["password"]
        re_password = data['re_password']

        try:
            if password == re_password:
                if User.objects.filter(username=username).exists():
                    return Response({'error': "Username already exists"})

                else:
                    if len(password) < 6:
                        return Response({'error': "Password must be at least 6 characters"})

                    else:

                        user = User.objects.create_user(
                            username=username, password=password)

                        user = User.objects.get(id=user.id)

                        user_profile = UserProfile.objects.create(
                            user=user, first_name='', last_name='', phone='', city='')

                        return Response({'success': 'User created successfully'})
            else:
                return Response({'error': "Passwords do not match"})
        except:
            return Response({'error': 'Something went wrong when registering account'})


@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCSRFToken(APIView):
    permission_classes = (permissions.AllowAny, )

    def get(self, request, format=None):
        return Response({'success': 'CSRF cookie set'})


class DeleteAccountView(APIView):
    def delete(self, request, format=None):
        user = self.request.user
        try:
            User.objects.filter(id=user.id).delete()

            return Response({'success': 'User deleted successfully'})
        except:
            return Response({'error': 'Something went wrong when trying to delete user'})


class GetUsersView(APIView):
    def get(self, requset, format=None):
        try:
            users = User.objects.all()
            users = UserSerializer(users, many=True)
            return Response(users.data)
        except:
            return Response({"error": "sth is wrong when trying to get users"})
