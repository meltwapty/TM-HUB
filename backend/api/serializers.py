from rest_framework import serializers
from .models import Function, Member, Course, CourseProgress, Quiz, Question, QuizAttempt, Answer

class FunctionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Function
        fields = '__all__'

class MemberSerializer(serializers.ModelSerializer):
    function = FunctionSerializer(read_only=True)
    class Meta:
        model = Member
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'expa_id', 'function', 'profile_picture']

class CourseSerializer(serializers.ModelSerializer):
    function_name = serializers.CharField(source='function.name', read_only=True)
    function_code = serializers.CharField(source='function.code', read_only=True)
    class Meta:
        model = Course
        fields = ['id','title','description','thumbnail','file_or_url','video_url',
                  'pdf_url','notes','function','function_name','function_code','duration','order']

class CourseProgressSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    class Meta:
        model = CourseProgress
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'choice_a', 'choice_b', 'choice_c', 'choice_d']

class QuestionAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    function_name = serializers.CharField(source='function.name', read_only=True)
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'function', 'function_name', 'course', 'questions']

class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    class Meta:
        model = QuizAttempt
        fields = '__all__'
