import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../utils/apiServices';
import '../stylesheets/profile.css';
import BaseForm from './forms/BaseForm';
import { useForm } from '../hooks/useForm';

const initialProfile = {
  name: '',
  email: ''
};
const initialPassword = {
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
};

const Profile = () => {
  const { user } = useAuth();

  // Formulario de perfil
  const onProfileSubmit = async (data) => {
    await userService.updateProfile({ name: data.name, email: data.email });
  };
  const {
    formData: profileData,
    errors: profileErrors,
    loading: profileLoading,
    handleChange: handleProfileChange,
    handleSubmit: handleProfileSubmit,
    setFormData: setProfileData
  } = useForm(initialProfile, onProfileSubmit);

  // Formulario de contraseña
  const onPasswordSubmit = async (data) => {
    if (data.new_password !== data.new_password_confirmation) {
      throw { response: { data: { general: 'Las contraseñas no coinciden' } } };
    }
    await userService.updatePassword(data);
  };
  const {
    formData: passwordData,
    errors: passwordErrors,
    loading: passwordLoading,
    handleChange: handlePasswordChange,
    handleSubmit: handlePasswordSubmit,
    setFormData: setPasswordData
  } = useForm(initialPassword, onPasswordSubmit);

  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({ ...prev, name: user.name, email: user.email }));
    }
  }, [user, setProfileData]);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Perfil de Usuario</h2>
      </div>
      <div className="profile-content">
        <div className="profile-section">
          <h3>Información Personal</h3>
          <BaseForm onSubmit={handleProfileSubmit} loading={profileLoading} error={profileErrors?.general}>
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                required
              />
              {profileErrors?.name && <div className="error-message">{profileErrors.name}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                required
              />
              {profileErrors?.email && <div className="error-message">{profileErrors.email}</div>}
            </div>
          </BaseForm>
        </div>
        <div className="profile-section">
          <h3>Cambiar Contraseña</h3>
          <BaseForm onSubmit={handlePasswordSubmit} loading={passwordLoading} error={passwordErrors?.general}>
            <div className="form-group">
              <label htmlFor="current_password">Contraseña Actual</label>
              <input
                type="password"
                id="current_password"
                name="current_password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                required
              />
              {passwordErrors?.current_password && <div className="error-message">{passwordErrors.current_password}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="new_password">Nueva Contraseña</label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                required
                minLength="8"
              />
              {passwordErrors?.new_password && <div className="error-message">{passwordErrors.new_password}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="new_password_confirmation">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                id="new_password_confirmation"
                name="new_password_confirmation"
                value={passwordData.new_password_confirmation}
                onChange={handlePasswordChange}
                required
                minLength="8"
              />
              {passwordErrors?.new_password_confirmation && <div className="error-message">{passwordErrors.new_password_confirmation}</div>}
            </div>
          </BaseForm>
        </div>
      </div>
    </div>
  );
};

export default Profile; 