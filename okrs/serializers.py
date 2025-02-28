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
        objectives = obj.objectives.all()
        return ObjectiveSerializer(objectives, many=True, context=self.context).data

class TaskSerializer(serializers.ModelSerializer):
    assignee = UsersSimpleSerializer(read_only=True)
    assignee_id = serializers.PrimaryKeyRelatedField(
        queryset=Users.objects.all(), write_only=True, source='assignee'
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

class ActivitySerializer(serializers.ModelSerializer):
    owner = UsersSimpleSerializer(read_only=True)
    owner_id = serializers.PrimaryKeyRelatedField(
        queryset=Users.objects.all(), write_only=True, source='owner'
    )
    okr = serializers.PrimaryKeyRelatedField(queryset=OKR.objects.all())
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = Activity
        fields = [
            'id', 'okr', 'name', 'description', 'owner', 'owner_id',
            'start_date', 'end_date', 'tasks', 'created', 'updated'
        ]

class OKRSerializer(serializers.ModelSerializer):
    owner = UsersSimpleSerializer(read_only=True)
    owner_id = serializers.PrimaryKeyRelatedField(
        queryset=Users.objects.all(), write_only=True, source='owner'
    )
    objective = serializers.PrimaryKeyRelatedField(queryset=Objective.objects.all())
    activities = ActivitySerializer(many=True, read_only=True)

    class Meta:
        model = OKR
        fields = [
            'id', 'objective', 'key_result', 'target_value',
            'current_value', 'progress', 'owner', 'owner_id',
            'activities', 'created', 'updated'
        ]

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

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'created_by', 'members', 'members_ids',
            'epics',  # Antes: objectives
            'start_date', 'end_date', 'color', 'created', 'updated'
        ]

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