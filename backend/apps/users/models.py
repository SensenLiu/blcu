from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    自定义用户模型
    扩展 Django 默认用户，添加角色、组织等字段
    """
    ROLE_CHOICES = (
        ('contestant', '参赛选手'),
        ('judge', '评委'),
        ('admin', '管理员'),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='contestant',
        verbose_name='用户角色',
        db_index=True
    )

    full_name = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='真实姓名'
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name='联系电话'
    )

    organization = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='所属单位'
    )

    class Meta:
        db_table = 'users_customuser'
        verbose_name = '用户'
        verbose_name_plural = '用户'
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    @property
    def is_contestant(self):
        """是否为参赛选手"""
        return self.role == 'contestant'

    @property
    def is_judge(self):
        """是否为评委"""
        return self.role == 'judge'

    @property
    def is_admin_user(self):
        """是否为管理员"""
        return self.role == 'admin' or self.is_superuser
