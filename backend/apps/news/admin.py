from django.contrib import admin
from .models import Article


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    """新闻文章管理后台"""
    list_display = ('title', 'category', 'author', 'view_count', 'is_published', 'publish_date', 'created_at')
    list_filter = ('category', 'is_published', 'publish_date', 'created_at')
    search_fields = ('title', 'summary', 'content')
    date_hierarchy = 'publish_date'
    readonly_fields = ('view_count', 'created_at', 'updated_at')

    fieldsets = (
        ('基本信息', {
            'fields': ('title', 'category', 'summary', 'content')
        }),
        ('媒体文件', {
            'fields': ('cover_image',)
        }),
        ('发布设置', {
            'fields': ('is_published', 'publish_date', 'author')
        }),
        ('统计信息', {
            'fields': ('view_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        """保存时自动设置作者"""
        if not change:  # 新建时
            obj.author = request.user
        super().save_model(request, obj, form, change)
