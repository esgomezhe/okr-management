import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { objectiveService } from '../utils/apiServices';
import '../stylesheets/objective.css';

const ObjectiveForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'active',
    progress: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadObjective();
    }
  }, [id]);

  const loadObjective = async () => {
    try {
      setLoading(true);
      const response = await objectiveService.getObjective(id);
      const objective = response.data;
      setFormData({
        title: objective.title,
        description: objective.description,
        start_date: objective.start_date.split('T')[0],
        end_date: objective.end_date.split('T')[0],
        status: objective.status,
        progress: objective.progress,
      });
    } catch (err) {
      setError('Error al cargar el objetivo');
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
        await objectiveService.updateObjective(id, formData);
      } else {
        await objectiveService.createObjective(formData);
      }
      navigate('/objectives');
    } catch (err) {
      setError(
        isEditing
          ? 'Error al actualizar el objetivo'
          : 'Error al crear el objetivo'
      );
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <div className="loading">Cargando objetivo...</div>;
  }

  return (
    <div className="objective-form-container">
      <div className="objective-form-header">
        <h2>{isEditing ? 'Editar Objetivo' : 'Nuevo Objetivo'}</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="objective-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Título</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Ingrese el título del objetivo"
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
            placeholder="Ingrese la descripción del objetivo"
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

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Estado</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="active">Activo</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="progress">Progreso (%)</label>
            <input
              type="number"
              id="progress"
              name="progress"
              value={formData.progress}
              onChange={handleChange}
              min="0"
              max="100"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/objectives')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {isEditing ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ObjectiveForm; 