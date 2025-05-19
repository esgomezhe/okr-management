import React, { useState, useEffect, useCallback } from 'react';
import { historyService } from '../utils/apiServices';
import '../stylesheets/history.css';

const History = ({ missionId, objectiveId, keyResultId, activityId, taskId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await historyService.getAll(
        missionId,
        objectiveId,
        keyResultId,
        activityId,
        taskId
      );
      setHistory(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  }, [missionId, objectiveId, keyResultId, activityId, taskId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const getChangeTypeLabel = (type) => {
    const labels = {
      create: 'Creación',
      update: 'Actualización',
      delete: 'Eliminación'
    };
    return labels[type] || type;
  };

  const getChangeTypeColor = (type) => {
    const colors = {
      create: '#2e7d32',
      update: '#1976d2',
      delete: '#d32f2f'
    };
    return colors[type] || '#666';
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