import React, { useState, useEffect } from 'react';

const ObjectiveModal = ({ mode, objective, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: objective?.title || '',
    description: objective?.description || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mode === 'edit' && objective) {
      setForm({
        title: objective.title || '',
        description: objective.description || ''
      });
    }
  }, [mode, objective]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'edit') {
        await onSave(objective.id, form);
      } else {
        await onSave(form);
      }
    } catch (err) {
      setError('Error al guardar el objetivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{mode === 'edit' ? 'Editar Objetivo' : 'Nuevo Objetivo'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="objective-title">Título</label>
            <input
              type="text"
              id="objective-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="objective-description">Descripción</label>
            <textarea
              id="objective-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className="form-textarea"
            />
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

export default ObjectiveModal; 