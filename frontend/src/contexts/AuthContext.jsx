import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import { setTokens, setUser, clearTokens, getUser, isAuthenticated } from '../utils/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初始化时检查登录状态
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUserState(userData);
          setUser(userData);
        } catch (error) {
          clearTokens();
          setUserState(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    const response = await authAPI.login({ username, password });
    const { user, tokens } = response;
    setTokens(tokens.access, tokens.refresh);
    setUser(user);
    setUserState(user);
    return user;
  };

  const register = async (data) => {
    const response = await authAPI.register(data);
    const { user, tokens } = response;
    setTokens(tokens.access, tokens.refresh);
    setUser(user);
    setUserState(user);
    return user;
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      setUserState(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isContestant: user?.role === 'contestant',
    isJudge: user?.role === 'judge',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
