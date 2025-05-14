import React, { useState, useEffect } from 'react';
import { taskService } from '../utils/apiServices';
import Modal from './Modal';
import '../stylesheets/tasks.css';

const Tasks = ({ missionId, objectiveId, keyResultId, activityId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    status: 'not_started',
    assigned_to_id: ''
  });

  useEffect(() => {
    loadTasks();
  }, [missionId, objectiveId, keyResultId, activityId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getAll(missionId, objectiveId, keyResultId, activityId);
      setTasks(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await taskService.update(missionId, objectiveId, keyResultId, activityId, editingTask.id, formData);
      } else {
        await taskService.create(missionId, objectiveId, keyResultId, activityId, formData);
      }
      setShowModal(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        due_date: '',
        status: 'not_started',
        assigned_to_id: ''
      });
      loadTasks();
    } catch (err) {
      setError('Error al guardar la tarea');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      status: task.status,
      assigned_to_id: task.assigned_to?.id || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      try {
        await taskService.delete(missionId, objectiveId, keyResultId, activityId, id);
        loadTasks();
      } catch (err) {
        setError('Error al eliminar la tarea');
      }
    }
  };

  if (loading) return <div className="loading">Cargando tareas...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="tasks">
      <div className="tasks-header">
        <h2>Tareas</h2>
        <button className="task-add-btn" onClick={() => setShowModal(true)}>
          + Nueva Tarea
        </button>
      </div>

      <div className="tasks-list">
        {tasks.map((task) => (
          <div key={task.id} className="task-card">
            <div className="task-header">
              <h3>{task.title}</h3>
              <div className="task-actions">
                <button
                  className="task-edit-btn"
                  onClick={() => handleEdit(task)}
                >
                  Editar
                </button>
                <button
                  className="task-delete-btn"
                  onClick={() => handleDelete(task.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
            <p>{task.description}</p>
            <div className="task-due-date">
              <span>Fecha límite: {new Date(task.due_date).toLocaleDateString()}</span>
            </div>
            {task.assigned_to && (
              <div className="task-assigned">
                <span>Asignado a: {task.assigned_to.username}</span>
              </div>
            )}
            <div className="task-status">
              <span className={`status-badge ${task.status}`}>
                {task.status === 'not_started' && 'No iniciada'}
                {task.status === 'in_progress' && 'En progreso'}
                {task.status === 'completed' && 'Completada'}
                {task.status === 'cancelled' && 'Cancelada'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTask(null);
          setFormData({
            title: '',
            description: '',
            due_date: '',
            status: 'not_started',
            assigned_to_id: ''
          });
        }}
        title={editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
      >
        <form onSubmit={handleSubmit} className="task-form">
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
            <label htmlFor="due_date">Fecha límite</label>
            <input
              type="date"
              id="due_date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              required
            />
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
              {editingTask ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks; 