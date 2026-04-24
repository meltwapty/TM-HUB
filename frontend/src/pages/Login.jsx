import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userData = await login(email, password);
      if (userData.is_staff) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-impact-gradient flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#6f42c1] opacity-20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl max-w-md w-full z-10 relative">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-impact-gradient rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-xl">TM</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-aiesec-dark">
            TM <span className="text-aiesec-blue">HUB</span>
          </h1>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-xl text-sm font-medium">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">AIESEC Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@aiesec.net"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-aiesec-blue transition-all"
              required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-aiesec-blue transition-all"
              required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-aiesec-blue hover:bg-blue-600 disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center gap-2 mt-2">
            <LogIn size={20} />
            {loading ? 'Logging in...' : 'Login with EXPA'}
          </button>
        </form>
        <div className="mt-8 text-center pt-8 border-t border-gray-100/50">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Mohamed Eltwapty - IM</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
