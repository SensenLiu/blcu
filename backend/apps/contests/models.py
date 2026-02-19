from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid


class Contest(models.Model):
    """竞赛配置模型"""
    STATUS_CHOICES = (
        ('draft', '草稿'),
        ('open', '开放报名'),
        ('reviewing', '评审中'),
        ('closed', '已结束'),
    )

    name = models.CharField(
        max_length=200,
        verbose_name='竞赛名称'
    )

    description = models.TextField(
        blank=True,
        verbose_name='竞赛说明'
    )

    start_date = models.DateTimeField(
        verbose_name='开始时间'
    )

    submission_deadline = models.DateTimeField(
        verbose_name='作品提交截止时间'
    )

    review_deadline = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='评审截止时间'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name='状态',
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
        db_table = 'contests_contest'
        verbose_name = '竞赛'
        verbose_name_plural = '竞赛'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return self.name

    @property
    def is_open(self):
        """是否开放报名"""
        now = timezone.now()
        return (
            self.status == 'open' and
            self.start_date <= now <= self.submission_deadline
        )

    @property
    def is_submission_closed(self):
        """是否已截止提交"""
        return timezone.now() > self.submission_deadline


class Category(models.Model):
    """竞赛组别模型"""
    contest = models.ForeignKey(
        Contest,
        on_delete=models.CASCADE,
        related_name='categories',
        verbose_name='所属竞赛'
    )

    name = models.CharField(
        max_length=100,
        verbose_name='组别名称'
    )

    description = models.TextField(
        blank=True,
        verbose_name='组别说明'
    )

    max_file_size_mb = models.PositiveIntegerField(
        default=10,
        verbose_name='最大文件大小(MB)'
    )

    allowed_formats = models.CharField(
        max_length=200,
        default='pdf,docx,doc,jpg,jpeg,png',
        verbose_name='允许的文件格式',
        help_text='用逗号分隔，如：pdf,docx,jpg'
    )

    class Meta:
        db_table = 'contests_category'
        verbose_name = '竞赛组别'
        verbose_name_plural = '竞赛组别'
        indexes = [
            models.Index(fields=['contest']),
        ]

    def __str__(self):
        return f"{self.contest.name} - {self.name}"

    def get_allowed_formats_list(self):
        """获取允许的文件格式列表"""
        return [fmt.strip().lower() for fmt in self.allowed_formats.split(',')]


class Submission(models.Model):
    """参赛作品提交模型"""
    STATUS_CHOICES = (
        ('draft', '草稿'),
        ('submitted', '已提交'),
        ('under_review', '评审中'),
        ('reviewed', '已评审'),
    )

    contest = models.ForeignKey(
        Contest,
        on_delete=models.CASCADE,
        related_name='submissions',
        verbose_name='所属竞赛'
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='submissions',
        verbose_name='参赛组别'
    )

    contestant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='submissions',
        verbose_name='参赛选手'
    )

    work_title = models.CharField(
        max_length=200,
        verbose_name='作品标题'
    )

    work_description = models.TextField(
        blank=True,
        verbose_name='作品说明'
    )

    file = models.FileField(
        upload_to='submissions/%Y/%m/',
        verbose_name='作品文件'
    )

    file_name = models.CharField(
        max_length=255,
        verbose_name='文件名'
    )

    file_size_kb = models.PositiveIntegerField(
        null=True,
        verbose_name='文件大小(KB)'
    )

    submission_number = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='参赛编号',
        db_index=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name='状态',
        db_index=True
    )

    submitted_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='提交时间'
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
        db_table = 'contests_submission'
        verbose_name = '参赛作品'
        verbose_name_plural = '参赛作品'
        ordering = ['-submitted_at', '-created_at']
        indexes = [
            models.Index(fields=['contestant']),
            models.Index(fields=['status']),
            models.Index(fields=['submission_number']),
        ]

    def __str__(self):
        return f"{self.submission_number} - {self.work_title}"

    def save(self, *args, **kwargs):
        """保存时自动生成参赛编号"""
        if not self.submission_number:
            self.submission_number = self.generate_submission_number()

        # 提交时设置提交时间
        if self.status == 'submitted' and not self.submitted_at:
            self.submitted_at = timezone.now()

        super().save(*args, **kwargs)

    def generate_submission_number(self):
        """生成唯一的参赛编号"""
        prefix = f"{self.contest.id:03d}{self.category.id:02d}"
        unique_id = uuid.uuid4().hex[:8].upper()
        return f"{prefix}-{unique_id}"
