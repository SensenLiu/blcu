from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import ScoreDimension, Assignment, Review
from .serializers import (
    ScoreDimensionSerializer,
    AssignmentListSerializer,
    ReviewSerializer,
    ReviewSubmitSerializer
)


class IsJudge(permissions.BasePermission):
    """评委权限"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_judge


class MyAssignmentsView(generics.ListAPIView):
    """
    我的评审任务列表
    GET /api/reviews/my-assignments/
    """
    serializer_class = AssignmentListSerializer
    permission_classes = [IsJudge]

    def get_queryset(self):
        return Assignment.objects.filter(
            judge=self.request.user
        ).select_related(
            'submission',
            'submission__contest',
            'submission__category',
            'submission__contestant'
        ).prefetch_related('submission__assignments')


class AssignmentDetailView(generics.RetrieveAPIView):
    """
    评审任务详情
    GET /api/reviews/assignments/{id}/
    """
    serializer_class = AssignmentListSerializer
    permission_classes = [IsJudge]

    def get_queryset(self):
        return Assignment.objects.filter(judge=self.request.user)


@api_view(['GET'])
@permission_classes([IsJudge])
def score_dimensions_view(request, contest_id):
    """
    获取竞赛的评分维度
    GET /api/reviews/contests/{contest_id}/dimensions/
    """
    dimensions = ScoreDimension.objects.filter(contest_id=contest_id)
    serializer = ScoreDimensionSerializer(dimensions, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsJudge])
def submit_review_view(request):
    """
    提交评审
    POST /api/reviews/submit/
    Body: {
        "assignment_id": 1,
        "scores": [
            {"dimension": 1, "score": 85.5},
            {"dimension": 2, "score": 90}
        ],
        "comment": "评审意见..."
    }
    """
    serializer = ReviewSubmitSerializer(
        data=request.data,
        context={'request': request}
    )

    if serializer.is_valid():
        review = serializer.save()
        return Response({
            'message': '评审提交成功',
            'review': ReviewSerializer(review).data
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsJudge])
def my_review_view(request, assignment_id):
    """
    获取我的评审详情
    GET /api/reviews/assignments/{assignment_id}/review/
    """
    assignment = get_object_or_404(
        Assignment,
        id=assignment_id,
        judge=request.user
    )

    try:
        review = assignment.review
        serializer = ReviewSerializer(review)
        return Response(serializer.data)
    except Review.DoesNotExist:
        return Response(
            {'message': '尚未提交评审'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PUT'])
@permission_classes([IsJudge])
def update_review_view(request, assignment_id):
    """
    更新评审
    PUT /api/reviews/assignments/{assignment_id}/review/
    """
    assignment = get_object_or_404(
        Assignment,
        id=assignment_id,
        judge=request.user
    )

    # 修改请求数据，添加 assignment_id
    data = request.data.copy()
    data['assignment_id'] = assignment_id

    serializer = ReviewSubmitSerializer(
        data=data,
        context={'request': request}
    )

    if serializer.is_valid():
        review = serializer.save()
        return Response({
            'message': '评审更新成功',
            'review': ReviewSerializer(review).data
        })

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
