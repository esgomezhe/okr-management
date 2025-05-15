import React, { useState, useEffect } from 'react';

const OKRModal = ({ show, onClose, onSave, okr }) => {
  const [form, setForm] = useState({
    key_result: okr?.key_result || '',
    current_value: okr?.current_value || 0,
    target_value: okr?.target_value || 100,
    progress: okr?.progress || 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show === 'edit' && okr) {
      setForm({
        key_result: okr.key_result || '',
        current_value: okr.current_value || 0,
        target_value: okr.target_value || 100,
        progress: okr.progress || 0
      });
    }
  }, [show, okr]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (show === 'edit') {
        await onSave(okr.id, form);
      } else {
        await onSave(form);
      }
    } catch (err) {
      setError('Error al guardar el OKR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{show === 'edit' ? 'Editar OKR' : 'Nuevo OKR'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="okr-key_result">Resultado Clave :</label>
            <input
              type="text"
              id="okr-key_result"
              name="key_result"
              value={form.key_result}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Ingrese el nombre del resultado clave"
            />
          </div>
          <div className="form-group">
            <label>Información del Progreso :</label>
            <div className="info-box" style={{ marginTop: '10px' }}>
              <div className="info-item">
                <span className="info-label">Valor Actual: </span>
                <span className="info-value">{form.current_value}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Valor Objetivo: </span>
                <span className="info-value">{form.target_value}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Progreso: </span>
                <span className="info-value">{form.progress}%</span>
              </div>
            </div>
            <small className="form-text" style={{ marginTop: '10px', display: 'block' }}>
              El progreso se calcula automáticamente según las tareas completadas asociadas a este OKR.
            </small>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OKRModal; 