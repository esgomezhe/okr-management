# Generated by Django 5.1.2 on 2025-05-13 19:48

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('okrs', '0003_alter_activity_options_alter_epic_options_and_more'),
        ('users', '0002_alter_users_options'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='epic',
            options={'ordering': ['-created'], 'verbose_name': 'Epic', 'verbose_name_plural': 'Epics'},
        ),
        migrations.AlterModelOptions(
            name='okr',
            options={'ordering': ['-created'], 'verbose_name': 'OKR', 'verbose_name_plural': 'OKRs'},
        ),
        migrations.AddField(
            model_name='okr',
            name='tasks',
            field=models.ManyToManyField(blank=True, related_name='okrs', to='okrs.task'),
        ),
        migrations.AlterField(
            model_name='okr',
            name='current_value',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='okr',
            name='key_result',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='okr',
            name='owner',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.users'),
        ),
        migrations.AlterField(
            model_name='okr',
            name='progress',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='okr',
            name='target_value',
            field=models.IntegerField(default=100),
        ),
    ]
