import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { authAxios } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAxios.get(`/quizzes/${quizId}/`).then(r => { setQuiz(r.data); setLoading(false); });
  }, [quizId]);

  if (loading) return (
    <div className="min-h-screen bg-aiesec-light flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-aiesec-blue border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!quiz) return null;

  const questions = quiz.questions || [];
  const q = questions[current];
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;

  const handleSelect = (choice) => {
    if (!submitted) setAnswers(prev => ({ ...prev, [q.id]: choice }));
  };

  const handleSubmit = async () => {
    const answerList = Object.entries(answers).map(([qId, choice]) => ({
      question_id: parseInt(qId), selected_choice: choice
    }));
    const res = await authAxios.post('/quiz-attempts/', { quiz: quiz.id, answers: answerList });
    setResult(res.data);
    setSubmitted(true);
  };

  const scorePercent = result && result.max_score > 0
    ? Math.round((result.score / result.max_score) * 100) : 0;

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-aiesec-light flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-3xl p-10 shadow-xl text-center">
            <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${scorePercent >= 60 ? 'bg-green-50' : 'bg-red-50'}`}>
              {scorePercent >= 60
                ? <Trophy size={48} className="text-green-500" />
                : <XCircle size={48} className="text-red-400" />}
            </div>
            <h2 className="text-5xl font-black mb-2 bg-impact-gradient bg-clip-text text-transparent">{scorePercent}%</h2>
            <p className="text-2xl font-bold text-gray-800 mb-2">
              {scorePercent >= 80 ? 'Excellent! 🎉' : scorePercent >= 60 ? 'Good Job! 👍' : 'Keep Practicing 💪'}
            </p>
            <p className="text-gray-500 mb-2">{quiz.title}</p>
            <p className="text-gray-400 text-sm mb-8">You scored {result.score} out of {result.max_score} points</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/dashboard/quizzes')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                <ChevronLeft size={18} /> Back to Quizzes
              </button>
              <button onClick={() => { setSubmitted(false); setResult(null); setAnswers({}); setCurrent(0); }}
                className="px-6 py-3 rounded-xl bg-impact-gradient text-white font-bold shadow-md hover:shadow-lg transition-all">
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aiesec-light">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate('/dashboard/quizzes')}
          className="flex items-center gap-2 text-gray-600 hover:text-aiesec-blue font-semibold transition-colors">
          <ChevronLeft size={20} /> Back
        </button>
        <div className="text-center">
          <h2 className="font-bold text-gray-800">{quiz.title}</h2>
          <p className="text-xs text-gray-500">{answeredCount} / {totalQ} answered</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={answeredCount < totalQ}
          className="bg-aiesec-blue text-white font-bold px-5 py-2 rounded-xl disabled:opacity-40 hover:bg-blue-600 transition-colors text-sm">
          Submit
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-200">
        <div className="h-1.5 bg-impact-gradient transition-all duration-500"
          style={{ width: `${(answeredCount / totalQ) * 100}%` }}></div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Question counter */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm font-bold text-aiesec-blue bg-blue-50 px-3 py-1 rounded-full">
            Question {current + 1} of {totalQ}
          </span>
          <div className="flex gap-2">
            {questions.map((_, idx) => (
              <button key={idx} onClick={() => setCurrent(idx)}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  answers[questions[idx].id]
                    ? 'bg-aiesec-blue text-white'
                    : idx === current
                    ? 'bg-blue-100 text-aiesec-blue border-2 border-aiesec-blue'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-8 leading-relaxed">{q.text}</h3>
          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map(choice => (
              <button key={choice} onClick={() => handleSelect(choice)}
                className={`w-full text-left px-5 py-4 rounded-2xl font-medium transition-all border-2 flex items-center gap-4 ${
                  answers[q.id] === choice
                    ? 'bg-aiesec-blue text-white border-aiesec-blue shadow-lg shadow-blue-500/20'
                    : 'bg-gray-50 text-gray-700 border-transparent hover:border-aiesec-blue hover:bg-blue-50 hover:text-aiesec-blue'
                }`}>
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                  answers[q.id] === choice ? 'bg-white/20 text-white' : 'bg-white text-gray-500 shadow-sm'
                }`}>{choice}</span>
                {q[`choice_${choice.toLowerCase()}`]}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-40">
            <ChevronLeft size={18} /> Previous
          </button>
          {current < totalQ - 1 ? (
            <button onClick={() => setCurrent(c => Math.min(totalQ - 1, c + 1))}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-aiesec-blue text-white font-bold hover:bg-blue-600 transition-colors shadow-md">
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={answeredCount < totalQ}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-impact-gradient text-white font-bold disabled:opacity-40 shadow-md hover:shadow-lg transition-all">
              Submit Quiz <CheckCircle size={18} />
            </button>
          )}
        </div>
      </div>
      <footer className="p-10 text-center border-t border-gray-100 bg-white/50 mt-10">
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Mohamed Eltwapty - IM</p>
      </footer>
    </div>
  );
};

export default QuizPage;
