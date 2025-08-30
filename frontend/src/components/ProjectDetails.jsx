import { useEffect, useState } from "react"
import { getProjectDetails, getEpics, createEpic, updateEpic, deleteEpic, getObjectives, createObjective, updateObjective, deleteObjective, getUserDetails, getOKRs, createOKR, updateOKR, deleteOKR, getActivities, createActivity, updateActivity, deleteActivity, getTasks, createTask, updateTask, deleteTask } from "../utils/apiServices"
import "../stylesheets/projectdetails.css"
import MembersSection from './MembersSection';

const ProjectDetails = ({ projectId, type = "project" }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [epics, setEpics] = useState([]);
  const [epicModal, setEpicModal] = useState({ open: false, mode: 'create', epic: null });
  const [objectives, setObjectives] = useState(type === 'project' ? [] : {});
  const [objectiveModal, setObjectiveModal] = useState({ open: false, mode: 'create', objective: null, epicId: null });
  const [okrs, setOKRs] = useState({});
  const [okrModal, setOKRModal] = useState({ show: false, mode: 'create', okr: null, objectiveId: null });
  const [activities, setActivities] = useState({});
  const [activityModal, setActivityModal] = useState({ show: false, mode: 'create', activity: null, okrId: null });
  const [tasks, setTasks] = useState({});
  const [taskModal, setTaskModal] = useState({ show: false, mode: 'create', task: null, activityId: null });
  

  useEffect(() => {
    const fetchAllData = async () => {
      if (!projectId) return;
      setLoading(true);
      setError(null);
      try {
        const detailsData = await getProjectDetails(projectId, type);
      setDetails(detailsData);
        let objectivesToFetch = [];
        if (type === 'project' && detailsData.objectives) {
          objectivesToFetch = detailsData.objectives;
          setObjectives(detailsData.objectives);
        } else if (type === 'mission') {
          const epicsData = await getEpics(projectId);
          const fetchedEpics = epicsData.results || [];
          setEpics(fetchedEpics);
          const objectivesPromises = fetchedEpics.map(epic => getObjectives(epic.id));
          const objectivesResponses = await Promise.all(objectivesPromises);
          const objectivesByEpic = {};
          objectivesResponses.forEach((response, index) => {
            const epicId = fetchedEpics[index].id;
            const epicObjectives = response.results || [];
            objectivesByEpic[epicId] = epicObjectives;
            objectivesToFetch.push(...epicObjectives);
          });
          setObjectives(objectivesByEpic);
        }
        if (objectivesToFetch.length > 0) {
          const okrsPromises = objectivesToFetch.map(obj => getOKRs(obj.id));
          const okrsResponses = await Promise.all(okrsPromises);
          const okrsByObjective = {};
          const allOkrs = [];
          okrsResponses.forEach((response, index) => {
            const objectiveId = objectivesToFetch[index].id;
            const objectiveOkrs = response.results || [];
            okrsByObjective[objectiveId] = objectiveOkrs;
            allOkrs.push(...objectiveOkrs);
          });
          setOKRs(okrsByObjective);
          if (allOkrs.length > 0) {
            const activitiesPromises = allOkrs.map(okr => getActivities(okr.id));
            const activitiesResponses = await Promise.all(activitiesPromises);
            const activitiesByOkr = {};
            const allActivities = [];
            activitiesResponses.forEach((response, index) => {
              const okrId = allOkrs[index].id;
              const okrActivities = response.results || [];
              activitiesByOkr[okrId] = okrActivities;
              allActivities.push(...okrActivities);
            });
            setActivities(activitiesByOkr);
            if (allActivities.length > 0) {
              const tasksPromises = allActivities.map(act => getTasks(act.id));
              const tasksResponses = await Promise.all(tasksPromises);
              const tasksByActivity = {};
              tasksResponses.forEach((response, index) => {
                const activityId = allActivities[index].id;
                tasksByActivity[activityId] = response.results || [];
              });
              setTasks(tasksByActivity);
            }
          }
        }
      } catch (err) {
        setError(`No se pudieron cargar todos los datos del ${type}. Por favor, recarga la página.`);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [projectId, type]);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  const handleCreateEpic = async (epicData) => {
    setLoading(true);
    try {
      const userDetails = await getUserDetails();
      const newEpic = await createEpic({ 
        ...epicData, 
        project: projectId,
        owner_id: userDetails.id 
      })
      setEpics((prev) => [newEpic, ...prev])
      setEpicModal({ open: false, mode: 'create', epic: null })
    } catch (err) {
      setError("Error al crear la épica")
    } finally {
      setLoading(false);
    }
  }
  
  const handleUpdateEpic = async (epicId, epicData) => {
    setLoading(true);
    try {
      const userDetails = await getUserDetails();
      const updated = await updateEpic(epicId, {
        ...epicData,
        project: projectId,
        owner_id: userDetails.id
      })
      setEpics((prev) => prev.map(e => e.id === epicId ? updated : e))
      setEpicModal({ open: false, mode: 'create', epic: null })
    } catch (err) {
      setError("Error al actualizar la épica")
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteEpic = async (epicId) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta épica?")) return
    setLoading(true);
    try {
      await deleteEpic(epicId)
      setEpics((prev) => prev.filter(e => e.id !== epicId))
    } catch (err) {
      setError("Error al eliminar la épica")
    } finally {
      setLoading(false);
    }
  }

  const handleCreateObjective = async (objectiveData) => {
    setLoading(true);
    try {
      const userDetails = await getUserDetails();
      let newObjective;
      if (type === 'project') {
        newObjective = await createObjective({
          ...objectiveData,
          project: projectId,
          owner_id: userDetails.id
        });
        setObjectives(prev => [newObjective, ...(prev || [])]);
      } else {
        if (!objectiveModal.epicId) {
          setError("Debes seleccionar una épica para crear un objetivo.");
          setLoading(false);
          return;
        }
        newObjective = await createObjective({
          ...objectiveData,
          epic: objectiveModal.epicId,
          owner_id: userDetails.id
        });
        setObjectives(prev => ({
          ...prev,
          [objectiveModal.epicId]: [newObjective, ...(prev[objectiveModal.epicId] || [])]
        }));
      }
      setObjectiveModal({ open: false, mode: 'create', objective: null, epicId: null })
    } catch (err) {
      setError("Error al crear el objetivo")
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateObjective = async (objectiveId, objectiveData) => {
    setLoading(true);
    try {
      const userDetails = await getUserDetails();
      let epicId = objectiveModal.epicId;
      if (!epicId && type !== 'project') {
        Object.keys(objectives).forEach(key => {
          if (objectives[key].some(obj => obj.id === objectiveId)) {
            epicId = key;
          }
        });
      }
      const updated = await updateObjective(objectiveId, {
        ...objectiveData,
        ...(type !== 'project' ? { epic: epicId } : { project: projectId }),
        owner_id: userDetails.id
      })
      setObjectives(prev => {
        if (type === 'project') {
          return prev.map(o => o.id === objectiveId ? updated : o);
        }
        const newObjectives = { ...prev }
        Object.keys(newObjectives).forEach(epicId => {
          newObjectives[epicId] = newObjectives[epicId].map(o => 
            o.id === objectiveId ? updated : o
          )
        })
        return newObjectives
      })
      setObjectiveModal({ open: false, mode: 'create', objective: null, epicId: null })
    } catch (err) {
      setError("Error al actualizar el objetivo")
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteObjective = async (objectiveId) => {
    if (!window.confirm("¿Seguro que deseas eliminar este objetivo?")) return
    setLoading(true);
    try {
      await deleteObjective(objectiveId)
      if (type === 'project') {
        setObjectives(prev => prev.filter(obj => obj.id !== objectiveId))
      } else {
        setObjectives(prev => {
          const newObjectives = { ...prev }
          Object.keys(newObjectives).forEach(epicId => {
            newObjectives[epicId] = newObjectives[epicId].filter(o => o.id !== objectiveId)
          })
          return newObjectives
        })
      }
    } catch (err) {
      setError("Error al eliminar el objetivo")
    } finally {
      setLoading(false);
    }
  }

  const handleCreateOKR = async (objectiveId, data) => {
    setLoading(true);
    try {
      const userDetails = await getUserDetails()
      const okrData = {
        ...data,
        objective: objectiveId,
        owner_id: userDetails.id
      }
      const newOKR = await createOKR(okrData)
      setOKRs(prev => ({
      ...prev,
        [objectiveId]: [...(prev[objectiveId] || []), newOKR]
      }))
      setOKRModal({ show: false, mode: 'create', okr: null, objectiveId: null })
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateOKR = async (okrId, data) => {
    setLoading(true);
    try {
      const userDetails = await getUserDetails();
      const updatedOKR = await updateOKR(okrId, {
        ...data,
        objective: okrModal.objectiveId || (okrs && Object.keys(okrs).find(key => okrs[key].some(okr => okr.id === okrId))),
        owner_id: userDetails.id
      })
      setOKRs(prev => {
        const newOKRs = { ...prev }
        Object.keys(newOKRs).forEach(objectiveId => {
          newOKRs[objectiveId] = newOKRs[objectiveId].map(okr =>
            okr.id === okrId ? updatedOKR : okr
          )
        })
        return newOKRs
      })
      setOKRModal({ show: false, mode: 'create', okr: null, objectiveId: null })
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteOKR = async (okrId) => {
    setLoading(true);
    try {
      await deleteOKR(okrId)
      setOKRs(prev => {
        const newOKRs = { ...prev }
        Object.keys(newOKRs).forEach(objectiveId => {
          newOKRs[objectiveId] = newOKRs[objectiveId].filter(okr => okr.id !== okrId)
        })
        return newOKRs
      })
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false);
    }
  }

  const handleCreateActivity = async (okrId, data) => {
    setLoading(true);
    try {
      const userDetails = await getUserDetails()
      const activityData = {
        ...data,
        okr: okrId,
        owner_id: userDetails.id
      }
      const newActivity = await createActivity(activityData)
      setActivities(prev => ({
      ...prev,
        [okrId]: [...(prev[okrId] || []), newActivity]
      }))
      setActivityModal({ show: false, mode: 'create', activity: null, okrId: null })
    } catch (error) {
      const msg = error?.response?.data?.detail || error?.message || 'Error al crear la actividad'
      setError(msg)
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateActivity = async (activityId, data) => {
    setLoading(true);
    try {
      const userDetails = await getUserDetails();
      let okrId = null;
      Object.keys(activities).forEach(key => {
        if (activities[key].some(act => act.id === activityId)) {
          okrId = key;
        }
      });
      const updatedActivity = await updateActivity(activityId, {
        ...data,
        okr: okrId,
        owner_id: userDetails.id
      })
      setActivities(prev => {
        const newActivities = { ...prev }
        Object.keys(newActivities).forEach(okrId => {
          newActivities[okrId] = newActivities[okrId].map(activity =>
            activity.id === activityId ? updatedActivity : activity
          )
        })
        return newActivities
      })
      setActivityModal({ show: false, mode: 'create', activity: null, okrId: null })
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteActivity = async (okrId, activityId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
      return
    }
    setLoading(true);
    try {
      await deleteActivity(activityId)
      setActivities(prev => ({
      ...prev,
        [okrId]: prev[okrId].filter(activity => activity.id !== activityId)
      }))
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false);
    }
  }

  const handleCreateTask = async (activityId, data) => {
    setLoading(true);
    try {
      const userDetails = await getUserDetails()
      const taskData = {
        ...data,
        activity: activityId,
        assignee_id: userDetails.id
      }
      const newTask = await createTask(taskData)
      setTasks(prev => ({
        ...prev,
        [activityId]: [...(prev[activityId] || []), newTask]
      }))
      setTaskModal({ show: false, mode: 'create', task: null, activityId: null })
    } catch (error) {
      setError(error?.response?.data?.detail || error?.message || 'Error al crear la tarea')
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateTask = async (taskId, data) => {
    setLoading(true);
    try {
      let activityId = null;
      Object.keys(tasks).forEach(key => {
        if (tasks[key].some(task => task.id === taskId)) {
          activityId = key;
        }
      });
      const userDetails = await getUserDetails();
      const updatedTask = await updateTask(taskId, {
        ...data,
        activity: activityId,
        assignee_id: userDetails.id
      })
      setTasks(prev => {
        const newTasks = { ...prev }
        Object.keys(newTasks).forEach(activityId => {
          newTasks[activityId] = newTasks[activityId].map(task =>
            task.id === taskId ? updatedTask : task
          )
        })
        return newTasks
      })
      setTaskModal({ show: false, mode: 'create', task: null, activityId: null })
    } catch (error) {
      setError(error?.response?.data?.detail || error?.message || 'Error al actualizar la tarea')
    } finally {
      setLoading(false);
    }
  }
  


  const handleDeleteTask = async (activityId, taskId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return
    setLoading(true);
    try {
      await deleteTask(taskId)
      setTasks(prev => ({
        ...prev,
        [activityId]: prev[activityId].filter(task => task.id !== taskId)
      }))
    } catch (error) {
      setError(error?.response?.data?.detail || error?.message || 'Error al eliminar la tarea')
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="details-loading">Cargando detalles del {type}...</div>
  }

  if (error) {
    return <div className="details-error">{error}</div>
  }

  if (!details) {
    return <div className="details-empty">No hay detalles disponibles para este {type}.</div>
  }

  const renderProgressBar = (current, target, percentage) => (
    <div className="progress-container" style={{ marginBottom: '12px' }}>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage || 0}%` }}></div>
      </div>
      <span className="progress-text">
        {current || 0}/{target || 100} ({percentage || 0}%)
      </span>
    </div>
  )
  

  const renderTasks = (activityId) => {
    const activityTasks = tasks[activityId] || []
    return (
      <div className="tasks-list">
        <div className="tasks-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontSize:'13px',fontWeight:500}}>Tareas</span>
          <button
            className="btn btn-primary"
            style={{fontSize:'13px',padding:'2px 10px',height:24}}
            onClick={() => setTaskModal({ show: true, mode: 'create', task: null, activityId })}
          >
            + Nueva Tarea
          </button>
        </div>
        
        {activityTasks.length > 0 ? activityTasks.map((task) => (
          <div key={task.id} className="task-item">
            <div className="task-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:'13px',fontWeight:500}}>{task.title}</span>
              <span className={`status-badge ${task.status}`}>{task.status}</span>
            </div>
            <p className="task-description" style={{fontSize:'12px',color:'#757575'}}>{task.desc}</p>
            <div className="task-actions">
              <button className="btn" style={{fontSize:'13px'}} onClick={() => setTaskModal({ show: true, mode: 'edit', task, activityId })}>Editar</button>
              <button className="btn btn-danger" style={{fontSize:'13px'}} onClick={() => handleDeleteTask(activityId, task.id)}>Eliminar</button>
            </div>
          </div>
        )) : <p className="no-tasks" style={{fontSize:'12px',color:'#b3b3b3'}}>No hay tareas asociadas</p>}
      </div>
    )
  }

  const renderActivities = (okrId) => {
    const okrActivities = activities[okrId] || []
    return (
      <div className="activities-container">
        <div className="activities-header">
          <span style={{fontSize:'13px',fontWeight:500}}>Actividades</span>
          <button
            className="btn btn-primary"
            style={{fontSize:'13px',padding:'2px 10px',height:24}}
            onClick={() => setActivityModal({ show: true, mode: 'create', activity: null, okrId })}
          >
            Agregar Actividad
          </button>
        </div>
        
        {okrActivities.map(activity => (
          <div key={activity.id} className="activity-item">
            <div className="activity-header" onClick={() => toggleSection(`activity-${activity.id}`)} style={{cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center'}}>
                <span className="toggle-icon">{expandedSections[`activity-${activity.id}`] ? '▼' : '▶'}</span>
                <span style={{fontSize:'13px',fontWeight:500}}>{activity.name}</span>
              </div>
              <div className="activity-actions">
                <button className="btn" style={{fontSize:'13px'}} onClick={(e) => {e.stopPropagation(); setActivityModal({ show: true, mode: 'edit', activity, okrId });}}>Editar</button>
                <button className="btn btn-danger" style={{fontSize:'13px'}} onClick={(e) => {e.stopPropagation(); handleDeleteActivity(okrId, activity.id);}}>Eliminar</button>
              </div>
            </div>
            {expandedSections[`activity-${activity.id}`] && (
              <div className="activity-content">
                <p className="activity-description" style={{fontSize:'12px',color:'#757575'}}>{activity.description}</p>
                <div className="activity-dates" style={{ display: 'flex', gap: '16px', marginBottom: '4px' }}>
                  <span>Inicio: {new Date(activity.start_date).toLocaleDateString()}</span>
                  <span>|</span>
                  <span>Fin: {new Date(activity.end_date).toLocaleDateString()}</span>
                </div>
                <div className="activity-progress" style={{ marginBottom: '12px' }}>
                  <span>Progreso: {activity.progress}%</span>
                </div>
                <div className="activity-tasks">
                  <span style={{fontSize:'12px',fontWeight:500}}>Tareas Asociadas</span>
                  {renderTasks(activity.id)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderOKRs = (objectiveId) => {
    const objectiveOKRs = okrs[objectiveId] || []
    return (
      <div className="okrs-container">
        <div className="okrs-header">
          <span style={{fontSize:'13px',fontWeight:500}}>OKRs</span>
          <button 
            className="btn btn-primary"
            style={{fontSize:'13px',padding:'2px 10px',height:24}}
            onClick={() => setOKRModal({ show: true, mode: 'create', okr: null, objectiveId })}
          >
            Agregar OKR
          </button>
        </div>
        
        {(objectiveOKRs.length === 0) && (
          <div className="okr-empty">No hay OKRs para este objetivo.</div>
        )}
        {objectiveOKRs.map(okr => (
          <div key={okr.id} className="okr-item">
            <div className="okr-header-row" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div className="okr-header" onClick={() => toggleSection(`okr-${okr.id}`)} style={{cursor:'pointer',display:'flex',alignItems:'center'}}>
                <span className="toggle-icon">{expandedSections[`okr-${okr.id}`] ? '▼' : '▶'}</span>
                <span style={{fontSize:'13px',fontWeight:500}}>{okr.key_result}</span>
              </div>
            </div>
            <div className="okr-progress" style={{ marginBottom: '16px' }}>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${okr.progress}%` }}
                ></div>
              </div>
              <span className="progress-text">
                {okr.current_value}/{okr.target_value} ({okr.progress}%)
              </span>
            </div>
            <div className="okr-actions" style={{ marginTop: '10px' }}>
              <button 
                className="btn"
                style={{fontSize:'13px'}}
                onClick={(e) => {
                  e.stopPropagation();
                  setOKRModal({ show: true, mode: 'edit', okr, objectiveId });
                }}
              >
                Editar
              </button>
              <button 
                className="btn btn-danger"
                style={{fontSize:'13px'}}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteOKR(okr.id);
                }}
              >
                Eliminar
              </button>
            </div>
            {expandedSections[`okr-${okr.id}`] && renderActivities(okr.id)}
          </div>
        ))}
      </div>
    )
  }

  const renderObjectivesProject = (objectivesArr) => (
    <div className="objectives-list">
      <div className="objectives-header">
        <span style={{fontSize:'13px',fontWeight:500}}>Objetivos</span>
        <button 
          className="btn btn-primary" 
          style={{fontSize:'13px',padding:'2px 10px',height:24}}
          onClick={() => setObjectiveModal({ open: true, mode: 'create', objective: null, epicId: null })}
        >
          + Nuevo Objetivo
        </button>
      </div>
      
      {objectivesArr.map((objective) => (
        <div key={objective.id} className="objective-item">
          <div className="objective-header-row" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div className="objective-header" onClick={() => toggleSection(`objective-${objective.id}`)} style={{cursor:'pointer',display:'flex',alignItems:'center'}}>
              <span className="toggle-icon">{expandedSections[`objective-${objective.id}`] ? '▼' : '▶'}</span>
              <span style={{fontSize:'13px',fontWeight:500}}>{objective.title}</span>
            </div>
          </div>
          {expandedSections[`objective-${objective.id}`] && (
            <div className="objective-content">
              <p className="objective-description" style={{fontSize:'12px',color:'#757575'}}>{objective.description}</p>
              <div className="objective-actions">
                <button className="btn" style={{fontSize:'13px'}} onClick={() => setObjectiveModal({ open: true, mode: 'edit', objective, epicId: null })}>Editar</button>
                <button className="btn btn-danger" style={{fontSize:'13px'}} onClick={() => handleDeleteObjective(objective.id)}>Eliminar</button>
              </div>
              {renderOKRs(objective.id)}
            </div>
          )}
        </div>
      ))}
      {objectiveModal.open && (
        <ObjectiveModal
          mode={objectiveModal.mode}
          objective={objectiveModal.objective}
          onClose={() => setObjectiveModal({ open: false, mode: 'create', objective: null, epicId: null })}
          onSave={objectiveModal.mode === 'edit' ? handleUpdateObjective : handleCreateObjective}
        />
      )}
    </div>
  );

  const renderEpics = (epics) => (
    <div className="epics-list">
      <div className="epics-header">
        <span style={{fontSize:'13px',fontWeight:500}}>Épicas (Objetivos Estratégicos)</span>
        <button className="btn btn-primary" style={{fontSize:'13px',padding:'2px 10px',height:24}} onClick={() => setEpicModal({ open: true, mode: 'create', epic: null })}>+ Nueva Épica</button>
      </div>
      
      {epics?.map((epic) => (
        <div key={epic.id} className="epic-item">
          <div className="epic-header-row" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div className="epic-header" onClick={() => toggleSection(`epic-${epic.id}`)} style={{cursor:'pointer',display:'flex',alignItems:'center'}}>
              <span className="toggle-icon">{expandedSections[`epic-${epic.id}`] ? '▼' : '▶'}</span>
              <span style={{fontSize:'13px',fontWeight:500}}>{epic.title}</span>
            </div>
          </div>
          {expandedSections[`epic-${epic.id}`] && (
            <div className="epic-content">
              <p className="epic-description" style={{fontSize:'12px',color:'#757575'}}>{epic.description}</p>
              <div className="epic-actions">
                <button className="btn" style={{fontSize:'13px'}} onClick={() => setEpicModal({ open: true, mode: 'edit', epic })}>Editar</button>
                <button className="btn btn-danger" style={{fontSize:'13px'}} onClick={() => handleDeleteEpic(epic.id)}>Eliminar</button>
              </div>
              {renderObjectivesProject(objectives[epic.id] || [])}
            </div>
          )}
        </div>
      ))}
      {epicModal.open && (
        <EpicModal
          mode={epicModal.mode}
          epic={epicModal.epic}
          onClose={() => setEpicModal({ open: false, mode: 'create', epic: null })}
          onSave={epicModal.mode === 'edit' ? handleUpdateEpic : handleCreateEpic}
        />
      )}
    </div>
  )

  return (
    <div className="project-details">
      <div className="details-header">
        <h1>{details.name}</h1>
        <p className="project-description">{details.description}</p>
      </div>
      <div className="details-content">
    <MembersSection projectId={projectId} />
    {type === "mission"
        ? renderEpics(epics)
        : renderObjectivesProject(objectives)}
    </div>
      {okrModal.show && (
// ... y el resto del código ...
        <OKRModal
          show={okrModal.show}
          onClose={() => setOKRModal({ show: false, mode: 'create', okr: null, objectiveId: null })}
          onSave={okrModal.mode === 'create' 
            ? (data) => handleCreateOKR(okrModal.objectiveId, data)
            : (data) => handleUpdateOKR(okrModal.okr.id, data)
          }
          okr={okrModal.okr}
        />
      )}
      {activityModal.show && (
        <ActivityModal
          mode={activityModal.mode}
          activity={activityModal.activity}
          onClose={() => setActivityModal({ show: false, mode: 'create', activity: null, okrId: null })}
          onSave={activityModal.mode === 'edit' 
            ? (data) => handleUpdateActivity(activityModal.activity.id, data)
            : (data) => handleCreateActivity(activityModal.okrId, data)
          }
        />
      )}
      {taskModal.show && (
        <TaskModal
          mode={taskModal.mode}
          task={taskModal.task}
          onClose={() => setTaskModal({ show: false, mode: 'create', task: null, activityId: null })}
          onSave={taskModal.mode === 'edit'
            ? (data) => handleUpdateTask(taskModal.task.id, data)
            : (data) => handleCreateTask(taskModal.activityId, data)
          }
        />
      )}
    </div>
  )
}

// Modal para crear/editar épicas
const EpicModal = ({ mode, epic, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: epic?.title || '',
    description: epic?.description || ''
  })
  useEffect(() => {
    if (mode === 'edit' && epic) {
      setForm({
        title: epic.title || '',
        description: epic.description || ''
      })
    }
  }, [mode, epic])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (mode === 'edit') {
        await onSave(epic.id, form)
      } else {
        await onSave(form)
      }
    } catch (err) {
      setError('Error al guardar la épica')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{mode === 'edit' ? 'Editar Épica' : 'Nueva Épica'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="epic-title">Título</label>
            <input
              type="text"
              id="epic-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="epic-description">Descripción</label>
            <textarea
              id="epic-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className="form-textarea"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal para crear/editar objetivos
const ObjectiveModal = ({ mode, objective, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: objective?.title || '',
    description: objective?.description || ''
  })
  useEffect(() => {
    if (mode === 'edit' && objective) {
      setForm({
        title: objective.title || '',
        description: objective.description || ''
      })
    }
  }, [mode, objective])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (mode === 'edit') {
        await onSave(objective.id, form)
      } else {
        await onSave(form)
      }
    } catch (err) {
      setError('Error al guardar el objetivo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{mode === 'edit' ? 'Editar Objetivo' : 'Nuevo Objetivo'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="objective-title">Título</label>
            <input
              type="text"
              id="objective-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="objective-description">Descripción</label>
            <textarea
              id="objective-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className="form-textarea"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal para crear/editar OKRs
const OKRModal = ({ show, onClose, onSave, okr }) => {
  const [form, setForm] = useState({
    key_result: okr?.key_result || '',
    current_value: okr?.current_value || 0,
    target_value: okr?.target_value || 100,
    progress: okr?.progress || 0
  })
  useEffect(() => {
    if (show === 'edit' && okr) {
      setForm({
        key_result: okr.key_result || '',
        current_value: okr.current_value || 0,
        target_value: okr.target_value || 100,
        progress: okr.progress || 0
      })
    }
  }, [show, okr])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (show === 'edit') {
        await onSave(okr.id, form)
      } else {
        await onSave(form)
      }
    } catch (err) {
      setError('Error al guardar el OKR')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{show === 'edit' ? 'Editar OKR' : 'Nuevo OKR'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="okr-key_result">Resultado Clave</label>
            <input
              type="text"
              id="okr-key_result"
              name="key_result"
              value={form.key_result}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Ingrese el nombre del resultado clave"
            />
          </div>
          <div className="form-group">
            <label>Información del Progreso</label>
            <div className="info-box">
              <div className="info-item">
                <span className="info-label">Valor Actual:</span>
                <span className="info-value">{form.current_value}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Valor Objetivo:</span>
                <span className="info-value">{form.target_value}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Progreso:</span>
                <span className="info-value">{form.progress}%</span>
              </div>
            </div>
            <small className="form-text">
              El progreso se calcula automáticamente según las tareas completadas asociadas a este OKR.
            </small>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal para crear/editar actividades
const ActivityModal = ({ mode, activity, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: activity?.name || '',
    description: activity?.description || '',
    start_date: activity?.start_date || '',
    end_date: activity?.end_date || ''
  })
  useEffect(() => {
    if (mode === 'edit' && activity) {
      setForm({
        name: activity.name || '',
        description: activity.description || '',
        start_date: activity.start_date || '',
        end_date: activity.end_date || ''
      })
    }
  }, [mode, activity])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (mode === 'edit') {
        await onSave(activity.id, form)
      } else {
        await onSave(form)
      }
    } catch (err) {
      setError('Error al guardar la actividad')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{mode === 'edit' ? 'Editar Actividad' : 'Nueva Actividad'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="activity-name">Nombre</label>
            <input
              type="text"
              id="activity-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="activity-description">Descripción</label>
            <textarea
              id="activity-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className="form-textarea"
            />
          </div>
          <div className="form-group">
            <label htmlFor="activity-start_date">Fecha de Inicio</label>
            <input
              type="date"
              id="activity-start_date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="activity-end_date">Fecha de Finalización</label>
            <input
              type="date"
              id="activity-end_date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal para crear/editar tareas
const TaskModal = ({ mode, task, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: task?.title || '',
    desc: task?.desc || '',
    status: task?.status || 'backlog'
  })
  useEffect(() => {
    if (mode === 'edit' && task) {
      setForm({
        title: task.title || '',
        desc: task.desc || '',
        status: task.status || 'backlog'
      })
    }
  }, [mode, task])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (mode === 'edit') {
        await onSave(form)
      } else {
        await onSave(form)
      }
    } catch (err) {
      setError('Error al guardar la tarea')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{mode === 'edit' ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="task-title">Título</label>
            <input
              type="text"
              id="task-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-desc">Descripción</label>
            <textarea
              id="task-desc"
              name="desc"
              value={form.desc}
              onChange={handleChange}
              rows="3"
              className="form-textarea"
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-status">Estado</label>
            <select
              id="task-status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="form-input"
            >
              <option value="backlog">Backlog</option>
              <option value="in progress">En progreso</option>
              <option value="completed">Completada</option>
            </select>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProjectDetails