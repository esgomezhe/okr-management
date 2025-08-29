from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Project, Epic, Objective, OKR, Activity, Task, Log, Comment, ProjectMembers
from .serializers import (
    ProjectSerializer, EpicSerializer, ObjectiveSerializer, OKRSerializer,
    ActivitySerializer, TaskSerializer, LogSerializer, CommentSerializer,
    ProjectMembersSerializer, AddProjectMemberSerializer, RemoveProjectMemberSerializer, UserSerializer
)
from .permissions import (
    IsAdminOrManager, IsProjectMember, CanEditProject, CanCreateEpics,
    CanCreateObjectives, CanEditOKRs, CanEditActivities, CanEditTasks,
    CanAssignTasks, CanManageProjectMembers, EmployeeTaskAccess
)
from users.models import Users
from django.db import models
from rest_framework.exceptions import AuthenticationFailed

# Helper para obtener el perfil de usuario autenticado de forma segura
def get_authenticated_profile(request):
    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        raise AuthenticationFailed('Authentication credentials were not provided or are invalid.')
    try:
        return user.users
    except Exception:
        # Si no existe el perfil asociado, tratamos como no autenticado
        raise AuthenticationFailed('Invalid authentication credentials.')

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManager]

    def get_queryset(self):
        user = get_authenticated_profile(self.request)
        
        # Los admins ven todos los proyectos
        if user.role == 'admin':
            tipo = self.request.query_params.get('tipo')
            if tipo:
                return Project.objects.filter(tipo=tipo)
            return Project.objects.all()
        
        # Los managers ven todos los proyectos
        if user.role == 'manager':
            tipo = self.request.query_params.get('tipo')
            if tipo:
                return Project.objects.filter(tipo=tipo)
            return Project.objects.all()
        
        # Los empleados solo ven proyectos donde son miembros
        tipo = self.request.query_params.get('tipo')
        if tipo:
            return Project.objects.filter(tipo=tipo, members=user)
        return Project.objects.filter(members=user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.users)

    @action(detail=True, methods=['get', 'post'], permission_classes=[permissions.IsAuthenticated])
    def members(self, request, pk=None):
        """Obtener y agregar miembros del proyecto"""
        auth_user = get_authenticated_profile(request)
        project = self.get_object()

        # Solo miembros, managers o admins pueden ver/gestionar miembros
        is_member = project.is_member(auth_user)
        is_manager_or_admin = auth_user.role in ['admin', 'manager'] or project.get_member_role(auth_user) in ['owner', 'manager']

        if request.method == 'GET':
            if not (is_member or is_manager_or_admin):
                return Response({'error': 'No tienes permisos para ver los miembros de este proyecto'}, status=status.HTTP_403_FORBIDDEN)
            members = ProjectMembers.objects.filter(project=project)
            serializer = ProjectMembersSerializer(members, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            if not is_manager_or_admin:
                return Response({'error': 'No tienes permisos para agregar miembros'}, status=status.HTTP_403_FORBIDDEN)
            serializer = AddProjectMemberSerializer(data=request.data, context={'project': project})
            if serializer.is_valid():
                try:
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='members/(?P<user_id>[^/.]+)', permission_classes=[permissions.IsAuthenticated, CanManageProjectMembers])
    def remove_member_by_id(self, request, pk=None, user_id=None):
        """Eliminar miembro del proyecto por ID de usuario"""
        auth_user = get_authenticated_profile(request)
        project = self.get_object()
        try:
            member = ProjectMembers.objects.get(project=project, user_id=user_id)
            member.delete()
            return Response({'message': 'Miembro eliminado exitosamente'}, status=status.HTTP_204_NO_CONTENT)
        except ProjectMembers.DoesNotExist:
            return Response({'error': 'Usuario no es miembro de este proyecto'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, CanManageProjectMembers])
    def add_member(self, request, pk=None):
        """Agregar miembro al proyecto"""
        project = self.get_object()
        _ = get_authenticated_profile(request)
        serializer = AddProjectMemberSerializer(data=request.data, context={'project': project})
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, CanManageProjectMembers])
    def remove_member(self, request, pk=None):
        """Remover miembro del proyecto"""
        project = self.get_object()
        _ = get_authenticated_profile(request)
        serializer = RemoveProjectMemberSerializer(data=request.data)
        
        if serializer.is_valid():
            user_id = serializer.validated_data['user_id']
            try:
                member = ProjectMembers.objects.get(project=project, user_id=user_id)
                member.delete()
                return Response({'message': 'Miembro removido exitosamente'}, status=status.HTTP_200_OK)
            except ProjectMembers.DoesNotExist:
                return Response({'error': 'Usuario no es miembro de este proyecto'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def available_users(self, request):
        """Obtener usuarios disponibles para agregar al proyecto"""
        auth_user = get_authenticated_profile(request)
        
        # Los admins y managers ven todos los usuarios
        if auth_user.role in ['admin', 'manager']:
            users = Users.objects.all()
        else:
            # Los empleados no pueden ver esta lista
            return Response({'error': 'No tienes permisos para ver esta información'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class EpicViewSet(viewsets.ModelViewSet):
    queryset = Epic.objects.all()
    serializer_class = EpicSerializer
    permission_classes = [permissions.IsAuthenticated, CanCreateEpics]

    def get_queryset(self):
        user = get_authenticated_profile(self.request)
        
        # Los admins ven todas las épicas
        if user.role == 'admin':
            project_id = self.request.query_params.get('project')
            if project_id:
                return Epic.objects.filter(project_id=project_id).prefetch_related('objectives')
            return Epic.objects.all().prefetch_related('objectives')
        
        # Los managers ven todas las épicas
        if user.role == 'manager':
            project_id = self.request.query_params.get('project')
            if project_id:
                return Epic.objects.filter(project_id=project_id).prefetch_related('objectives')
            return Epic.objects.all().prefetch_related('objectives')
        
        # Los empleados solo ven épicas de proyectos donde son miembros
        project_id = self.request.query_params.get('project')
        if project_id:
            return Epic.objects.filter(project_id=project_id, project__members=user).prefetch_related('objectives')
        return Epic.objects.filter(project__members=user).prefetch_related('objectives')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user.users)

    def destroy(self, request, *args, **kwargs):
        try:
            epic_id = kwargs.get('pk')
            epic = Epic.objects.get(id=epic_id)
            epic.delete()
            return Response({'message': 'Épica eliminada exitosamente'}, status=status.HTTP_204_NO_CONTENT)
        except Epic.DoesNotExist:
            return Response({'error': 'Épica no encontrada'}, status=status.HTTP_404_NOT_FOUND)

class ObjectiveViewSet(viewsets.ModelViewSet):
    queryset = Objective.objects.all()
    serializer_class = ObjectiveSerializer
    permission_classes = [permissions.IsAuthenticated, CanCreateObjectives]

    def get_queryset(self):
        user = get_authenticated_profile(self.request)
        
        # Los admins ven todos los objetivos
        if user.role == 'admin':
            epic_id = self.request.query_params.get('epic_id')
            if epic_id:
                return Objective.objects.filter(epic_id=epic_id)
            return Objective.objects.all()
        
        # Los managers ven todos los objetivos
        if user.role == 'manager':
            epic_id = self.request.query_params.get('epic_id')
            if epic_id:
                return Objective.objects.filter(epic_id=epic_id)
            return Objective.objects.all()
        
        # Los empleados solo ven objetivos de proyectos donde son miembros
        epic_id = self.request.query_params.get('epic_id')
        if epic_id:
            return Objective.objects.filter(epic_id=epic_id, epic__project__members=user)
        return Objective.objects.filter(
            models.Q(epic__project__members=user) | models.Q(project__members=user)
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user.users)

    def destroy(self, request, *args, **kwargs):
        try:
            objective_id = kwargs.get('pk')
            objective = Objective.objects.get(id=objective_id)
            objective.delete()
            return Response({'message': 'Objetivo eliminado exitosamente'}, status=status.HTTP_204_NO_CONTENT)
        except Objective.DoesNotExist:
            return Response({'error': 'Objetivo no encontrado'}, status=status.HTTP_404_NOT_FOUND)

class OKRViewSet(viewsets.ModelViewSet):
    queryset = OKR.objects.all()
    serializer_class = OKRSerializer
    permission_classes = [permissions.IsAuthenticated, CanEditOKRs]

    def get_queryset(self):
        user = get_authenticated_profile(self.request)
        
        # Los admins ven todos los OKRs
        if user.role == 'admin':
            objective_id = self.request.query_params.get('objective_id')
            if objective_id:
                return OKR.objects.filter(objective_id=objective_id)
            return OKR.objects.all()
        
        # Los managers ven todos los OKRs
        if user.role == 'manager':
            objective_id = self.request.query_params.get('objective_id')
            if objective_id:
                return OKR.objects.filter(objective_id=objective_id)
            return OKR.objects.all()
        
        # Los empleados solo ven OKRs de proyectos donde son miembros
        objective_id = self.request.query_params.get('objective_id')
        if objective_id:
            return OKR.objects.filter(
                objective_id=objective_id,
                objective__epic__project__members=user
            ) | OKR.objects.filter(
                objective_id=objective_id,
                objective__project__members=user
            )
        return OKR.objects.filter(
            models.Q(objective__epic__project__members=user) | models.Q(objective__project__members=user)
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user.users)

    def destroy(self, request, *args, **kwargs):
        try:
            okr_id = kwargs.get('pk')
            okr = OKR.objects.get(id=okr_id)
            okr.delete()
            return Response({'message': 'OKR eliminado exitosamente'}, status=status.HTTP_204_NO_CONTENT)
        except OKR.DoesNotExist:
            return Response({'error': 'OKR no encontrado'}, status=status.HTTP_404_NOT_FOUND)

class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated, CanEditActivities]

    def get_queryset(self):
        user = get_authenticated_profile(self.request)
        
        # Los admins ven todas las actividades
        if user.role == 'admin':
            okr_id = self.request.query_params.get('okr_id')
            if okr_id:
                return Activity.objects.filter(okr_id=okr_id)
            return Activity.objects.all()
        
        # Los managers ven todas las actividades
        if user.role == 'manager':
            okr_id = self.request.query_params.get('okr_id')
            if okr_id:
                return Activity.objects.filter(okr_id=okr_id)
            return Activity.objects.all()
        
        # Los empleados solo ven actividades de proyectos donde son miembros
        okr_id = self.request.query_params.get('okr_id')
        if okr_id:
            return Activity.objects.filter(
                okr_id=okr_id,
                okr__objective__epic__project__members=user
            ) | Activity.objects.filter(
                okr_id=okr_id,
                okr__objective__project__members=user
            )
        return Activity.objects.filter(
            models.Q(okr__objective__epic__project__members=user) | models.Q(okr__objective__project__members=user)
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user.users)

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, EmployeeTaskAccess]

    def get_queryset(self):
        user = get_authenticated_profile(self.request)
        
        # Los admins ven todas las tareas
        if user.role == 'admin':
            activity_id = self.request.query_params.get('activity_id')
            if activity_id:
                return Task.objects.filter(activity_id=activity_id)
            return Task.objects.all()
        
        # Los managers ven todas las tareas
        if user.role == 'manager':
            activity_id = self.request.query_params.get('activity_id')
            if activity_id:
                return Task.objects.filter(activity_id=activity_id)
            return Task.objects.all()
        
        # Los empleados solo ven sus tareas asignadas o tareas de proyectos donde son miembros
        activity_id = self.request.query_params.get('activity_id')
        if activity_id:
            return Task.objects.filter(
                models.Q(activity_id=activity_id, assignee=user) |
                models.Q(activity_id=activity_id, activity__okr__objective__epic__project__members=user) |
                models.Q(activity_id=activity_id, activity__okr__objective__project__members=user)
            )
        
        return Task.objects.filter(
            models.Q(assignee=user) |
            models.Q(activity__okr__objective__epic__project__members=user) |
            models.Q(activity__okr__objective__project__members=user)
        )

    def perform_create(self, serializer):
        task = serializer.save()
        # Recalcular progreso de la actividad y OKR
        task.activity.calculate_progress()
        task.activity.okr.calculate_progress()

    def perform_update(self, serializer):
        task = serializer.save()
        # Recalcular progreso de la actividad y OKR
        task.activity.calculate_progress()
        task.activity.okr.calculate_progress()

    def perform_destroy(self, instance):
        # Guardar referencia antes de eliminar
        activity = instance.activity
        okr = activity.okr
        instance.delete()
        # Recalcular progreso de la actividad y OKR
        activity.calculate_progress()
        okr.calculate_progress()

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_tasks(self, request):
        """Obtener tareas asignadas al usuario actual"""
        user = get_authenticated_profile(request)
        tasks = Task.objects.filter(assignee=user)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def project_tasks(self, request):
        """Obtener tareas de un proyecto específico"""
        user = get_authenticated_profile(request)
        project_id = request.query_params.get('project_id')
        
        if not project_id:
            return Response({'error': 'Se requiere project_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Los admins y managers ven todas las tareas del proyecto
        if user.role in ['admin', 'manager']:
            tasks = Task.objects.filter(
                models.Q(activity__okr__objective__epic__project_id=project_id) |
                models.Q(activity__okr__objective__project_id=project_id)
            )
        else:
            # Los empleados solo ven sus tareas asignadas del proyecto
            tasks = Task.objects.filter(
                models.Q(assignee=user) &
                (models.Q(activity__okr__objective__epic__project_id=project_id) |
                 models.Q(activity__okr__objective__project_id=project_id))
            )
        
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

class LogViewSet(viewsets.ModelViewSet):
    queryset = Log.objects.all()
    serializer_class = LogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = get_authenticated_profile(self.request)
        
        # Los admins ven todos los logs
        if user.role == 'admin':
            return Log.objects.all()
        
        # Los managers ven todos los logs
        if user.role == 'manager':
            return Log.objects.all()
        
        # Los empleados solo ven logs de proyectos donde son miembros
        return Log.objects.filter(
            models.Q(project__members=user) |
            models.Q(epic__project__members=user) |
            models.Q(objective__epic__project__members=user) |
            models.Q(objective__project__members=user) |
            models.Q(okr__objective__epic__project__members=user) |
            models.Q(okr__objective__project__members=user) |
            models.Q(activity__okr__objective__epic__project__members=user) |
            models.Q(activity__okr__objective__project__members=user) |
            models.Q(task__activity__okr__objective__epic__project__members=user) |
            models.Q(task__activity__okr__objective__project__members=user)
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user.users)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = get_authenticated_profile(self.request)
        
        # Los admins ven todos los comentarios
        if user.role == 'admin':
            return Comment.objects.all()
        
        # Los managers ven todos los comentarios
        if user.role == 'manager':
            return Comment.objects.all()
        
        # Los empleados solo ven comentarios de tareas de proyectos donde son miembros
        return Comment.objects.filter(
            models.Q(task__activity__okr__objective__epic__project__members=user) |
            models.Q(task__activity__okr__objective__project__members=user) |
            models.Q(task__assignee=user)
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user.users)