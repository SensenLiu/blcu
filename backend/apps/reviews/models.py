from django.db import models
from django.conf import settings
from apps.contests.models import Contest, Submission


class ScoreDimension(models.Model):
    """评分维度模型"""
    contest = models.ForeignKey(
        Contest,
        on_delete=models.CASCADE,
        related_name='score_dimensions',
        verbose_name='所属竞赛'
    )

    name = models.CharField(
        max_length=100,
        verbose_name='维度名称'
    )

    description = models.TextField(
        blank=True,
        verbose_name='维度说明'
    )

    max_score = models.PositiveIntegerField(
        verbose_name='满分',
        help_text='该维度的最高分数'
    )

    weight = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=1.00,
        verbose_name='权重',
        help_text='计算总分时的权重系数'
    )

    sort_order = models.PositiveIntegerField(
        default=0,
        verbose_name='排序'
    )

    class Meta:
        db_table = 'reviews_scoredimension'
        verbose_name = '评分维度'
        verbose_name_plural = '评分维度'
        ordering = ['sort_order', 'id']
        indexes = [
            models.Index(fields=['contest']),
        ]

    def __str__(self):
        return f"{self.contest.name} - {self.name}"


class Assignment(models.Model):
    """评审分配模型"""
    submission = models.ForeignKey(
        Submission,
        on_delete=models.CASCADE,
        related_name='assignments',
        verbose_name='参赛作品'
    )

    judge = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='judge_assignments',
        verbose_name='评委'
    )

    assigned_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='分配时间'
    )

    is_completed = models.BooleanField(
        default=False,
        verbose_name='是否完成评审'
    )

    class Meta:
        db_table = 'reviews_assignment'
        verbose_name = '评审分配'
        verbose_name_plural = '评审分配'
        unique_together = [['submission', 'judge']]
        indexes = [
            models.Index(fields=['judge']),
            models.Index(fields=['submission']),
        ]

    def __str__(self):
        return f"{self.judge.username} -> {self.submission.submission_number}"


class Score(models.Model):
    """评分模型"""
    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name='scores',
        verbose_name='评审分配'
    )

    dimension = models.ForeignKey(
        ScoreDimension,
        on_delete=models.CASCADE,
        related_name='scores',
        verbose_name='评分维度'
    )

    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name='分数'
    )

    class Meta:
        db_table = 'reviews_score'
        verbose_name = '评分'
        verbose_name_plural = '评分'
        unique_together = [['assignment', 'dimension']]
        indexes = [
            models.Index(fields=['assignment']),
        ]

    def __str__(self):
        return f"{self.assignment} - {self.dimension.name}: {self.score}"


class Review(models.Model):
    """评审意见模型"""
    assignment = models.OneToOneField(
        Assignment,
        on_delete=models.CASCADE,
        related_name='review',
        verbose_name='评审分配'
    )

    comment = models.TextField(
        blank=True,
        verbose_name='评审意见'
    )

    total_score = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='总分'
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
        db_table = 'reviews_review'
        verbose_name = '评审意见'
        verbose_name_plural = '评审意见'
        indexes = [
            models.Index(fields=['assignment']),
        ]

    def __str__(self):
        return f"评审 - {self.assignment}"

    def calculate_total_score(self):
        """计算加权总分"""
        scores = self.assignment.scores.select_related('dimension')
        total = sum(
            score.score * score.dimension.weight
            for score in scores
        )
        return round(total, 2)
