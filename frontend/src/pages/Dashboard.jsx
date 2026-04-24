import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, Award, FileQuestion, ChevronRight, BookOpen, Target, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, authAxios } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [progress, setProgress] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      authAxios.get('/courses/'),
      authAxios.get('/quizzes/'),
      authAxios.get('/course-progress/'),
      authAxios.get('/quiz-attempts/'),
    ]).then(([cr, qr, pr, ar]) => {
      setCourses(cr.data);
      setQuizzes(qr.data);
      setProgress(pr.data);
      setAttempts(ar.data);
    }).catch(err => console.error("Dashboard error", err))
    .finally(() => setLoading(false));
  }, []);

  const getProgress = (courseId) => {
    const p = progress.find(p => p.course?.id === courseId || p.course === courseId);
    return p ? p.progress_percentage : 0;
  };

  const getAttempt = (quizId) => attempts.find(a => a.quiz === quizId);

  return (
    <div className="pb-10 font-sans text-gray-900 animate-in fade-in duration-700">
      {/* 1. Statistics at the VERY BEGINNING (Top) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-100 border border-gray-50 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-aiesec-blue flex items-center justify-center shadow-inner"><BookOpen size={28}/></div>
          <div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Functional Courses</p>
            <h3 className="text-4xl font-black text-gray-800">{courses.length}</h3>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-100 border border-gray-50 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shadow-inner"><FileQuestion size={28}/></div>
          <div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Quizes Available</p>
            <h3 className="text-4xl font-black text-gray-800">{quizzes.length}</h3>
          </div>
        </div>
        <div className="bg-white rounded-[2.5rem] p-8 bg-impact-gradient shadow-2xl shadow-blue-200 flex items-center gap-6 text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20"><Sparkles size={28}/></div>
          <div>
            <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">Your Product</p>
            <h3 className="text-2xl font-black truncate max-w-[150px]">{user?.function || 'TM'}</h3>
          </div>
        </div>
      </div>

      {/* 2. Personalized Banner */}
      <div className="relative rounded-[3rem] overflow-hidden mb-12 shadow-2xl h-64 flex items-center bg-gray-900 group">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-aiesec-blue/90 via-aiesec-blue/20 to-transparent z-10"></div>
          <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&q=80"
            alt="AIESEC" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-20 px-12">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tighter">
            Welcome, <span className="text-orange-400">{user?.first_name}</span> 👋
          </h1>
          <p className="text-lg text-blue-100 font-bold opacity-90">{user?.function_name} Talent Hub</p>
        </div>
      </div>

      {/* 3. Recommended Learning */}
      <div className="mb-16">
        <div className="flex justify-between items-end mb-8 px-4">
          <div>
            <h2 className="text-4xl font-black text-gray-800 tracking-tighter">Start Learning</h2>
            <p className="text-gray-400 font-bold text-sm tracking-tight italic opacity-70">Specially for your functional growth</p>
          </div>
          <Link to="/dashboard/courses" className="text-aiesec-blue font-black flex items-center gap-2 text-[11px] uppercase tracking-widest hover:translate-x-2 transition-all">
            See All <ChevronRight size={18} strokeWidth={4}/>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-[3rem]"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {courses.slice(0, 3).map(course => {
              const prog = getProgress(course.id);
              return (
                <div key={course.id} onClick={() => navigate(`/course/${course.id}`)}
                  className="bg-white rounded-[3rem] overflow-hidden shadow-xl shadow-gray-100 border border-gray-100 group cursor-pointer hover:shadow-2xl transition-all duration-500 flex flex-col h-full hover:-translate-y-2">
                  <div className="h-48 relative overflow-hidden">
                    <img src={course.thumbnail || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80'} alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 group-hover:opacity-20 transition-all"></div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="font-black text-xl mb-6 text-gray-800 line-clamp-2 leading-tight tracking-tight group-hover:text-aiesec-blue transition-colors">{course.title}</h3>
                    <div className="mt-auto">
                       <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{course.duration} MINS</span>
                          <span className="text-[10px] font-black text-aiesec-blue uppercase">{Math.round(prog)}%</span>
                       </div>
                       <button className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex justify-center items-center gap-2 bg-gray-50 text-aiesec-blue group-hover:bg-aiesec-blue group-hover:text-white transition-all">
                        <PlayCircle size={16}/>{prog > 0 ? 'Continue' : 'Start'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {courses.length === 0 && (
              <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No courses currently available for your function.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Quizes */}
      <div>
        <div className="flex justify-between items-end mb-8 px-4">
          <h2 className="text-4xl font-black text-gray-800 tracking-tighter">Knowledge Check</h2>
          <Link to="/dashboard/quizzes" className="text-aiesec-blue font-black flex items-center gap-2 text-[11px] uppercase tracking-widest hover:translate-x-2 transition-all">
            See All <ChevronRight size={18} strokeWidth={4}/>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {quizzes.slice(0, 2).map(quiz => {
            const attempt = getAttempt(quiz.id);
            return (
              <div key={quiz.id} onClick={() => navigate(`/quiz/${quiz.id}`)}
                className={`bg-white rounded-[3rem] p-8 shadow-xl shadow-gray-100 border border-gray-100 flex items-center justify-between group cursor-pointer hover:shadow-2xl transition-all duration-500 border-l-[10px] ${attempt ? 'border-l-green-500' : 'border-l-aiesec-blue'}`}>
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner transition-all duration-500 ${attempt ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-aiesec-blue'}`}>
                    <FileQuestion size={32}/>
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-gray-800 group-hover:text-aiesec-blue transition-colors leading-tight mb-1 tracking-tight">{quiz.title}</h3>
                    <p className="text-gray-300 text-[10px] font-black uppercase tracking-widest">{quiz.questions?.length || 0} Items</p>
                  </div>
                </div>
                <div className="bg-impact-gradient text-white px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-200 group-hover:scale-110 transition-all">
                   {attempt ? 'RETRY' : 'START'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
