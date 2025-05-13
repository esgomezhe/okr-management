from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Project, ProjectMembers, Objective, OKR, Activity, Task, Log, Comment
from .serializers import (
    ProjectSerializer, ProjectMembersSerializer,
    ObjectiveSerializer, OKRSerializer, ActivitySerializer, 
    TaskSerializer, LogSerializer, CommentSerializer
)
from rest_framework.decorators import action
from rest_framework.response import Response
from .permissions import IsAdminOrManager, IsOwnerOrReadOnly
from users.models import Users

# Create your views here.

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.AllowAny]  # Temporalmente AllowAny para desarrollo
    # Revertir a las siguientes líneas en producción:
    # permission_classes = [permissions.IsAuthenticated, IsAdminOrManager]

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

class ObjectiveViewSet(viewsets.ModelViewSet):
    queryset = Objective.objects.all()
    serializer_class = ObjectiveSerializer
    permission_classes = [permissions.AllowAny]
    #permission_classes = [permissions.IsAuthenticated, IsAdminOrManager, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user.users)

class OKRViewSet(viewsets.ModelViewSet):
    queryset = OKR.objects.all()
    serializer_class = OKRSerializer
    permission_classes = [permissions.AllowAny]
    #permission_classes = [permissions.IsAuthenticated, IsAdminOrManager, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user.users)

class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [permissions.AllowAny]
    #permission_classes = [permissions.IsAuthenticated, IsAdminOrManager, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user.users)

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.AllowAny]
    #permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.AllowAny()]
            #return [permissions.IsAuthenticated(), IsAdminOrManager()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save()

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
