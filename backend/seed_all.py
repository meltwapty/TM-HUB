import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tm_hub_backend.settings')
django.setup()

from api.models import Function, Member, Course, Quiz, Question, CourseProgress, QuizAttempt, Answer

print("Clearing existing members, courses, quizzes...")
Answer.objects.all().delete()
QuizAttempt.objects.all().delete()
CourseProgress.objects.all().delete()
Question.objects.all().delete()
Quiz.objects.all().delete()
Course.objects.all().delete()
Member.objects.all().delete()

PASSWORD = "1234567890"
funcs = {f.code: f for f in Function.objects.all()}
print(f"Functions loaded: {list(funcs.keys())}")

def get_func(code):
    mapping = {'ogv':'OGV','ogt':'OGT','igt':'IGT','igv':'IGV','b2b':'B2B','b2c':'B2C',
               'tm':'TM','bd':'BD','f&l':'F&L','cxp':'CXP'}
    return funcs.get(mapping.get(code.lower(), code.upper()))

def make_username(email):
    base = email.split('@')[0].replace('.','_').replace('-','_').lower()
    username = base
    i = 1
    while Member.objects.filter(username=username).exists():
        username = f"{base}{i}"; i += 1
    return username

# Admin
admin = Member.objects.create_superuser(username='admin', email='admin@aiesec.net',
    password=PASSWORD, first_name='Admin', last_name='AIESEC')
print("Created admin")

# VPs
vps = [
    ("Youssef","Alaa","youssefalla@aiesec.net","F&L"),
    ("Arein","Akram","areinakram@aiesec.net","TM"),
    ("Hana","Adel","hanaadel@aiesec.net","BD"),
    ("Mohamed","Waleed","mohamedwaleed@aiesec.net","B2B"),
    ("Youssef","Mostafa","youssefmostafa@aiesec.net","B2C"),
    ("Mohanad","Medhat","mohanadmedhat@aiesec.net","OGV"),
    ("Radwa","Ahmed","radwaahmed@aiesec.net","OGT"),
    ("Abdelrhman","Sayed","abdelrhmansayed@aiesec.net","IGV"),
    ("IGT","VP","igtvp@aiesec.net","IGT"),
]
for first, last, email, fc in vps:
    Member.objects.create_user(username=make_username(email), email=email, password=PASSWORD,
        first_name=first, last_name=last, function=get_func(fc))
    print(f"  VP: {first} {last} [{fc}]")

# Members
members_raw = [
    ("Bassma","","basma.elshafey2003@aiesec.net","B2B"),
    ("Ganna","","Gannahossam@aiesec.net","B2B"),
    ("Nour","Sameh","noursamehh@aiesec.net","B2B"),
    ("Alaa","Zaher","alaazahr@aiesec.net","B2B"),
    ("Jana","Allam","janaallam@aiesec.net","B2B"),
    ("Ahmed","Hosni","ahmed.hossny@aiesec.net","B2B"),
    ("Yasmine","","yasmineabuelmagd@aiesec.net","B2C"),
    ("Mohamed","Ashraf","mohamedashraf01359@aiesec.net","B2C"),
    ("Aliaa","","alyaaessam@aiesec.net","B2C"),
    ("Hala","","halaloly@aiesec.net","B2C"),
    ("Karim","","karimmohamed@aiesec.net","B2C"),
    ("Sondos","","sondosahmed@aiesec.net","B2C"),
    ("Jasmine","","jasminemohamed@aiesec.net","B2C"),
    ("Mazen","","mazenmohammed@aiesec.net","B2C"),
    ("Zamzam","","zamzammuhamed@aiesec.net","B2C"),
    ("Sohila","","suhailawael@aiesec.net","B2C"),
    ("Bassant","","bassantmohamed@aiesec.net","OGV"),
    ("Osama","","osamawalid@aiesec.net","OGV"),
    ("Omar","Mohamed","omarmohamed12@aiesec.net","OGV"),
    ("Abdelshafy","","mohamedabdelshafy@aiesec.net","OGV"),
    ("Yousef","Ahmed","yosefahmed@aiesec.net","OGV"),
    ("Hams","","hamswalid@aiesec.net","OGV"),
    ("Amira","","amiramaher@aiesec.net","OGV"),
    ("Fayrouz","","fayrouzahmed@aiesec.net","OGV"),
    ("Malak","Ghozy","malakghozzy@aiesec.net","OGV"),
    ("El Sheshtawy","","ahmedelshshtawy@aiesec.net","OGV"),
    ("Mohamed","Ayman","mohamed_ayman@aiesec.net","OGV"),
    ("Hytham","","mohamedhitham@aiesec.net","OGV"),
    ("Nada","Ahmed","nadaahmed14@aiesec.net","OGV"),
    ("Malak","Karar","malakkarara@aiesec.net","OGV"),
    ("Rania","Fawzy","Raniahfawzie@aiesec.net","OGV"),
    ("Noureen","","noreenayman@aiesec.net","OGT"),
    ("Kordy","","mohamedayman2@aiesec.net","OGT"),
    ("Marwan","","marwanelsheemy@aiesec.net","OGT"),
    ("Ali","","alihamada@aiesec.net","IGT"),
    ("Jasmine","Elkhatib","jasmineelkhatib@aiesec.net","IGT"),
    ("May","","maisaleh@aiesec.net","IGT"),
    ("Memo","","memoahmed@aiesec.net","IGT"),
    ("Dalia","","daliakhairy@aiesec.net","IGT"),
    ("Sara","","sarahali217@aiesec.net","IGT"),
    ("Moaaz","","muazmohamed@aiesec.net","IGT"),
    ("Rahaf","","rahafferas@aiesec.net","IGV"),
    ("Ahmed","Mohamed","ahmedmohamedd@aiesec.net","IGV"),
    ("Roaa","","roaasaqr@aiesec.net","IGV"),
    ("Laila","Hazem","laylahazem@aiesec.net","IGV"),
    ("Basmala","","basmalamuhammad@aiesec.net","IGV"),
    ("Hanya","","hanya@aiesec.net","IGV"),
    ("Habiba","Maged","habibamaged@aiesec.net","IGV"),
    ("Rawan","Emad","rawanemad@aiesec.net","IGV"),
    ("Rawan","Mohamed","rawanmohamed@aiesec.net","IGV"),
    ("Shaf3y","","ahmedelshafeey@aiesec.net","IGV"),
    ("Farida","","faridamarey@aiesec.net","IGV"),
    ("Jana","Tamer","jana.elhallag@aiesec.net","IGV"),
]
for first, last, email, fc in members_raw:
    Member.objects.create_user(username=make_username(email), email=email.lower(),
        password=PASSWORD, first_name=first, last_name=last, function=get_func(fc))
print(f"Created {len(members_raw)} members")

# ── COURSES ──────────────────────────────────────────────
IMG = {
    'FL':  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    'FL2': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
    'FL3': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    'TM':  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    'TM2': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
    'TM3': 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=80',
    'BD':  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80',
    'BD2': 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80',
    'BD3': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    'B2B': 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
    'B2B2':'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    'B2C': 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&q=80',
    'B2C2':'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80',
    'OGV': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80',
    'OGV2':'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80',
    'OGT': 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=800&q=80',
    'OGT2':'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
    'IGV': 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80',
    'IGV2':'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80',
    'IGT': 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80',
    'IGT2':'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
}

courses_data = [
    # (func_code, title, description, img_key, duration, order)
    ("F&L","F&L 101: Introduction to Finance","Learn the basics of AIESEC financial management.",'FL',30,1),
    ("F&L","Budget Management","How to plan, create, and track function budgets.",'FL2',45,2),
    ("F&L","Financial Records & Reporting","Keeping accurate records and producing reports.",'FL3',40,3),
    ("TM","TM 101: Talent Management Basics","Your introduction to managing and growing talent.",'TM',30,1),
    ("TM","Recruitment Strategies","Modern techniques to attract and select members.",'TM2',50,2),
    ("TM","Member Experience Design","Designing memorable journeys for your members.",'TM3',45,3),
    ("BD","BD 101: Business Development Intro","Foundations of BD in AIESEC.",'BD',30,1),
    ("BD","Partnership Development","How to build and grow strategic partnerships.",'BD2',50,2),
    ("BD","Opportunity Mapping","Finding and qualifying new business opportunities.",'BD3',40,3),
    ("B2B","B2B 101: Corporate Relations","Understanding B2B in the AIESEC context.",'B2B',30,1),
    ("B2B","How to Sell AIESEC","Pitching AIESEC programs to companies effectively.",'B2B2',55,2),
    ("B2B","Client Meetings & Proposals","Running impactful meetings and writing proposals.",'B2B',50,3),
    ("B2C","B2C 101: Marketing Essentials","Core marketing concepts for AIESEC B2C.",'B2C',30,1),
    ("B2C","Campaign Planning & Execution","Building campaigns that convert students.",'B2C2',50,2),
    ("B2C","Social Media Strategy","Growing your audience and driving sign-ups.",'B2C',45,3),
    ("OGV","OGV 101: Volunteer Exchange","Introduction to sending volunteers abroad.",'OGV',30,1),
    ("OGV","How to Match","Finding the right volunteer for the right project.",'OGV2',45,2),
    ("OGV","Pre-departure Support","Preparing volunteers before they travel.",'OGV',40,3),
    ("OGT","OGT 101: Talent Exchange","Sending talent on international internships.",'OGT',30,1),
    ("OGT","Talent Matching Process","Matching talent with global companies.",'OGT2',50,2),
    ("OGT","International Internship Prep","Skills and mindset for working abroad.",'OGT',40,3),
    ("IGV","IGV 101: Incoming Volunteers","Managing incoming volunteer experiences.",'IGV',30,1),
    ("IGV","Volunteer Management","Day-to-day support for hosted volunteers.",'IGV2',45,2),
    ("IGV","Project Hosting Guide","Running successful volunteer projects.",'IGV',50,3),
    ("IGT","IGT 101: Incoming Talent","Hosting international trainees in companies.",'IGT',30,1),
    ("IGT","Trainee Onboarding","Smooth onboarding for international talent.",'IGT2',45,2),
    ("IGT","Company Relations","Maintaining strong host company relationships.",'IGT',40,3),
]

for fc, title, desc, img_key, dur, order in courses_data:
    Course.objects.create(
        title=title, description=desc, file_or_url=IMG[img_key],
        function=get_func(fc), duration=dur, order=order
    )
print(f"Created {len(courses_data)} courses")

# ── QUIZZES & QUESTIONS ───────────────────────────────────
quizzes_data = {
    "F&L": {
        "title": "F&L Knowledge Check",
        "questions": [
            ("Why is budgeting important?","To spend money faster","To track and control spending","To avoid planning","To increase expenses","B"),
            ("What should you do before spending money?","Spend quickly","Ask a friend","Check the budget","Ignore records","C"),
            ("How can you track expenses?","Memory only","Writing them down or using a sheet","Guessing","Ignoring them","B"),
            ("Why keep financial records?","For fun","To forget later","To track and review spending","No reason","C"),
            ("What happens if finances aren't tracked?","Everything improves","No impact","Confusion and loss of control","Faster growth","C"),
        ]
    },
    "TM": {
        "title": "TM Knowledge Check",
        "questions": [
            ("Why is onboarding important?","To confuse members","To help members understand their role","To delay work","To test them","B"),
            ("What motivates team members?","Ignoring them","Clear goals and support","No communication","Pressure only","B"),
            ("How to support a struggling teammate?","Ignore them","Criticize them","Help and guide them","Replace them","C"),
            ("Why set clear goals?","To waste time","To confuse people","To give direction and focus","To avoid work","C"),
            ("Why is feedback important?","To criticize only","To improve performance","To waste time","To avoid communication","B"),
        ]
    },
    "B2B": {
        "title": "B2B Knowledge Check",
        "questions": [
            ("Why contact companies?","For fun","To build partnerships","To waste time","To compete","B"),
            ("Why build relationships with partners?","No reason","For long-term collaboration","To ignore them later","To avoid work","B"),
            ("What attracts companies?","No value","Clear benefits and impact","Random ideas","No communication","B"),
            ("Before a meeting, you should:","Go unprepared","Prepare your proposal","Ignore details","Cancel","B"),
            ("After a meeting, you should:","Forget it","Follow up","Ignore them","Wait forever","B"),
        ]
    },
    "BD": {
        "title": "BD Knowledge Check",
        "questions": [
            ("What is growing partnerships?","Ending them","Building and expanding relationships","Ignoring partners","Avoiding contact","B"),
            ("Why understand partner needs?","To ignore them","To offer better solutions","To confuse them","No reason","B"),
            ("How find opportunities?","Wait only","Research and outreach","Ignore market","Guess","B"),
            ("What makes partnership successful?","No communication","Mutual benefit","One-sided gain","No planning","B"),
            ("Why maintain relationships?","No reason","For long-term success","To end quickly","To avoid effort","B"),
        ]
    },
    "OGV": {
        "title": "OGV Knowledge Check",
        "questions": [
            ("Why join volunteer exchange?","To waste time","To create impact and learn","To avoid work","To travel only","B"),
            ("Before matching, check:","Nothing","Profile and project fit","Random choice","Ignore details","B"),
            ("How support before travel?","Ignore them","Guide and prepare them","Delay them","Cancel","B"),
            ("Why cultural understanding matters?","No reason","Helps adapt better","To avoid people","To judge others","B"),
            ("What makes experience successful?","No preparation","Good support and matching","Confusion","No communication","B"),
        ]
    },
    "OGT": {
        "title": "OGT Knowledge Check",
        "questions": [
            ("Why apply for internships abroad?","To waste time","To gain experience","To avoid work","No reason","B"),
            ("Important skills?","No skills","Communication and adaptability","Ignoring tasks","Sleeping","B"),
            ("How prepare someone?","Ignore them","Train and guide them","Delay","Cancel","B"),
            ("Why communication matters?","No reason","To avoid misunderstandings","To confuse","To delay","B"),
            ("Challenge abroad?","Nothing","Cultural differences","No issues","Easy always","B"),
        ]
    },
    "B2C": {
        "title": "B2C Knowledge Check",
        "questions": [
            ("Why understand your audience?","No reason","To target better","To confuse","To ignore","B"),
            ("What makes a campaign attractive?","No message","Clear and engaging content","Confusion","No design","B"),
            ("Social media helps by:","Doing nothing","Promoting opportunities","Ignoring users","Blocking people","B"),
            ("Why do people sign up?","No reason","Clear value and benefits","Confusion","Pressure","B"),
            ("Why clear messaging?","To confuse","To communicate value clearly","To waste time","To avoid users","B"),
        ]
    },
    "IGV": {
        "title": "IGV Knowledge Check",
        "questions": [
            ("Why volunteers come?","No reason","To contribute and learn","To waste time","To avoid work","B"),
            ("How make them feel welcome?","Ignore them","Support and communicate","Leave them","Avoid contact","B"),
            ("Important in project?","No planning","Organization and clarity","Confusion","Delay","B"),
            ("Why communication matters?","No reason","To avoid problems","To confuse","To delay","B"),
            ("What makes them recommend it?","Bad experience","Good support and impact","No communication","Confusion","B"),
        ]
    },
    "IGT": {
        "title": "IGT Knowledge Check",
        "questions": [
            ("Why companies hire international talent?","No reason","To gain skills and diversity","To waste money","To avoid work","B"),
            ("How support trainee?","Ignore","Help with onboarding","Delay","Avoid","B"),
            ("Challenge for trainee?","Nothing","Cultural adaptation","No issues","Easy always","B"),
            ("Why onboarding matters?","No reason","Helps them adapt faster","To confuse","To delay","B"),
            ("Good experience means:","Problems","Satisfaction for both sides","Confusion","No communication","B"),
        ]
    },
}

for func_code, quiz_info in quizzes_data.items():
    f = get_func(func_code)
    quiz = Quiz.objects.create(title=quiz_info["title"], function=f)
    for i, (text, a, b, c, d, correct) in enumerate(quiz_info["questions"], 1):
        Question.objects.create(quiz=quiz, text=text, choice_a=a, choice_b=b,
                                choice_c=c, choice_d=d, correct_choice=correct, weight=1.0)
    print(f"  Quiz: {quiz_info['title']}")

print("All seeding complete!")
