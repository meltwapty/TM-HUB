from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import AuthenticationFailed
from .models import Function, Member, Course, CourseProgress, Quiz, Question, QuizAttempt, Answer
from .serializers import (FunctionSerializer, MemberSerializer, CourseSerializer,
                          CourseProgressSerializer, QuizSerializer, QuizAttemptSerializer, QuestionAdminSerializer)

# Email-based JWT login
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        email = attrs.get('username')
        password = attrs.get('password')
        try:
            user = Member.objects.get(email__iexact=email)
        except Member.DoesNotExist:
            raise AuthenticationFailed('No account found with this email.')
        if not user.check_password(password):
            raise AuthenticationFailed('Incorrect password.')
        if not user.is_active:
            raise AuthenticationFailed('Account is disabled.')
        refresh = self.get_token(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'function': user.function.code if user.function else None,
                'function_name': user.function.name if user.function else None,
                'is_staff': user.is_staff,
            }
        }

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

class FunctionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Function.objects.all()
    serializer_class = FunctionSerializer
    permission_classes = [permissions.AllowAny]

class MemberViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        # If user is admin (is_staff), show everything in the system
        if user.is_authenticated and user.is_staff:
            return Course.objects.all().order_by('function', 'order')
        # Regular members only see courses for their function
        if user.is_authenticated and user.function:
            return Course.objects.filter(function=user.function).order_by('order')
        return Course.objects.none()

class CourseProgressViewSet(viewsets.ModelViewSet):
    serializer_class = CourseProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CourseProgress.objects.filter(member=self.request.user)

    def create(self, request, *args, **kwargs):
        course_id = request.data.get('course')
        progress = request.data.get('progress_percentage', 0)
        completed = float(progress) >= 100
        obj, created = CourseProgress.objects.update_or_create(
            member=request.user,
            course_id=course_id,
            defaults={'progress_percentage': progress, 'completed': completed}
        )
        return Response(CourseProgressSerializer(obj).data, status=status.HTTP_200_OK)

class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.is_staff:
            return Quiz.objects.all()
        if user.is_authenticated and user.function:
            return Quiz.objects.filter(function=user.function)
        return Quiz.objects.none()

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionAdminSerializer
    permission_classes = [permissions.IsAdminUser]

class QuizAttemptViewSet(viewsets.ModelViewSet):
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return QuizAttempt.objects.filter(member=self.request.user)

    def create(self, request, *args, **kwargs):
        quiz_id = request.data.get('quiz')
        answers_data = request.data.get('answers', [])
        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)

        attempt = QuizAttempt.objects.create(member=request.user, quiz=quiz)
        total_score, max_score = 0.0, 0.0

        for ans in answers_data:
            try:
                question = Question.objects.get(id=ans['question_id'], quiz=quiz)
                is_correct = (question.correct_choice == ans['selected_choice'])
                max_score += question.weight
                if is_correct:
                    total_score += question.weight
                Answer.objects.create(attempt=attempt, question=question,
                                      selected_choice=ans['selected_choice'], is_correct=is_correct)
            except Question.DoesNotExist:
                continue

        attempt.score = total_score
        attempt.max_score = max_score
        attempt.save()
        return Response(QuizAttemptSerializer(attempt).data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def ranking(request):
    members = Member.objects.filter(is_staff=False).select_related('function')
    data = []
    for m in members:
        total_courses = Course.objects.filter(function=m.function).count() if m.function else 0
        completed = CourseProgress.objects.filter(member=m, completed=True).count()
        attempts = QuizAttempt.objects.filter(member=m)
        scores = [a.score / a.max_score * 100 for a in attempts if a.max_score > 0]
        avg = round(sum(scores) / len(scores), 1) if scores else 0
        data.append({
            'id': m.id,
            'name': f"{m.first_name} {m.last_name}".strip() or m.email,
            'function': m.function.code if m.function else '-',
            'courses_completed': completed,
            'total_courses': total_courses,
            'avg_quiz_score': avg,
            'quiz_attempts': attempts.count(),
        })
    data.sort(key=lambda x: (-x['avg_quiz_score'], -x['courses_completed']))
    return Response(data)

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_members(request):
    members = Member.objects.filter(is_staff=False).select_related('function')
    data = []
    for m in members:
        attempts = QuizAttempt.objects.filter(member=m)
        scores = [a.score / a.max_score * 100 for a in attempts if a.max_score > 0]
        avg = round(sum(scores) / len(scores), 1) if scores else 0
        completed = CourseProgress.objects.filter(member=m, completed=True).count()
        data.append({
            'id': m.id,
            'name': f"{m.first_name} {m.last_name}".strip() or m.email,
            'email': m.email,
            'function': m.function.code if m.function else '-',
            'function_name': m.function.name if m.function else '-',
            'courses_completed': completed,
            'quiz_attempts': attempts.count(),
            'avg_score': avg,
        })
    return Response(data)
