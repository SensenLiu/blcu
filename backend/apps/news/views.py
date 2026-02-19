from rest_framework import generics, filters, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Article
from .serializers import (
    ArticleListSerializer,
    ArticleDetailSerializer,
    ArticleCreateUpdateSerializer
)


class IsAdminOrReadOnly(permissions.BasePermission):
    """只有管理员可以创建/编辑，其他人只读"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.is_admin_user


class ArticleListView(generics.ListCreateAPIView):
    """
    新闻列表 API
    GET /api/news/ - 获取新闻列表（支持分页、搜索、分类筛选）
    POST /api/news/ - 创建新闻（仅管理员）
    """
    queryset = Article.objects.filter(is_published=True)
    serializer_class = ArticleListSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['title', 'summary', 'content']
    ordering_fields = ['publish_date', 'view_count', 'created_at']
    ordering = ['-publish_date']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ArticleCreateUpdateSerializer
        return ArticleListSerializer


class ArticleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    新闻详情 API
    GET /api/news/{id}/ - 获取新闻详情
    PUT/PATCH /api/news/{id}/ - 更新新闻（仅管理员）
    DELETE /api/news/{id}/ - 删除新闻（仅管理员）
    """
    queryset = Article.objects.filter(is_published=True)
    serializer_class = ArticleDetailSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ArticleCreateUpdateSerializer
        return ArticleDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        """获取详情时增加浏览次数"""
        instance = self.get_object()
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def article_categories_view(request):
    """
    获取新闻分类列表
    GET /api/news/categories/
    """
    categories = [
        {'value': choice[0], 'label': choice[1]}
        for choice in Article.CATEGORY_CHOICES
    ]
    return Response(categories)
