import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { missionService } from '../utils/apiServices';
import '../stylesheets/mission.css';
import BaseForm from './forms/BaseForm';
import { useForm } from '../hooks/useForm';

const initialState = {
  title: '',
  description: '',
  start_date: '',
  end_date: '',
  status: 'active',
};

const MissionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const onSubmit = async (data) => {
    if (isEditing) {
      await missionService.updateMission(id, data);
    } else {
      await missionService.createMission(data);
    }
    navigate('/missions');
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
      const loadMission = async () => {
        try {
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
          // Manejo de error opcional
        }
      };
      loadMission();
    }
  }, [id, isEditing, setFormData]);

  return (
    <div className="mission-form-container">
      <div className="mission-form-header">
        <h2>{isEditing ? 'Editar Misión' : 'Nueva Misión'}</h2>
      </div>
      {errors?.general && <div className="error-message">{errors.general}</div>}
      <BaseForm onSubmit={handleSubmit} loading={loading} error={errors?.general} onCancel={() => navigate('/missions')}>
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
            placeholder="Descripción de la misión"
            rows="4"
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
          {errors?.status && <div className="error-message">{errors.status}</div>}
        </div>
      </BaseForm>
    </div>
  );
};

export default MissionForm; 