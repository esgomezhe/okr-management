import React, { useEffect } from 'react';
import BaseModal from './BaseModal';
import BaseForm from '../forms/BaseForm';
import { useForm } from '../../hooks/useForm';

const initialState = {
  key_result: '',
  current_value: 0,
  target_value: 100,
  progress: 0
};

const OKRModal = ({ show, onClose, onSave, okr }) => {
  const {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    setFormData
  } = useForm(initialState, async (data) => {
    if (show === 'edit') {
      await onSave(okr.id, data);
    } else {
      await onSave(data);
    }
    onClose();
  });

  useEffect(() => {
    if (show === 'edit' && okr) {
      setFormData({
        key_result: okr.key_result || '',
        current_value: okr.current_value || 0,
        target_value: okr.target_value || 100,
        progress: okr.progress || 0
      });
    } else {
      setFormData(initialState);
    }
  }, [show, okr, setFormData]);

  return (
    <BaseModal isOpen={!!show} onClose={onClose} title={show === 'edit' ? 'Editar OKR' : 'Nuevo OKR'} error={errors?.general} loading={loading}>
      <BaseForm onSubmit={handleSubmit} loading={loading} onCancel={onClose} error={errors?.general}>
        <div className="form-group">
          <label htmlFor="okr-key_result">Resultado Clave :</label>
          <input
            type="text"
            id="okr-key_result"
            name="key_result"
            value={formData.key_result}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="Ingrese el nombre del resultado clave"
          />
          {errors?.key_result && <div className="error-message">{errors.key_result}</div>}
        </div>
        <div className="form-group">
          <label>Información del Progreso :</label>
          <div className="info-box" style={{ marginTop: '10px' }}>
            <div className="info-item">
              <span className="info-label">Valor Actual: </span>
              <span className="info-value">{formData.current_value}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Valor Objetivo: </span>
              <span className="info-value">{formData.target_value}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Progreso: </span>
              <span className="info-value">{formData.progress}%</span>
            </div>
          </div>
          <small className="form-text" style={{ marginTop: '10px', display: 'block' }}>
            El progreso se calcula automáticamente según las tareas completadas asociadas a este OKR.
          </small>
        </div>
      </BaseForm>
    </BaseModal>
  );
};

export default OKRModal; 