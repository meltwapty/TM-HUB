# TM-HUB
# 🎓 TM HUB - AIESEC Performance & Education Center

TM HUB is a comprehensive educational platform designed for AIESEC members to track their performance, complete function-specific courses, and compete on a global leaderboard.

---

## 🔐 Access Credentials

The following accounts have been pre-configured for testing. The default password for all accounts is **`1234567890`**.

| Name | Username / Email | Role | Function |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@aiesec.net` | Superuser | All |
| **Youssef Alaa** | `youssefalla@aiesec.net` | VP | F&L |
| **Arein Akram** | `areinakram@aiesec.net` | VP | TM |
| **Mohamed Waleed** | `mohamedwaleed@aiesec.net` | VP | B2B |
| **Mohanad Medhat** | `mohanadmedhat@aiesec.net` | VP | OGV |

---

## 🚀 Features

- **Interactive Courses**: Function-specific learning paths (TM, F&L, B2B, etc.) with video and PDF support.
- **Quiz System**: Knowledge checks after every course with automatic scoring.
- **Global Leaderboard**: Real-time ranking of members based on course completion and quiz performance.
- **Performance Center**: Personal stats dashboard showing average scores, attempts, and rank.
- **Admin Portal**: Full control over members, courses, and quiz content.
- **Secure Auth**: JWT-based authentication with automatic token refreshing.

---

## 📊 Data Model

- **Member**: Custom user model extending `AbstractUser` with `expa_id`, `function`, and `profile_picture`.
- **Function**: Organizational units (e.g., TM, OGV, B2B).
- **Course**: Educational content linked to functions, including descriptions, thumbnails, and media links.
- **Quiz / Question**: Multi-choice assessment system linked to courses.
- **QuizAttempt / Answer**: Tracking of member performance and specific answers.
- **CourseProgress**: Real-time tracking of completion percentage for each member.

---

## 🛠️ How to Run Locally

### Prerequisites
- Python 3.10+
- Node.js & npm

### 1. Backend Setup
```bash
cd backend
# Create virtual environment
python -m venv venv
source venv/Scripts/activate # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations & seed data
python manage.py migrate
python seed_all.py

# Start server
python manage.py runserver
```

### 2. Frontend Setup
```bash
cd frontend
# Install dependencies
npm install

# Start development server
npm run dev
```
