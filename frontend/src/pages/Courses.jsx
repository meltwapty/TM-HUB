import React, { useEffect, useState } from 'react';
import { PlayCircle, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Courses = () => {
  const { authAxios } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([authAxios.get('/courses/'), authAxios.get('/course-progress/')])
      .then(([cr, pr]) => { setCourses(cr.data); setProgress(pr.data); })
      .finally(() => setLoading(false));
  }, []);

  const getProgress = (courseId) => {
    const p = progress.find(p => p.course?.id === courseId);
    return p ? p.progress_percentage : 0;
  };

  const inProgress = courses.filter(c => { const p = getProgress(c.id); return p > 0 && p < 100; });
  const notStarted = courses.filter(c => getProgress(c.id) === 0);
  const completed = courses.filter(c => getProgress(c.id) >= 100);

  const CourseCard = ({ course }) => {
    const prog = getProgress(course.id);
    // Use thumbnail, fallback to file_or_url, fallback to default
    const imgSrc = course.thumbnail || course.file_or_url ||
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80';

    return (
      <div onClick={() => navigate(`/course/${course.id}`)}
        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 card-hover group cursor-pointer flex flex-col h-full">
        <div className="h-44 relative overflow-hidden">
          <img src={imgSrc} alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          {prog >= 100 && (
            <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle size={11}/> Done
            </div>
          )}
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1">
            <Clock size={11}/> {course.duration}m
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-bold text-base mb-2 text-gray-800 line-clamp-2">{course.title}</h3>
          {course.description && <p className="text-gray-400 text-xs mb-3 line-clamp-2">{course.description}</p>}
          <div className="mt-auto space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-gray-400">Progress</span>
                <span className={prog >= 100 ? 'text-green-500' : 'text-aiesec-blue'}>{Math.round(prog)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${prog >= 100 ? 'bg-green-500' : 'bg-impact-gradient'}`}
                  style={{ width: `${Math.round(prog)}%` }}></div>
              </div>
            </div>
            <button className={`w-full py-2.5 rounded-xl font-semibold text-sm flex justify-center items-center gap-2 transition-all pointer-events-none ${
              prog >= 100
                ? 'bg-green-50 text-green-600'
                : prog > 0
                ? 'bg-aiesec-blue text-white'
                : 'bg-aiesec-light text-aiesec-blue group-hover:bg-aiesec-blue group-hover:text-white'
            }`}>
              {prog >= 100 ? <><CheckCircle size={15}/> Review</> :
               prog > 0 ? <><PlayCircle size={15}/> Continue</> :
               <><BookOpen size={15}/> Start Learning</>}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-aiesec-blue border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="pb-10">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-aiesec-dark mb-2">Your Learning Path</h1>
        <p className="text-gray-500">Master your function through curated content. Click any course to start.</p>
      </div>

      {inProgress.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-aiesec-blue inline-block"></span> In Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {inProgress.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Completed
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {completed.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        </div>
      )}

      {notStarted.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-300 inline-block"></span> Available Courses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {notStarted.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        </div>
      )}

      {courses.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-semibold">No courses assigned to your function yet.</p>
        </div>
      )}
    </div>
  );
};

export default Courses;
