import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../stylesheets/navigation.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navigation">
      <div className="nav-header">
        <Link to="/" className="logo">
          OKR Management
        </Link>
        <button
          className="mobile-menu-btn"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <span className="menu-icon"></span>
        </button>
      </div>

      <div className={`nav-content ${showMobileMenu ? 'show' : ''}`}>
        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/missions"
            className={`nav-link ${isActive('/missions') ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            Misiones
          </Link>
          <Link
            to="/objectives"
            className={`nav-link ${isActive('/objectives') ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            Objetivos
          </Link>
          <Link
            to="/key-results"
            className={`nav-link ${isActive('/key-results') ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            Resultados Clave
          </Link>
          <Link
            to="/activities"
            className={`nav-link ${isActive('/activities') ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            Actividades
          </Link>
          <Link
            to="/tasks"
            className={`nav-link ${isActive('/tasks') ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            Tareas
          </Link>
        </div>

        <div className="nav-footer">
          {user ? (
            <>
              <Link
                to="/profile"
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                onClick={() => setShowMobileMenu(false)}
              >
                Perfil
              </Link>
              <button className="logout-btn" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                onClick={() => setShowMobileMenu(false)}
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className={`nav-link ${isActive('/register') ? 'active' : ''}`}
                onClick={() => setShowMobileMenu(false)}
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 