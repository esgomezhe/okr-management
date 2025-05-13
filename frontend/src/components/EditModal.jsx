import React, { useState, useEffect } from 'react';
import { updateMission, updateProject } from '../utils/apiServices';
import '../stylesheets/modal.css';

const EditModal = ({ isOpen, onClose, item, type, onItemUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    color: '#FF5733',
    members_ids: []
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        start_date: item.start_date || '',
        end_date: item.end_date || '',
        color: item.color || '#FF5733',
        members_ids: item.members_ids || []
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToSubmit = {
        ...formData,
        end_date: formData.end_date || null
      };

      const updateFunction = type === 'mission' ? updateMission : updateProject;
      const updatedItem = await updateFunction(item.id, dataToSubmit);
      onItemUpdated(updatedItem);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || `Error al actualizar el ${type === 'mission' ? 'misión' : 'proyecto'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Editar {type === 'mission' ? 'Misión' : 'Proyecto'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="form-textarea"
            />
          </div>
          <div className="form-group">
            <label htmlFor="start_date">Fecha de Inicio</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="end_date">Fecha de Finalización (Opcional)</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="color">Color</label>
            <div className="color-input-container">
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="form-color"
              />
              <span className="color-value">{formData.color}</span>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal; 