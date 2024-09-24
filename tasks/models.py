from django.db import models
from django.core.validators import MaxValueValidator
from colorfield.fields import ColorField
from user_profiles.models import Users

TASK_STATUS = (
    ('backlog', "Backlog"),
    ('in progress', "In Progress"),
    ('completed', "Completed")
)

LOG_TYPES = (
    ('Task Created', "Task Created"),
    ('Task Updated', "Task Updated"),
)

PROGRESS_DICT = {'backlog': 0, 'in progress': 50, 'completed': 100}

class Project(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(max_length=2000, blank=True)
    created_by = models.ForeignKey(Users, related_name='projects_created', on_delete=models.CASCADE)
    members = models.ManyToManyField(Users, related_name='projects', blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    color = ColorField(default='#FF5733')
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created']
    
    def __str__(self):
        return self.name
    
    def get_objectives_num(self):
        return self.objectives.all().count()
    
    def get_logs(self):
        return self.logs.all()

class Objective(models.Model):
    project = models.ForeignKey(Project, related_name='objectives', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(max_length=2000, blank=True)
    owner = models.ForeignKey(Users, related_name='objectives', on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created']
    
    def __str__(self):
        return self.title
    
    def get_okrs_num(self):
        return self.okrs.all().count()

class OKR(models.Model):
    objective = models.ForeignKey(Objective, related_name='okrs', on_delete=models.CASCADE)
    key_result = models.CharField(max_length=255)
    target_value = models.PositiveIntegerField()
    current_value = models.PositiveIntegerField(default=0)
    progress = models.PositiveIntegerField(default=0, validators=[MaxValueValidator(100)])
    owner = models.ForeignKey(Users, related_name='okrs', on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created']
    
    def __str__(self):
        return self.key_result
    
    def update_progress(self):
        if self.target_value > 0:
            self.progress = min(100, (self.current_value / self.target_value) * 100)
            self.save()

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
    
    def __str__(self):
        return self.name
    
    def get_tasks_num(self):
        return self.tasks.all().count()

class Task(models.Model):
    activity = models.ForeignKey(Activity, related_name='tasks', on_delete=models.CASCADE)
    title = models.CharField(max_length=255, default="No Title")
    desc = models.TextField(max_length=2000, default="No description")
    assignee = models.ForeignKey(
        Users, related_name='tasks', on_delete=models.CASCADE, null=True) 
    parent_task = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True, related_name='subs')
    status = models.CharField(
        default="backlog", max_length=255, choices=TASK_STATUS)
    completion_percentage = models.PositiveBigIntegerField(
        default=0,
        validators=[MaxValueValidator(100)])
    archived = models.BooleanField(default=False)
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created']
    
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
    objective = models.ForeignKey(Objective, related_name='logs', on_delete=models.CASCADE, null=True, blank=True)
    okr = models.ForeignKey(OKR, related_name='logs', on_delete=models.CASCADE, null=True, blank=True)
    activity = models.ForeignKey(Activity, related_name='logs', on_delete=models.CASCADE, null=True, blank=True)
    task = models.ForeignKey(Task, related_name='logs', on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(
        Users, related_name='logs', on_delete=models.CASCADE, null=True) 
    log_text = models.CharField(max_length=255)
    log_type = models.CharField(
        max_length=255, choices=LOG_TYPES, default="Task Created")
    log_color = ColorField(default='#955251')
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created']
    
    def __str__(self):
        return f"Log-{self.id}"

class Comment(models.Model):
    task = models.ForeignKey(Task, related_name='comments',
                             on_delete=models.CASCADE)
    user = models.ForeignKey(
        Users, related_name='comments', on_delete=models.CASCADE, null=True) 
    text = models.TextField(max_length=1250, blank=False)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.text}"