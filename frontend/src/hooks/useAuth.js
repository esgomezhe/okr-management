import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService, logout as logoutService } from '../utils/apiServices';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await loginService(credentials);
      const userData = {
        ...response.user,
        accessToken: response.access,
        refreshToken: response.refresh
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      navigate('/dashboard');
      return userData;
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await logoutService();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
      navigate('/login');
    }
  }, [navigate]);

  const isAuthenticated = useCallback(() => {
    return !!user;
  }, [user]);

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated
  };
}; 