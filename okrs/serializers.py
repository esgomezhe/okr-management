from rest_framework import serializers
from .models import Project, Epic, Objective, OKR, Activity, Task, Log, Comment, ProjectMembers
from users.models import Users

class ProjectMembersSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id')
    username = serializers.CharField(source='user.user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.CharField(source='user.user.email', read_only=True)
    role = serializers.CharField(read_only=True)
    
    class Meta:
        model = ProjectMembers
        fields = ['id', 'user_id', 'username', 'first_name', 'last_name', 'email', 'role', 'joined_at']

class AddProjectMemberSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(write_only=True)
    role = serializers.ChoiceField(choices=ProjectMembers.ROLE_CHOICES, default='member')
    
    class Meta:
        model = ProjectMembers
        fields = ['user_id', 'role']
    
    def validate_user_id(self, value):
        try:
            user = Users.objects.get(id=value)
            return value
        except Users.DoesNotExist:
            raise serializers.ValidationError("Usuario no encontrado")
    
    def create(self, validated_data):
        user_id = validated_data.pop('user_id')
        user = Users.objects.get(id=user_id)
        project = self.context['project']
        
        # Verificar si el usuario ya es miembro
        if ProjectMembers.objects.filter(project=project, user=user).exists():
            raise serializers.ValidationError("El usuario ya es miembro de este proyecto")
        
        return ProjectMembers.objects.create(
            project=project,
            user=user,
            **validated_data
        )

class RemoveProjectMemberSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    
    def validate_user_id(self, value):
        try:
            user = Users.objects.get(id=value)
            return value
        except Users.DoesNotExist:
            raise serializers.ValidationError("Usuario no encontrado")

class ProjectSerializer(serializers.ModelSerializer):
    epics = serializers.SerializerMethodField()
    objectives = serializers.SerializerMethodField()
    members = ProjectMembersSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.user.username', read_only=True)
    tipo = serializers.CharField()
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'created_by', 'created_by_name', 'members', 'start_date', 'end_date', 'color', 'tipo', 'created', 'updated', 'epics', 'objectives']
        read_only_fields = ['created_by', 'created', 'updated']
    
    def get_epics(self, obj):
        if obj.tipo == 'mision':
            return EpicSerializer(obj.epics.all(), many=True, context=self.context).data
        return []
    
    def get_objectives(self, obj):
        if obj.tipo == 'proyecto':
            return ObjectiveSerializer(obj.objectives.all(), many=True, context=self.context).data
        return []
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.tipo == 'proyecto':
            data['epics'] = []
            data['objectives'] = ObjectiveSerializer(instance.objectives.all(), many=True, context=self.context).data
        else:
            data['objectives'] = []
        return data

class EpicSerializer(serializers.ModelSerializer):
    objectives = serializers.SerializerMethodField()
    owner_name = serializers.CharField(source='owner.user.username', read_only=True)
    
    class Meta:
        model = Epic
        fields = ['id', 'project', 'title', 'description', 'owner', 'owner_name', 'created', 'updated', 'objectives']
        read_only_fields = ['owner', 'created', 'updated']
    
    def get_objectives(self, obj):
        return ObjectiveSerializer(Objective.objects.filter(epic=obj), many=True, context=self.context).data

class ObjectiveSerializer(serializers.ModelSerializer):
    okrs = serializers.SerializerMethodField()
    owner_name = serializers.CharField(source='owner.user.username', read_only=True)
    epic = serializers.PrimaryKeyRelatedField(queryset=Epic.objects.all(), allow_null=True, required=False)
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all(), allow_null=True, required=False)
    
    class Meta:
        model = Objective
        fields = ['id', 'epic', 'project', 'title', 'description', 'owner', 'owner_name', 'created', 'updated', 'okrs']
        read_only_fields = ['owner', 'created', 'updated']
    
    def validate(self, data):
        epic = data.get('epic')
        project = data.get('project')
        
        if not epic and not project:
            raise serializers.ValidationError("Debe proporcionar una épica o un proyecto")
        
        if epic and project:
            raise serializers.ValidationError("No puede proporcionar tanto una épica como un proyecto")
        
        return data
    
    def get_okrs(self, obj):
        return OKRSerializer(obj.okrs.all(), many=True, context=self.context).data

class OKRSerializer(serializers.ModelSerializer):
    tasks = serializers.SerializerMethodField()
    owner_name = serializers.CharField(source='owner.user.username', read_only=True)
    current_value = serializers.IntegerField(read_only=True)
    target_value = serializers.IntegerField(read_only=True)
    progress = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = OKR
        fields = ['id', 'objective', 'key_result', 'current_value', 'target_value', 'progress', 'owner', 'owner_name', 'created', 'updated', 'tasks']
        read_only_fields = ['owner', 'current_value', 'target_value', 'progress', 'created', 'updated']
    
    def get_tasks(self, obj):
        return TaskSerializer(obj.tasks.all(), many=True, context=self.context).data
    
    def create(self, validated_data):
        okr = super().create(validated_data)
        okr.calculate_progress()
        return okr
    
    def update(self, instance, validated_data):
        okr = super().update(instance, validated_data)
        okr.calculate_progress()
        return okr

class ActivitySerializer(serializers.ModelSerializer):
    tasks = serializers.SerializerMethodField()
    owner_name = serializers.CharField(source='owner.user.username', read_only=True)
    progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Activity
        fields = ['id', 'okr', 'name', 'description', 'owner', 'owner_name', 'start_date', 'end_date', 'created', 'updated', 'tasks', 'progress']
        read_only_fields = ['owner', 'created', 'updated']
    
    def get_tasks(self, obj):
        return TaskSerializer(obj.tasks.all(), many=True, context=self.context).data
    
    def get_progress(self, obj):
        return obj.calculate_progress()
    
    def create(self, validated_data):
        activity = super().create(validated_data)
        activity.calculate_progress()
        return activity
    
    def update(self, instance, validated_data):
        activity = super().update(instance, validated_data)
        activity.calculate_progress()
        return activity

class TaskSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source='assignee.user.username', read_only=True)
    assignee_id = serializers.IntegerField(source='assignee.id', required=False, allow_null=True)
    
    class Meta:
        model = Task
        fields = ['id', 'activity', 'title', 'desc', 'assignee', 'assignee_id', 'assignee_name', 'parent_task', 'status', 'completion_percentage', 'archived', 'created', 'updated']
        read_only_fields = ['completion_percentage', 'created', 'updated']
    
    def create(self, validated_data):
        task = super().create(validated_data)
        # Recalcular progreso de la actividad y OKR
        task.activity.calculate_progress()
        task.activity.okr.calculate_progress()
        return task
    
    def update(self, instance, validated_data):
        task = super().update(instance, validated_data)
        # Recalcular progreso de la actividad y OKR
        task.activity.calculate_progress()
        task.activity.okr.calculate_progress()
        return task

class LogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.user.username', read_only=True)
    
    class Meta:
        model = Log
        fields = ['id', 'project', 'epic', 'objective', 'okr', 'activity', 'task', 'user', 'user_name', 'log_text', 'log_type', 'log_color', 'created']
        read_only_fields = ['user', 'created']

class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.user.username', read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'task', 'user', 'user_name', 'text', 'created', 'updated']
        read_only_fields = ['user', 'created', 'updated']

class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Users
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']