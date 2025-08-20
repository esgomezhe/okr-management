import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
};

export const usePermissions = () => {
  const { user } = useContext(AuthContext);

  const isAdmin = user?.role === ROLES.ADMIN;
  const isManager = user?.role === ROLES.MANAGER || isAdmin;
  const isEmployee = !!user;

  // --- Bloque para depurar ---
  console.log('--- DEBUGGING DE PERMISOS ---');
  console.log('El objeto "user" que recibe el hook es:', user);
  console.log('El rol extraído (user.role) es:', user?.role);
  console.log('¿El resultado de "isManager" es?:', isManager);
  console.log('-----------------------------');
  // --- Fin del bloque de depuración ---

  return {
    userRole: user?.role,
    isAdmin,
    isManager,
    isEmployee,
  };
};