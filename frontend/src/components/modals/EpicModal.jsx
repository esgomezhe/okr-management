import React, { useEffect } from 'react';
import BaseModal from './BaseModal';
import BaseForm from '../forms/BaseForm';
import { useForm } from '../../hooks/useForm';

const initialState = {
  title: '',
  description: ''
};

const EpicModal = ({ mode, epic, onClose, onSave }) => {
  const {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    setFormData
  } = useForm(initialState, async (data) => {
    if (mode === 'edit') {
      await onSave(epic.id, data);
    } else {
      await onSave(data);
    }
    onClose();
  });

  useEffect(() => {
    if (mode === 'edit' && epic) {
      setFormData({
        title: epic.title || '',
        description: epic.description || ''
      });
    } else {
      setFormData(initialState);
    }
  }, [mode, epic, setFormData]);

  return (
    <BaseModal isOpen={!!mode} onClose={onClose} title={mode === 'edit' ? 'Editar Épica' : 'Nueva Épica'} error={errors?.general} loading={loading}>
      <BaseForm onSubmit={handleSubmit} loading={loading} onCancel={onClose} error={errors?.general}>
        <div className="form-group">
          <label htmlFor="epic-title">Título: </label>
          <input
            type="text"
            id="epic-title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="form-input"
          />
          {errors?.title && <div className="error-message">{errors.title}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="epic-description">Descripción: </label>
          <textarea
            id="epic-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="form-textarea"
          />
          {errors?.description && <div className="error-message">{errors.description}</div>}
        </div>
      </BaseForm>
    </BaseModal>
  );
};

export default EpicModal; 