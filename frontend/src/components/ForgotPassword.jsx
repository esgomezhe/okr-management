import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from '../utils/apiServices';
import '../stylesheets/results.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState('');

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await sendPasswordResetEmail(email);
      setMessage('Te hemos enviado un correo para restablecer tu contraseña.');
      setErrors('');
    } catch (error) {
      setErrors('Ocurrió un error. Por favor, intenta nuevamente.');
      setMessage('');
    }
  };

  return (
    <div className="lineabase">
      <div className="document-check">
        <form onSubmit={handleSubmit} className="document-check-form">
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
          {errors && (
            <div className="error-container">
              <p className="error-message">{errors}</p>
            </div>
          )}
          {message && (
            <div className="success-container">
              <p className="success-message">{message}</p>
            </div>
          )}
          <button type="submit" className="form-submit-button">Enviar correo de recuperación</button>
          <Link to="/login/" className="form-submit-button" style={{ textAlign: 'center' }}>
            Volver a Iniciar Sesión
          </Link>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;