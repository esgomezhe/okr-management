import React, { useState, useEffect } from 'react';

const TaskModal = ({ mode, task, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: task?.title || '',
    desc: task?.desc || '',
    status: task?.status || 'backlog'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mode === 'edit' && task) {
      setForm({
        title: task.title || '',
        desc: task.desc || '',
        status: task.status || 'backlog'
      });
    }
  }, [mode, task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'edit') {
        await onSave(form);
      } else {
        await onSave(form);
      }
    } catch (err) {
      setError('Error al guardar la tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{mode === 'edit' ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="task-title">Título: </label>
            <input
              type="text"
              id="task-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-desc">Descripción: </label>
            <textarea
              id="task-desc"
              name="desc"
              value={form.desc}
              onChange={handleChange}
              rows="3"
              className="form-textarea"
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-status">Estado: </label>
            <select
              id="task-status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="form-input"
            >
              <option value="backlog">Backlog</option>
              <option value="in progress">En progreso</option>
              <option value="completed">Completada</option>
            </select>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal; 