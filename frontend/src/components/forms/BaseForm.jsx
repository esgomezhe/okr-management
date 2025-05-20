import React from 'react';

const BaseForm = ({
  onSubmit,
  children,
  loading = false,
  submitText = 'Guardar',
  cancelText = 'Cancelar',
  onCancel,
  error = null
}) => {
  return (
    <form onSubmit={onSubmit} className="auth-form">
      {error && <div className="auth-error">{error}</div>}
      <div className="auth-form-content">
        {children}
      </div>
      <div className="auth-form-actions">
        {onCancel && (
          <button 
            type="button" 
            className="auth-button auth-button-secondary" 
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
        )}
        <button 
          type="submit" 
          className="auth-button auth-button-primary" 
          disabled={loading}
        >
          {loading ? 'Guardando...' : submitText}
        </button>
      </div>
    </form>
  );
};

export default BaseForm; 