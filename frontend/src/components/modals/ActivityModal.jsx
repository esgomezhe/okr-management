import React, { useState, useEffect } from 'react';

const ActivityModal = ({ mode, activity, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: activity?.name || '',
    description: activity?.description || '',
    start_date: activity?.start_date || '',
    end_date: activity?.end_date || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mode === 'edit' && activity) {
      setForm({
        name: activity.name || '',
        description: activity.description || '',
        start_date: activity.start_date || '',
        end_date: activity.end_date || ''
      });
    }
  }, [mode, activity]);

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
        await onSave(activity.id, form);
      } else {
        await onSave(form);
      }
    } catch (err) {
      setError('Error al guardar la actividad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{mode === 'edit' ? 'Editar Actividad' : 'Nueva Actividad'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="activity-name">Nombre</label>
            <input
              type="text"
              id="activity-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="activity-description">Descripción</label>
            <textarea
              id="activity-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className="form-textarea"
            />
          </div>
          <div className="form-group">
            <label htmlFor="activity-start_date">Fecha de Inicio</label>
            <input
              type="date"
              id="activity-start_date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="activity-end_date">Fecha de Finalización</label>
            <input
              type="date"
              id="activity-end_date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              required
              className="form-input"
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

export default ActivityModal; 