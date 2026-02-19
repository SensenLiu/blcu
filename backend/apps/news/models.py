from django.db import models
from django.conf import settings
from django.utils import timezone


class Article(models.Model):
    """新闻文章模型"""
    CATEGORY_CHOICES = (
        ('news', '中心动态'),
        ('event', '活动通知'),
        ('achievement', '学术成果'),
    )

    title = models.CharField(
        max_length=200,
        verbose_name='标题'
    )

    summary = models.TextField(
        blank=True,
        verbose_name='摘要'
    )

    content = models.TextField(
        verbose_name='正文内容'
    )

    cover_image = models.ImageField(
        upload_to='news/covers/%Y/%m/',
        blank=True,
        null=True,
        verbose_name='封面图片'
    )

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='news',
        verbose_name='分类',
        db_index=True
    )

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='articles',
        verbose_name='发布者'
    )

    view_count = models.PositiveIntegerField(
        default=0,
        verbose_name='浏览次数'
    )

    is_published = models.BooleanField(
        default=False,
        verbose_name='是否发布'
    )

    publish_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='发布时间',
        db_index=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='创建时间'
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='更新时间'
    )

    class Meta:
        db_table = 'news_article'
        verbose_name = '新闻文章'
        verbose_name_plural = '新闻文章'
        ordering = ['-publish_date', '-created_at']
        indexes = [
            models.Index(fields=['-publish_date']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        """保存时自动设置发布时间"""
        if self.is_published and not self.publish_date:
            self.publish_date = timezone.now()
        super().save(*args, **kwargs)

    def increment_views(self):
        """增加浏览次数"""
        self.view_count += 1
        self.save(update_fields=['view_count'])
