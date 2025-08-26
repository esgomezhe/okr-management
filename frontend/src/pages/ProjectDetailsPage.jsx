import { useParams } from 'react-router-dom';
import ProjectDetails from '../components/ProjectDetails';
const ProjectDetailsPage = () => {
  
  const { projectId } = useParams();


  return <ProjectDetails projectId={projectId} type="project" />;
};

export default ProjectDetailsPage;