import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { objectiveService } from '../utils/apiServices';
import '../stylesheets/objective.css';

const ObjectiveList = () => {
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadObjectives();
  }, []);

  const loadObjectives = async () => {
    try {
      setLoading(true);
      const response = await objectiveService.getObjectives();
      setObjectives(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar los objetivos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este objetivo?')) {
      return;
    }

    try {
      await objectiveService.deleteObjective(id);
      setObjectives((prev) => prev.filter((objective) => objective.id !== id));
    } catch (err) {
      setError('Error al eliminar el objetivo');
      console.error('Error:', err);
    }
  };

  const filteredObjectives = objectives.filter((objective) => {
    if (filter === 'all') return true;
    return objective.status === filter;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'status-badge active';
      case 'completed':
        return 'status-badge completed';
      case 'cancelled':
        return 'status-badge cancelled';
      default:
        return 'status-badge';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading) return <div className="loading">Cargando objetivos...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="objective-list-container">
      <div className="objective-list-header">
        <h2>Objetivos</h2>
        <Link to="/objectives/new" className="create-btn">
          Nuevo Objetivo
        </Link>
      </div>

      <div className="objective-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos
        </button>
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Activos
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completados
        </button>
        <button
          className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          Cancelados
        </button>
      </div>

      <div className="objective-grid">
        {filteredObjectives.map((objective) => (
          <div key={objective.id} className="objective-card">
            <div className="objective-card-header">
              <h3>{objective.title}</h3>
              <span className={getStatusBadgeClass(objective.status)}>
                {getStatusText(objective.status)}
              </span>
            </div>

            <p className="objective-description">{objective.description}</p>

            <div className="objective-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${objective.progress}%` }}
                />
              </div>
              <span className="progress-text">{objective.progress}%</span>
            </div>

            <div className="objective-dates">
              <div className="date-group">
                <span className="date-label">Inicio:</span>
                <span className="date-value">
                  {new Date(objective.start_date).toLocaleDateString()}
                </span>
              </div>
              <div className="date-group">
                <span className="date-label">Fin:</span>
                <span className="date-value">
                  {new Date(objective.end_date).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="objective-actions">
              <Link
                to={`/objectives/${objective.id}/edit`}
                className="action-btn edit"
              >
                Editar
              </Link>
              <button
                className="action-btn delete"
                onClick={() => handleDelete(objective.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredObjectives.length === 0 && (
        <div className="no-objectives">
          No hay objetivos {filter !== 'all' ? 'con este estado' : ''}
        </div>
      )}
    </div>
  );
};

export default ObjectiveList; 