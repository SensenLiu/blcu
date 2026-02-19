from django.urls import path
from . import views

app_name = 'reviews'

urlpatterns = [
    # 评审任务
    path('my-assignments/', views.MyAssignmentsView.as_view(), name='my_assignments'),
    path('assignments/<int:pk>/', views.AssignmentDetailView.as_view(), name='assignment_detail'),

    # 评分维度
    path('contests/<int:contest_id>/dimensions/', views.score_dimensions_view, name='score_dimensions'),

    # 评审提交
    path('submit/', views.submit_review_view, name='submit_review'),
    path('assignments/<int:assignment_id>/review/', views.my_review_view, name='my_review'),
    path('assignments/<int:assignment_id>/review/update/', views.update_review_view, name='update_review'),
]
