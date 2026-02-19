from rest_framework import serializers
from .models import Article
from apps.users.serializers import UserSerializer


class ArticleListSerializer(serializers.ModelSerializer):
    """新闻列表序列化器（简化版）"""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    author_name = serializers.CharField(source='author.full_name', read_only=True)

    class Meta:
        model = Article
        fields = (
            'id', 'title', 'summary', 'cover_image',
            'category', 'category_display', 'author_name',
            'view_count', 'publish_date', 'created_at'
        )


class ArticleDetailSerializer(serializers.ModelSerializer):
    """新闻详情序列化器（完整版）"""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    author = UserSerializer(read_only=True)

    class Meta:
        model = Article
        fields = (
            'id', 'title', 'summary', 'content', 'cover_image',
            'category', 'category_display', 'author',
            'view_count', 'is_published', 'publish_date',
            'created_at', 'updated_at'
        )


class ArticleCreateUpdateSerializer(serializers.ModelSerializer):
    """新闻创建/更新序列化器"""
    class Meta:
        model = Article
        fields = (
            'title', 'summary', 'content', 'cover_image',
            'category', 'is_published'
        )

    def create(self, validated_data):
        """创建新闻，自动设置作者"""
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
