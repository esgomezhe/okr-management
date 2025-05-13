from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Permiso para solo permitir a usuarios con rol 'admin'.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.users.role == 'admin'

class IsAdminOrManager(permissions.BasePermission):
    """
    Permiso para permitir a usuarios con rol 'admin' o 'manager'.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.users.role in ['admin', 'manager']

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permiso para solo permitir que el propietario edite el objeto.
    """
    def has_object_permission(self, request, view, obj):
        # Lectura permitida para cualquier solicitud
        if request.method in permissions.SAFE_METHODS:
            return True
        # Escritura permitida solo al propietario
        return obj.owner == request.user.users 