from rest_framework import serializers
from .models import Mission, StrategicObjective, KeyResult, Activity, Task
from users.serializers import UserSerializer

class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'due_date', 'status', 'created_at', 
                 'updated_at', 'assigned_to', 'assigned_to_id', 'created_by']
        read_only_fields = ['created_at', 'updated_at', 'created_by']

class ActivitySerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)
    assigned_to = UserSerializer(read_only=True)
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Activity
        fields = ['id', 'title', 'description', 'start_date', 'end_date', 'status',
                 'created_at', 'updated_at', 'assigned_to', 'assigned_to_id', 
                 'created_by', 'tasks']
        read_only_fields = ['created_at', 'updated_at', 'created_by']

class KeyResultSerializer(serializers.ModelSerializer):
    activities = ActivitySerializer(many=True, read_only=True)

    class Meta:
        model = KeyResult
        fields = ['id', 'title', 'description', 'target_value', 'current_value',
                 'unit', 'status', 'created_at', 'updated_at', 'created_by',
                 'activities', 'progress']
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'progress']

class StrategicObjectiveSerializer(serializers.ModelSerializer):
    key_results = KeyResultSerializer(many=True, read_only=True)

    class Meta:
        model = StrategicObjective
        fields = ['id', 'title', 'description', 'start_date', 'end_date',
                 'status', 'progress', 'created_at', 'updated_at', 'created_by',
                 'key_results']
        read_only_fields = ['created_at', 'updated_at', 'created_by']

class MissionSerializer(serializers.ModelSerializer):
    objectives = StrategicObjectiveSerializer(many=True, read_only=True)

    class Meta:
        model = Mission
        fields = ['id', 'title', 'description', 'start_date', 'end_date',
                 'status', 'created_at', 'updated_at', 'created_by', 'objectives']
        read_only_fields = ['created_at', 'updated_at', 'created_by'] 