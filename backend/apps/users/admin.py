from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser


def approve_judges(modeladmin, request, queryset):
    """审批通过评委注册申请"""
    updated = queryset.filter(role='judge', pending_approval=True).update(
        is_active=True,
        pending_approval=False,
    )
    modeladmin.message_user(request, f'成功审批通过 {updated} 位评委账号', messages.SUCCESS)


approve_judges.short_description = '审批通过所选评委'


@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    """自定义用户管理后台"""
    list_display = ('username', 'email', 'full_name', 'role', 'organization', 'pending_approval', 'is_active', 'date_joined')
    list_filter = ('role', 'pending_approval', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('username', 'email', 'full_name', 'organization')
    actions = [approve_judges]

    fieldsets = BaseUserAdmin.fieldsets + (
        ('扩展信息', {
            'fields': ('role', 'full_name', 'phone', 'organization', 'pending_approval')
        }),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('扩展信息', {
            'fields': ('role', 'full_name', 'phone', 'organization', 'email')
        }),
    )
