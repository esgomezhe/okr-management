import React, { useState, useEffect } from 'react';
import { attachmentService } from '../utils/apiServices';
import '../stylesheets/attachments.css';

const Attachments = ({ missionId, objectiveId, keyResultId, activityId, taskId }) => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAttachments();
  }, [missionId, objectiveId, keyResultId, activityId, taskId]);

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const response = await attachmentService.getAll(missionId, objectiveId, keyResultId, activityId, taskId);
      setAttachments(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los archivos adjuntos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        await attachmentService.create(missionId, objectiveId, keyResultId, activityId, taskId, formData);
      }
      loadAttachments();
    } catch (err) {
      setError('Error al subir los archivos');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este archivo?')) {
      try {
        await attachmentService.delete(missionId, objectiveId, keyResultId, activityId, taskId, id);
        loadAttachments();
      } catch (err) {
        setError('Error al eliminar el archivo');
      }
    }
  };

  const handleDownload = async (attachment) => {
    try {
      const response = await attachmentService.download(missionId, objectiveId, keyResultId, activityId, taskId, attachment.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachment.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Error al descargar el archivo');
    }
  };

  if (loading) return <div className="loading">Cargando archivos adjuntos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="attachments">
      <h2>Archivos Adjuntos</h2>

      <div className="upload-section">
        <label htmlFor="file-upload" className="upload-btn">
          {uploading ? 'Subiendo...' : 'Seleccionar archivos'}
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          onChange={handleFileUpload}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </div>

      <div className="attachments-list">
        {attachments.map((attachment) => (
          <div key={attachment.id} className="attachment-card">
            <div className="attachment-info">
              <span className="filename">{attachment.filename}</span>
              <span className="filesize">
                {(attachment.filesize / 1024).toFixed(2)} KB
              </span>
            </div>
            <div className="attachment-actions">
              <button
                className="download-btn"
                onClick={() => handleDownload(attachment)}
              >
                Descargar
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDelete(attachment.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Attachments; 