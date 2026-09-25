import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('campusride_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('campusride_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.success && res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('campusride_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.warn('[AuthContext] Session check warning:', err.message);
        localStorage.removeItem('campusride_token');
        localStorage.removeItem('campusride_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const loginUser = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success) {
        const { user: userData, token: jwtToken } = res.data;
        localStorage.setItem('campusride_token', jwtToken);
        localStorage.setItem('campusride_user', JSON.stringify(userData));
        setToken(jwtToken);
        setUser(userData);
        return { success: true, message: res.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const registerUser = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.success) {
        const { user: userData, token: jwtToken } = res.data;
        localStorage.setItem('campusride_token', jwtToken);
        localStorage.setItem('campusride_user', JSON.stringify(userData));
        localStorage.removeItem('campusride_signup_draft');
        setToken(jwtToken);
        setUser(userData);
        return { success: true, message: res.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateUser = (userData) => {
    if (userData) {
      setUser(userData);
      localStorage.setItem('campusride_user', JSON.stringify(userData));
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('campusride_token');
    localStorage.removeItem('campusride_user');
    localStorage.removeItem('campusride_signup_draft');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        loginUser,
        registerUser,
        updateUser,
        logoutUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isVerifiedStudent: user?.verificationStatus === 'verified',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
