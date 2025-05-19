import React from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from '../utils/apiServices';
import '../stylesheets/results.css';
import BaseForm from './forms/BaseForm';
import { useForm } from '../hooks/useForm';

const initialState = { email: '' };

function ForgotPassword() {
  const onSubmit = async (data) => {
    await sendPasswordResetEmail(data.email);
  };

  const {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit
  } = useForm(initialState, onSubmit);

  return (
    <div className="lineabase">
      <div className="document-check">
        <BaseForm onSubmit={handleSubmit} loading={loading} error={errors?.general}>
          <label htmlFor="email" className="form-label">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-input"
          />
        </BaseForm>
        <Link to="/login/" className="form-submit-button" style={{ textAlign: 'center' }}>
          Volver a Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;