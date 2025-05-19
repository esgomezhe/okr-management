import React, { useState } from 'react';
import { BaseService } from '../utils/baseService';
import TaskModal from './modals/TaskModal';
import '../stylesheets/tasks.css';
import { useCRUD } from '../hooks/useCRUD';

const taskService = new BaseService('tasks');

const Tasks = ({ missionId, objectiveId, keyResultId, activityId }) => {
  const {
    items: tasks,
    loading,
    error,
    loadItems,
    createItem,
    updateItem,
    deleteItem
  } = useCRUD(taskService);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  React.useEffect(() => {
    loadItems({ missionId, objectiveId, keyResultId, activityId });
  }, [missionId, objectiveId, keyResultId, activityId, loadItems]);

  const handleSave = async (data) => {
    if (editingTask) {
      await updateItem(editingTask.id, data);
    } else {
      await createItem(data);
    }
    setShowModal(false);
    setEditingTask(null);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      await deleteItem(id);
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
                <button className="task-edit-btn" onClick={() => handleEdit(task)}>
                  Editar
                </button>
                <button className="task-delete-btn" onClick={() => handleDelete(task.id)}>
                  Eliminar
                </button>
              </div>
            </div>
            <p>{task.description}</p>
            <div className="task-due-date">
              <span>Fecha límite: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Sin fecha'}</span>
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
      <TaskModal
        mode={editingTask ? 'edit' : 'create'}
        task={editingTask}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTask(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
};

export default Tasks; 