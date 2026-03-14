from django.contrib import admin, messages
from django.shortcuts import render, redirect
from .models import Contest, Category, Submission
from apps.reviews.models import Assignment
from apps.users.models import CustomUser


def bulk_assign_to_judge(modeladmin, request, queryset):
    """批量分配参赛作品给评委"""
    if 'apply' in request.POST:
        judge_id = request.POST.get('judge')
        submission_ids = request.POST.getlist('submission_ids')
        if not judge_id:
            modeladmin.message_user(request, '请选择评委', messages.ERROR)
            return redirect('.')
        judge = CustomUser.objects.get(id=judge_id)
        submissions = Submission.objects.filter(id__in=submission_ids)
        created_count = 0
        skipped_count = 0
        for submission in submissions:
            _, created = Assignment.objects.get_or_create(
                submission=submission,
                judge=judge,
            )
            if created:
                created_count += 1
            else:
                skipped_count += 1
        msg = f'成功分配 {created_count} 件作品给 {judge.full_name or judge.username}'
        if skipped_count:
            msg += f'，{skipped_count} 件已跳过（已存在分配）'
        modeladmin.message_user(request, msg, messages.SUCCESS)
        return redirect('..')

    judges = CustomUser.objects.filter(role='judge', is_active=True)
    context = {
        **modeladmin.admin_site.each_context(request),
        'title': '批量分配评委',
        'queryset': queryset,
        'judges': judges,
        'opts': modeladmin.model._meta,
    }
    return render(request, 'admin/bulk_assign_judge.html', context)


bulk_assign_to_judge.short_description = '批量分配给评委'


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
    actions = [bulk_assign_to_judge]
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
