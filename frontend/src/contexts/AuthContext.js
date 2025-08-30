import React, { createContext, useState, useEffect } from 'react';
import { getUserDetails, loginUser } from '../utils/apiServices';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const access = localStorage.getItem('access');
      if (access) {
        try {
          const userData = await getUserDetails();
          setUser(userData);
        } catch (error) {
          clearAuthData();
        }
      }
      setLoading(false);
    };
    bootstrapAuth();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
  };
  
  const login = async (username, password) => {
    try {
      const tokenData = await loginUser(username, password);
      localStorage.setItem('access', tokenData.access);
      localStorage.setItem('refresh', tokenData.refresh);
      
      const userData = await getUserDetails();
      setUser(userData);

      return userData;

    } catch (error) {
      console.error("Error en el proceso de login:", error);
      clearAuthData();
      throw error;
    }
  };

  const logout = () => {
    clearAuthData();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, clearAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};