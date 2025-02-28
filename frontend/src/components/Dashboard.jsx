import { useEffect, useState, useContext } from "react"
import { getUserProjects } from "../utils/apiServices"
import { AuthContext } from "../contexts/AuthContext"
import ProjectCard from "./ProjectCard"
import "../stylesheets/dashboard.css"

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext)
  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchProjects = async () => {
      if (user && user.token) {
        try {
          const data = await getUserProjects(user.token, page)
          if (data.results && Array.isArray(data.results)) {
            setProjects(data.results)
            setTotalPages(Math.ceil(data.count / data.results.length))
          } else {
            setProjects([])
            setTotalPages(1)
          }
          setLoadingProjects(false)
        } catch (err) {
          console.error("Error al obtener proyectos:", err)
          setError("No se pudieron cargar los proyectos.")
          setLoadingProjects(false)
        }
      }
    }

    fetchProjects()
  }, [user, page])

  const handleNextPage = () => {
    if (page < totalPages) setPage((prev) => prev + 1)
  }

  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1)
  }

  if (loading || loadingProjects) {
    return <div className="loading-container">Cargando dashboard...</div>
  }

  if (error) {
    return <div className="error-container">{error}</div>
  }

  if (!Array.isArray(projects)) {
    return <div className="error-container">Error: Datos de proyectos no válidos.</div>
  }

  if (projects.length === 0) {
    return <div className="empty-container">No tienes proyectos asignados.</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Planificador de proyectos</h2>
        <p className="dashboard-description">
          Usa esta plantilla para hacer un seguimiento de todos tus proyectos y tareas. Abre cada proyecto haciendo clic
          en el desplegable para ver las subtareas. Asigna fechas límite y actualiza los estados para estar al tanto de
          tus proyectos.
        </p>
        <div className="dashboard-actions">
          <button className="new-project-btn">Nuevo</button>
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
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} token={user.token} />
          ))}
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
    </div>
  )
}

export default Dashboard