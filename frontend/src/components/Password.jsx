import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../utils/apiServices';
import { AuthContext } from '../contexts/AuthContext';
import home from '../img/svg/home.svg';
import arrow from '../img/svg/arrow.svg';
import figure from '../img/svg/formulario_figure.svg';
import '../stylesheets/results.css';
import BaseForm from './forms/BaseForm';
import { useForm } from '../hooks/useForm';

const initialState = {
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
};

function ChangePassword() {
  const { user, loading: authLoading, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmNewPassword) {
      throw { response: { data: { general: 'Las contraseñas nuevas no coinciden.' } } };
    }
    await changePassword(user.token, data.currentPassword, data.newPassword);
    updateProfile({ ...user, password: data.newPassword });
  };

  const {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit
  } = useForm(initialState, onSubmit);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login/');
    }
  }, [authLoading, user, navigate]);

  if (authLoading || !user) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="lineabase">
      <div className="notice__container">
        <div className="figure">
          <img src={figure} alt="figure" height={155} />
        </div>
        <div className="notice__options">
          <img src={home} alt="home" onClick={() => navigate('/')} />
          <img src={arrow} alt="arrow" />
          <p className="notice__options--text">Formulario de Cambio de Contraseña</p>
        </div>
        <div className="notice__title--container">
          <h4 className="notice__title">Cambia tu Contraseña</h4>
        </div>
      </div>
      <div className="document-check">
        <BaseForm onSubmit={handleSubmit} loading={loading} error={errors?.general}>
          <label htmlFor="currentPassword" className="form-label">Contraseña Actual</label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
            className="form-input"
          />
          <label htmlFor="newPassword" className="form-label">Nueva Contraseña</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            className="form-input"
          />
          <label htmlFor="confirmNewPassword" className="form-label">Confirma Nueva Contraseña</label>
          <input
            type="password"
            id="confirmNewPassword"
            name="confirmNewPassword"
            value={formData.confirmNewPassword}
            onChange={handleChange}
            required
            className="form-input"
          />
        </BaseForm>
      </div>
    </div>
  );
}

export default ChangePassword;