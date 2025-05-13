import React, { useState, useEffect } from 'react';
import { dashboardService } from '../utils/apiServices';
import '../stylesheets/dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getStats();
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las estadísticas');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Misiones</h3>
          <div className="stat-value">{stats.missions_count}</div>
          <div className="stat-details">
            <div className="stat-item">
              <span className="label">Activas</span>
              <span className="value">{stats.active_missions}</span>
            </div>
            <div className="stat-item">
              <span className="label">Completadas</span>
              <span className="value">{stats.completed_missions}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Objetivos</h3>
          <div className="stat-value">{stats.objectives_count}</div>
          <div className="stat-details">
            <div className="stat-item">
              <span className="label">Activos</span>
              <span className="value">{stats.active_objectives}</span>
            </div>
            <div className="stat-item">
              <span className="label">Completados</span>
              <span className="value">{stats.completed_objectives}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Resultados Clave</h3>
          <div className="stat-value">{stats.key_results_count}</div>
          <div className="stat-details">
            <div className="stat-item">
              <span className="label">Activos</span>
              <span className="value">{stats.active_key_results}</span>
            </div>
            <div className="stat-item">
              <span className="label">Completados</span>
              <span className="value">{stats.completed_key_results}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Actividades</h3>
          <div className="stat-value">{stats.activities_count}</div>
          <div className="stat-details">
            <div className="stat-item">
              <span className="label">Activas</span>
              <span className="value">{stats.active_activities}</span>
            </div>
            <div className="stat-item">
              <span className="label">Completadas</span>
              <span className="value">{stats.completed_activities}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Tareas</h3>
          <div className="stat-value">{stats.tasks_count}</div>
          <div className="stat-details">
            <div className="stat-item">
              <span className="label">Activas</span>
              <span className="value">{stats.active_tasks}</span>
            </div>
            <div className="stat-item">
              <span className="label">Completadas</span>
              <span className="value">{stats.completed_tasks}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Usuarios</h3>
          <div className="stat-value">{stats.users_count}</div>
          <div className="stat-details">
            <div className="stat-item">
              <span className="label">Activos</span>
              <span className="value">{stats.active_users}</span>
            </div>
            <div className="stat-item">
              <span className="label">Inactivos</span>
              <span className="value">{stats.inactive_users}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Actividad Reciente</h3>
        <div className="activity-list">
          {stats.recent_activity.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                {activity.type === 'create' && '➕'}
                {activity.type === 'update' && '✏️'}
                {activity.type === 'delete' && '🗑️'}
              </div>
              <div className="activity-content">
                <p className="activity-message">{activity.message}</p>
                <span className="activity-time">
                  {new Date(activity.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;