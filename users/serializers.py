from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Users

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class UsersSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Users
        fields = ['id', 'user', 'phone', 'city', 'avatar', 'role']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create(**user_data)
        users = Users.objects.create(user=user, **validated_data)
        return users

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user

        # Actualizar campos de User
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()

        # Actualizar campos de Users
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
    

class UsersSimpleSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Users
        fields = ['id', 'user', 'first_name', 'last_name', 'role']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'}, label='Confirm password')

    class Meta:
        model = Users
        fields = ['user', 'phone', 'city', 'avatar', 'role', 'password', 'password2']
        extra_kwargs = {
            'user': {'required': True},
            'role': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        return attrs

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        password = validated_data.pop('password')
        validated_data.pop('password2')

        user = User.objects.create(
            username=user_data['username'],
            email=user_data.get('email', ''),
            first_name=user_data.get('first_name', ''),
            last_name=user_data.get('last_name', '')
        )
        user.set_password(password)
        user.save()

        users = Users.objects.create(user=user, **validated_data)
        return users