from rest_framework import serializers
from .models import Contest, Category, Submission
import os


class CategorySerializer(serializers.ModelSerializer):
    """竞赛组别序列化器"""
    allowed_formats_list = serializers.ListField(
        source='get_allowed_formats_list',
        read_only=True
    )

    class Meta:
        model = Category
        fields = (
            'id', 'name', 'description', 'max_file_size_mb',
            'allowed_formats', 'allowed_formats_list'
        )


class ContestListSerializer(serializers.ModelSerializer):
    """竞赛列表序列化器"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_open = serializers.BooleanField(read_only=True)

    class Meta:
        model = Contest
        fields = (
            'id', 'name', 'description', 'status', 'status_display',
            'start_date', 'submission_deadline', 'is_open'
        )


class ContestDetailSerializer(serializers.ModelSerializer):
    """竞赛详情序列化器"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    is_open = serializers.BooleanField(read_only=True)
    is_submission_closed = serializers.BooleanField(read_only=True)

    class Meta:
        model = Contest
        fields = (
            'id', 'name', 'description', 'status', 'status_display',
            'start_date', 'submission_deadline', 'review_deadline',
            'is_open', 'is_submission_closed', 'categories',
            'created_at', 'updated_at'
        )


class SubmissionListSerializer(serializers.ModelSerializer):
    """作品列表序列化器"""
    contest_name = serializers.CharField(source='contest.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    contestant_name = serializers.CharField(source='contestant.full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Submission
        fields = (
            'id', 'submission_number', 'work_title', 'contest_name',
            'category_name', 'contestant_name', 'status', 'status_display',
            'submitted_at', 'created_at'
        )


class SubmissionDetailSerializer(serializers.ModelSerializer):
    """作品详情序列化器"""
    contest = ContestListSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    contestant_name = serializers.CharField(source='contestant.full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Submission
        fields = (
            'id', 'submission_number', 'work_title', 'work_description',
            'contest', 'category', 'contestant_name', 'file_url',
            'file_name', 'file_size_kb', 'status', 'status_display',
            'submitted_at', 'created_at', 'updated_at'
        )

    def get_file_url(self, obj):
        """获取文件 URL"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class SubmissionCreateSerializer(serializers.ModelSerializer):
    """作品提交序列化器"""
    class Meta:
        model = Submission
        fields = (
            'contest', 'category', 'work_title', 'work_description', 'file'
        )

    def validate(self, attrs):
        """验证提交信息"""
        contest = attrs['contest']
        category = attrs['category']
        file = attrs.get('file')

        # 验证组别属于该竞赛
        if category.contest != contest:
            raise serializers.ValidationError({
                'category': '所选组别不属于该竞赛'
            })

        # 验证竞赛是否开放
        if not contest.is_open:
            raise serializers.ValidationError({
                'contest': '该竞赛未开放或已截止'
            })

        # 验证文件格式
        if file:
            ext = os.path.splitext(file.name)[1][1:].lower()
            allowed_formats = category.get_allowed_formats_list()
            if ext not in allowed_formats:
                raise serializers.ValidationError({
                    'file': f'不支持的文件格式。允许的格式：{", ".join(allowed_formats)}'
                })

            # 验证文件大小
            max_size = category.max_file_size_mb * 1024 * 1024
            if file.size > max_size:
                raise serializers.ValidationError({
                    'file': f'文件过大。最大允许 {category.max_file_size_mb}MB'
                })

        return attrs

    def create(self, validated_data):
        """创建作品提交"""
        file = validated_data.get('file')

        submission = Submission.objects.create(
            contest=validated_data['contest'],
            category=validated_data['category'],
            contestant=self.context['request'].user,
            work_title=validated_data['work_title'],
            work_description=validated_data.get('work_description', ''),
            file=file,
            file_name=file.name,
            file_size_kb=file.size // 1024,
            status='submitted'  # 直接设为已提交
        )

        return submission
