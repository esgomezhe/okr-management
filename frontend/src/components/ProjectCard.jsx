import { useState } from "react"
import ProjectDetails from "./ProjectDetails"
import "../stylesheets/projectcard.css"

const ProjectCard = ({ project, token }) => {
  const [showDetails, setShowDetails] = useState(false)

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  const getStatusClass = () => {
    if (project.status === "completed") return "status-completed"
    if (project.status === "in_progress") return "status-in-progress"
    return "status-not-started"
  }

  const getStatusText = () => {
    if (project.status === "completed") return "Completado"
    if (project.status === "in_progress") return "En curso"
    return "Sin empezar"
  }

  return (
    <div className="project-row">
      <div className="project-card">
        <div className="column-estado">
          <span className={`status-indicator ${getStatusClass()}`}></span>
          <span className="status-text">{getStatusText()}</span>
        </div>

        <div className="column-proyecto">
          <div className="project-title" onClick={toggleDetails}>
            <span className={`toggle-icon ${showDetails ? "open" : ""}`}>▶</span>
            <span className="project-name">{project.name}</span>
          </div>
        </div>

        <div className="column-fecha">{project.deadline || "Sin fecha"}</div>

        <div className="column-actions">
          <button className="action-button">⋯</button>
        </div>
      </div>

      {showDetails && <ProjectDetails projectId={project.id} token={token} />}
    </div>
  )
}

export default ProjectCard