import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API = window.location.origin.includes('localhost') 
  ? 'http://localhost:8000/api' 
  : '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('tmhub_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('tmhub_token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true); setError(null);
    try {
      const res = await axios.post(`${API}/auth/login/`, { username: email, password });
      const { access, refresh, user: userData } = res.data;
      setToken(access); setUser(userData);
      localStorage.setItem('tmhub_token', access);
      localStorage.setItem('tmhub_refresh', refresh);
      localStorage.setItem('tmhub_user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Check your credentials.';
      setError(msg); throw new Error(msg);
    } finally { setLoading(false); }
  };

  const logout = () => {
    setToken(null); setUser(null);
    localStorage.removeItem('tmhub_token');
    localStorage.removeItem('tmhub_refresh');
    localStorage.removeItem('tmhub_user');
  };

  const authAxios = axios.create({ baseURL: API });

  authAxios.interceptors.request.use(cfg => {
    const t = localStorage.getItem('tmhub_token');
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
    return cfg;
  });

  // Automatic Refresh Interceptor
  authAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem('tmhub_refresh');
        if (refreshToken) {
          try {
            const res = await axios.post(`${API}/auth/refresh/`, { refresh: refreshToken });
            const newAccessToken = res.data.access;
            localStorage.setItem('tmhub_token', newAccessToken);
            setToken(newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return authAxios(originalRequest);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }
      }
      return Promise.reject(error);
    }
  );

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, error, authAxios }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
