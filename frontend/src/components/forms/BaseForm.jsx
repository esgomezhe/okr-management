import React from 'react';
import '../stylesheets/forms.css';

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
    <form onSubmit={onSubmit} className="base-form">
      {error && <div className="error-message">{error}</div>}
      <div className="form-content">
        {children}
      </div>
      <div className="form-actions">
        {onCancel && (
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
        )}
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading}
        >
          {loading ? 'Guardando...' : submitText}
        </button>
      </div>
    </form>
  );
};

export default BaseForm; 