from django.db import models
from django.contrib.auth.models import AbstractUser

class Function(models.Model):
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=10, unique=True) # e.g., oGV, TM

    def __str__(self):
        return self.name

class Member(AbstractUser):
    expa_id = models.CharField(max_length=50, blank=True, null=True)
    function = models.ForeignKey(Function, on_delete=models.SET_NULL, null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)

    def __str__(self):
        return self.username

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    thumbnail = models.CharField(max_length=500, blank=True)   # Card image URL
    file_or_url = models.CharField(max_length=500, blank=True) # Legacy / kept for compat
    video_url = models.CharField(max_length=500, blank=True)   # YouTube / Drive video
    pdf_url = models.CharField(max_length=500, blank=True)     # PDF / Doc link
    notes = models.TextField(blank=True)                        # Rich text notes/content
    function = models.ForeignKey(Function, on_delete=models.CASCADE, related_name='courses')
    duration = models.IntegerField(help_text="Duration in minutes", default=0)
    order = models.IntegerField(default=0)

    def __str__(self):
        return self.title


class CourseProgress(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='course_progress')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    progress_percentage = models.FloatField(default=0.0)

    class Meta:
        unique_together = ('member', 'course')

    def __str__(self):
        return f"{self.member.username} - {self.course.title} ({self.progress_percentage}%)"

class Quiz(models.Model):
    title = models.CharField(max_length=255)
    function = models.ForeignKey(Function, on_delete=models.CASCADE, related_name='quizzes')
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.title

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    choice_a = models.CharField(max_length=255)
    choice_b = models.CharField(max_length=255)
    choice_c = models.CharField(max_length=255)
    choice_d = models.CharField(max_length=255)
    correct_choice = models.CharField(max_length=1, choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')])
    weight = models.FloatField(default=1.0)

    def __str__(self):
        return self.text

class QuizAttempt(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.FloatField(default=0.0)
    max_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.member.username} - {self.quiz.title} - {self.score}"

class Answer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_choice = models.CharField(max_length=1, choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')])
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.attempt} - {self.question.id}"
