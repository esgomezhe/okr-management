import React, { useState } from 'react';
import { BaseService } from '../utils/baseService';
import '../stylesheets/keyresults.css';
import { useCRUD } from '../hooks/useCRUD';
import BaseModal from './modals/BaseModal';
import BaseForm from './forms/BaseForm';

const keyResultService = new BaseService('keyresults');

const initialState = {
  title: '',
  description: '',
  target_value: '',
  current_value: '0',
  unit: '',
  status: 'not_started'
};

const KeyResults = ({ missionId, objectiveId }) => {
  const {
    items: keyResults,
    loading,
    error,
    loadItems,
    createItem,
    updateItem,
    deleteItem
  } = useCRUD(keyResultService);
  const [showModal, setShowModal] = useState(false);
  const [editingKR, setEditingKR] = useState(null);
  const [formData, setFormData] = useState(initialState);

  React.useEffect(() => {
    loadItems({ missionId, objectiveId });
  }, [missionId, objectiveId, loadItems]);

  const handleSave = async (data) => {
    if (editingKR) {
      await updateItem(editingKR.id, data);
    } else {
      await createItem(data);
    }
    setShowModal(false);
    setEditingKR(null);
    setFormData(initialState);
  };

  const handleEdit = (kr) => {
    setEditingKR(kr);
    setFormData({
      title: kr.title,
      description: kr.description,
      target_value: kr.target_value,
      current_value: kr.current_value,
      unit: kr.unit,
      status: kr.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este resultado clave?')) {
      await deleteItem(id);
    }
  };

  if (loading) return <div className="loading">Cargando resultados clave...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="key-results">
      <div className="krs-header">
        <h2>Resultados Clave</h2>
        <button className="kr-add-btn" onClick={() => setShowModal(true)}>
          + Nuevo Resultado Clave
        </button>
      </div>
      <div className="krs-list">
        {keyResults.map((kr) => (
          <div key={kr.id} className="kr-card">
            <div className="kr-header">
              <h3>{kr.title}</h3>
              <div className="kr-actions">
                <button className="kr-edit-btn" onClick={() => handleEdit(kr)}>
                  Editar
                </button>
                <button className="kr-delete-btn" onClick={() => handleDelete(kr.id)}>
                  Eliminar
                </button>
              </div>
            </div>
            <p>{kr.description}</p>
            <div className="kr-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${kr.progress}%` }} />
              </div>
              <div className="progress-values">
                <span>{kr.current_value} / {kr.target_value} {kr.unit}</span>
                <span>{Math.round(kr.progress)}%</span>
              </div>
            </div>
            <div className="kr-status">
              <span className={`status-badge ${kr.status}`}>
                {kr.status === 'not_started' && 'No iniciado'}
                {kr.status === 'in_progress' && 'En progreso'}
                {kr.status === 'completed' && 'Completado'}
                {kr.status === 'cancelled' && 'Cancelado'}
              </span>
            </div>
          </div>
        ))}
      </div>
      <BaseModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingKR(null);
          setFormData(initialState);
        }}
        title={editingKR ? 'Editar Resultado Clave' : 'Nuevo Resultado Clave'}
      >
        <BaseForm
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSave(formData);
          }}
          loading={loading}
          onCancel={() => {
            setShowModal(false);
            setEditingKR(null);
            setFormData(initialState);
          }}
        >
          <div className="form-group">
            <label htmlFor="title">Título</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="target_value">Valor objetivo</label>
              <input
                type="number"
                id="target_value"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label htmlFor="current_value">Valor actual</label>
              <input
                type="number"
                id="current_value"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label htmlFor="unit">Unidad</label>
              <input
                type="text"
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
                placeholder="%, $, kg, etc."
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="status">Estado</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              <option value="not_started">No iniciado</option>
              <option value="in_progress">En progreso</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </BaseForm>
      </BaseModal>
    </div>
  );
};

export default KeyResults; 