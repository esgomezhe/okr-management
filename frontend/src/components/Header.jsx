import React, { useEffect, useContext } from 'react';
import { NavLink, Link, useNavigate } from "react-router-dom"; 
import { AuthContext } from '../contexts/AuthContext';
import { logoutUser } from '../utils/apiServices';
import '../stylesheets/header.css';
import { usePermissions } from '../hooks/usePermissions';

function Header() {
  const { user, logout } = useContext(AuthContext);
  console.log('Usuario para permisos:', user);
  const navigate = useNavigate();
  const { isAdmin, isManager } = usePermissions();
  // Paso 2: Ya no necesitamos 'useLocation' ni la función 'isActive'

  useEffect(() => {
    // Este bloque de código para manejar el menú móvil no necesita cambios.
    // Se deja tal cual para que la funcionalidad del menú en celular siga intacta.
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

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

    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    if (mobileNavToggle) {
      mobileNavToggle.addEventListener('click', handleMobileNavToggle);
    }

    const dropdownLinks = document.querySelectorAll('.navbar .dropdown > a');
    dropdownLinks.forEach(item => {
      item.addEventListener('click', handleDropdownClick, true);
    });

    return () => {
      if (mobileNavToggle) {
        mobileNavToggle.removeEventListener('click', handleMobileNavToggle);
      }
      dropdownLinks.forEach(item => {
        item.removeEventListener('click', handleDropdownClick, true);
      });
    };
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      sessionStorage.clear();
      await logoutUser();
      logout();
      navigate('/login/');
    } catch (error) {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      sessionStorage.clear();
      logout();
      navigate('/login/');
    }
  };

  return (
    <header className='header'>
      <div className='header__container'>
        <div className='header--logo'>
          <Link to='/'>
            <img
              className='header--image'
              src={require('../img/wirk_logo.jpg')}
              alt="Wirk Consulting Logo"
              loading="lazy"
            />
          </Link>
        </div>
        <nav id="navbar" className="navbar">
          <ul>
            {user ? ( // Si el usuario está logueado...
              <>
                {isManager ? (
                  // Si es Manager o Admin, muestra estos enlaces
                  <>
                    <li><NavLink className="nav-link" to='/dashboard/missions'>Misiones</NavLink></li>
                    <li><NavLink className="nav-link" to='/dashboard/projects'>Proyectos</NavLink></li>
                  </>
                ) : (
                  // Si NO es Manager (es decir, es Empleado), muestra este enlace
                  <li><NavLink className="nav-link" to='/dashboard/employee'>Mi Panel</NavLink></li>
                )}

                {/* El botón de Salir es para todos los usuarios logueados */}
                <li><a href="#" onClick={handleLogout}>Salir</a></li>
              </>
            ) : (
              // Si no hay sesión iniciada
              <li>
                <NavLink className="nav-link" to='/login/'>Iniciar Sesión</NavLink>
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