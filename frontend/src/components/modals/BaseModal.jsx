import React from 'react';
import '../stylesheets/modal.css';

const BaseModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  loading = false,
  error = null 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BaseModal; 