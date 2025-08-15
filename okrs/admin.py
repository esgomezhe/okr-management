from django.contrib import admin
from .models import Project, ProjectMembers, Epic, Objective, OKR, Activity, Task, Log, Comment

@admin.register(ProjectMembers)
class ProjectMembersAdmin(admin.ModelAdmin):
    list_display = ['user', 'project', 'role', 'joined_at']
    list_filter = ['role', 'joined_at', 'project__tipo']
    search_fields = ['user__user__username', 'user__first_name', 'user__last_name', 'project__name']
    ordering = ['project', 'role', 'user__user__username']

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'tipo', 'created_by', 'start_date', 'end_date', 'get_members_count']
    list_filter = ['tipo', 'start_date', 'end_date', 'created']
    search_fields = ['name', 'description', 'created_by__user__username']
    ordering = ['-created']
    
    def get_members_count(self, obj):
        return obj.members.count()
    get_members_count.short_description = 'Miembros'

@admin.register(Epic)
class EpicAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'owner', 'get_objectives_count', 'created']
    list_filter = ['project__tipo', 'created']
    search_fields = ['title', 'description', 'project__name', 'owner__user__username']
    ordering = ['-created']
    
    def get_objectives_count(self, obj):
        return obj.objectives.count()
    get_objectives_count.short_description = 'Objetivos'

@admin.register(Objective)
class ObjectiveAdmin(admin.ModelAdmin):
    list_display = ['title', 'epic', 'project', 'owner', 'get_okrs_count', 'created']
    list_filter = ['created', 'epic__project__tipo']
    search_fields = ['title', 'description', 'epic__title', 'project__name', 'owner__user__username']
    ordering = ['-created']
    
    def get_okrs_count(self, obj):
        return obj.okrs.count()
    get_okrs_count.short_description = 'OKRs'

@admin.register(OKR)
class OKRAdmin(admin.ModelAdmin):
    list_display = ['key_result', 'objective', 'progress', 'current_value', 'target_value', 'owner', 'created']
    list_filter = ['progress', 'created', 'objective__epic__project__tipo']
    search_fields = ['key_result', 'objective__title', 'owner__user__username']
    ordering = ['-created']
    readonly_fields = ['progress', 'current_value']

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['name', 'okr', 'owner', 'start_date', 'end_date', 'get_tasks_count', 'created']
    list_filter = ['start_date', 'end_date', 'created', 'okr__objective__epic__project__tipo']
    search_fields = ['name', 'description', 'okr__key_result', 'owner__user__username']
    ordering = ['-created']
    
    def get_tasks_count(self, obj):
        return obj.tasks.count()
    get_tasks_count.short_description = 'Tareas'

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'activity', 'assignee', 'status', 'completion_percentage', 'created']
    list_filter = ['status', 'archived', 'created', 'activity__okr__objective__epic__project__tipo']
    search_fields = ['title', 'desc', 'assignee__user__username', 'activity__name']
    ordering = ['-created']
    readonly_fields = ['completion_percentage']

@admin.register(Log)
class LogAdmin(admin.ModelAdmin):
    list_display = ['log_text', 'log_type', 'user', 'project', 'created']
    list_filter = ['log_type', 'created', 'project__tipo']
    search_fields = ['log_text', 'user__user__username', 'project__name']
    ordering = ['-created']
    readonly_fields = ['created']

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['text', 'task', 'user', 'created']
    list_filter = ['created', 'task__activity__okr__objective__epic__project__tipo']
    search_fields = ['text', 'user__user__username', 'task__title']
    ordering = ['-created']
    readonly_fields = ['created', 'updated']