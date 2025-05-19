import React, { useEffect } from 'react';
import BaseModal from './BaseModal';
import BaseForm from '../forms/BaseForm';
import { useForm } from '../../hooks/useForm';

const initialState = {
  name: '',
  description: '',
  start_date: '',
  end_date: ''
};

const ActivityModal = ({ mode, activity, onClose, onSave }) => {
  const {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    setFormData
  } = useForm(initialState, async (data) => {
    if (mode === 'edit') {
      await onSave(activity.id, data);
    } else {
      await onSave(data);
    }
    onClose();
  });

  useEffect(() => {
    if (mode === 'edit' && activity) {
      setFormData({
        name: activity.name || '',
        description: activity.description || '',
        start_date: activity.start_date || '',
        end_date: activity.end_date || ''
      });
    } else {
      setFormData(initialState);
    }
  }, [mode, activity, setFormData]);

  return (
    <BaseModal isOpen={!!mode} onClose={onClose} title={mode === 'edit' ? 'Editar Actividad' : 'Nueva Actividad'} error={errors?.general} loading={loading}>
      <BaseForm onSubmit={handleSubmit} loading={loading} onCancel={onClose} error={errors?.general}>
        <div className="form-group">
          <label htmlFor="activity-name">Nombre :</label>
          <input
            type="text"
            id="activity-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-input"
          />
          {errors?.name && <div className="error-message">{errors.name}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="activity-description">Descripción :</label>
          <textarea
            id="activity-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="form-textarea"
          />
          {errors?.description && <div className="error-message">{errors.description}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="activity-start_date">Fecha de Inicio :</label>
          <input
            type="date"
            id="activity-start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
            className="form-input"
          />
          {errors?.start_date && <div className="error-message">{errors.start_date}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="activity-end_date">Fecha de Finalización :</label>
          <input
            type="date"
            id="activity-end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            required
            className="form-input"
          />
          {errors?.end_date && <div className="error-message">{errors.end_date}</div>}
        </div>
      </BaseForm>
    </BaseModal>
  );
};

export default ActivityModal; 