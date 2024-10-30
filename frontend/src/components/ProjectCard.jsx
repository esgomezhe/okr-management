import React, { useState } from 'react';
import ProjectDetails from './ProjectDetails';
import '../stylesheets/projectcard.css';

const ProjectCard = ({ project, token }) => {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  console.log(`Proyecto ${project.id}:`, project); // Agregar esta línea

  return (
    <div className="project-card">
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      <button onClick={toggleDetails} className="toggle-details-button">
        {showDetails ? 'Ocultar Detalles' : 'Ver Detalles'}
      </button>
      {showDetails && <ProjectDetails projectId={project.id} token={token} />}
    </div>
  );
};

export default ProjectCard;