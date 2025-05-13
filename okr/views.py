from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Mission, StrategicObjective, KeyResult, Activity, Task
from .serializers import (
    MissionSerializer, StrategicObjectiveSerializer,
    KeyResultSerializer, ActivitySerializer, TaskSerializer
)

class MissionViewSet(viewsets.ModelViewSet):
    queryset = Mission.objects.all()
    serializer_class = MissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class StrategicObjectiveViewSet(viewsets.ModelViewSet):
    queryset = StrategicObjective.objects.all()
    serializer_class = StrategicObjectiveSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        mission_id = self.kwargs.get('mission_pk')
        if mission_id:
            return StrategicObjective.objects.filter(mission_id=mission_id)
        return StrategicObjective.objects.none()

    def perform_create(self, serializer):
        mission_id = self.kwargs.get('mission_pk')
        mission = get_object_or_404(Mission, id=mission_id)
        serializer.save(mission=mission, created_by=self.request.user)

class KeyResultViewSet(viewsets.ModelViewSet):
    queryset = KeyResult.objects.all()
    serializer_class = KeyResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        objective_id = self.kwargs.get('objective_pk')
        if objective_id:
            return KeyResult.objects.filter(objective_id=objective_id)
        return KeyResult.objects.none()

    def perform_create(self, serializer):
        objective_id = self.kwargs.get('objective_pk')
        objective = get_object_or_404(StrategicObjective, id=objective_id)
        serializer.save(objective=objective, created_by=self.request.user)

    @action(detail=True, methods=['patch'])
    def update_progress(self, request, pk=None, objective_pk=None):
        key_result = self.get_object()
        current_value = request.data.get('current_value')
        if current_value is not None:
            key_result.current_value = current_value
            key_result.save()
            return Response(self.get_serializer(key_result).data)
        return Response({'error': 'current_value is required'}, status=status.HTTP_400_BAD_REQUEST)

class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        key_result_id = self.kwargs.get('key_result_pk')
        if key_result_id:
            return Activity.objects.filter(key_result_id=key_result_id)
        return Activity.objects.none()

    def perform_create(self, serializer):
        key_result_id = self.kwargs.get('key_result_pk')
        key_result = get_object_or_404(KeyResult, id=key_result_id)
        serializer.save(key_result=key_result, created_by=self.request.user)

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        activity_id = self.kwargs.get('activity_pk')
        if activity_id:
            return Task.objects.filter(activity_id=activity_id)
        return Task.objects.none()

    def perform_create(self, serializer):
        activity_id = self.kwargs.get('activity_pk')
        activity = get_object_or_404(Activity, id=activity_id)
        serializer.save(activity=activity, created_by=self.request.user) 