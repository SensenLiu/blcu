from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser


class UserRegistrationSerializer(serializers.ModelSerializer):
    """用户注册序列化器"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = CustomUser
        fields = (
            'username', 'email', 'password', 'password_confirm',
            'full_name', 'phone', 'organization'
        )
        extra_kwargs = {
            'email': {'required': True},
        }

    def validate(self, attrs):
        """验证密码一致性"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "两次密码不一致"})
        return attrs

    def create(self, validated_data):
        """创建用户"""
        validated_data.pop('password_confirm')
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name', ''),
            phone=validated_data.get('phone', ''),
            organization=validated_data.get('organization', ''),
            role='contestant'  # 默认注册为参赛选手
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """用户信息序列化器"""
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'email', 'role', 'role_display',
            'full_name', 'phone', 'organization',
            'is_active', 'date_joined', 'last_login'
        )
        read_only_fields = ('id', 'username', 'role', 'date_joined', 'last_login')


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """用户资料更新序列化器"""
    class Meta:
        model = CustomUser
        fields = ('full_name', 'phone', 'organization', 'email')

    def validate_email(self, value):
        """验证邮箱唯一性"""
        user = self.context['request'].user
        if CustomUser.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("该邮箱已被使用")
        return value


class PasswordChangeSerializer(serializers.Serializer):
    """密码修改序列化器"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        """验证新密码一致性"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "两次密码不一致"})
        return attrs

    def validate_old_password(self, value):
        """验证旧密码正确性"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("原密码错误")
        return value
