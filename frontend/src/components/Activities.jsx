import React, { useState, useEffect } from 'react';
import { activityService } from '../utils/apiServices';
import Modal from './Modal';
import '../stylesheets/activities.css';

const Activities = ({ missionId, objectiveId, keyResultId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'not_started',
    assigned_to_id: ''
  });

  useEffect(() => {
    loadActivities();
  }, [missionId, objectiveId, keyResultId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await activityService.getAll(missionId, objectiveId, keyResultId);
      setActivities(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las actividades');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingActivity) {
        await activityService.update(missionId, objectiveId, keyResultId, editingActivity.id, formData);
      } else {
        await activityService.create(missionId, objectiveId, keyResultId, formData);
      }
      setShowModal(false);
      setEditingActivity(null);
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'not_started',
        assigned_to_id: ''
      });
      loadActivities();
    } catch (err) {
      setError('Error al guardar la actividad');
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setFormData({
      title: activity.title,
      description: activity.description,
      start_date: activity.start_date,
      end_date: activity.end_date,
      status: activity.status,
      assigned_to_id: activity.assigned_to?.id || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
      try {
        await activityService.delete(missionId, objectiveId, keyResultId, id);
        loadActivities();
      } catch (err) {
        setError('Error al eliminar la actividad');
      }
    }
  };

  if (loading) return <div className="loading">Cargando actividades...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="activities">
      <div className="activities-header">
        <h2>Actividades</h2>
        <button className="activity-add-btn" onClick={() => setShowModal(true)}>
          + Nueva Actividad
        </button>
      </div>

      <div className="activities-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-card">
            <div className="activity-header">
              <h3>{activity.title}</h3>
              <div className="activity-actions">
                <button
                  className="activity-edit-btn"
                  onClick={() => handleEdit(activity)}
                >
                  Editar
                </button>
                <button
                  className="activity-delete-btn"
                  onClick={() => handleDelete(activity.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
            <p>{activity.description}</p>
            <div className="activity-dates">
              <span>Inicio: {new Date(activity.start_date).toLocaleDateString()}</span>
              <span>Fin: {new Date(activity.end_date).toLocaleDateString()}</span>
            </div>
            {activity.assigned_to && (
              <div className="activity-assigned">
                <span>Asignado a: {activity.assigned_to.username}</span>
              </div>
            )}
            <div className="activity-status">
              <span className={`status-badge ${activity.status}`}>
                {activity.status === 'not_started' && 'No iniciada'}
                {activity.status === 'in_progress' && 'En progreso'}
                {activity.status === 'completed' && 'Completada'}
                {activity.status === 'cancelled' && 'Cancelada'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingActivity(null);
          setFormData({
            title: '',
            description: '',
            start_date: '',
            end_date: '',
            status: 'not_started',
            assigned_to_id: ''
          });
        }}
        title={editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}
      >
        <form onSubmit={handleSubmit} className="activity-form">
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
          </div>
          <div className="form-group">
            <label htmlFor="assigned_to_id">Asignar a</label>
            <input
              type="text"
              id="assigned_to_id"
              value={formData.assigned_to_id}
              onChange={(e) => setFormData({ ...formData, assigned_to_id: e.target.value })}
              placeholder="ID del usuario"
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
              <option value="not_started">No iniciada</option>
              <option value="in_progress">En progreso</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editingActivity ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Activities; 