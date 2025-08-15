import React, { useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading, clearAuthData } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    // Verificar si hay tokens en localStorage pero no hay usuario
    const accessToken = localStorage.getItem('access');
    if (accessToken && !user && !loading) {
      // Si hay token pero no hay usuario, limpiar datos corruptos
      clearAuthData();
    }
  }, [user, loading, clearAuthData]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        Cargando...
      </div>
    );
  }

  if (!user) {
    // Redirigir al login y guardar la ubicación actual para redirigir después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
