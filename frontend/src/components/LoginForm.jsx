import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../stylesheets/auth.css';
import BaseForm from './forms/BaseForm';
import { useForm } from '../hooks/useForm';

const initialState = {
  email: '',
  password: '',
};

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data) => {
    await login(data.email, data.password);
    navigate('/');
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
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="tu@email.com"
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