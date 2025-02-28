import { useEffect, useState } from "react"
import { getProjectDetails } from "../utils/apiServices"
import "../stylesheets/projectdetails.css"

const ProjectDetails = ({ projectId, token }) => {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedObjectives, setExpandedObjectives] = useState({})
  const [expandedOKRs, setExpandedOKRs] = useState({})
  const [expandedActivities, setExpandedActivities] = useState({})

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const data = await getProjectDetails(token, projectId)
        setDetails(data)
        setLoading(false)
      } catch (err) {
        console.error(`Error al obtener detalles del proyecto ${projectId}:`, err)
        setError("No se pudieron cargar los detalles del proyecto.")
        setLoading(false)
      }
    }

    fetchProjectDetails()
  }, [projectId, token])

  const toggleObjective = (objectiveId) => {
    setExpandedObjectives((prev) => ({
      ...prev,
      [objectiveId]: !prev[objectiveId],
    }))
  }

  const toggleOKR = (okrId) => {
    setExpandedOKRs((prev) => ({
      ...prev,
      [okrId]: !prev[okrId],
    }))
  }

  const toggleActivity = (activityId) => {
    setExpandedActivities((prev) => ({
      ...prev,
      [activityId]: !prev[activityId],
    }))
  }

  if (loading) {
    return <div className="details-loading">Cargando detalles del proyecto...</div>
  }

  if (error) {
    return <div className="details-error">{error}</div>
  }

  if (!details) {
    return <div className="details-empty">No hay detalles disponibles para este proyecto.</div>
  }

  return (
    <div className="project-details">
      {details.objectives && details.objectives.length > 0 ? (
        details.objectives.map((objective, index) => (
          <div key={objective.id || index} className="objective-item">
            <div className="objective-header" onClick={() => toggleObjective(objective.id)}>
              <span className={`toggle-icon ${expandedObjectives[objective.id] ? "open" : ""}`}>▶</span>
              <span className="objective-title">Objetivo {index + 1}</span>
              <span className="objective-description">
                {objective.description || `Descripción objetivo ${index + 1}`}
              </span>
            </div>

            {expandedObjectives[objective.id] && objective.okrs && objective.okrs.length > 0 ? (
              <div className="okrs-container">
                {objective.okrs.map((okr, okrIndex) => (
                  <div key={okr.id || `okr-${index}-${okrIndex}`} className="okr-item">
                    <div className="okr-header" onClick={() => toggleOKR(okr.id)}>
                      <span className={`toggle-icon ${expandedOKRs[okr.id] ? "open" : ""}`}>▶</span>
                      <span className="okr-title">
                        Okr {okrIndex + 1} objetivo {index + 1}
                      </span>
                      <div className="okr-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${okr.progress || 0}%` }}></div>
                        </div>
                        <span className="progress-text">
                          {okr.current_value || 0}/{okr.target_value || 100} ({okr.progress || 0}%)
                        </span>
                      </div>
                    </div>

                    {expandedOKRs[okr.id] && okr.activities && okr.activities.length > 0 ? (
                      <div className="activities-container">
                        {okr.activities.map((activity, actIndex) => (
                          <div key={activity.id || `act-${index}-${okrIndex}-${actIndex}`} className="activity-item">
                            <div className="activity-header" onClick={() => toggleActivity(activity.id)}>
                              <span className={`toggle-icon ${expandedActivities[activity.id] ? "open" : ""}`}>▶</span>
                              <span className="activity-title">Actividad</span>
                              <span className="activity-dates">
                                {activity.start_date || "2024-10-29"} - {activity.end_date || "2024-11-15"}
                              </span>
                            </div>

                            {expandedActivities[activity.id] && activity.tasks && activity.tasks.length > 0 ? (
                              <div className="tasks-container">
                                {activity.tasks.map((task, taskIndex) => (
                                  <div
                                    key={task.id || `task-${index}-${okrIndex}-${actIndex}-${taskIndex}`}
                                    className="task-item"
                                  >
                                    <span className="task-title">{task.title || "Tarea de ejemplo"}</span>
                                    <span className="task-status">{task.status || "in progress"}</span>
                                    <div className="task-progress">
                                      <div className="progress-bar">
                                        <div
                                          className="progress-fill"
                                          style={{ width: `${task.completion_percentage || 50}%` }}
                                        ></div>
                                      </div>
                                      <span className="progress-text">{task.completion_percentage || 50}%</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              expandedActivities[activity.id] && (
                                <div className="no-tasks">No hay tareas disponibles.</div>
                              )
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      expandedOKRs[okr.id] && <div className="no-activities">No hay actividades disponibles.</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              expandedObjectives[objective.id] && <div className="no-okrs">No hay OKRs disponibles.</div>
            )}
          </div>
        ))
      ) : (
        <div className="no-objectives">No hay objetivos disponibles.</div>
      )}
    </div>
  )
}

export default ProjectDetails
