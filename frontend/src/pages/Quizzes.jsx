import React, { useEffect, useState } from 'react';
import { FileQuestion, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Quizzes = () => {
  const { authAxios } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([authAxios.get('/quizzes/'), authAxios.get('/quiz-attempts/')])
      .then(([qr, ar]) => { setQuizzes(qr.data); setAttempts(ar.data); })
      .finally(() => setLoading(false));
  }, []);

  const getAttempt = (qId) => attempts.find(a => a.quiz === qId);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-aiesec-blue border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="pb-10">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-aiesec-dark mb-2">Test Your Knowledge</h1>
        <p className="text-gray-500">Evaluate your understanding and track your scores.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map(quiz => {
          const attempt = getAttempt(quiz.id);
          const score = attempt && attempt.max_score > 0
            ? Math.round((attempt.score / attempt.max_score) * 100) : null;
          return (
            <div key={quiz.id}
              className={`bg-white rounded-2xl p-7 shadow-sm border card-hover border-l-4 cursor-pointer ${attempt ? 'border-l-green-500 border-gray-100' : 'border-l-aiesec-blue border-gray-100'}`}
              onClick={() => navigate(`/quiz/${quiz.id}`)}>
              <div className="flex justify-between items-start mb-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${attempt ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-aiesec-blue'}`}>
                  {attempt ? <CheckCircle size={28} /> : <FileQuestion size={28} />}
                </div>
                {score !== null && (
                  <div className={`font-black text-2xl px-4 py-2 rounded-xl ${score >= 60 ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                    {score}%
                  </div>
                )}
              </div>
              <h3 className="font-bold text-xl text-gray-800 mb-2">{quiz.title}</h3>
              <div className="flex items-center gap-5 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1"><FileQuestion size={15} /> {quiz.questions?.length} Questions</span>
                <span className="flex items-center gap-1"><Clock size={15} /> ~{(quiz.questions?.length || 5) * 2}m</span>
              </div>
              <button
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all pointer-events-none ${
                  attempt
                    ? 'bg-gray-50 text-gray-700'
                    : 'bg-impact-gradient text-white shadow-lg shadow-blue-500/30'
                }`}>
                {attempt ? 'Retake Quiz →' : 'Start Quiz →'}
              </button>
            </div>
          );
        })}
        {quizzes.length === 0 && (
          <p className="col-span-2 text-center text-gray-400 py-16">No quizzes assigned to your function yet.</p>
        )}
      </div>
    </div>
  );
};

export default Quizzes;
