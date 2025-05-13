from django.db import models
from django.core.validators import MaxValueValidator
from colorfield.fields import ColorField
from users.models import Users

TASK_STATUS = (
    ('backlog', "Backlog"),
    ('in progress', "In Progress"),
    ('completed', "Completed")
)

LOG_TYPES = (
    ('Task Created', "Task Created"),
    ('Task Updated', "Task Updated"),
    ('Project Created', "Project Created"),
    ('Epic Created', "Epic Created"),
    ('Objective Created', "Objective Created"),
    ('OKR Created', "OKR Created"),
    ('Activity Created', "Activity Created"),
)

PROGRESS_DICT = {'backlog': 0, 'in progress': 50, 'completed': 100}

class Project(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(max_length=2000, blank=True)
    created_by = models.ForeignKey(Users, related_name='projects_created', on_delete=models.CASCADE)
    members = models.ManyToManyField(Users, related_name='projects', through='ProjectMembers', blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    color = ColorField(default='#FF5733')
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created']
    
    def __str__(self):
        return self.name
    
    def get_objectives_num(self):
        return sum(epic.objectives.count() for epic in self.epics.all())
    
    def get_logs(self):
        return self.logs.all()

class ProjectMembers(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('project', 'user')
        verbose_name = 'Project Member'
        verbose_name_plural = 'Project Members'
    
    def __str__(self):
        return f"{self.user} in {self.project}"

class Epic(models.Model):
    project = models.ForeignKey(Project, related_name='epics', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(max_length=2000, blank=True)
    owner = models.ForeignKey(Users, related_name='epics', on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created']
        verbose_name = 'Epic'
        verbose_name_plural = 'Epics'
    
    def __str__(self):
        return self.title
    
    def get_objectives_num(self):
        return self.objectives.all().count()

    def delete(self, *args, **kwargs):
        try:
            # Primero eliminamos todos los objetivos asociados
            for objective in self.objectives.all():
                objective.delete()
            super().delete(*args, **kwargs)
        except Exception as e:
            raise Exception(f"Error al eliminar la épica: {str(e)}")

class Objective(models.Model):
    epic = models.ForeignKey(Epic, related_name='objectives', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(max_length=2000, blank=True)
    owner = models.ForeignKey(Users, related_name='objectives', on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created']
    
    def __str__(self):
        return self.title
    
    def get_okrs_num(self):
        return self.okrs.all().count()

class OKR(models.Model):
    objective = models.ForeignKey(Objective, on_delete=models.CASCADE, related_name='okrs')
    key_result = models.CharField(max_length=200)
    current_value = models.IntegerField(default=0)
    target_value = models.IntegerField(default=100)
    progress = models.IntegerField(default=0)
    owner = models.ForeignKey(Users, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    tasks = models.ManyToManyField('Task', related_name='okrs', blank=True)

    def calculate_progress(self):
        activities = self.activities.all()
        if not activities.exists():
            self.progress = 0
            self.current_value = 0
            self.save()
            return 0
        total_activities = activities.count()
        completed_activities = activities.filter(tasks__status='completed').distinct().count()
        progress = (completed_activities / total_activities) * 100 if total_activities > 0 else 0
        self.progress = round(progress)
        self.current_value = round(progress)
        self.save()
        return self.progress

    def __str__(self):
        return f"{self.key_result} - {self.progress}%"

    class Meta:
        ordering = ['-created']
        verbose_name = 'OKR'
        verbose_name_plural = 'OKRs'

class Activity(models.Model):
    okr = models.ForeignKey(OKR, related_name='activities', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(max_length=2000, blank=True)
    owner = models.ForeignKey(Users, related_name='activities', on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created']
        verbose_name = 'Activity'
        verbose_name_plural = 'Activities'
    
    def __str__(self):
        return self.name
    
    def get_tasks_num(self):
        return self.tasks.all().count()

    def calculate_progress(self):
        tasks = self.tasks.all()
        if not tasks.exists():
            return 0
        total_tasks = tasks.count()
        completed_tasks = tasks.filter(status='completed').count()
        progress = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
        return round(progress)

    def delete(self, *args, **kwargs):
        try:
            # Primero eliminamos todas las tareas asociadas
            for task in self.tasks.all():
                task.delete()
            super().delete(*args, **kwargs)
        except Exception as e:
            raise Exception(f"Error al eliminar la actividad: {str(e)}")

class Task(models.Model):
    activity = models.ForeignKey(Activity, related_name='tasks', on_delete=models.CASCADE)
    title = models.CharField(max_length=255, default="No Title")
    desc = models.TextField(max_length=2000, default="No description")
    assignee = models.ForeignKey(Users, related_name='tasks', on_delete=models.CASCADE, null=True)
    parent_task = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subs')
    status = models.CharField(default="backlog", max_length=255, choices=TASK_STATUS)
    completion_percentage = models.PositiveBigIntegerField(default=0, validators=[MaxValueValidator(100)])
    archived = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created']
    
    def __str__(self):
        return f"Task-{self.id}"
    
    def get_subtasks_num(self):
        return self.subs.all().count()
    
    def get_subtasks(self):
        return self.subs.all()
    
    def get_logs(self):
        return self.logs.all()
    
    def get_comments(self):
        return self.comments.all()
    
    def save(self, *args, **kwargs):
        self.completion_percentage = PROGRESS_DICT.get(self.status, 0)
        super().save(*args, **kwargs)

class Log(models.Model):
    project = models.ForeignKey(Project, related_name='logs', on_delete=models.CASCADE, null=True, blank=True)
    epic = models.ForeignKey(Epic, related_name='logs', on_delete=models.CASCADE, null=True, blank=True)  # Nuevo
    objective = models.ForeignKey(Objective, related_name='logs', on_delete=models.CASCADE, null=True, blank=True)
    okr = models.ForeignKey(OKR, related_name='logs', on_delete=models.CASCADE, null=True, blank=True)
    activity = models.ForeignKey(Activity, related_name='logs', on_delete=models.CASCADE, null=True, blank=True)
    task = models.ForeignKey(Task, related_name='logs', on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(Users, related_name='logs', on_delete=models.CASCADE, null=True) 
    log_text = models.CharField(max_length=255)
    log_type = models.CharField(max_length=255, choices=LOG_TYPES, default="Task Created")
    log_color = ColorField(default='#955251')
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created']
    
    def __str__(self):
        return f"Log-{self.id}"

class Comment(models.Model):
    task = models.ForeignKey(Task, related_name='comments', on_delete=models.CASCADE)
    user = models.ForeignKey(Users, related_name='comments', on_delete=models.CASCADE, null=True) 
    text = models.TextField(max_length=1250, blank=False)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.text[:20]}..."