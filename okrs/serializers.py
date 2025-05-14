from rest_framework import serializers
from users.models import Users
from .models import Project, ProjectMembers, Epic, Objective, OKR, Activity, Task, Log, Comment
from users.serializers import UsersSerializer

class UsersSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['id', 'user', 'first_name', 'last_name', 'role']

# Serializer para Épicas
class EpicSerializer(serializers.ModelSerializer):
    owner = UsersSimpleSerializer(read_only=True)
    owner_id = serializers.PrimaryKeyRelatedField(
        queryset=Users.objects.all(), write_only=True, source='owner'
    )
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())
    objectives = serializers.SerializerMethodField()

    class Meta:
        model = Epic
        fields = [
            'id', 'project', 'title', 'description', 'owner', 'owner_id',
            'objectives', 'created', 'updated'
        ]

    def get_objectives(self, obj):
        objectives = Objective.objects.filter(epic=obj)
        if not objectives.exists():
            return []
        return ObjectiveSerializer(objectives, many=True, context=self.context).data

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if not representation['objectives']:
            representation['objectives'] = []
        return representation

class TaskSerializer(serializers.ModelSerializer):
    assignee = UsersSimpleSerializer(read_only=True)
    assignee_id = serializers.PrimaryKeyRelatedField(
        queryset=Users.objects.all(), write_only=True, source='assignee', required=False
    )
    activity = serializers.PrimaryKeyRelatedField(queryset=Activity.objects.all())
    parent_task = serializers.PrimaryKeyRelatedField(queryset=Task.objects.all(), allow_null=True, required=False)

    class Meta:
        model = Task
        fields = [
            'id', 'activity', 'title', 'desc', 'assignee', 'assignee_id',
            'parent_task', 'status', 'completion_percentage', 'archived',
            'created', 'updated'
        ]

    def create(self, validated_data):
        return Task.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class ActivitySerializer(serializers.ModelSerializer):
    owner = UsersSimpleSerializer(read_only=True)
    owner_id = serializers.PrimaryKeyRelatedField(
        queryset=Users.objects.all(), write_only=True, source='owner'
    )
    okr = serializers.PrimaryKeyRelatedField(queryset=OKR.objects.all())
    tasks = TaskSerializer(many=True, read_only=True)
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = [
            'id', 'okr', 'name', 'description', 'owner', 'owner_id',
            'start_date', 'end_date', 'tasks', 'progress', 'created', 'updated'
        ]
        read_only_fields = ['owner', 'created', 'updated', 'progress']

    def get_progress(self, obj):
        return obj.calculate_progress()

    def create(self, validated_data):
        activity = Activity.objects.create(**validated_data)
        activity.calculate_progress()
        return activity

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.start_date = validated_data.get('start_date', instance.start_date)
        instance.end_date = validated_data.get('end_date', instance.end_date)
        instance.save()
        instance.calculate_progress()
        return instance

class OKRSerializer(serializers.ModelSerializer):
    owner = UsersSimpleSerializer(read_only=True)
    owner_id = serializers.PrimaryKeyRelatedField(
        queryset=Users.objects.all(), write_only=True, source='owner'
    )
    objective = serializers.PrimaryKeyRelatedField(queryset=Objective.objects.all())
    activities = ActivitySerializer(many=True, read_only=True)
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = OKR
        fields = [
            'id', 'objective', 'key_result', 'current_value', 'target_value', 'progress', 'owner', 'owner_id',
            'activities', 'created', 'updated', 'tasks'
        ]
        read_only_fields = ['current_value', 'target_value', 'progress', 'owner', 'created', 'updated']

    def create(self, validated_data):
        okr = OKR.objects.create(**validated_data)
        okr.calculate_progress()
        return okr

    def update(self, instance, validated_data):
        instance.key_result = validated_data.get('key_result', instance.key_result)
        instance.save()
        instance.calculate_progress()
        return instance

class ObjectiveSerializer(serializers.ModelSerializer):
    owner = UsersSimpleSerializer(read_only=True)
    owner_id = serializers.PrimaryKeyRelatedField(
        queryset=Users.objects.all(), write_only=True, source='owner'
    )
    epic = serializers.PrimaryKeyRelatedField(queryset=Epic.objects.all())
    okrs = OKRSerializer(many=True, read_only=True)

    class Meta:
        model = Objective
        fields = [
            'id', 'epic', 'title', 'description', 'owner', 'owner_id',
            'okrs', 'created', 'updated'
        ]

class ProjectSerializer(serializers.ModelSerializer):
    created_by = UsersSimpleSerializer(read_only=True)
    members = UsersSimpleSerializer(many=True, read_only=True)
    members_ids = serializers.PrimaryKeyRelatedField(
        queryset=Users.objects.all(), many=True, write_only=True, source='members'
    )
    epics = EpicSerializer(many=True, read_only=True)
    tipo = serializers.CharField()

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'created_by', 'members', 'members_ids',
            'epics', 'tipo',
            'start_date', 'end_date', 'color', 'created', 'updated'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.tipo == 'proyecto':
            # No mostrar épicas, solo objetivos directos
            data['epics'] = []
            # Suponiendo que hay una relación directa project.objectives
            data['objectives'] = ObjectiveSerializer(getattr(instance, 'objectives', []), many=True, context=self.context).data
        else:
            # Si es misión, mostrar épicas y no objetivos directos
            data['objectives'] = []
        return data

    def create(self, validated_data):
        members = validated_data.pop('members', [])
        project = Project.objects.create(**validated_data)
        project.members.set(members)
        return project

    def update(self, instance, validated_data):
        members = validated_data.pop('members', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if members is not None:
            instance.members.set(members)
        return instance

class ProjectMembersSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())
    user = UsersSimpleSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=Users.objects.all(), write_only=True, source='user'
    )
    joined_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = ProjectMembers
        fields = ['id', 'project', 'user', 'user_id', 'joined_at']

class LogSerializer(serializers.ModelSerializer):
    user = UsersSimpleSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=Users.objects.all(), write_only=True, source='user'
    )
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all(), allow_null=True, required=False)
    epic = serializers.PrimaryKeyRelatedField(queryset=Epic.objects.all(), allow_null=True, required=False)  # Nuevo
    objective = serializers.PrimaryKeyRelatedField(queryset=Objective.objects.all(), allow_null=True, required=False)
    okr = serializers.PrimaryKeyRelatedField(queryset=OKR.objects.all(), allow_null=True, required=False)
    activity = serializers.PrimaryKeyRelatedField(queryset=Activity.objects.all(), allow_null=True, required=False)
    task = serializers.PrimaryKeyRelatedField(queryset=Task.objects.all(), allow_null=True, required=False)

    class Meta:
        model = Log
        fields = [
            'id', 'project', 'epic', 'objective', 'okr', 'activity', 'task',
            'user', 'user_id', 'log_text', 'log_type', 'log_color', 'created'
        ]

class CommentSerializer(serializers.ModelSerializer):
    user = UsersSimpleSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=Users.objects.all(), write_only=True, source='user'
    )
    task = serializers.PrimaryKeyRelatedField(queryset=Task.objects.all())

    class Meta:
        model = Comment
        fields = ['id', 'task', 'user', 'user_id', 'text', 'created', 'updated']