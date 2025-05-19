import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../stylesheets/auth.css';
import BaseForm from './forms/BaseForm';
import { useForm } from '../hooks/useForm';

const initialState = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
};

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const onSubmit = async (data) => {
    if (data.password !== data.password_confirmation) {
      throw { response: { data: { general: 'Las contraseñas no coinciden' } } };
    }
    await register(data.name, data.email, data.password);
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
        <h2>Registro</h2>
        <BaseForm onSubmit={handleSubmit} loading={loading} error={errors?.general}>
          <div className="form-group">
            <label htmlFor="name">Nombre</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Tu nombre"
            />
            {errors?.name && <div className="error-message">{errors.name}</div>}
          </div>
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
              minLength="8"
            />
            {errors?.password && <div className="error-message">{errors.password}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="password_confirmation">Confirmar Contraseña</label>
            <input
              type="password"
              id="password_confirmation"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              required
              placeholder="••••••••"
              minLength="8"
            />
            {errors?.password_confirmation && <div className="error-message">{errors.password_confirmation}</div>}
          </div>
        </BaseForm>
        <div className="auth-footer">
          <p>
            ¿Ya tienes una cuenta?{' '}
            <a href="/login" className="auth-link">
              Inicia sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm; 