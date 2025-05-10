import React, { createContext, useState, useEffect } from 'react';
import { getUserDetails } from '../utils/apiServices';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al iniciar, intenta obtener los datos del usuario usando el token en localStorage
  useEffect(() => {
    const access = localStorage.getItem('access');
    console.log('Access token al iniciar AuthContext:', access);
    if (access) {
      getUserDetails()
        .then((userData) => {
          console.log('Datos del usuario en AuthContext:', userData);
          setUser({ ...userData, token: access });
          setLoading(false);
        })
        .catch((error) => {
          console.error(
            'Error en AuthContext obteniendo detalles del usuario:',
            error
          );
          setLoading(false);
        });
    } else {
      console.warn('No hay token en localStorage.');
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
            .catch((error) =>
              console.error('Error sincronizando token:', error)
            );
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

  const login = async (accessToken) => {
    console.log('Guardando access token:', accessToken);
    localStorage.setItem('access', accessToken);
    try {
      const userData = await getUserDetails();
      console.log('Datos del usuario después del login:', userData);
      setUser({ ...userData, token: accessToken });
    } catch (error) {
      console.error(
        'Error al obtener detalles del usuario después del login:',
        error
      );
    }
  };

  const logout = () => {
    console.log('Cerrando sesión y removiendo tokens.');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};