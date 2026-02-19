from rest_framework import serializers
from django.utils import timezone
from .models import ScoreDimension, Assignment, Score, Review
from apps.contests.serializers import SubmissionDetailSerializer


class ScoreDimensionSerializer(serializers.ModelSerializer):
    """评分维度序列化器"""
    class Meta:
        model = ScoreDimension
        fields = ('id', 'name', 'description', 'max_score', 'weight', 'sort_order')


class ScoreSerializer(serializers.ModelSerializer):
    """评分序列化器"""
    dimension_name = serializers.CharField(source='dimension.name', read_only=True)
    max_score = serializers.IntegerField(source='dimension.max_score', read_only=True)

    class Meta:
        model = Score
        fields = ('id', 'dimension', 'dimension_name', 'max_score', 'score')


class AssignmentListSerializer(serializers.ModelSerializer):
    """评审分配列表序列化器"""
    submission = SubmissionDetailSerializer(read_only=True)
    has_review = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = ('id', 'submission', 'assigned_at', 'is_completed', 'has_review')

    def get_has_review(self, obj):
        """是否已提交评审"""
        return hasattr(obj, 'review') and obj.review.submitted_at is not None


class ReviewSerializer(serializers.ModelSerializer):
    """评审意见序列化器"""
    scores = ScoreSerializer(source='assignment.scores', many=True, read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'comment', 'total_score', 'scores', 'submitted_at', 'created_at', 'updated_at')
        read_only_fields = ('total_score', 'submitted_at')


class ReviewSubmitSerializer(serializers.Serializer):
    """评审提交序列化器"""
    assignment_id = serializers.IntegerField()
    scores = serializers.ListField(
        child=serializers.DictField(),
        help_text='评分列表，格式：[{"dimension": 1, "score": 85.5}, ...]'
    )
    comment = serializers.CharField(required=False, allow_blank=True)

    def validate_assignment_id(self, value):
        """验证评审分配是否存在且属于当前评委"""
        user = self.context['request'].user
        try:
            assignment = Assignment.objects.get(id=value, judge=user)
        except Assignment.DoesNotExist:
            raise serializers.ValidationError("评审分配不存在或无权访问")
        return value

    def validate_scores(self, value):
        """验证评分数据"""
        if not value:
            raise serializers.ValidationError("评分不能为空")

        for score_data in value:
            if 'dimension' not in score_data or 'score' not in score_data:
                raise serializers.ValidationError("评分数据格式错误")

            try:
                dimension = ScoreDimension.objects.get(id=score_data['dimension'])
            except ScoreDimension.DoesNotExist:
                raise serializers.ValidationError(f"评分维度 {score_data['dimension']} 不存在")

            score = float(score_data['score'])
            if score < 0 or score > dimension.max_score:
                raise serializers.ValidationError(
                    f"{dimension.name} 分数必须在 0 到 {dimension.max_score} 之间"
                )

        return value

    def save(self):
        """保存评审"""
        assignment_id = self.validated_data['assignment_id']
        scores_data = self.validated_data['scores']
        comment = self.validated_data.get('comment', '')

        assignment = Assignment.objects.get(id=assignment_id)

        # 删除旧评分
        Score.objects.filter(assignment=assignment).delete()

        # 创建新评分
        for score_data in scores_data:
            Score.objects.create(
                assignment=assignment,
                dimension_id=score_data['dimension'],
                score=score_data['score']
            )

        # 创建或更新评审意见
        review, created = Review.objects.get_or_create(
            assignment=assignment,
            defaults={'comment': comment}
        )

        if not created:
            review.comment = comment

        # 计算总分
        review.total_score = review.calculate_total_score()
        review.submitted_at = timezone.now()
        review.save()

        # 标记评审完成
        assignment.is_completed = True
        assignment.save()

        return review
