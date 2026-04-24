import React, { useEffect, useState } from 'react';
import { BookOpen, Target, Zap, Award, Trophy, Medal, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Progress = () => {
  const { user, authAxios } = useAuth();
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterFunc, setFilterFunc] = useState('ALL');

  useEffect(() => {
    Promise.all([
      authAxios.get('/courses/'),
      authAxios.get('/course-progress/'),
      authAxios.get('/quiz-attempts/'),
      authAxios.get('/ranking/'),
      authAxios.get('/functions/'),
    ]).then(([cr, pr, ar, rr, fr]) => {
      setCourses(cr.data); setProgress(pr.data); setAttempts(ar.data); setRanking(rr.data); setFunctions(fr.data);
    }).finally(() => setLoading(false));
  }, []);

  const completedCount = progress.filter(p => p.completed).length;
  const scores = attempts.filter(a => a.max_score > 0).map(a => (a.score / a.max_score) * 100);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const filteredRanking = filterFunc === 'ALL' ? ranking : ranking.filter(r => r.function === filterFunc);
  const myRank = ranking.findIndex(r => r.id === user?.id) + 1;

  const funcColors = {
    'TM': 'bg-blue-100 text-blue-700', 'B2B': 'bg-green-100 text-green-700',
    'B2C': 'bg-pink-100 text-pink-700', 'OGV': 'bg-orange-100 text-orange-700',
    'OGT': 'bg-yellow-100 text-yellow-800', 'IGV': 'bg-teal-100 text-teal-700',
    'IGT': 'bg-purple-100 text-purple-700', 'BD': 'bg-indigo-100 text-indigo-700',
    'F&L': 'bg-red-100 text-red-700', 'CXP': 'bg-cyan-100 text-cyan-700',
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-aiesec-blue border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="pb-10">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-aiesec-dark mb-2">Performance Center</h1>
        <p className="text-gray-500">Analyze your growth and compete with the network.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-aiesec-blue flex items-center justify-center mb-3"><BookOpen size={20} /></div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Courses Done</p>
          <h3 className="text-2xl font-black text-gray-800">{completedCount} <span className="text-base text-gray-300 font-bold">/ {courses.length}</span></h3>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center mb-3"><Target size={20} /></div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Avg Score</p>
          <h3 className="text-2xl font-black text-gray-800">{avgScore}%</h3>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-aiesec-orange flex items-center justify-center mb-3"><Award size={20} /></div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Attempts</p>
          <h3 className="text-2xl font-black text-gray-800">{attempts.length}</h3>
        </div>
        <div className="bg-impact-gradient rounded-2xl p-5 shadow-lg text-white relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-20 transition-transform group-hover:scale-110"><Trophy size={120} /></div>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3"><Trophy size={20} /></div>
          <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Your Rank</p>
          <h3 className="text-2xl font-black">{myRank > 0 ? `#${myRank}` : '--'}</h3>
        </div>
      </div>

      {/* Ranking Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-xl text-aiesec-orange"><Trophy size={22} /></div>
            <div>
              <h3 className="text-xl font-black text-gray-800">Global Leaderboard</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{filteredRanking.length} Members Loaded</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
            <Filter size={14} className="text-gray-400" />
            <select value={filterFunc} onChange={e => setFilterFunc(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-gray-600 focus:ring-0 cursor-pointer">
              <option value="ALL">ALL FUNCTIONS</option>
              {functions.map(f => <option key={f.id} value={f.code}>{f.name.toUpperCase()}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Rank</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Member</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Function</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Courses</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRanking.map((member, idx) => {
                const isMe = member.id === user?.id;
                const overallIndex = ranking.findIndex(r => r.id === member.id);
                const rankDisplay = overallIndex === 0 ? '🥇' : overallIndex === 1 ? '🥈' : overallIndex === 2 ? '🥉' : `#${overallIndex + 1}`;
                return (
                  <tr key={member.id} className={`transition-all ${isMe ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'}`}>
                    <td className="px-6 py-5 text-sm font-black text-gray-800">{rankDisplay}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-impact-gradient flex items-center justify-center text-white text-xs font-black shadow-sm">
                          {member.name?.[0]}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${isMe ? 'text-aiesec-blue' : 'text-gray-800'}`}>{member.name} {isMe && '⭐'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${funcColors[member.function] || 'bg-gray-100 text-gray-600'}`}>
                        {member.function}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center text-sm font-bold text-gray-700">{member.courses_completed}</td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-sm font-black ${member.avg_quiz_score >= 80 ? 'text-green-500' : member.avg_quiz_score >= 60 ? 'text-aiesec-blue' : member.avg_quiz_score > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                          {member.avg_quiz_score > 0 ? `${member.avg_quiz_score}%` : '—'}
                        </span>
                        <div className="w-12 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                           <div className={`h-full ${member.avg_quiz_score >= 80 ? 'bg-green-500' : 'bg-aiesec-blue'}`} style={{ width: `${member.avg_quiz_score}%` }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredRanking.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-gray-400 italic text-sm">No members found in this function.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Progress;
