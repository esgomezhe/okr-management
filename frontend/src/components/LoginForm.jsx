import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../stylesheets/auth.css';
import BaseForm from './forms/BaseForm';
import { useForm } from '../hooks/useForm';
import { ROLES } from '../hooks/usePermissions'; // Importamos los roles

const initialState = {
  email: '', // El backend usa 'username', pero mantendremos 'email' si así lo prefieres en el form
  password: '',
};

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (formData) => {
    // La función 'login' ahora devuelve los datos del usuario
    const loggedInUser = await login(formData.email, formData.password);

    if (loggedInUser) {
      // Si el login fue exitoso, revisamos el rol
      if (loggedInUser.role === ROLES.MANAGER || loggedInUser.role === ROLES.ADMIN) {
        // Si es manager o admin, va al dashboard de misiones
        navigate('/dashboard/missions');
      } else {
        // Si es cualquier otro rol (empleado), va a su panel personal
        navigate('/dashboard/employee');
      }
    }
    // Si loggedInUser es nulo o hay un error, el hook useForm lo manejará
  };

  const {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit
  } = useForm(initialState, onSubmit);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Iniciar Sesión</h2>
        <BaseForm onSubmit={handleSubmit} loading={loading} error={errors?.general}>
          <div className="form-group">
            <label htmlFor="email">Usuario o Correo</label> {/* Cambiado para ser más claro */}
            <input
              type="text" // Cambiado a text para permitir usernames
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="tu_usuario"
            />
            {errors?.email && <div className="error-message">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
            {errors?.password && <div className="error-message">{errors.password}</div>}
          </div>
        </BaseForm>
        <div className="auth-footer">
          <p>
            ¿No tienes una cuenta?{' '}
            <a href="/register" className="auth-link">
              Regístrate
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;