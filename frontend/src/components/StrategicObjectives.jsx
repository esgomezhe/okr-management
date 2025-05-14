import React, { useState, useEffect } from 'react';
import { objectiveService } from '../utils/apiServices';
import Modal from './Modal';
import '../stylesheets/strategicobjectives.css';

const StrategicObjectives = ({ missionId }) => {
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingObjective, setEditingObjective] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'not_started'
  });

  useEffect(() => {
    loadObjectives();
  }, [missionId]);

  const loadObjectives = async () => {
    try {
      setLoading(true);
      const response = await objectiveService.getAll(missionId);
      setObjectives(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los objetivos estratégicos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingObjective) {
        await objectiveService.update(missionId, editingObjective.id, formData);
      } else {
        await objectiveService.create(missionId, formData);
      }
      setShowModal(false);
      setEditingObjective(null);
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'not_started'
      });
      loadObjectives();
    } catch (err) {
      setError('Error al guardar el objetivo estratégico');
    }
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
      try {
        await objectiveService.delete(missionId, id);
        loadObjectives();
      } catch (err) {
        setError('Error al eliminar el objetivo estratégico');
      }
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
                <button
                  className="objective-edit-btn"
                  onClick={() => handleEdit(objective)}
                >
                  Editar
                </button>
                <button
                  className="objective-delete-btn"
                  onClick={() => handleDelete(objective.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
            <p>{objective.description}</p>
            <div className="objective-dates">
              <span>Inicio: {new Date(objective.start_date).toLocaleDateString()}</span>
              <span>Fin: {new Date(objective.end_date).toLocaleDateString()}</span>
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

      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingObjective(null);
          setFormData({
            title: '',
            description: '',
            start_date: '',
            end_date: '',
            status: 'not_started'
          });
        }}
        title={editingObjective ? 'Editar Objetivo Estratégico' : 'Nuevo Objetivo Estratégico'}
      >
        <form onSubmit={handleSubmit} className="objective-form">
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
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editingObjective ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StrategicObjectives; 