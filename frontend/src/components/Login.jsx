import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { registerUser, loginUser } from '../utils/apiServices';
import { AuthContext } from '../contexts/AuthContext';
import '../stylesheets/login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState('employee');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [errors, setErrors] = useState({});
  const { user, login, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Handlers para los campos del formulario
  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
  };

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
  };

  const handlePhoneChange = (event) => {
    setPhone(event.target.value);
  };

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  const handleRoleChange = (event) => {
    setRole(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handlePassword2Change = (event) => {
    setPassword2(event.target.value);
  };

  // Manejar el envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isRegister) {
      handleRegister();
    } else {
      handleLogin();
    }
  };

  // Función para manejar el inicio de sesión
  const handleLogin = async () => {
    try {
      // Limpiar localStorage antes de intentar iniciar sesión
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      
      const data = await loginUser(username, password);
      await login(data.access);
      setErrors({});
      
      // Redirigir a la página original o al dashboard por defecto
      const from = location.state?.from?.pathname || '/dashboard/missions';
      navigate(from, { replace: true });
    } catch (error) {
      if (error.response && error.response.data.detail) {
        setErrors({ detail: error.response.data.detail });
      } else if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ detail: 'Error al iniciar sesión. Inténtalo de nuevo.' });
      }
    }
  };

  // Función para manejar el registro de usuario
  const handleRegister = async () => {
    if (password !== password2) {
      setErrors({ detail: 'Las contraseñas no coinciden.' });
      return;
    }

    try {
      // Limpiar localStorage antes de intentar registrar
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      
      await registerUser(
        username,
        email,
        firstName,
        lastName,
        phone,
        city,
        role,
        password,
        password2
      );
      await handleLogin();
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ detail: 'Error al registrar usuario. Inténtalo de nuevo.' });
      }
    }
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-form-container">
          <div className="login-header">
            <h2>Cargando...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    navigate('/dashboard/missions');
    return null;
  }

  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="login-header">
          <h2>{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
          <p>{isRegister ? 'Completa el formulario para registrarte' : 'Ingresa tus credenciales para continuar'}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={handleUsernameChange}
              required
              className="form-input"
              placeholder="Ingresa tu usuario"
            />
          </div>

          {isRegister && (
            <>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className="form-input"
                  placeholder="Ingresa tu correo electrónico"
                />
              </div>

              <div className="form-group">
                <label htmlFor="first_name" className="form-label">Nombre</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={firstName}
                  onChange={handleFirstNameChange}
                  required
                  className="form-input"
                  placeholder="Ingresa tu nombre"
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name" className="form-label">Apellido</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={lastName}
                  onChange={handleLastNameChange}
                  required
                  className="form-input"
                  placeholder="Ingresa tu apellido"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  className="form-input"
                  placeholder="Ingresa tu teléfono"
                />
              </div>

              <div className="form-group">
                <label htmlFor="city" className="form-label">Ciudad</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={city}
                  onChange={handleCityChange}
                  required
                  className="form-input"
                  placeholder="Ingresa tu ciudad"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role" className="form-label">Rol</label>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={handleRoleChange}
                  required
                  className="form-input"
                >
                  <option value="employee">Empleado</option>
                  <option value="manager">Gerente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="password2" className="form-label">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="password2"
                  name="password2"
                  value={password2}
                  onChange={handlePassword2Change}
                  required
                  className="form-input"
                  placeholder="Confirma tu contraseña"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
              required
              className="form-input"
              placeholder="Ingresa tu contraseña"
            />
          </div>

          {errors.detail && (
            <div className="error-container">
              <p className="error-message">{errors.detail}</p>
            </div>
          )}

          <button type="submit" className="form-submit-button">
            {isRegister ? 'Registrarse' : 'Iniciar Sesión'}
          </button>

          {!isRegister && (
            <Link to="/forgot-password/" className="forgot-password-link">
              ¿Olvidaste tu contraseña?
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="form-submit-button secondary-button"
          >
            {isRegister ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes una cuenta? Regístrate'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;