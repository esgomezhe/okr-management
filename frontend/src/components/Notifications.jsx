import React, { useState, useEffect } from 'react';
import { notificationService } from '../utils/apiServices';
import '../stylesheets/notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getAll();
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.read).length);
      setError(null);
    } catch (err) {
      setError('Error al cargar las notificaciones');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      loadNotifications();
    } catch (err) {
      setError('Error al marcar la notificación como leída');
      console.error('Error:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      loadNotifications();
    } catch (err) {
      setError('Error al marcar todas las notificaciones como leídas');
      console.error('Error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta notificación?')) {
      try {
        await notificationService.delete(id);
        loadNotifications();
      } catch (err) {
        setError('Error al eliminar la notificación');
        console.error('Error:', err);
      }
    }
  };

  if (loading) return <div className="loading">Cargando notificaciones...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="notifications">
      <div className="notifications-header">
        <h2>Notificaciones</h2>
        {unreadCount > 0 && (
          <button
            className="mark-all-read-btn"
            onClick={handleMarkAllAsRead}
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            No hay notificaciones
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
            >
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">
                  {new Date(notification.created_at).toLocaleString()}
                </span>
              </div>
              <div className="notification-actions">
                {!notification.read && (
                  <button
                    className="mark-read-btn"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    Marcar como leída
                  </button>
                )}
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(notification.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications; 