import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { deleteMission, deleteProject } from '../utils/apiServices';
import EditModal from './EditModal';
import ProjectDetails from './ProjectDetails';
import "../stylesheets/project-card.css"

const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.85 2.85a1.2 1.2 0 0 1 1.7 1.7l-1.1 1.1-1.7-1.7 1.1-1.1zm-2.1 2.1l1.7 1.7-8.1 8.1c-.13.13-.22.29-.25.47l-.4 2.3a.5.5 0 0 0 .59.59l2.3-.4c.18-.03.34-.12.47-.25l8.1-8.1-1.7-1.7-8.1 8.1z" fill="currentColor"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 2a1.5 1.5 0 0 1 3 0h5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1h5zm-4 3h13v1a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-1zm2 3h9l-.7 8.1a2 2 0 0 1-2 1.9h-3.6a2 2 0 0 1-2-1.9l-.7-8.1z" fill="currentColor"/>
  </svg>
);

const MenuPortal = ({ children, position }) => {
  return createPortal(
    <div style={{
      position: 'fixed',
      left: position.left,
      top: position.top,
      zIndex: 2000
    }}>
      {children}
    </div>,
    document.body
  );
};

const ProjectCard = ({ project, type = "project", onDelete, onUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [menuDirection, setMenuDirection] = useState('down');
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Detectar si hay espacio suficiente abajo, si no, mostrar hacia arriba y calcular posición absoluta
  useEffect(() => {
    if (showMenu && buttonRef.current && menuRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 170;
      const menuHeight = menuRef.current.offsetHeight || 120;
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      let direction = 'down';
      let top = buttonRect.bottom + 8;
      if (spaceBelow < menuHeight + 16) {
        direction = 'up';
        top = buttonRect.top - menuHeight - 8;
      }
      // Alinear el borde derecho del menú con el borde derecho del botón
      const left = buttonRect.right - menuWidth; // sin desplazamiento extra
      setMenuDirection(direction);
      setMenuPosition({
        left,
        top
      });
    }
  }, [showMenu]);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const getStatusClass = () => {
    if (project.status === "completed") return "status-completed";
    if (project.status === "in_progress") return "status-in-progress";
    return "status-not-started";
  };

  const getStatusText = () => {
    if (project.status === "completed") return "Completado";
    if (project.status === "in_progress") return "En curso";
    return "Sin empezar";
  };

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar este ${type === 'mission' ? 'misión' : 'proyecto'}?`)) {
      try {
        const deleteFunction = type === 'mission' ? deleteMission : deleteProject;
        await deleteFunction(project.id);
        onDelete(project.id);
      } catch (err) {
        setError(err.response?.data?.detail || `Error al eliminar el ${type === 'mission' ? 'misión' : 'proyecto'}`);
      }
    }
  };

  const handleUpdate = (updatedProject) => {
    onUpdate(updatedProject);
  };

  return (
    <div className="project-row">
      <div className="project-card">
        <div className="column-estado">
          <span className={`status-indicator ${getStatusClass()}`}></span>
          <span className="status-text">{getStatusText()}</span>
        </div>

        <div className="column-proyecto">
          <div className="project-title" onClick={toggleDetails} tabIndex={0} role="button" aria-pressed={showDetails}>
            <span className={`toggle-icon ${showDetails ? "open" : ""}`}>▶</span>
            <span className="project-name">{project.name}</span>
          </div>
        </div>

        <div className="column-fecha">{project.end_date || "Sin fecha"}</div>

        <div className="column-actions">
          <div className="menu-container">
            <button 
              className="menu-button"
              aria-label="Abrir menú de acciones"
              ref={buttonRef}
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu((prev) => !prev);
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
              </svg>
            </button>
            {showMenu && (
              <MenuPortal position={menuPosition}>
                <div
                  className={`menu-dropdown menu-dropdown-${menuDirection}`}
                  ref={menuRef}
                >
                  <button 
                    className="menu-item edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditModalOpen(true);
                      setShowMenu(false);
                    }}
                  >
                    <span className="menu-icon"><EditIcon /></span>
                    Editar
                  </button>
                  <button 
                    className="menu-item delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                      setShowMenu(false);
                    }}
                  >
                    <span className="menu-icon"><DeleteIcon /></span>
                    Eliminar
                  </button>
                </div>
              </MenuPortal>
            )}
          </div>
        </div>
      </div>

      {showDetails && <ProjectDetails projectId={project.id} type={type} />}

      {error && <div className="error-message">{error}</div>}

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        item={project}
        type={type}
        onItemUpdated={handleUpdate}
      />
    </div>
  );
};

export default ProjectCard;