import usePermissions from '../hooks/usePermissions';

/**
 * Este componente actúa como un guardián.
 * Solo renderiza los componentes hijos (children) si el rol del usuario actual
 * está incluido en la lista de roles permitidos (allowedRoles).
 *
 * @param {object} props
 * @param {string[]} props.allowedRoles - Un array de roles permitidos (ej: ['admin', 'manager'])
 * @param {React.ReactNode} props.children - Los componentes que se protegerán.
 */
const PermissionGate = ({ allowedRoles, children }) => {
  // Obtenemos el rol del usuario actual desde nuestro hook
  const { userRole } = usePermissions();

  // Verificamos si el rol del usuario está en la lista de roles permitidos
  const hasPermission = allowedRoles.includes(userRole);

  // Si no tiene permiso, no renderizamos nada (o podríamos mostrar un mensaje)
  if (!hasPermission) {
    return null;
  }

  // Si tiene permiso, renderizamos los componentes hijos que están dentro del Gate
  return <>{children}</>;
};

export default PermissionGate;