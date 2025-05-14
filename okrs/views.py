from rest_framework import viewsets, permissions
from .models import Project, ProjectMembers, Epic, Objective, OKR, Activity, Task, Log, Comment
from .serializers import (
    ProjectSerializer, ProjectMembersSerializer, EpicSerializer,
    ObjectiveSerializer, OKRSerializer, ActivitySerializer, 
    TaskSerializer, LogSerializer, CommentSerializer
)
from rest_framework.decorators import action
from rest_framework.response import Response
from .permissions import IsAdminOrManager, IsOwnerOrReadOnly
from users.models import Users
from rest_framework import status

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.AllowAny]  # Temporalmente AllowAny para desarrollo
    # Revertir a las siguientes líneas en producción:
    # permission_classes = [permissions.IsAuthenticated, IsAdminOrManager]

    def get_queryset(self):
        tipo = self.request.query_params.get('tipo')
        if tipo:
            return Project.objects.filter(tipo=tipo)
        return Project.objects.all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.users)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrManager])
    def add_member(self, request, pk=None):
        project = self.get_object()
        user_id = request.data.get('user_id')
        try:
            user = Users.objects.get(pk=user_id)
            ProjectMembers.objects.create(project=project, user=user)
            return Response({'status': 'member added'})
        except Users.DoesNotExist:
            return Response({'error': 'User not found'}, status=400)

class ProjectMembersViewSet(viewsets.ModelViewSet):
    queryset = ProjectMembers.objects.all()
    serializer_class = ProjectMembersSerializer
    permission_classes = [permissions.AllowAny]
    #permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()

# Nuevo ViewSet para Épicas
class EpicViewSet(viewsets.ModelViewSet):
    queryset = Epic.objects.all()
    serializer_class = EpicSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user.users)

    def get_queryset(self):
        project_id = self.request.query_params.get('project')
        if project_id:
            return Epic.objects.filter(project_id=project_id).prefetch_related('objectives')
        return Epic.objects.all()

    def destroy(self, request, *args, **kwargs):
        try:
            epic_id = kwargs.get('pk')
            epic = Epic.objects.get(id=epic_id)
            epic.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Epic.DoesNotExist:
            return Response(
                {'detail': 'No Epic matches the given query.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class ObjectiveViewSet(viewsets.ModelViewSet):
    queryset = Objective.objects.all()
    serializer_class = ObjectiveSerializer
    permission_classes = [permissions.AllowAny]
    #permission_classes = [permissions.IsAuthenticated, IsAdminOrManager, IsOwnerOrReadOnly]

    def get_queryset(self):
        epic_id = self.request.query_params.get('epic')
        if epic_id:
            return Objective.objects.filter(epic_id=epic_id)
        return Objective.objects.all()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user.users)

    def destroy(self, request, *args, **kwargs):
        try:
            objective_id = kwargs.get('pk')
            objective = Objective.objects.get(id=objective_id)
            objective.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Objective.DoesNotExist:
            return Response(
                {'detail': 'No Objective matches the given query.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class OKRViewSet(viewsets.ModelViewSet):
    queryset = OKR.objects.all()
    serializer_class = OKRSerializer
    permission_classes = [permissions.AllowAny]
    #permission_classes = [permissions.IsAuthenticated, IsAdminOrManager, IsOwnerOrReadOnly]

    def get_queryset(self):
        objective_id = self.request.query_params.get('objective')
        if objective_id:
            return OKR.objects.filter(objective_id=objective_id)
        return OKR.objects.all()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user.users)

    def destroy(self, request, *args, **kwargs):
        try:
            okr_id = kwargs.get('pk')
            okr = OKR.objects.get(id=okr_id)
            okr.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except OKR.DoesNotExist:
            return Response(
                {'detail': 'No OKR matches the given query.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user.users)

    def get_queryset(self):
        queryset = Activity.objects.all()
        okr_id = self.request.query_params.get('okr', None)
        if okr_id is not None:
            queryset = queryset.filter(okr_id=okr_id)
        return queryset

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        activity_id = self.request.query_params.get('activity')
        if activity_id:
            return Task.objects.filter(activity_id=activity_id)
        return Task.objects.all()

    def perform_create(self, serializer):
        task = serializer.save()
        if task.activity:
            task.activity.calculate_progress()
            if task.activity.okr:
                task.activity.okr.calculate_progress()

    def perform_update(self, serializer):
        task = serializer.save()
        if task.activity:
            task.activity.calculate_progress()
            if task.activity.okr:
                task.activity.okr.calculate_progress()

    def perform_destroy(self, instance):
        activity = instance.activity
        super().perform_destroy(instance)
        if activity:
            activity.calculate_progress()
            if activity.okr:
                activity.okr.calculate_progress()

class LogViewSet(viewsets.ModelViewSet):
    queryset = Log.objects.all()
    serializer_class = LogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManager]

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.AllowAny]
    #permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user.users)