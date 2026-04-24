from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (FunctionViewSet, MemberViewSet, CourseViewSet,
                    CourseProgressViewSet, QuizViewSet, QuestionViewSet,
                    QuizAttemptViewSet, EmailTokenObtainPairView,
                    ranking, admin_members)

router = DefaultRouter()
router.register(r'functions', FunctionViewSet)
router.register(r'members', MemberViewSet)
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'course-progress', CourseProgressViewSet, basename='courseprogress')
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'quiz-attempts', QuizAttemptViewSet, basename='quizattempt')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('ranking/', ranking, name='ranking'),
    path('admin/members/', admin_members, name='admin_members'),
]
