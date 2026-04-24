from django.contrib import admin
from .models import Function, Member, Course, CourseProgress, Quiz, Question, QuizAttempt, Answer

admin.site.register(Function)
admin.site.register(Member)
admin.site.register(Course)
admin.site.register(CourseProgress)
admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(QuizAttempt)
admin.site.register(Answer)
