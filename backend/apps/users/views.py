from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import CustomUser
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserProfileUpdateSerializer,
    PasswordChangeSerializer
)


class UserRegistrationView(generics.CreateAPIView):
    """
    用户注册 API
    POST /api/users/register/
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # 评委注册需等待审批，不发放 Token
        if user.pending_approval:
            return Response({
                'message': '评委注册申请已提交，请等待管理员审批后登录',
                'pending_approval': True,
            }, status=status.HTTP_201_CREATED)

        # 选手注册直接发放 Token
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': '注册成功',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    用户登录 API
    POST /api/users/login/
    Body: {"username": "...", "password": "..."}
    """
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': '用户名和密码不能为空'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username, password=password)

    if user is None:
        # 区分：待审批 vs 用户名密码错误
        try:
            inactive_user = CustomUser.objects.get(username=username)
            if inactive_user.pending_approval and inactive_user.check_password(password):
                return Response(
                    {'error': '账号待管理员审批，审批通过后即可登录'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except CustomUser.DoesNotExist:
            pass
        return Response(
            {'error': '用户名或密码错误'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        return Response(
            {'error': '账号已被禁用'},
            status=status.HTTP_403_FORBIDDEN
        )

    # 生成 JWT Token
    refresh = RefreshToken.for_user(user)

    return Response({
        'message': '登录成功',
        'user': UserSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """
    获取当前用户信息
    GET /api/users/me/
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class UserProfileUpdateView(generics.UpdateAPIView):
    """
    更新用户资料
    PUT/PATCH /api/users/profile/
    """
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """
    修改密码
    POST /api/users/change-password/
    """
    serializer = PasswordChangeSerializer(
        data=request.data,
        context={'request': request}
    )

    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response({
            'message': '密码修改成功，请重新登录'
        })

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    用户登出（客户端需删除 Token）
    POST /api/users/logout/
    """
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
    except Exception:
        pass

    return Response({
        'message': '登出成功'
    })
