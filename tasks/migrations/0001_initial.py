# Generated by Django 4.1.1 on 2022-10-07 05:44

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Task',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(default='No Title', max_length=255)),
                ('desc', models.TextField(default='No description', max_length=2000)),
                ('status', models.CharField(choices=[('backlog', 'backlog'), ('in progress', 'in progress'), ('completed', 'completed')], max_length=255)),
                ('completion_percentage', models.PositiveBigIntegerField(validators=[django.core.validators.MaxValueValidator(100)])),
                ('updated', models.DateTimeField(auto_now=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('assignee', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tasks', to='users.userprofile')),
                ('parent_task', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='subs', to='tasks.task')),
            ],
            options={
                'ordering': ['-updated'],
            },
        ),
    ]
