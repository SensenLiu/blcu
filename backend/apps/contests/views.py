from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from .models import Contest, Category, Submission
from .serializers import (
    ContestListSerializer,
    ContestDetailSerializer,
    CategorySerializer,
    SubmissionListSerializer,
    SubmissionDetailSerializer,
    SubmissionCreateSerializer
)


class ContestListView(generics.ListAPIView):
    """
    竞赛列表 API
    GET /api/contests/
    """
    queryset = Contest.objects.exclude(status='draft')
    serializer_class = ContestListSerializer
    permission_classes = [permissions.AllowAny]


class ContestDetailView(generics.RetrieveAPIView):
    """
    竞赛详情 API
    GET /api/contests/{id}/
    """
    queryset = Contest.objects.exclude(status='draft')
    serializer_class = ContestDetailSerializer
    permission_classes = [permissions.AllowAny]


class CategoryListView(generics.ListAPIView):
    """
    竞赛组别列表 API
    GET /api/contests/{contest_id}/categories/
    """
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        contest_id = self.kwargs['contest_id']
        return Category.objects.filter(contest_id=contest_id)


class SubmissionCreateView(generics.CreateAPIView):
    """
    提交作品 API
    POST /api/contests/submissions/
    """
    serializer_class = SubmissionCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # 检查用户角色
        if not self.request.user.is_contestant:
            return Response(
                {'error': '只有参赛选手可以提交作品'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()


class MySubmissionsView(generics.ListAPIView):
    """
    我的作品列表 API
    GET /api/contests/my-submissions/
    """
    serializer_class = SubmissionListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Submission.objects.filter(
            contestant=self.request.user
        ).select_related('contest', 'category', 'contestant')


class SubmissionDetailView(generics.RetrieveAPIView):
    """
    作品详情 API
    GET /api/contests/submissions/{id}/
    """
    serializer_class = SubmissionDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # 选手只能查看自己的作品，评委可以查看分配的作品，管理员可以查看所有
        if user.is_contestant:
            return Submission.objects.filter(contestant=user)
        elif user.is_judge:
            # 评委可以查看分配给自己的作品
            return Submission.objects.filter(
                reviews__assignment__judge=user
            ).distinct()
        elif user.is_admin_user:
            return Submission.objects.all()
        return Submission.objects.none()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def download_submission_file(request, submission_id):
    """
    下载作品文件
    GET /api/contests/submissions/{id}/download/
    """
    user = request.user

    # 获取作品
    submission = get_object_or_404(Submission, id=submission_id)

    # 权限验证
    can_download = False
    if user.is_contestant and submission.contestant == user:
        can_download = True
    elif user.is_judge:
        # 评委只能下载分配给自己的作品
        from apps.reviews.models import Assignment
        can_download = Assignment.objects.filter(
            submission=submission,
            judge=user
        ).exists()
    elif user.is_admin_user:
        can_download = True

    if not can_download:
        return Response(
            {'error': '无权下载该文件'},
            status=status.HTTP_403_FORBIDDEN
        )

    # 返回文件
    if submission.file:
        return FileResponse(
            submission.file.open('rb'),
            as_attachment=True,
            filename=submission.file_name
        )

    return Response(
        {'error': '文件不存在'},
        status=status.HTTP_404_NOT_FOUND
    )
