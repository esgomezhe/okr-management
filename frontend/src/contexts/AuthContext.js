import React, { createContext, useState, useEffect } from 'react';
import { getUserDetails } from '../utils/apiServices';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al iniciar, intenta obtener los datos del usuario usando el token en localStorage
  useEffect(() => {
    const access = localStorage.getItem('access');
    if (access) {
      getUserDetails()
        .then((userData) => {
          setUser({ ...userData, token: access });
          setLoading(false);
        })
        .catch((error) => {
          // Si hay error al obtener detalles del usuario, limpiar localStorage
          clearAuthData();
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Sincroniza el token entre pestañas usando el evento "storage"
  useEffect(() => {
    const syncAuth = (event) => {
      if (event.key === 'access') {
        const newToken = event.newValue;
        if (newToken) {
          getUserDetails()
            .then((userData) => setUser({ ...userData, token: newToken }))
            .catch(() => {});
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', syncAuth);

    return () => {
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  // Escuchar evento de token expirado
  useEffect(() => {
    const handleTokenExpired = () => {
      clearAuthData();
    };

    window.addEventListener('tokenExpired', handleTokenExpired);

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  const login = async (accessToken) => {
    localStorage.setItem('access', accessToken);
    try {
      const userData = await getUserDetails();
      setUser({ ...userData, token: accessToken });
    } catch (error) {}
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
  };

  const clearAuthData = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, clearAuthData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};