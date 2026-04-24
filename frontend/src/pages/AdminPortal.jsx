import React, { useEffect, useState } from 'react';
import { Users, BookOpen, FileQuestion, Plus, X, Edit3, Trash2, UserPlus, ChevronLeft, Image as ImageIcon, RefreshCw, Filter, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FUNC_COLORS = {
  'TM': 'bg-blue-100 text-blue-700', 'B2B': 'bg-green-100 text-green-700',
  'B2C': 'bg-pink-100 text-pink-700', 'OGV': 'bg-orange-100 text-orange-700',
  'OGT': 'bg-yellow-100 text-yellow-800', 'IGV': 'bg-teal-100 text-teal-700',
  'IGT': 'bg-purple-100 text-purple-700', 'BD': 'bg-indigo-100 text-indigo-700',
  'F&L': 'bg-red-100 text-red-700', 'CXP': 'bg-cyan-100 text-cyan-700',
};

const AdminPortal = () => {
  const { authAxios } = useAuth();
  const [tab, setTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterFunc, setFilterFunc] = useState('ALL');

  // Course Modal state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const blankCourse = { title: '', description: '', thumbnail: '', video_url: '', pdf_url: '', notes: '', function: '', duration: 30, order: 1 };
  const [courseForm, setCourseForm] = useState(blankCourse);

  // Quiz Modal state
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [quizForm, setQuizForm] = useState({ title: '', function: '' });

  // Question Management state
  const [activeQuizForQuestions, setActiveQuizForQuestions] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionForm, setQuestionForm] = useState({ text: '', choice_a: '', choice_b: '', choice_c: '', choice_d: '', correct_choice: 'A', weight: 1.0 });

  const tabs = [
    { id: 'members', label: 'Scores', icon: <Users size={16} /> },
    { id: 'membership', label: 'Membership', icon: <UserPlus size={16} /> },
    { id: 'courses', label: 'Content Hub', icon: <BookOpen size={16} /> },
    { id: 'quizzes', label: 'Quizes', icon: <FileQuestion size={16} /> },
  ];

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      authAxios.get('/admin/members/'),
      authAxios.get('/courses/'),
      authAxios.get('/quizzes/'),
      authAxios.get('/functions/'),
    ]).then(([mr, cr, qr, fr]) => {
      setMembers(mr.data); setCourses(cr.data); setQuizzes(qr.data); setFunctions(fr.data);
    }).catch(err => console.error("Admin load failed", err))
    .finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, []);

  const filteredMembers = filterFunc === 'ALL' ? members : members.filter(m => m.function === filterFunc);
  const filteredCourses = filterFunc === 'ALL' ? courses : courses.filter(c => c.function_code === filterFunc || c.function === parseInt(filterFunc));
  const filteredQuizzes = filterFunc === 'ALL' ? quizzes : quizzes.filter(q => q.function_name === filterFunc || q.function === parseInt(filterFunc));

  const handleOpenCourseModal = (course = null) => {
    if (course) {
      setEditingCourseId(course.id);
      setCourseForm({
        title: course.title || '',
        description: course.description || '',
        thumbnail: course.thumbnail || '',
        video_url: course.video_url || '',
        pdf_url: course.pdf_url || '',
        notes: course.notes || '',
        function: course.function || '',
        duration: course.duration || 30,
        order: course.order || 1,
      });
    } else {
      setEditingCourseId(null);
      setCourseForm(blankCourse);
    }
    setShowCourseModal(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.title.trim()) {
      alert('Module Title is required.');
      return;
    }
    if (!courseForm.function) {
      alert('Please select a Function.');
      return;
    }

    try {
      // Sanitize data: Ensure numbers are integers and remove read-only fields
      const { function_name, function_code, ...sendData } = courseForm;
      const finalData = {
        ...sendData,
        title: sendData.title.trim(),
        function: parseInt(sendData.function),
        duration: parseInt(sendData.duration) || 0,
        order: parseInt(sendData.order) || 0
      };

      if (editingCourseId) await authAxios.patch(`/courses/${editingCourseId}/`, finalData);
      else await authAxios.post('/courses/', finalData);
      
      setShowCourseModal(false); 
      loadAll();
    } catch (err) { 
      const errorData = err.response?.data;
      let errorMsg = 'Check your connection or fields.';
      if (typeof errorData === 'object' && errorData !== null) {
        errorMsg = Object.entries(errorData)
          .map(([field, errors]) => `${field.toUpperCase()}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('\n');
      }
      alert(`Failed to save course:\n${errorMsg}`); 
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Are you sure? This course will be permanently removed.')) {
      try {
        await authAxios.delete(`/courses/${id}/`);
        loadAll();
      } catch (err) { alert('Delete failed'); }
    }
  };

  const handleOpenQuizModal = (quiz = null) => {
    if (quiz) {
      setEditingQuizId(quiz.id);
      setQuizForm({ title: quiz.title, function: quiz.function });
    } else {
      setEditingQuizId(null);
      setQuizForm({ title: '', function: '' });
    }
    setShowQuizModal(true);
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (!quizForm.title.trim() || !quizForm.function) {
      alert('Title and Function are required.');
      return;
    }
    try {
      const data = {
        ...quizForm,
        title: quizForm.title.trim(),
        function: parseInt(quizForm.function)
      };
      if (editingQuizId) await authAxios.patch(`/quizzes/${editingQuizId}/`, data);
      else await authAxios.post('/quizzes/', data);
      setShowQuizModal(false); 
      loadAll();
    } catch (err) { 
      const errorData = err.response?.data;
      let errorMsg = 'Failed to save quiz.';
      if (typeof errorData === 'object' && errorData !== null) {
        errorMsg = Object.entries(errorData)
          .map(([field, errors]) => `${field.toUpperCase()}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('\n');
      }
      alert(errorMsg); 
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (window.confirm('Delete this quiz?')) {
      try {
        await authAxios.delete(`/quizzes/${id}/`);
        loadAll();
      } catch (err) { alert('Delete failed'); }
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      const data = { 
        ...questionForm, 
        quiz: activeQuizForQuestions.id,
        weight: parseFloat(questionForm.weight) || 1.0 
      };
      await authAxios.post('/questions/', data);
      setQuestionForm({ text: '', choice_a: '', choice_b: '', choice_c: '', choice_d: '', correct_choice: 'A', weight: 1.0 });
      setShowQuestionModal(false);
      const res = await authAxios.get(`/quizzes/${activeQuizForQuestions.id}/`);
      setActiveQuizForQuestions(res.data);
    } catch (err) { 
      const errorData = err.response?.data;
      let errorMsg = 'Failed to add question.';
      if (typeof errorData === 'object' && errorData !== null) {
        errorMsg = Object.entries(errorData)
          .map(([field, errors]) => `${field.toUpperCase()}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('\n');
      }
      alert(errorMsg); 
    }
  };

  const deleteQuestion = async (qId) => {
    if (window.confirm('Delete this question?')) {
      try {
        await authAxios.delete(`/questions/${qId}/`);
        const res = await authAxios.get(`/quizzes/${activeQuizForQuestions.id}/`);
        setActiveQuizForQuestions(res.data);
      } catch (err) { alert('Delete failed'); }
    }
  };

  return (
    <div className="pb-10 font-sans text-gray-900">
      {/* HEADER SECTION */}
      <div className="relative rounded-[3rem] overflow-hidden mb-10 h-52 flex items-center bg-gray-900 shadow-2xl">
        <div className="absolute inset-0 bg-impact-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent"></div>
        <div className="relative z-10 px-12 w-full flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              <p className="text-white font-black uppercase tracking-[0.4em] text-[10px]">AIESEC CONTROL PANEL</p>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter">Command Center</h1>
          </div>
          <button onClick={loadAll} className="p-5 bg-white/10 hover:bg-white/20 rounded-3xl text-white transition-all backdrop-blur-xl border border-white/20 group shadow-2xl">
             <RefreshCw size={28} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
          </button>
        </div>
      </div>

      {/* NAVIGATION & GLOBAL FILTERS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div className="flex gap-2 bg-white rounded-[2rem] p-2 shadow-xl shadow-gray-100 border border-gray-100 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setActiveQuizForQuestions(null); }}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${tab === t.id ? 'bg-aiesec-dark text-white shadow-2xl' : 'text-gray-400 hover:text-aiesec-blue hover:bg-gray-50'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100 min-w-[280px]">
           <div className="p-2 bg-blue-50 rounded-xl text-aiesec-blue"><Filter size={18} /></div>
           <select value={filterFunc} onChange={e => setFilterFunc(e.target.value)}
             className="border-none bg-transparent text-xs font-black text-gray-700 focus:ring-0 cursor-pointer w-full uppercase tracking-[0.2em]">
             <option value="ALL">All Network</option>
             {functions.map(f => <option key={f.id} value={f.code}>{f.name}</option>)}
           </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32"><div className="w-16 h-16 border-8 border-aiesec-blue border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <>
          {/* MEMBERS / SCOREBOARD TAB */}
          {(tab === 'members' || tab === 'membership') && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-100 border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50/80 backdrop-blur-sm">
                    <tr>
                      <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">AIESECer</th>
                      {tab === 'membership' && <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Identity</th>}
                      <th className="px-10 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Product</th>
                      {tab === 'members' && (
                        <>
                          <th className="px-10 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Modules</th>
                          <th className="px-10 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Evaluations</th>
                          <th className="px-10 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Performance</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMembers.map(m => (
                      <tr key={m.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-10 py-7">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-[1.25rem] bg-impact-gradient flex items-center justify-center text-white text-base font-black shadow-lg shadow-blue-200 flex-shrink-0">{m.name?.[0]}</div>
                            <span className="font-black text-gray-800 tracking-tight">{m.name}</span>
                          </div>
                        </td>
                        {tab === 'membership' && <td className="px-10 py-7 text-sm text-gray-400 font-bold">{m.email}</td>}
                        <td className="px-10 py-7 text-center">
                          <span className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest ${FUNC_COLORS[m.function] || 'bg-gray-100 text-gray-600'}`}>{m.function}</span>
                        </td>
                        {tab === 'members' && (
                          <>
                            <td className="px-10 py-7 text-center font-black text-gray-700">{m.courses_completed}</td>
                            <td className="px-10 py-7 text-center font-black text-gray-700">{m.quiz_attempts}</td>
                            <td className="px-10 py-7 text-center">
                              <span className={`text-base font-black ${m.avg_score >= 80 ? 'text-green-500' : m.avg_score >= 60 ? 'text-aiesec-blue' : m.avg_score > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                                {m.avg_score > 0 ? `${m.avg_score}%` : '—'}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* COURSES TAB */}
          {tab === 'courses' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center justify-between mb-10 px-4">
                <h2 className="text-4xl font-black text-gray-800 tracking-tighter">Content Hub</h2>
                <button onClick={() => handleOpenCourseModal()}
                  className="flex items-center gap-4 bg-impact-gradient text-white font-black px-10 py-5 rounded-[2rem] shadow-2xl shadow-blue-200 hover:shadow-blue-300 transition-all text-xs uppercase tracking-widest hover:-translate-y-1 active:scale-95">
                  <Plus size={24} /> New Module
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredCourses.map(c => (
                  <div key={c.id} className="bg-white rounded-[3rem] shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-500 relative border-b-[8px] border-b-gray-50 hover:border-b-aiesec-blue">
                    <div className="h-56 relative overflow-hidden bg-gray-100">
                      <img src={c.thumbnail || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80'}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
                        <button onClick={(e) => { e.stopPropagation(); handleOpenCourseModal(c); }} className="w-14 h-14 bg-white rounded-[1.25rem] shadow-2xl text-aiesec-blue flex items-center justify-center hover:bg-blue-50 transition-all active:scale-90 z-20 hover:rotate-12">
                          <Edit3 size={24} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCourse(c.id); }} className="w-14 h-14 bg-white rounded-[1.25rem] shadow-2xl text-red-500 flex items-center justify-center hover:bg-red-50 transition-all active:scale-90 z-20 hover:-rotate-12">
                          <Trash2 size={24} />
                        </button>
                      </div>
                      <div className="absolute bottom-6 left-6 px-4 py-2 bg-white/95 backdrop-blur-xl rounded-[1.25rem] text-[10px] font-black text-gray-800 uppercase tracking-widest shadow-2xl">{c.function_name}</div>
                    </div>
                    <div className="p-10 flex-1 flex flex-col">
                      <h4 className="font-black text-2xl text-gray-800 mb-4 line-clamp-1 group-hover:text-aiesec-blue transition-colors tracking-tight leading-none">{c.title}</h4>
                      <p className="text-sm text-gray-400 font-bold line-clamp-2 mb-10 leading-relaxed opacity-70 italic">"{c.description || 'No module details available.'}"</p>
                      <div className="mt-auto flex items-center justify-between pt-8 border-t border-gray-50">
                        <span className="text-[10px] font-black text-gray-400 tracking-[0.3em] uppercase">{c.duration} MIN JOURNEY</span>
                        <div className="flex gap-3">
                          {c.video_url && <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-lg shadow-red-100"></div>}
                          {c.pdf_url && <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-lg shadow-blue-100"></div>}
                          {c.notes && <div className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-lg shadow-green-100"></div>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredCourses.length === 0 && (
                  <div className="col-span-full py-32 text-center opacity-30 grayscale">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"><BookOpen size={48} className="text-gray-400" /></div>
                    <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-xs">Repository Empty</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* QUIZZES TAB */}
          {tab === 'quizzes' && !activeQuizForQuestions && (
             <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center justify-between mb-10 px-4">
                  <h2 className="text-4xl font-black text-gray-800 tracking-tighter">Quizes</h2>
                  <button onClick={() => handleOpenQuizModal()}
                    className="flex items-center gap-4 bg-impact-gradient text-white font-black px-10 py-5 rounded-[2rem] shadow-2xl shadow-blue-200 transition-all text-xs uppercase tracking-widest hover:-translate-y-1">
                    <Plus size={24} /> Create Quiz
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {filteredQuizzes.map(q => (
                    <div key={q.id} className="bg-white rounded-[3rem] p-10 shadow-xl shadow-gray-100 border border-gray-100 flex flex-col group hover:border-aiesec-blue hover:shadow-2xl transition-all duration-500 cursor-pointer relative overflow-hidden"
                      onClick={() => setActiveQuizForQuestions(q)}>
                      <div className="flex justify-between items-start mb-10">
                        <div className="w-20 h-20 rounded-[2rem] bg-blue-50 text-aiesec-blue flex items-center justify-center shadow-inner group-hover:bg-aiesec-blue group-hover:text-white transition-all duration-300">
                          <FileQuestion size={40} />
                        </div>
                        <div className="flex gap-2">
                           <button onClick={(e) => { e.stopPropagation(); handleOpenQuizModal(q); }} className="w-12 h-12 bg-white rounded-2xl shadow-2xl text-aiesec-blue flex items-center justify-center hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100 z-20">
                            <Edit3 size={20} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(q.id); }} className="w-12 h-12 bg-white rounded-2xl shadow-2xl text-red-500 flex items-center justify-center hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 z-20">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-black text-2xl text-gray-800 mb-2 group-hover:text-aiesec-blue transition-colors line-clamp-1 leading-tight tracking-tight">{q.title}</h3>
                      <p className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-400 mb-12">{q.function_name} SPECIALIZATION</p>
                      <div className="mt-auto pt-8 border-t border-gray-50 flex justify-between items-center relative z-10">
                        <span className="text-[11px] font-black text-aiesec-blue uppercase tracking-widest">{q.questions?.length || 0} ITEMS</span>
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-aiesec-blue group-hover:text-white transition-all shadow-sm">
                           <ChevronLeft size={24} className="rotate-180" strokeWidth={5} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          )}

          {/* ACTIVE QUIZ QUESTION MANAGEMENT */}
          {tab === 'quizzes' && activeQuizForQuestions && (
            <div className="animate-in zoom-in-95 duration-500">
               <div className="bg-white rounded-[4rem] p-16 shadow-2xl shadow-gray-200 border border-gray-100">
                  <div className="flex items-center justify-between mb-16 pb-12 border-b border-gray-100">
                    <div>
                      <button onClick={() => setActiveQuizForQuestions(null)} className="text-[11px] font-black text-aiesec-blue flex items-center gap-3 mb-6 hover:underline uppercase tracking-[0.4em]">
                        <ChevronLeft size={20} strokeWidth={4} /> EXIT TO POOL
                      </button>
                      <h3 className="text-6xl font-black text-gray-800 tracking-tighter leading-none mb-6">{activeQuizForQuestions.title}</h3>
                      <div className="flex items-center gap-6">
                         <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">{activeQuizForQuestions.function_name} FIELD</span>
                         <div className="w-2 h-2 rounded-full bg-blue-100"></div>
                         <span className="text-[11px] font-black text-aiesec-blue uppercase tracking-[0.3em]">{activeQuizForQuestions.questions?.length || 0} TOTAL QUESTIONS</span>
                      </div>
                    </div>
                    <button onClick={() => setShowQuestionModal(true)} className="flex items-center gap-5 bg-impact-gradient text-white font-black px-12 py-7 rounded-[2.5rem] shadow-2xl shadow-blue-100 hover:scale-[1.05] active:scale-[0.98] transition-all text-sm uppercase tracking-[0.25em]">
                      <Plus size={32} /> ADD NEW ITEM
                    </button>
                  </div>

                  <div className="space-y-10">
                    {activeQuizForQuestions.questions && activeQuizForQuestions.questions.map((q, idx) => (
                      <div key={q.id} className="bg-white rounded-[3.5rem] p-12 border border-gray-50 flex justify-between items-start group shadow-xl shadow-gray-50 hover:shadow-2xl transition-all duration-500">
                        <div className="flex-1">
                          <div className="flex items-center gap-6 mb-10">
                            <span className="w-14 h-14 rounded-[1.5rem] bg-blue-50 text-aiesec-blue flex items-center justify-center text-lg font-black shadow-inner">{idx + 1}</span>
                            <h5 className="font-black text-gray-800 text-2xl leading-snug tracking-tight max-w-4xl">{q.text}</h5>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-6 ml-20">
                            {['a', 'b', 'c', 'd'].map(c => (
                              <div key={c} className={`text-sm font-bold p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between ${q.correct_choice === c.toUpperCase() ? 'bg-green-50 border-green-200 text-green-700 shadow-xl shadow-green-50' : 'bg-gray-50 border-transparent text-gray-400'}`}>
                                <span><span className="uppercase mr-5 opacity-30 font-black text-xs">[{c}]</span> {q[`choice_${c}`]}</span>
                                {q.correct_choice === c.toUpperCase() && <CheckCircle size={20} />}
                              </div>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => deleteQuestion(q.id)} className="w-16 h-16 flex items-center justify-center text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-[2rem] transition-all ml-10">
                          <Trash2 size={32} />
                        </button>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}
        </>
      )}

      {/* MODAL OVERLAYS */}
      {showCourseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/60 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[4rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
              <div className="px-12 py-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <div>
                    <h3 className="text-3xl font-black text-gray-800 tracking-tight">{editingCourseId ? 'Refine Content' : 'Add New Resource'}</h3>
                 </div>
                 <button onClick={() => setShowCourseModal(false)} className="p-4 hover:bg-red-50 rounded-[1.5rem] text-gray-300 hover:text-red-500 transition-all"><X size={32} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-12">
                 <form onSubmit={handleSaveCourse} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="md:col-span-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 mb-4 block tracking-[0.3em]">Module Title</label>
                          <input required value={courseForm.title} onChange={e => setCourseForm(p => ({ ...p, title: e.target.value }))}
                            className="w-full border-gray-200 bg-gray-50 rounded-3xl px-8 py-6 text-lg font-bold focus:bg-white focus:ring-8 focus:ring-blue-50 shadow-inner" />
                       </div>
                       <div className="md:col-span-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 mb-4 block tracking-[0.3em]">Summary</label>
                          <textarea value={courseForm.description} onChange={e => setCourseForm(p => ({ ...p, description: e.target.value }))}
                            className="w-full border-gray-200 bg-gray-50 rounded-3xl px-8 py-6 text-sm font-bold focus:bg-white shadow-inner" rows={2} />
                       </div>
                       <div className="md:col-span-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 mb-4 block tracking-[0.3em]">Thumbnail & Live Preview</label>
                          <div className="flex flex-col md:flex-row gap-8">
                             <div className="flex-1">
                                <input value={courseForm.thumbnail} onChange={e => setCourseForm(p => ({ ...p, thumbnail: e.target.value }))}
                                  className="w-full border-gray-200 bg-gray-50 rounded-3xl px-8 py-6 text-sm font-bold shadow-inner focus:bg-white" />
                             </div>
                             <div className="w-full md:w-64 h-36 bg-white rounded-[2.5rem] border-4 border-gray-100 overflow-hidden flex items-center justify-center relative shadow-2xl">
                                {courseForm.thumbnail ? <img src={courseForm.thumbnail} alt="preview" className="w-full h-full object-cover" /> : <ImageIcon size={32} className="text-gray-100" />}
                             </div>
                          </div>
                       </div>
                       <div>
                          <label className="text-[10px] font-black uppercase text-gray-400 mb-4 block tracking-[0.3em]">Video Link</label>
                          <input value={courseForm.video_url} onChange={e => setCourseForm(p => ({ ...p, video_url: e.target.value }))}
                            className="w-full border-gray-200 bg-gray-50 rounded-3xl px-8 py-6 text-sm font-bold shadow-inner" />
                       </div>
                       <div>
                          <label className="text-[10px] font-black uppercase text-gray-400 mb-4 block tracking-[0.3em]">Document Link</label>
                          <input value={courseForm.pdf_url} onChange={e => setCourseForm(p => ({ ...p, pdf_url: e.target.value }))}
                            className="w-full border-gray-200 bg-gray-50 rounded-3xl px-8 py-6 text-sm font-bold shadow-inner" />
                       </div>
                       <div>
                          <label className="text-[10px] font-black uppercase text-gray-400 mb-4 block tracking-[0.3em]">Function</label>
                          <select required value={courseForm.function} onChange={e => setCourseForm(p => ({ ...p, function: e.target.value }))}
                            className="w-full border-gray-200 bg-gray-50 rounded-3xl px-8 py-6 text-sm font-black text-gray-700 shadow-inner">
                            <option value="">Select Function</option>
                            {functions.map(f => <option key={f.id} value={f.id}>{f.name.toUpperCase()}</option>)}
                          </select>
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <input type="number" value={courseForm.duration} onChange={e => setCourseForm(p => ({ ...p, duration: e.target.value }))} className="w-full border-gray-200 bg-gray-50 rounded-3xl px-8 py-6 text-sm font-black shadow-inner" />
                          <input type="number" value={courseForm.order} onChange={e => setCourseForm(p => ({ ...p, order: e.target.value }))} className="w-full border-gray-200 bg-gray-50 rounded-3xl px-8 py-6 text-sm font-black shadow-inner" />
                       </div>
                    </div>
                    <div className="flex justify-end gap-6 pt-12">
                       <button type="button" onClick={() => setShowCourseModal(false)} className="px-12 py-6 rounded-3xl font-black text-xs uppercase tracking-widest text-gray-400">Cancel</button>
                       <button type="submit" className="px-20 py-6 rounded-[2rem] bg-aiesec-blue text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl">Confirm</button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}

      {showQuizModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/60 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="px-12 py-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h3 className="text-3xl font-black text-gray-800 tracking-tight">Quiz Config</h3>
                 <button onClick={() => setShowQuizModal(false)} className="p-4 hover:bg-red-50 rounded-[1.5rem] text-gray-300 hover:text-red-500 transition-all"><X size={32} /></button>
              </div>
              <form onSubmit={handleSaveQuiz} className="p-12 space-y-10">
                 <input required value={quizForm.title} onChange={e => setQuizForm(p => ({ ...p, title: e.target.value }))} className="w-full border-gray-200 bg-gray-50 rounded-3xl px-8 py-6 text-lg font-bold shadow-inner" />
                 <select required value={quizForm.function} onChange={e => setQuizForm(p => ({ ...p, function: e.target.value }))} className="w-full border-gray-200 bg-gray-50 rounded-3xl px-8 py-6 text-sm font-black text-gray-700 shadow-inner">
                    <option value="">Select Function</option>
                    {functions.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                 </select>
                 <div className="flex justify-end gap-6 pt-6">
                    <button type="button" onClick={() => setShowQuizModal(false)} className="px-10 py-6 rounded-3xl font-black text-xs uppercase tracking-widest text-gray-400">Cancel</button>
                    <button type="submit" className="px-14 py-6 rounded-3xl bg-aiesec-blue text-white font-black text-xs uppercase tracking-widest shadow-2xl">Confirm</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {showQuestionModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/60 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="px-12 py-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h3 className="text-3xl font-black text-gray-800 tracking-tight">Question Form</h3>
                 <button onClick={() => setShowQuestionModal(false)} className="p-4 hover:bg-red-50 rounded-[1.5rem] text-gray-300 hover:text-red-500 transition-all"><X size={32} /></button>
              </div>
              <form onSubmit={handleSaveQuestion} className="p-12 space-y-8 overflow-y-auto max-h-[75vh]">
                 <textarea required value={questionForm.text} onChange={e => setQuestionForm(p => ({ ...p, text: e.target.value }))} className="w-full border-gray-200 bg-gray-50 rounded-3xl px-8 py-6 text-base font-bold shadow-inner" rows={2} />
                 <div className="grid grid-cols-2 gap-8">
                    {['a', 'b', 'c', 'd'].map(c => (
                      <input key={c} required value={questionForm[`choice_${c}`]} onChange={e => setQuestionForm(p => ({ ...p, [`choice_${c}`]: e.target.value }))} className="w-full border-gray-200 bg-gray-50 rounded-2xl px-8 py-5 text-sm font-bold shadow-inner" placeholder={`Choice ${c.toUpperCase()}`} />
                    ))}
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <select value={questionForm.correct_choice} onChange={e => setQuestionForm(p => ({ ...p, correct_choice: e.target.value }))} className="w-full border-gray-200 bg-gray-50 rounded-2xl px-8 py-5 text-sm font-black shadow-inner">
                      {['A', 'B', 'C', 'D'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="number" step="0.5" value={questionForm.weight} onChange={e => setQuestionForm(p => ({ ...p, weight: e.target.value }))} className="w-full border-gray-200 bg-gray-50 rounded-2xl px-8 py-5 text-sm font-black shadow-inner" />
                 </div>
                 <div className="flex justify-end gap-6 pt-8">
                    <button type="button" onClick={() => setShowQuestionModal(false)} className="px-10 py-6 rounded-3xl font-black text-xs uppercase tracking-widest text-gray-400">Discard</button>
                    <button type="submit" className="px-16 py-6 rounded-3xl bg-aiesec-blue text-white font-black text-xs uppercase tracking-widest shadow-2xl">Confirm</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
