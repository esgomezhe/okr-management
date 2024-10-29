from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Users  # Asegúrate de que tu modelo de perfil se llama 'Users'

class UserSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo incorporado de Django User.
    Incluye campos esenciales como email, first_name y last_name.
    """

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

class UsersSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo personalizado Users.
    Incluye una representación anidada del modelo User.
    """
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source='user',
        required=True,
        help_text="ID del usuario relacionado."
    )

    class Meta:
        model = Users
        fields = ['id', 'user', 'user_id', 'phone', 'city', 'avatar', 'role']
        read_only_fields = ['id', 'avatar']

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializador para el registro de nuevos usuarios.
    Maneja la creación de User y Users simultáneamente.
    """
    user = UserSerializer()
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label='Contraseña'
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label='Confirmar Contraseña'
    )

    class Meta:
        model = Users
        fields = ['user', 'phone', 'city', 'avatar', 'role', 'password', 'password2']
        extra_kwargs = {
            'avatar': {'required': False},
            'role': {'required': True},
            'phone': {'required': True},
            'city': {'required': True},
        }

    def validate(self, attrs):
        """
        Valida que las contraseñas coincidan.
        """
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        return attrs

    def create(self, validated_data):
        """
        Crea una nueva instancia de Users junto con una instancia de User.
        """
        user_data = validated_data.pop('user')
        password = validated_data.pop('password')
        validated_data.pop('password2')  # Eliminamos password2 ya que ya lo validamos

        # Crear el usuario incorporado de Django
        user = User(
            username=user_data['username'],
            email=user_data['email'],
            first_name=user_data['first_name'],
            last_name=user_data['last_name']
        )
        user.set_password(password)
        user.save()

        # Crear la instancia personalizada de Users
        users = Users.objects.create(user=user, **validated_data)
        return users

class UsersReadSerializer(serializers.ModelSerializer):
    """
    Serializador para leer instancias de Users.
    Incluye los campos de User anidados.
    """
    user = UserSerializer(read_only=True)

    class Meta:
        model = Users
        fields = ['id', 'user', 'phone', 'city', 'avatar', 'role']

class UsersUpdateSerializer(serializers.ModelSerializer):
    """
    Serializador para actualizar instancias de Users.
    Permite actualizar campos tanto del modelo Users como del modelo User.
    """
    user = UserSerializer(required=False)

    class Meta:
        model = Users
        fields = ['user', 'phone', 'city', 'avatar', 'role']

    def update(self, instance, validated_data):
        """
        Actualiza una instancia existente de Users y su relación con User.
        """
        user_data = validated_data.pop('user', None)
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer para cambiar la contraseña del usuario.
    """
    current_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        label='Contraseña Actual'
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        label='Nueva Contraseña'
    )
    new_password2 = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        label='Confirmar Nueva Contraseña'
    )

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Las nuevas contraseñas no coinciden."})
        return attrs

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Contraseña actual incorrecta.")
        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user