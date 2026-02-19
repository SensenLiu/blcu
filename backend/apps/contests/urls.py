from django.urls import path
from . import views

app_name = 'contests'

urlpatterns = [
    # 竞赛
    path('', views.ContestListView.as_view(), name='contest_list'),
    path('<int:pk>/', views.ContestDetailView.as_view(), name='contest_detail'),
    path('<int:contest_id>/categories/', views.CategoryListView.as_view(), name='category_list'),

    # 作品提交
    path('submissions/', views.SubmissionCreateView.as_view(), name='submission_create'),
    path('my-submissions/', views.MySubmissionsView.as_view(), name='my_submissions'),
    path('submissions/<int:pk>/', views.SubmissionDetailView.as_view(), name='submission_detail'),
    path('submissions/<int:submission_id>/download/', views.download_submission_file, name='submission_download'),
]
