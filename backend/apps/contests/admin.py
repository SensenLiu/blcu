from django.contrib import admin
from .models import Contest, Category, Submission


class CategoryInline(admin.TabularInline):
    """竞赛组别内联编辑"""
    model = Category
    extra = 1


@admin.register(Contest)
class ContestAdmin(admin.ModelAdmin):
    """竞赛管理后台"""
    list_display = ('name', 'status', 'start_date', 'submission_deadline', 'created_at')
    list_filter = ('status', 'start_date', 'created_at')
    search_fields = ('name', 'description')
    date_hierarchy = 'start_date'
    inlines = [CategoryInline]

    fieldsets = (
        ('基本信息', {
            'fields': ('name', 'description', 'status')
        }),
        ('时间设置', {
            'fields': ('start_date', 'submission_deadline', 'review_deadline')
        }),
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """竞赛组别管理后台"""
    list_display = ('name', 'contest', 'max_file_size_mb', 'allowed_formats')
    list_filter = ('contest',)
    search_fields = ('name', 'description')


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    """参赛作品管理后台"""
    list_display = (
        'submission_number', 'work_title', 'contestant', 'contest',
        'category', 'status', 'submitted_at'
    )
    list_filter = ('status', 'contest', 'category', 'submitted_at')
    search_fields = ('submission_number', 'work_title', 'contestant__username', 'contestant__full_name')
    readonly_fields = ('submission_number', 'file_name', 'file_size_kb', 'submitted_at', 'created_at', 'updated_at')
    date_hierarchy = 'submitted_at'

    fieldsets = (
        ('作品信息', {
            'fields': ('submission_number', 'work_title', 'work_description')
        }),
        ('竞赛信息', {
            'fields': ('contest', 'category', 'contestant')
        }),
        ('文件信息', {
            'fields': ('file', 'file_name', 'file_size_kb')
        }),
        ('状态信息', {
            'fields': ('status', 'submitted_at', 'created_at', 'updated_at')
        }),
    )
