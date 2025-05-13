import { useEffect, useState, useContext } from "react";
import { getUserProjects } from "../utils/apiServices";
import { AuthContext } from "../contexts/AuthContext";
import ProjectCard from "./ProjectCard";
import CreateProjectModal from "./CreateProjectModal";
import "../stylesheets/dashboard.css";

const ProjectsDashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      if (user) {
        try {
          const data = await getUserProjects(page);
          if (data.results && Array.isArray(data.results)) {
            setProjects(data.results);
            setTotalPages(Math.ceil(data.count / data.results.length));
          } else {
            setProjects([]);
            setTotalPages(1);
          }
          setLoadingProjects(false);
        } catch (err) {
          console.error("Error al obtener proyectos:", err);
          setError("No se pudieron cargar los proyectos.");
          setLoadingProjects(false);
        }
      }
    };

    fetchProjects();
  }, [user, page]);

  const handleNextPage = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleCreateProject = (newProject) => {
    setProjects((prevProjects) => [newProject, ...prevProjects]);
  };

  const handleDeleteProject = (projectId) => {
    setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
  };

  const handleUpdateProject = (updatedProject) => {
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      )
    );
  };

  if (loading || loadingProjects) {
    return <div className="loading-container">Cargando proyectos...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!Array.isArray(projects)) {
    return <div className="error-container">Error: Datos de proyectos no válidos.</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Planificador de Proyectos</h2>
        <p className="dashboard-description">
          Usa esta plantilla para hacer un seguimiento de todos tus proyectos. Abre cada proyecto haciendo clic
          en el desplegable para ver las tareas y actividades. Asigna fechas límite y actualiza los estados para estar al tanto de
          tus proyectos.
        </p>
        <div className="dashboard-actions">
          <button 
            className="new-project-btn"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Nuevo Proyecto
          </button>
        </div>
      </div>

      <div className="projects-table">
        <div className="table-header">
          <div className="column-estado">Estado</div>
          <div className="column-proyecto">Proyecto</div>
          <div className="column-fecha">Fecha límite</div>
          <div className="column-actions"></div>
        </div>

        <div className="projects-container">
          {projects.length === 0 ? (
            <div className="empty-container">No tienes proyectos asignados.</div>
          ) : (
            projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                type="project" 
                onDelete={handleDeleteProject}
                onUpdate={handleUpdateProject}
              />
            ))
          )}
        </div>
      </div>

      <div className="pagination">
        <button onClick={handlePrevPage} disabled={page === 1}>
          Anterior
        </button>
        <span>
          Página {page} de {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={page === totalPages}>
          Siguiente
        </button>
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleCreateProject}
      />
    </div>
  );
};

export default ProjectsDashboard; 