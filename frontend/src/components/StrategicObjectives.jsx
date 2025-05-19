import React, { useState } from 'react';
import { BaseService } from '../utils/baseService';
import '../stylesheets/strategicobjectives.css';
import { useCRUD } from '../hooks/useCRUD';
import BaseModal from './modals/BaseModal';
import BaseForm from './forms/BaseForm';

const objectiveService = new BaseService('objectives');

const initialState = {
  title: '',
  description: '',
  start_date: '',
  end_date: '',
  status: 'not_started'
};

const StrategicObjectives = ({ missionId }) => {
  const {
    items: objectives,
    loading,
    error,
    loadItems,
    createItem,
    updateItem,
    deleteItem
  } = useCRUD(objectiveService);
  const [showModal, setShowModal] = useState(false);
  const [editingObjective, setEditingObjective] = useState(null);
  const [formData, setFormData] = useState(initialState);

  React.useEffect(() => {
    loadItems({ missionId });
  }, [missionId, loadItems]);

  const handleSave = async (data) => {
    if (editingObjective) {
      await updateItem(editingObjective.id, data);
    } else {
      await createItem(data);
    }
    setShowModal(false);
    setEditingObjective(null);
    setFormData(initialState);
  };

  const handleEdit = (objective) => {
    setEditingObjective(objective);
    setFormData({
      title: objective.title,
      description: objective.description,
      start_date: objective.start_date,
      end_date: objective.end_date,
      status: objective.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este objetivo estratégico?')) {
      await deleteItem(id);
    }
  };

  if (loading) return <div className="loading">Cargando objetivos estratégicos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="strategic-objectives">
      <div className="objectives-header">
        <h2>Objetivos Estratégicos</h2>
        <button className="objective-add-btn" onClick={() => setShowModal(true)}>
          + Nuevo Objetivo
        </button>
      </div>
      <div className="objectives-list">
        {objectives.map((objective) => (
          <div key={objective.id} className="objective-card">
            <div className="objective-header">
              <h3>{objective.title}</h3>
              <div className="objective-actions">
                <button className="objective-edit-btn" onClick={() => handleEdit(objective)}>
                  Editar
                </button>
                <button className="objective-delete-btn" onClick={() => handleDelete(objective.id)}>
                  Eliminar
                </button>
              </div>
            </div>
            <p>{objective.description}</p>
            <div className="objective-dates">
              <span>Inicio: {objective.start_date ? new Date(objective.start_date).toLocaleDateString() : 'Sin fecha'}</span>
              <span>Fin: {objective.end_date ? new Date(objective.end_date).toLocaleDateString() : 'Sin fecha'}</span>
            </div>
            <div className="objective-status">
              <span className={`status-badge ${objective.status}`}>
                {objective.status === 'not_started' && 'No iniciado'}
                {objective.status === 'in_progress' && 'En progreso'}
                {objective.status === 'completed' && 'Completado'}
                {objective.status === 'cancelled' && 'Cancelado'}
              </span>
            </div>
          </div>
        ))}
      </div>
      <BaseModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingObjective(null);
          setFormData(initialState);
        }}
        title={editingObjective ? 'Editar Objetivo Estratégico' : 'Nuevo Objetivo Estratégico'}
      >
        <BaseForm
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSave(formData);
          }}
          loading={loading}
          onCancel={() => {
            setShowModal(false);
            setEditingObjective(null);
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
          <div className="form-group">
            <label htmlFor="start_date">Fecha de inicio</label>
            <input
              type="date"
              id="start_date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="end_date">Fecha de fin</label>
            <input
              type="date"
              id="end_date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required
            />
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

export default StrategicObjectives; 