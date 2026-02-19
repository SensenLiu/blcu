from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'users'

urlpatterns = [
    # 注册和登录
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),

    # Token 刷新
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # 用户信息
    path('me/', views.current_user_view, name='current_user'),
    path('profile/', views.UserProfileUpdateView.as_view(), name='profile_update'),
    path('change-password/', views.change_password_view, name='change_password'),
]
