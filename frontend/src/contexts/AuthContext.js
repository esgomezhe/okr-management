import React, { createContext, useState, useEffect } from 'react';
import { getUserDetails } from '../utils/apiServices';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = localStorage.getItem('access');
    console.log('Token obtenido de localStorage:', access); // Agregar esta línea
    if (access) {
      Promise.all([
        getUserDetails(access),
      ]).then(([userData]) => {
        console.log('Datos del usuario en AuthProvider:', userData);
        setUser({ ...userData, token: access });
        setLoading(false);
      }).catch((error) => {
        console.error('Error al obtener detalles del usuario en AuthProvider:', error);
        setLoading(false);
      });
    } else {
      console.log('No hay token en localStorage.');
      setLoading(false);
    }
  }, []);

  const login = async (accessToken) => {
    console.log('Login con token:', accessToken); // Agregar esta línea
    localStorage.setItem('access', accessToken);
    try {
      const [userData] = await Promise.all([
        getUserDetails(accessToken),
      ]);
      console.log('Datos del usuario después del login:', userData);
      setUser({ ...userData, token: accessToken });
    } catch (error) {
      console.error('Error al obtener detalles del usuario después del login:', error);
    }
  };

  const logout = () => {
    console.log('Cerrando sesión.');
    localStorage.removeItem('access');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};