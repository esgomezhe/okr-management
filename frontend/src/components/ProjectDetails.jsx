import React, { useEffect, useState } from 'react';
import { getProjectDetails } from '../utils/apiServices';
import '../stylesheets/projectdetails.css';

const ProjectDetails = ({ projectId, token }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const data = await getProjectDetails(token, projectId);
        console.log(`Detalles del Proyecto ${projectId}:`, data);
        setDetails(data);
        setLoading(false);
      } catch (err) {
        console.error(`Error al obtener detalles del proyecto ${projectId}:`, err);
        setError('No se pudieron cargar los detalles del proyecto.');
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, token]);

  if (loading) {
    return <div>Cargando detalles del proyecto...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!details) {
    return <div>No hay detalles disponibles para este proyecto.</div>;
  }

  return (
    <div className="project-details">
      <h4>Objetivos</h4>
      <ul>
        {details.objectives && details.objectives.length > 0 ? (
          details.objectives.map((objective) => (
            <li key={objective.id}>
              <strong>{objective.title}</strong>: {objective.description}
              {/* Mostrar OKRs dentro de cada objetivo */}
              {objective.okrs && objective.okrs.length > 0 ? (
                <ul>
                  {objective.okrs.map((okr) => (
                    <li key={okr.id}>
                      <strong>{okr.key_result}</strong>: {okr.description} (Valor Objetivo: {okr.target_value}, Valor Actual: {okr.current_value}, Progreso: {okr.progress}%)
                      {/* Mostrar Actividades dentro de cada OKR */}
                      {okr.activities && okr.activities.length > 0 ? (
                        <ul>
                          {okr.activities.map((activity) => (
                            <li key={activity.id}>
                              <strong>{activity.name}</strong>: {activity.description} (Fecha de Inicio: {activity.start_date}, Fecha de Fin: {activity.end_date})
                              {/* Mostrar Tareas dentro de cada Actividad */}
                              {activity.tasks && activity.tasks.length > 0 ? (
                                <ul>
                                  {activity.tasks.map((task) => (
                                    <li key={task.id}>
                                      {task.title} - Estado: {task.status} - Porcentaje Completado: {task.completion_percentage}%
                                      {task.parent_task && ` (Subtarea de: ${task.parent_task})`}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <ul>
                                  <li>No hay tareas disponibles.</li>
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ul>
                          <li>No hay actividades disponibles.</li>
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <ul>
                  <li>No hay OKRs disponibles.</li>
                </ul>
              )}
            </li>
          ))
        ) : (
          <li>No hay objetivos disponibles.</li>
        )}
      </ul>
    </div>
  );
};

export default ProjectDetails;