import React, { useEffect } from 'react';
import BaseModal from './BaseModal';
import BaseForm from '../forms/BaseForm';
import { useForm } from '../../hooks/useForm';

const initialState = {
  title: '',
  description: ''
};

const ObjectiveModal = ({ mode, objective, onClose, onSave }) => {
  const {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    setFormData
  } = useForm(initialState, async (data) => {
    if (mode === 'edit') {
      await onSave(objective.id, data);
    } else {
      await onSave(data);
    }
    onClose();
  });

  useEffect(() => {
    if (mode === 'edit' && objective) {
      setFormData({
        title: objective.title || '',
        description: objective.description || ''
      });
    } else {
      setFormData(initialState);
    }
  }, [mode, objective, setFormData]);

  return (
    <BaseModal isOpen={!!mode} onClose={onClose} title={mode === 'edit' ? 'Editar Objetivo' : 'Nuevo Objetivo'} error={errors?.general} loading={loading}>
      <BaseForm onSubmit={handleSubmit} loading={loading} onCancel={onClose} error={errors?.general}>
        <div className="form-group">
          <label htmlFor="objective-title">Título: </label>
          <input
            type="text"
            id="objective-title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="form-input"
          />
          {errors?.title && <div className="error-message">{errors.title}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="objective-description">Descripción: </label>
          <textarea
            id="objective-description"
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

export default ObjectiveModal; 