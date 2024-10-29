from django.contrib import admin
from .models import Users

@admin.register(Users)
class UsersAdmin(admin.ModelAdmin):
    list_display = ('user', 'first_name', 'last_name', 'role', 'phone', 'city')
    search_fields = ('user__username', 'first_name', 'last_name', 'email')
    list_filter = ('role', 'city')