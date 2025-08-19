import React from 'react';
import '../stylesheets/LoadingSpinner.css';
const LoadingSpinner = () => {
  return (
    <div className="spinner-overlay">
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner;