from django.contrib import admin
from .models import Project, ProjectMembers, Epic, Objective, OKR, Activity, Task, Log, Comment

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'start_date', 'end_date', 'created', 'updated')
    search_fields = ('name', 'description')
    list_filter = ('start_date', 'end_date', 'created_by')

@admin.register(ProjectMembers)
class ProjectMembersAdmin(admin.ModelAdmin):
    list_display = ('project', 'user', 'joined_at')
    search_fields = ('project__name', 'user__user__username', 'user__first_name', 'user__last_name')

@admin.register(Epic)
class EpicAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'owner', 'created', 'updated')
    search_fields = ('title', 'description')
    list_filter = ('project', 'owner', 'created')

@admin.register(Objective)
class ObjectiveAdmin(admin.ModelAdmin):
    list_display = ('title', 'epic', 'owner', 'created', 'updated')
    search_fields = ('title', 'description')
    list_filter = ('epic', 'owner')

@admin.register(OKR)
class OKRAdmin(admin.ModelAdmin):
    list_display = ('key_result', 'objective', 'owner', 'progress', 'created', 'updated')
    search_fields = ('key_result',)
    list_filter = ('owner', 'progress')

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('name', 'okr', 'owner', 'start_date', 'end_date', 'created', 'updated')
    search_fields = ('name', 'description')
    list_filter = ('okr', 'owner', 'start_date', 'end_date')

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'activity', 'assignee', 'status', 'completion_percentage', 'archived', 'created', 'updated')
    search_fields = ('title', 'desc')
    list_filter = ('status', 'archived', 'assignee')

@admin.register(Log)
class LogAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'log_type', 'created')
    search_fields = ('log_text',)
    list_filter = ('log_type', 'created')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('task', 'user', 'text', 'created', 'updated')
    search_fields = ('text',)
    list_filter = ('created', 'updated', 'user')