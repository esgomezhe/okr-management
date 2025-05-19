import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { objectiveService } from '../utils/apiServices';
import '../stylesheets/objective.css';
import BaseForm from './forms/BaseForm';
import { useForm } from '../hooks/useForm';

const initialState = {
  title: '',
  description: '',
  start_date: '',
  end_date: '',
  status: 'active',
  progress: 0,
};

const ObjectiveForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const onSubmit = async (data) => {
    if (isEditing) {
      await objectiveService.updateObjective(id, data);
    } else {
      await objectiveService.createObjective(data);
    }
    navigate('/objectives');
  };

  const {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    setFormData
  } = useForm(initialState, onSubmit);

  useEffect(() => {
    if (isEditing) {
      const loadObjective = async () => {
        try {
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
          // Manejo de error opcional
        }
      };
      loadObjective();
    }
  }, [id, isEditing, setFormData]);

  if (loading && isEditing) {
    return <div className="loading">Cargando objetivo...</div>;
  }

  return (
    <div className="objective-form-container">
      <div className="objective-form-header">
        <h2>{isEditing ? 'Editar Objetivo' : 'Nuevo Objetivo'}</h2>
      </div>
      {errors?.general && <div className="error-message">{errors.general}</div>}
      <BaseForm onSubmit={handleSubmit} loading={loading} error={errors?.general} onCancel={() => navigate('/objectives')}>
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
          {errors?.title && <div className="error-message">{errors.title}</div>}
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
          {errors?.description && <div className="error-message">{errors.description}</div>}
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
            {errors?.start_date && <div className="error-message">{errors.start_date}</div>}
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
            {errors?.end_date && <div className="error-message">{errors.end_date}</div>}
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
            {errors?.status && <div className="error-message">{errors.status}</div>}
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
            {errors?.progress && <div className="error-message">{errors.progress}</div>}
          </div>
        </div>
      </BaseForm>
    </div>
  );
};

export default ObjectiveForm; 
export default ObjectiveForm; 