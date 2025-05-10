import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../utils/apiServices';
import { AuthContext } from '../contexts/AuthContext';
import thankYouImage from '../img/grow-you-business.png';
import '../stylesheets/results.css';

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
  const navigate = useNavigate(); // Hook para navegar

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
      const data = await loginUser(username, password);
      await login(data.access);
      setErrors({});
      navigate('/dashboard/');
    } catch (error) {
      if (error.response && error.response.data.detail) {
        setErrors({ detail: error.response.data.detail });
      } else if (error.response && error.response.data) {
        // Manejar errores por campo
        setErrors(error.response.data);
      } else {
        setErrors({ detail: 'Error al iniciar sesión. Inténtalo de nuevo.' });
      }
    }
  };

  // Función para manejar el registro de usuario
  const handleRegister = async () => {
    // Validación básica en el frontend
    if (password !== password2) {
      setErrors({ detail: 'Las contraseñas no coinciden.' });
      return;
    }

    try {
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
      // Después de registrarse, iniciar sesión automáticamente
      await handleLogin();
    } catch (error) {
      if (error.response && error.response.data) {
        // Manejar errores por campo
        setErrors(error.response.data);
      } else {
        setErrors({ detail: 'Error al registrar usuario. Inténtalo de nuevo.' });
      }
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (user) {
    return (
      <section className="thank_you">
        <div className='thank_you__image'>
          <img src={thankYouImage} alt="Thank You"/>
        </div>
        <div className="thank_you__text">
          <h1>Bienvenido a la herramienta de OKRs de Wirk Tools!, {user?.user.first_name || 'Usuario'}!</h1>
          <h3>Es para nosotros un gusto poder ayudarte en tu crecimiento empresarial.</h3>
          <p>Dale un impulso a tu trayectoria con solo un clic. Empieza tu prueba en nuestras herramientas y abre la puerta a un mundo de oportunidades digitales.</p>
          <p>Regresa a la página principal: <Link className='thank_you__link' to='/'>Home</Link></p>
        </div>
      </section>
    );
  }

  return (
    <div className="lineabase">
      {!user && (
        <div className="document-check">
          <form onSubmit={handleSubmit} className="document-check-form">
            <h2>{isRegister ? 'Registrar' : 'Iniciar Sesión'}</h2>

            {/* Campo de Usuario */}
            <label htmlFor="username" className="form-label">Usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={handleUsernameChange}
              required
              className="form-input"
            />

            {/* Campos de Registro */}
            {isRegister && (
              <>
                {/* Campo de Correo Electrónico */}
                <label htmlFor="email" className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className="form-input"
                />

                {/* Campo de Nombre */}
                <label htmlFor="first_name" className="form-label">Nombre</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={firstName}
                  onChange={handleFirstNameChange}
                  required
                  className="form-input"
                />

                {/* Campo de Apellido */}
                <label htmlFor="last_name" className="form-label">Apellido</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={lastName}
                  onChange={handleLastNameChange}
                  required
                  className="form-input"
                />

                {/* Campo de Teléfono */}
                <label htmlFor="phone" className="form-label">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  className="form-input"
                />

                {/* Campo de Ciudad */}
                <label htmlFor="city" className="form-label">Ciudad</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={city}
                  onChange={handleCityChange}
                  required
                  className="form-input"
                />

                {/* Campo de Rol */}
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
                  {/* Añade más roles según tus necesidades */}
                </select>

                {/* Campo de Confirmar Contraseña */}
                <label htmlFor="password2" className="form-label">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="password2"
                  name="password2"
                  value={password2}
                  onChange={handlePassword2Change}
                  required
                  className="form-input"
                />
              </>
            )}

            {/* Campo de Contraseña */}
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
              required
              className="form-input"
            />

            {/* Mostrar Errores */}
            {errors.detail && (
              <div className="error-container">
                <p className="error-message">{errors.detail}</p>
              </div>
            )}

            {/* Botón de Envío */}
            <button type="submit" className="form-submit-button">
              {isRegister ? 'Registrar' : 'Iniciar Sesión'}
            </button>

            {/* Botón para alternar entre Registro e Inicio de Sesión */}
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
      )}
    </div>
  );
}

export default Login;