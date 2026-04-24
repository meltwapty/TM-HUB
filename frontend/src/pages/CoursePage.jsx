import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, FileText, BookOpen, CheckCircle, ExternalLink, Download, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { authAxios } = useAuth();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('video');
  const [markingDone, setMarkingDone] = useState(false);

  useEffect(() => {
    Promise.all([
      authAxios.get(`/courses/${courseId}/`),
      authAxios.get('/course-progress/')
    ]).then(([cr, pr]) => {
      setCourse(cr.data);
      const p = pr.data.find(p => p.course?.id === parseInt(courseId));
      setProgress(p || null);
      if (cr.data.video_url) setActiveTab('video');
      else if (cr.data.pdf_url) setActiveTab('pdf');
      else setActiveTab('notes');
    }).finally(() => setLoading(false));
  }, [courseId]);

  const markComplete = async () => {
    setMarkingDone(true);
    await authAxios.post('/course-progress/', { course: courseId, progress_percentage: 100 });
    setProgress({ completed: true, progress_percentage: 100 });
    setMarkingDone(false);
  };

  const getEmbedUrl = (url, type) => {
    if (!url) return null;
    
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    
    // Google Drive
    const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([^/?]+)/);
    if (driveMatch) {
      // Use preview for better embedding
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }
    
    return url;
  };

  if (loading) return (
    <div className="min-h-screen bg-aiesec-light flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-aiesec-blue border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!course) return null;

  const videoEmbed = getEmbedUrl(course.video_url, 'video');
  const pdfEmbed = getEmbedUrl(course.pdf_url, 'pdf');
  const pct = progress?.progress_percentage || 0;
  const hasContent = course.video_url || course.pdf_url || course.notes;

  return (
    <div className="min-h-screen bg-aiesec-light">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate('/dashboard/courses')}
          className="flex items-center gap-2 text-gray-600 hover:text-aiesec-blue font-semibold transition-colors">
          <ChevronLeft size={20} /> Back to Courses
        </button>
        <div className="text-center">
          <h2 className="font-bold text-gray-800 text-sm">{course.title}</h2>
          <p className="text-xs text-gray-500">{course.duration} min • {course.function_name}</p>
        </div>
        {progress?.completed ? (
          <span className="flex items-center gap-1.5 text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-xl">
            <CheckCircle size={16} /> Completed
          </span>
        ) : (
          <button onClick={markComplete} disabled={markingDone}
            className="bg-aiesec-blue text-white font-bold px-5 py-2 rounded-xl text-sm hover:bg-blue-600 transition-colors disabled:opacity-60">
            {markingDone ? 'Saving...' : 'Mark Complete'}
          </button>
        )}
      </div>

      <div className="h-1.5 bg-gray-200">
        <div className="h-1.5 bg-impact-gradient transition-all duration-500" style={{ width: `${pct}%` }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {hasContent && (
          <div className="flex gap-2 mb-6 bg-white rounded-2xl p-2 shadow-sm border border-gray-100 w-max overflow-x-auto">
            {course.video_url && (
              <button onClick={() => setActiveTab('video')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'video' ? 'bg-aiesec-blue text-white shadow' : 'text-gray-500 hover:text-aiesec-blue'}`}>
                <Play size={16} /> Video
              </button>
            )}
            {course.pdf_url && (
              <button onClick={() => setActiveTab('pdf')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'pdf' ? 'bg-aiesec-blue text-white shadow' : 'text-gray-500 hover:text-aiesec-blue'}`}>
                <FileText size={16} /> Document
              </button>
            )}
            {course.notes && (
              <button onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'notes' ? 'bg-aiesec-blue text-white shadow' : 'text-gray-500 hover:text-aiesec-blue'}`}>
                <BookOpen size={16} /> Notes
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {!hasContent ? (
              <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={32} className="text-aiesec-blue" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Content Coming Soon</h3>
                <p className="text-gray-400">The admin will add course materials shortly.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activeTab === 'video' && course.video_url && (
                  <div className="space-y-4">
                    <div className="bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video relative group">
                      {videoEmbed ? (
                        <iframe src={videoEmbed} className="w-full h-full" allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          title={course.title} />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gray-800">
                           <AlertTriangle size={48} className="text-yellow-500 mb-4" />
                           <p className="font-bold">Cannot embed this video link</p>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <a href={course.video_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 font-bold px-6 py-3 rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                        <ExternalLink size={18} /> Watch on Original Platform
                      </a>
                    </div>
                  </div>
                )}

                {activeTab === 'pdf' && course.pdf_url && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
                      <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-b">
                         <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                            <FileText size={16} /> DOCUMENT VIEWER
                         </div>
                         <p className="text-[10px] text-gray-400">IF PREVIEW FAILS, USE THE BUTTON BELOW</p>
                      </div>
                      <iframe src={pdfEmbed} className="w-full" style={{ height: '75vh' }}
                        title={`${course.title} - Document`} />
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 justify-center items-center">
                      <a href={course.pdf_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 bg-aiesec-blue text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-100">
                        <Download size={18} /> Download / View Direct
                      </a>
                      <div className="text-[10px] text-gray-400 max-w-[200px] text-center italic">
                        "You need access" message? Make sure the file is shared as "Anyone with the link can view".
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notes' && course.notes && (
                  <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">
                       <BookOpen size={24} className="text-aiesec-blue"/> STUDY NOTES
                    </h3>
                    <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed font-medium">
                      {course.notes}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <img src={course.thumbnail || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80'} 
                alt={course.title} className="w-full h-48 object-cover"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80'; }} />
              <div className="p-6">
                <h3 className="font-bold text-gray-800 text-lg mb-3 leading-tight">{course.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-6">{course.description || 'No additional description for this course.'}</p>
                
                <div className="space-y-3 pt-4 border-t border-gray-50">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PRODUCT</span>
                      <span className="text-xs font-black text-aiesec-blue uppercase">{course.function_name}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">DURATION</span>
                      <span className="text-xs font-black text-gray-700 uppercase">{course.duration} MIN</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PROGRESS</span>
                      <span className={`text-xs font-black uppercase ${pct >= 100 ? 'text-green-500' : 'text-aiesec-blue'}`}>{Math.round(pct)}%</span>
                   </div>
                </div>
              </div>
            </div>

            {!progress?.completed && (
              <button onClick={markComplete} disabled={markingDone}
                className="w-full py-4 rounded-2xl bg-impact-gradient text-white font-black shadow-xl shadow-blue-100 hover:shadow-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                <CheckCircle size={18} /> {markingDone ? 'UPDATING...' : 'FINISH COURSE'}
              </button>
            )}
          </div>
        </div>
      </div>
      <footer className="p-10 text-center border-t border-gray-100 bg-white/50 mt-10">
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Mohamed Eltwapty - IM</p>
      </footer>
    </div>
  );
};

export default CoursePage;
