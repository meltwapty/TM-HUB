import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileQuestion, LineChart, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/dashboard/courses', label: 'Your Learning Path', icon: <BookOpen size={20} /> },
    { path: '/dashboard/quizzes', label: 'Test Your Knowledge', icon: <FileQuestion size={20} /> },
    { path: '/dashboard/progress', label: 'Progress', icon: <LineChart size={20} /> },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  const funcColors = {
    'TM':'bg-blue-100 text-blue-700','B2B':'bg-green-100 text-green-700',
    'B2C':'bg-pink-100 text-pink-700','OGV':'bg-orange-100 text-orange-700',
    'OGT':'bg-yellow-100 text-yellow-700','IGV':'bg-teal-100 text-teal-700',
    'IGT':'bg-purple-100 text-purple-700','BD':'bg-indigo-100 text-indigo-700',
    'F&L':'bg-red-100 text-red-700','CXP':'bg-cyan-100 text-cyan-700',
  };
  const badgeClass = funcColors[user?.function] || 'bg-gray-100 text-gray-700';

  return (
    <div className="flex h-screen bg-aiesec-light overflow-hidden">
      <aside className="w-64 bg-white shadow-xl flex flex-col z-20">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-black tracking-tight text-aiesec-dark">
            TM <span className="text-aiesec-blue">HUB</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">AIESEC in MUST</p>
        </div>

        {user && (
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-impact-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-800 text-sm truncate">{user.first_name} {user.last_name}</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>{user.function || 'Admin'}</span>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 px-4 mt-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                  isActive ? 'bg-aiesec-blue text-white shadow-md' : 'text-gray-600 hover:bg-blue-50 hover:text-aiesec-blue'
                }`}>
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
          {user?.is_staff && (
            <Link to="/admin"
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-sm ${
                location.pathname.startsWith('/admin') ? 'bg-aiesec-orange text-white shadow-md' : 'text-gray-600 hover:bg-orange-50 hover:text-aiesec-orange'
              }`}>
              <ShieldCheck size={20} /><span className="font-medium">Admin Portal</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t">
          <button onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors text-sm">
            <LogOut size={20} /><span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#F5F7FA] flex flex-col">
        <div className="max-w-7xl mx-auto p-8 flex-1">
          <Outlet />
        </div>
        <footer className="p-8 text-center border-t border-gray-100 bg-white/50">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Mohamed Eltwapty - IM</p>
        </footer>
      </main>
    </div>
  );
};

export default DashboardLayout;
