import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { missionService } from '../utils/apiServices';
import '../stylesheets/mission.css';

const MissionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'active',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      loadMission();
    }
  }, [id]);

  const loadMission = async () => {
    try {
      setLoading(true);
      const response = await missionService.getMission(id);
      const mission = response.data;
      setFormData({
        title: mission.title,
        description: mission.description,
        start_date: mission.start_date,
        end_date: mission.end_date,
        status: mission.status,
      });
    } catch (err) {
      setError('Error al cargar la misión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditing) {
        await missionService.updateMission(id, formData);
      } else {
        await missionService.createMission(formData);
      }
      navigate('/missions');
    } catch (err) {
      setError('Error al guardar la misión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mission-form-container">
      <div className="mission-form-header">
        <h2>{isEditing ? 'Editar Misión' : 'Nueva Misión'}</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="mission-form">
        <div className="form-group">
          <label htmlFor="title">Título</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Título de la misión"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Descripción de la misión"
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start_date">Fecha de Inicio</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_date">Fecha de Fin</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="status">Estado</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="active">Activa</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/missions')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading
              ? isEditing
                ? 'Guardando...'
                : 'Creando...'
              : isEditing
              ? 'Guardar Cambios'
              : 'Crear Misión'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MissionForm; 