import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { missionService } from '../utils/apiServices';
import '../stylesheets/mission.css';

const MissionList = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      setLoading(true);
      const response = await missionService.getMissions();
      setMissions(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar las misiones');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta misión?')) {
      return;
    }

    try {
      await missionService.deleteMission(id);
      setMissions((prev) => prev.filter((mission) => mission.id !== id));
    } catch (err) {
      setError('Error al eliminar la misión');
      console.error('Error:', err);
    }
  };

  const filteredMissions = missions.filter((mission) => {
    if (filter === 'all') return true;
    return mission.status === filter;
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
        return 'Activa';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  if (loading) return <div className="loading">Cargando misiones...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="mission-list-container">
      <div className="mission-list-header">
        <h2>Misiones</h2>
        <Link to="/missions/new" className="create-btn">
          Nueva Misión
        </Link>
      </div>

      <div className="mission-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todas
        </button>
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Activas
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completadas
        </button>
        <button
          className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          Canceladas
        </button>
      </div>

      <div className="mission-grid">
        {filteredMissions.map((mission) => (
          <div key={mission.id} className="mission-card">
            <div className="mission-card-header">
              <h3>{mission.title}</h3>
              <span className={getStatusBadgeClass(mission.status)}>
                {getStatusText(mission.status)}
              </span>
            </div>

            <p className="mission-description">{mission.description}</p>

            <div className="mission-dates">
              <div className="date-group">
                <span className="date-label">Inicio:</span>
                <span className="date-value">
                  {new Date(mission.start_date).toLocaleDateString()}
                </span>
              </div>
              <div className="date-group">
                <span className="date-label">Fin:</span>
                <span className="date-value">
                  {new Date(mission.end_date).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mission-actions">
              <Link
                to={`/missions/${mission.id}/edit`}
                className="action-btn edit"
              >
                Editar
              </Link>
              <button
                className="action-btn delete"
                onClick={() => handleDelete(mission.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMissions.length === 0 && (
        <div className="no-missions">
          No hay misiones {filter !== 'all' ? 'con este estado' : ''}
        </div>
      )}
    </div>
  );
};

export default MissionList; 