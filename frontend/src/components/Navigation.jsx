import React, { useState } from 'react';
// Paso 1: Importamos NavLink en lugar de Link y ya no necesitamos useLocation
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../stylesheets/navigation.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Manejo de error opcional
    }
  };

  // Paso 2: Ya no necesitamos la función 'isActive' ni 'useLocation'

  return (
    <nav className="navigation">
      <div className="nav-header">
        <NavLink to="/" className="logo"> {/* <-- Cambiado a NavLink */}
          OKR Management
        </NavLink>
        <button
          className="mobile-menu-btn"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <span className="menu-icon"></span>
        </button>
      </div>

      <div className={`nav-content ${showMobileMenu ? 'show' : ''}`}>
        <div className="nav-links">
          {/* Paso 3: Reemplazamos todos los Link por NavLink y simplificamos la clase */}
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/dashboard/missions"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            Misiones
          </NavLink>
          <NavLink
            to="/objectives"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            Objetivos
          </NavLink>
          <NavLink
            to="/key-results"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            Resultados Clave
          </NavLink>
          <NavLink
            to="/activities"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            Actividades
          </NavLink>
          <NavLink
            to="/tasks"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            Tareas
          </NavLink>
        </div>

        <div className="nav-footer">
          {user ? (
            <>
              <NavLink
                to="/profile"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setShowMobileMenu(false)}
              >
                Perfil
              </NavLink>
              <button className="logout-btn" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setShowMobileMenu(false)}
              >
                Iniciar sesión
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setShowMobileMenu(false)}
              >
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;