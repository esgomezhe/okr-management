import React, { useState, useEffect } from 'react';
import { historyService } from '../utils/apiServices';
import '../stylesheets/history.css';

const History = ({ missionId, objectiveId, keyResultId, activityId, taskId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [missionId, objectiveId, keyResultId, activityId, taskId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await historyService.getAll(missionId, objectiveId, keyResultId, activityId, taskId);
      setHistory(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar el historial');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getChangeTypeLabel = (type) => {
    switch (type) {
      case 'create':
        return 'Creación';
      case 'update':
        return 'Actualización';
      case 'delete':
        return 'Eliminación';
      default:
        return type;
    }
  };

  const getChangeTypeColor = (type) => {
    switch (type) {
      case 'create':
        return '#2e7d32';
      case 'update':
        return '#1976d2';
      case 'delete':
        return '#d32f2f';
      default:
        return '#666';
    }
  };

  if (loading) return <div className="loading">Cargando historial...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="history">
      <h2>Historial de Cambios</h2>

      <div className="history-list">
        {history.map((item) => (
          <div key={item.id} className="history-item">
            <div className="history-header">
              <div className="history-user">
                <span className="username">{item.user.username}</span>
                <span className="timestamp">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
              <span
                className="change-type"
                style={{ color: getChangeTypeColor(item.change_type) }}
              >
                {getChangeTypeLabel(item.change_type)}
              </span>
            </div>
            <div className="history-details">
              <p className="change-description">{item.description}</p>
              {item.changes && (
                <div className="changes-details">
                  {Object.entries(item.changes).map(([field, value]) => (
                    <div key={field} className="change-field">
                      <span className="field-name">{field}:</span>
                      <span className="field-value">{JSON.stringify(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History; 