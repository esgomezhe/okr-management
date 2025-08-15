import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useContext } from 'react';

export const useAuthCleanup = () => {
  const { clearAuthData } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar tokens al cargar la página
    const checkTokens = () => {
      const accessToken = localStorage.getItem('access');
      const refreshToken = localStorage.getItem('refresh');
      
      // Si no hay tokens, no hacer nada
      if (!accessToken && !refreshToken) {
        return;
      }
      
      // Si solo hay access token pero no refresh token, limpiar
      if (accessToken && !refreshToken) {
        clearAuthData();
        navigate('/login', { replace: true });
        return;
      }
      
      // Verificar si el access token está expirado (formato JWT)
      if (accessToken) {
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (payload.exp < currentTime) {
            // Token expirado, limpiar localStorage
            clearAuthData();
            navigate('/login', { replace: true });
          }
        } catch (error) {
          // Token malformado, limpiar localStorage
          clearAuthData();
          navigate('/login', { replace: true });
        }
      }
    };

    // Verificar al cargar
    checkTokens();

    // Verificar cada 5 minutos
    const interval = setInterval(checkTokens, 5 * 60 * 1000);

    // Limpiar intervalo al desmontar
    return () => clearInterval(interval);
  }, [clearAuthData, navigate]);

  return { clearAuthData };
};
