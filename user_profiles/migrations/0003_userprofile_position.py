# Generated by Django 3.2.3 on 2022-10-14 05:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_profiles', '0002_userprofile_avatar'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='position',
            field=models.CharField(default='', max_length=255),
        ),
    ]