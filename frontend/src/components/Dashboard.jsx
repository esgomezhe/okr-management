// src/components/Dashboard.jsx

import React, { useEffect, useState, useContext } from 'react';
import { getUserProjects } from '../utils/apiServices';
import { AuthContext } from '../contexts/AuthContext';
import ProjectCard from './ProjectCard';
import '../stylesheets/dashboard.css';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchProjects = async () => {
      if (user && user.token) {
        try {
          const data = await getUserProjects(user.token, page);
          if (data.results && Array.isArray(data.results)) {
            setProjects(data.results);
            setTotalPages(Math.ceil(data.count / data.results.length));
          } else {
            setProjects([]);
            setTotalPages(1);
          }
          setLoadingProjects(false);
        } catch (err) {
          console.error('Error al obtener proyectos:', err);
          setError('No se pudieron cargar los proyectos.');
          setLoadingProjects(false);
        }
      }
    };

    fetchProjects();
  }, [user, page]);

  const handleNextPage = () => {
    if (page < totalPages) setPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  if (loading || loadingProjects) {
    return <div>Cargando dashboard...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!Array.isArray(projects)) {
    return <div>Error: Datos de proyectos no válidos.</div>;
  }

  if (projects.length === 0) {
    return <div>No tienes proyectos asignados.</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Mis Proyectos</h2>
      </div>
      <div className="projects-container">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} token={user.token} />
        ))}
      </div>
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={page === 1}>Anterior</button>
        <span>Página {page} de {totalPages}</span>
        <button onClick={handleNextPage} disabled={page === totalPages}>Siguiente</button>
      </div>
    </div>
  );
};

export default Dashboard;