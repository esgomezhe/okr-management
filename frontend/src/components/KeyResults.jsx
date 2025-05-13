import React, { useState, useEffect } from 'react';
import { keyResultService } from '../utils/apiServices';
import Modal from './Modal';
import '../stylesheets/keyresults.css';

const KeyResults = ({ missionId, objectiveId }) => {
  const [keyResults, setKeyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingKR, setEditingKR] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_value: '',
    current_value: '0',
    unit: '',
    status: 'not_started'
  });

  useEffect(() => {
    loadKeyResults();
  }, [missionId, objectiveId]);

  const loadKeyResults = async () => {
    try {
      setLoading(true);
      const response = await keyResultService.getAll(missionId, objectiveId);
      setKeyResults(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los resultados clave');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingKR) {
        await keyResultService.update(missionId, objectiveId, editingKR.id, formData);
      } else {
        await keyResultService.create(missionId, objectiveId, formData);
      }
      setShowModal(false);
      setEditingKR(null);
      setFormData({
        title: '',
        description: '',
        target_value: '',
        current_value: '0',
        unit: '',
        status: 'not_started'
      });
      loadKeyResults();
    } catch (err) {
      setError('Error al guardar el resultado clave');
      console.error('Error:', err);
    }
  };

  const handleEdit = (kr) => {
    setEditingKR(kr);
    setFormData({
      title: kr.title,
      description: kr.description,
      target_value: kr.target_value,
      current_value: kr.current_value,
      unit: kr.unit,
      status: kr.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este resultado clave?')) {
      try {
        await keyResultService.delete(missionId, objectiveId, id);
        loadKeyResults();
      } catch (err) {
        setError('Error al eliminar el resultado clave');
        console.error('Error:', err);
      }
    }
  };

  const handleProgressUpdate = async (id, currentValue) => {
    try {
      await keyResultService.updateProgress(missionId, objectiveId, id, currentValue);
      loadKeyResults();
    } catch (err) {
      setError('Error al actualizar el progreso');
      console.error('Error:', err);
    }
  };

  if (loading) return <div className="loading">Cargando resultados clave...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="key-results">
      <div className="krs-header">
        <h2>Resultados Clave</h2>
        <button className="kr-add-btn" onClick={() => setShowModal(true)}>
          + Nuevo Resultado Clave
        </button>
      </div>

      <div className="krs-list">
        {keyResults.map((kr) => (
          <div key={kr.id} className="kr-card">
            <div className="kr-header">
              <h3>{kr.title}</h3>
              <div className="kr-actions">
                <button
                  className="kr-edit-btn"
                  onClick={() => handleEdit(kr)}
                >
                  Editar
                </button>
                <button
                  className="kr-delete-btn"
                  onClick={() => handleDelete(kr.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
            <p>{kr.description}</p>
            <div className="kr-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${kr.progress}%` }}
                />
              </div>
              <div className="progress-values">
                <span>{kr.current_value} / {kr.target_value} {kr.unit}</span>
                <span>{Math.round(kr.progress)}%</span>
              </div>
            </div>
            <div className="kr-status">
              <span className={`status-badge ${kr.status}`}>
                {kr.status === 'not_started' && 'No iniciado'}
                {kr.status === 'in_progress' && 'En progreso'}
                {kr.status === 'completed' && 'Completado'}
                {kr.status === 'cancelled' && 'Cancelado'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingKR(null);
          setFormData({
            title: '',
            description: '',
            target_value: '',
            current_value: '0',
            unit: '',
            status: 'not_started'
          });
        }}
        title={editingKR ? 'Editar Resultado Clave' : 'Nuevo Resultado Clave'}
      >
        <form onSubmit={handleSubmit} className="kr-form">
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
              <label htmlFor="target_value">Valor objetivo</label>
              <input
                type="number"
                id="target_value"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label htmlFor="current_value">Valor actual</label>
              <input
                type="number"
                id="current_value"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label htmlFor="unit">Unidad</label>
              <input
                type="text"
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
                placeholder="%, $, kg, etc."
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="status">Estado</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              <option value="not_started">No iniciado</option>
              <option value="in_progress">En progreso</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editingKR ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default KeyResults; 