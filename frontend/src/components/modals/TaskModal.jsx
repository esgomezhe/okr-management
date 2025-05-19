import React, { useEffect } from 'react';
import BaseModal from './BaseModal';
import BaseForm from '../forms/BaseForm';
import { useForm } from '../../hooks/useForm';

const initialState = {
  title: '',
  desc: '',
  status: 'backlog'
};

const TaskModal = ({ mode, task, isOpen, onClose, onSave }) => {
  const {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    setFormData
  } = useForm(initialState, async (data) => {
    await onSave(data);
    onClose();
  });

  useEffect(() => {
    if (mode === 'edit' && task) {
      setFormData({
        title: task.title || '',
        desc: task.desc || '',
        status: task.status || 'backlog'
      });
    } else {
      setFormData(initialState);
    }
  }, [mode, task, setFormData]);

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={mode === 'edit' ? 'Editar Tarea' : 'Nueva Tarea'} error={errors?.general} loading={loading}>
      <BaseForm onSubmit={handleSubmit} loading={loading} onCancel={onClose} error={errors?.general}>
        <div className="form-group">
          <label htmlFor="title">Título</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          {errors?.title && <div className="error-message">{errors.title}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="desc">Descripción</label>
          <textarea
            id="desc"
            name="desc"
            value={formData.desc}
            onChange={handleChange}
            rows="4"
          />
          {errors?.desc && <div className="error-message">{errors.desc}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="status">Estado</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="backlog">Backlog</option>
            <option value="in_progress">En Progreso</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>
          {errors?.status && <div className="error-message">{errors.status}</div>}
        </div>
      </BaseForm>
    </BaseModal>
  );
};

export default TaskModal; 