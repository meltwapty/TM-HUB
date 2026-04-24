import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Quizzes from './pages/Quizzes';
import Progress from './pages/Progress';
import AdminPortal from './pages/AdminPortal';
import QuizPage from './pages/QuizPage';
import CoursePage from './pages/CoursePage';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !user.is_staff) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Full-page routes (no sidebar) */}
        <Route path="/quiz/:quizId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
        <Route path="/course/:courseId" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />

        {/* Dashboard with sidebar */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="progress" element={<Progress />} />
        </Route>

        {/* Admin portal with sidebar */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<AdminPortal />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
