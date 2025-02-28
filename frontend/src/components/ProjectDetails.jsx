import { useEffect, useState } from "react"
import { getProjectDetails } from "../utils/apiServices"
import "../stylesheets/projectdetails.css"

const ProjectDetails = ({ projectId, token }) => {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedEpics, setExpandedEpics] = useState({})
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

  const toggleEpic = (epicId) => {
    setExpandedEpics((prev) => ({
      ...prev,
      [epicId]: !prev[epicId],
    }))
  }

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

  if (!details || !details.epics) {
    return <div className="details-empty">No hay detalles disponibles para este proyecto.</div>
  }

  return (
    <div className="project-details">
      {details.epics.map((epic, epicIndex) => (
        <div key={epic.id || epicIndex} className="epic-item">
          <div className="epic-header" onClick={() => toggleEpic(epic.id)}>
            <span className={`toggle-icon ${expandedEpics[epic.id] ? "open" : ""}`}>▶</span>
            <span className="level-label">Objetivo Estratégico (Épica):</span>
            <span className="epic-title">{epic.title}</span>
          </div>

          {expandedEpics[epic.id] && epic.objectives && epic.objectives.length > 0 ? (
            <div className="objectives-container">
              {epic.objectives.map((objective, objectiveIndex) => (
                <div key={objective.id || objectiveIndex} className="objective-item">
                  <div className="objective-header" onClick={() => toggleObjective(objective.id)}>
                    <span className={`toggle-icon ${expandedObjectives[objective.id] ? "open" : ""}`}>▶</span>
                    <span className="level-label">Objetivo:</span>
                    <span className="objective-title">{objective.title}</span>
                    <span className="objective-description">{objective.description}</span>
                  </div>

                  {expandedObjectives[objective.id] && objective.okrs && objective.okrs.length > 0 ? (
                    <div className="okrs-container">
                      {objective.okrs.map((okr, okrIndex) => (
                        <div key={okr.id || `okr-${objectiveIndex}-${okrIndex}`} className="okr-item">
                          <div className="okr-header" onClick={() => toggleOKR(okr.id)}>
                            <span className={`toggle-icon ${expandedOKRs[okr.id] ? "open" : ""}`}>▶</span>
                            <span className="level-label">OKR:</span>
                            <span className="okr-title">{okr.key_result}</span>
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
                                <div
                                  key={activity.id || `act-${objectiveIndex}-${okrIndex}-${actIndex}`}
                                  className="activity-item"
                                >
                                  <div className="activity-header" onClick={() => toggleActivity(activity.id)}>
                                    <span className={`toggle-icon ${expandedActivities[activity.id] ? "open" : ""}`}>
                                      ▶
                                    </span>
                                    <span className="level-label">Actividad:</span>
                                    <span className="activity-title">{activity.name}</span>
                                    <span className="activity-dates">
                                      {activity.start_date} - {activity.end_date}
                                    </span>
                                  </div>

                                  {expandedActivities[activity.id] && activity.tasks && activity.tasks.length > 0 ? (
                                    <div className="tasks-container">
                                      {activity.tasks.map((task, taskIndex) => (
                                        <div
                                          key={task.id || `task-${objectiveIndex}-${okrIndex}-${actIndex}-${taskIndex}`}
                                          className="task-item"
                                        >
                                          <span className="level-label">Tarea:</span>
                                          <span className="task-title">{task.title}</span>
                                          <span className="task-status">{task.status}</span>
                                          <div className="task-progress">
                                            <div className="progress-bar">
                                              <div
                                                className="progress-fill"
                                                style={{ width: `${task.completion_percentage || 0}%` }}
                                              ></div>
                                            </div>
                                            <span className="progress-text">{task.completion_percentage || 0}%</span>
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
              ))}
            </div>
          ) : (
            expandedEpics[epic.id] && <div className="no-objectives">No hay objetivos disponibles para esta épica.</div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ProjectDetails