import { useEffect, useState, useContext } from "react";
import { getUserMissions } from "../utils/apiServices";
import { AuthContext } from "../contexts/AuthContext";
import ProjectCard from "./ProjectCard";
import CreateMissionModal from "./CreateMissionModal";
import "../stylesheets/dashboard.css";

const MissionsDashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const [missions, setMissions] = useState([]);
  const [loadingMissions, setLoadingMissions] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchMissions = async () => {
      if (user) {
        try {
          const data = await getUserMissions(page);
          if (data.results && Array.isArray(data.results)) {
            setMissions(data.results);
            setTotalPages(Math.ceil(data.count / data.results.length));
          } else {
            setMissions([]);
            setTotalPages(1);
          }
          setLoadingMissions(false);
        } catch (err) {
          console.error("Error al obtener misiones:", err);
          setError("No se pudieron cargar las misiones.");
          setLoadingMissions(false);
        }
      }
    };

    fetchMissions();
  }, [user, page]);

  const handleNextPage = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleCreateMission = (newMission) => {
    setMissions((prevMissions) => [newMission, ...prevMissions]);
  };

  const handleDeleteMission = (missionId) => {
    setMissions(prevMissions => prevMissions.filter(mission => mission.id !== missionId));
  };

  const handleUpdateMission = (updatedMission) => {
    setMissions(prevMissions => 
      prevMissions.map(mission => 
        mission.id === updatedMission.id ? updatedMission : mission
      )
    );
  };

  if (loading || loadingMissions) {
    return <div className="loading-container">Cargando misiones...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!Array.isArray(missions)) {
    return <div className="error-container">Error: Datos de misiones no válidos.</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Planificador de Misiones</h2>
        <p className="dashboard-description">
          Usa esta plantilla para hacer un seguimiento de todas tus misiones y objetivos estratégicos. Abre cada misión haciendo clic
          en el desplegable para ver los objetivos y OKRs. Asigna fechas límite y actualiza los estados para estar al tanto de
          tus misiones.
        </p>
        <div className="dashboard-actions">
          <button 
            className="new-project-btn"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Nueva Misión
          </button>
        </div>
      </div>

      <div className="projects-table">
        <div className="table-header">
          <div className="column-estado">Estado</div>
          <div className="column-proyecto">Misión</div>
          <div className="column-fecha">Fecha límite</div>
          <div className="column-actions"></div>
        </div>

        <div className="projects-container">
          {missions.length === 0 ? (
            <div className="empty-container">No tienes misiones asignadas.</div>
          ) : (
            missions.map((mission) => (
              <ProjectCard 
                key={mission.id} 
                project={mission} 
                type="mission" 
                onDelete={handleDeleteMission}
                onUpdate={handleUpdateMission}
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

      <CreateMissionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onMissionCreated={handleCreateMission}
      />
    </div>
  );
};

export default MissionsDashboard; 