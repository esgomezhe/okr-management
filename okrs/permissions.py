from rest_framework import permissions
from users.models import Users

class IsAdminOrManager(permissions.BasePermission):
    """
    Permite acceso solo a administradores y managers.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        try:
            user_profile = Users.objects.get(user=request.user)
            return user_profile.role in ['admin', 'manager']
        except Users.DoesNotExist:
            return False

class IsProjectMember(permissions.BasePermission):
    """
    Permite acceso solo a miembros del proyecto.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Los admins pueden acceder a todo
        try:
            user_profile = Users.objects.get(user=request.user)
            if user_profile.role == 'admin':
                return True
        except Users.DoesNotExist:
            return False
        
        # Para otros usuarios, verificar si son miembros del proyecto
        project_id = request.data.get('project') or request.query_params.get('project')
        if not project_id:
            return False
        
        try:
            from .models import Project
            project = Project.objects.get(id=project_id)
            return project.is_member(user_profile)
        except Project.DoesNotExist:
            return False

class CanEditProject(permissions.BasePermission):
    """
    Permite editar proyectos solo a owners y managers del proyecto.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Los admins pueden editar cualquier proyecto
        try:
            user_profile = Users.objects.get(user=request.user)
            if user_profile.role == 'admin':
                return True
        except Users.DoesNotExist:
            return False
        
        # Para otros usuarios, verificar permisos específicos del proyecto
        project_id = request.data.get('project') or request.query_params.get('project')
        if not project_id:
            return False
        
        try:
            from .models import Project
            project = Project.objects.get(id=project_id)
            if not project.is_member(user_profile):
                return False
            
            member_role = project.get_member_role(user_profile)
            return member_role in ['owner', 'manager']
        except Project.DoesNotExist:
            return False

class CanCreateEpics(permissions.BasePermission):
    """
    Permite crear épicas solo a owners y managers del proyecto.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Los admins pueden crear épicas en cualquier proyecto
        try:
            user_profile = Users.objects.get(user=request.user)
            if user_profile.role == 'admin':
                return True
        except Users.DoesNotExist:
            return False
        
        # Para otros usuarios, verificar permisos específicos del proyecto
        project_id = request.data.get('project')
        if not project_id:
            return False
        
        try:
            from .models import Project
            project = Project.objects.get(id=project_id)
            if not project.is_member(user_profile):
                return False
            
            member_role = project.get_member_role(user_profile)
            return member_role in ['owner', 'manager']
        except Project.DoesNotExist:
            return False

class CanCreateObjectives(permissions.BasePermission):
    """
    Permite crear objetivos solo a owners y managers del proyecto.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Los admins pueden crear objetivos en cualquier proyecto
        try:
            user_profile = Users.objects.get(user=request.user)
            if user_profile.role == 'admin':
                return True
        except Users.DoesNotExist:
            return False
        
        # Para otros usuarios, verificar permisos específicos del proyecto
        project_id = request.data.get('project')
        epic_id = request.data.get('epic')
        
        try:
            from .models import Project, Epic
            if project_id:
                project = Project.objects.get(id=project_id)
                if not project.is_member(user_profile):
                    return False
                member_role = project.get_member_role(user_profile)
                return member_role in ['owner', 'manager']
            elif epic_id:
                epic = Epic.objects.get(id=epic_id)
                project = epic.project
                if not project.is_member(user_profile):
                    return False
                member_role = project.get_member_role(user_profile)
                return member_role in ['owner', 'manager']
        except (Project.DoesNotExist, Epic.DoesNotExist):
            return False
        
        return False

class CanEditOKRs(permissions.BasePermission):
    """
    Permite editar OKRs a owners, managers y members del proyecto.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Los admins pueden editar cualquier OKR
        try:
            user_profile = Users.objects.get(user=request.user)
            if user_profile.role == 'admin':
                return True
        except Users.DoesNotExist:
            return False
        
        # Para otros usuarios, verificar permisos específicos del proyecto
        objective_id = request.data.get('objective')
        if not objective_id:
            return False
        
        try:
            from .models import Objective
            objective = Objective.objects.get(id=objective_id)
            project = objective.project or objective.epic.project
            
            if not project.is_member(user_profile):
                return False
            
            member_role = project.get_member_role(user_profile)
            return member_role in ['owner', 'manager', 'member']
        except Objective.DoesNotExist:
            return False

class CanEditActivities(permissions.BasePermission):
    """
    Permite editar actividades a owners, managers y members del proyecto.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Los admins pueden editar cualquier actividad
        try:
            user_profile = Users.objects.get(user=request.user)
            if user_profile.role == 'admin':
                return True
        except Users.DoesNotExist:
            return False
        
        # Para otros usuarios, verificar permisos específicos del proyecto
        okr_id = request.data.get('okr')
        if not okr_id:
            return False
        
        try:
            from .models import OKR
            okr = OKR.objects.get(id=okr_id)
            objective = okr.objective
            project = objective.project or objective.epic.project
            
            if not project.is_member(user_profile):
                return False
            
            member_role = project.get_member_role(user_profile)
            return member_role in ['owner', 'manager', 'member']
        except OKR.DoesNotExist:
            return False

class CanEditTasks(permissions.BasePermission):
    """
    Permite editar tareas al asignado, owners, managers y members del proyecto.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Los admins pueden editar cualquier tarea
        try:
            user_profile = Users.objects.get(user=request.user)
            if user_profile.role == 'admin':
                return True
        except Users.DoesNotExist:
            return False
        
        # Para otros usuarios, verificar permisos específicos
        activity_id = request.data.get('activity')
        if not activity_id:
            return False
        
        try:
            from .models import Activity
            activity = Activity.objects.get(id=activity_id)
            okr = activity.okr
            objective = okr.objective
            project = objective.project or objective.epic.project
            
            if not project.is_member(user_profile):
                return False
            
            member_role = project.get_member_role(user_profile)
            return member_role in ['owner', 'manager', 'member']
        except Activity.DoesNotExist:
            return False

class CanAssignTasks(permissions.BasePermission):
    """
    Permite asignar tareas solo a owners y managers del proyecto.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Los admins pueden asignar tareas
        try:
            user_profile = Users.objects.get(user=request.user)
            if user_profile.role == 'admin':
                return True
        except Users.DoesNotExist:
            return False
        
        # Para otros usuarios, verificar permisos específicos del proyecto
        activity_id = request.data.get('activity')
        if not activity_id:
            return False
        
        try:
            from .models import Activity
            activity = Activity.objects.get(id=activity_id)
            okr = activity.okr
            objective = okr.objective
            project = objective.project or objective.epic.project
            
            if not project.is_member(user_profile):
                return False
            
            member_role = project.get_member_role(user_profile)
            return member_role in ['owner', 'manager']
        except Activity.DoesNotExist:
            return False

class CanManageProjectMembers(permissions.BasePermission):
    """
    Permite gestionar miembros del proyecto solo a owners y managers.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Los admins pueden gestionar miembros de cualquier proyecto
        try:
            user_profile = Users.objects.get(user=request.user)
            if user_profile.role == 'admin':
                return True
        except Users.DoesNotExist:
            return False
        
        # Para otros usuarios, verificar permisos específicos del proyecto
        project_id = request.data.get('project') or request.query_params.get('project')
        if not project_id:
            return False
        
        try:
            from .models import Project
            project = Project.objects.get(id=project_id)
            if not project.is_member(user_profile):
                return False
            
            member_role = project.get_member_role(user_profile)
            return member_role in ['owner', 'manager']
        except Project.DoesNotExist:
            return False

class EmployeeTaskAccess(permissions.BasePermission):
    """
    Permite a los empleados acceder solo a sus tareas asignadas.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        try:
            user_profile = Users.objects.get(user=request.user)
            # Los admins y managers tienen acceso completo
            if user_profile.role in ['admin', 'manager']:
                return True
            
            # Los empleados solo pueden acceder a sus tareas
            if user_profile.role == 'employee':
                return True  # Se verificará en has_object_permission
            
        except Users.DoesNotExist:
            return False
        
        return False
    
    def has_object_permission(self, request, view, obj):
        try:
            user_profile = Users.objects.get(user=request.user)
            
            # Los admins y managers tienen acceso completo
            if user_profile.role in ['admin', 'manager']:
                return True
            
            # Los empleados solo pueden acceder a sus tareas asignadas
            if user_profile.role == 'employee':
                if hasattr(obj, 'assignee'):
                    return obj.assignee.id == user_profile.id
                elif hasattr(obj, 'owner'):
                    return obj.owner.id == user_profile.id
            
        except Users.DoesNotExist:
            return False
        
        return False
