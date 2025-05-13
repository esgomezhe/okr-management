import React, { useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from '../contexts/AuthContext';
import { logoutUser } from '../utils/apiServices';
import '../stylesheets/header.css';

function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const navbar = document.getElementById('navbar');

    const handleMobileNavToggle = (e) => {
      navbar.classList.toggle('navbar-mobile');
      e.target.classList.toggle('bi-list');
      e.target.classList.toggle('bi-x');
    };

    const handleDropdownClick = (e) => {
      if (navbar.classList.contains('navbar-mobile')) {
        e.preventDefault();
        e.target.nextElementSibling?.classList.toggle('dropdown-active');
      }
    };

    const handleScrollTo = (hash) => {
      const targetElement = document.querySelector(hash);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    if (mobileNavToggle) {
      mobileNavToggle.addEventListener('click', handleMobileNavToggle);
    }

    const dropdownLinks = document.querySelectorAll('.navbar .dropdown > a');
    if (dropdownLinks) {
      dropdownLinks.forEach(item => {
        item.addEventListener('click', handleDropdownClick, true);
      });
    }

    const scrollToLinks = document.querySelectorAll('.scrollto');
    if (scrollToLinks) {
      scrollToLinks.forEach(item => {
        item.addEventListener('click', (e) => handleScrollTo(e.target.hash), true);
      });
    }

    return () => {
      if (mobileNavToggle) {
        mobileNavToggle.removeEventListener('click', handleMobileNavToggle);
      }
      if (dropdownLinks) {
        dropdownLinks.forEach(item => {
          item.removeEventListener('click', handleDropdownClick, true);
        });
      }
      if (scrollToLinks) {
        scrollToLinks.forEach(item => {
          item.removeEventListener('click', (e) => handleScrollTo(e.target.hash), true);
        });
      }
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
      navigate('/login/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Aún así, forzamos el cierre de sesión local
    logout();
      navigate('/login/');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className='header'>
      <div className='header__container'>
        <div className='header--logo'>
          <Link to='/'>
            <img
              className='header--image'
              src={require('../img/wirk_logo.jpg')}
              alt="Cámara de Comercio de Cali"
            />
          </Link>
        </div>
        <nav id="navbar" className="navbar">
          <ul>
              {user ? (
                <>
                <li className={`nav-item ${isActive('/dashboard/missions')}`}>
                  <Link to='/dashboard/missions'>Misiones</Link>
                </li>
                <li className={`nav-item ${isActive('/dashboard/projects')}`}>
                  <Link to='/dashboard/projects'>Proyectos</Link>
                </li>
                <li className="dropdown">
                  <Link to='#' onClick={handleLogout}>Salir</Link>
                </li>
                </>
              ) : (
              <li className="dropdown">
                <Link to='/login/'>Iniciar Sesión</Link>
              </li>
              )}
          </ul>
          <i className="bi bi-list mobile-nav-toggle"></i>
        </nav>
      </div>
    </header>
  );
}

export default Header;