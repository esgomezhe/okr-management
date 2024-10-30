import React from 'react';
import ReactDOM from 'react-dom';
import '../stylesheets/popup.css';

const Popup = ({ children, isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return ReactDOM.createPortal(
    <div className="popup-overlay">
      <div className="popup-content">
        {children}
        <button className="close-button" onClick={onClose}>×</button>
      </div>
    </div>,
    document.getElementById('popup-root') // Asegúrate de que este ID coincide con el de App.js
  );
};

export default Popup;
