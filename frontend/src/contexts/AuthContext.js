import React, { createContext, useState, useEffect } from 'react';
// Importamos también la función 'loginUser' desde la API
import { getUserDetails, loginUser } from '../utils/apiServices';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al iniciar, intenta obtener los datos del usuario usando el token en localStorage
  useEffect(() => {
    const bootstrapAuth = async () => {
      const access = localStorage.getItem('access');
      if (access) {
        try {
          const userData = await getUserDetails();
          setUser(userData);
        } catch (error) {
          // Si el token es inválido, limpiamos los datos
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
  
  // --- FUNCIÓN LOGIN CORREGIDA ---
  // Ahora acepta 'username' y 'password'
  const login = async (username, password) => {
    try {
      // 1. Llama a la API para obtener los tokens
      const tokenData = await loginUser(username, password);
      localStorage.setItem('access', tokenData.access);
      localStorage.setItem('refresh', tokenData.refresh);
      
      // 2. Con el token, obtén los detalles completos del usuario
      const userData = await getUserDetails();
      setUser(userData); // Guarda el usuario en el estado global

      // 3. Devuelve los datos del usuario para la redirección
      return userData;

    } catch (error) {
      console.error("Error en el proceso de login:", error);
      clearAuthData(); // Limpia todo si hay un error
      throw error;     // Lanza el error para que el formulario lo muestre
    }
  };

  const logout = () => {
    // La función logoutUser de la API debería llamarse aquí idealmente,
    // pero por ahora solo limpiamos los datos locales.
    clearAuthData();
  };


  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};