from django.contrib import admin
from .models import ScoreDimension, Assignment, Score, Review


@admin.register(ScoreDimension)
class ScoreDimensionAdmin(admin.ModelAdmin):
    """评分维度管理后台"""
    list_display = ('name', 'contest', 'max_score', 'weight', 'sort_order')
    list_filter = ('contest',)
    search_fields = ('name', 'description')
    ordering = ('contest', 'sort_order')


class ScoreInline(admin.TabularInline):
    """评分内联编辑"""
    model = Score
    extra = 0


class ReviewInline(admin.StackedInline):
    """评审意见内联编辑"""
    model = Review
    extra = 0
    readonly_fields = ('total_score', 'submitted_at', 'created_at', 'updated_at')


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    """评审分配管理后台"""
    list_display = ('submission', 'judge', 'is_completed', 'assigned_at')
    list_filter = ('is_completed', 'assigned_at', 'submission__contest')
    search_fields = ('submission__submission_number', 'judge__username', 'judge__full_name')
    inlines = [ScoreInline, ReviewInline]

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'submission',
            'submission__contest',
            'judge'
        )


@admin.register(Score)
class ScoreAdmin(admin.ModelAdmin):
    """评分管理后台"""
    list_display = ('assignment', 'dimension', 'score')
    list_filter = ('dimension',)
    search_fields = ('assignment__submission__submission_number',)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """评审意见管理后台"""
    list_display = ('assignment', 'total_score', 'submitted_at', 'created_at')
    list_filter = ('submitted_at', 'created_at')
    search_fields = ('assignment__submission__submission_number', 'comment')
    readonly_fields = ('total_score', 'submitted_at', 'created_at', 'updated_at')

    fieldsets = (
        ('评审信息', {
            'fields': ('assignment', 'comment')
        }),
        ('评分统计', {
            'fields': ('total_score', 'submitted_at')
        }),
        ('时间信息', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
