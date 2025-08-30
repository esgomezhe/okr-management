import { useState, useEffect } from 'react';
import { getProjectMembers, getAllUsers, addMemberToProject, removeMemberFromProject } from '../utils/apiServices';

const MembersSection = ({ projectId }) => {
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('employee');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchMembersData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [membersResponse, allUsersResponse] = await Promise.all([
          getProjectMembers(projectId),
          getAllUsers()
        ]);
        setMembers(membersResponse.results || membersResponse || []);
        setAllUsers(allUsersResponse.results || allUsersResponse || []);
      } catch (err) {
        setError("No se pudieron cargar los miembros.");
      } finally {
        setLoading(false);
      }
    };

    fetchMembersData();
  }, [projectId]);

  const handleAddMember = async () => {
    if (!selectedUser) {
      alert('Por favor, selecciona un usuario.');
      return;
    }
    const newMemberResponse = await addMemberToProject(projectId, selectedUser, selectedRole);
    if (newMemberResponse) {
        const membersResponse = await getProjectMembers(projectId);
        setMembers(membersResponse.results || membersResponse || []);
        setSelectedUser('');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("¿Seguro que deseas eliminar a este miembro del proyecto?")) return;
    await removeMemberFromProject(projectId, userId);
    setMembers(prev => prev.filter(member => member.user.id !== userId));
  };

  if (loading) {
    return (
      <div className="members-section" style={{ padding: '1.5rem 2rem' }}>
        Cargando miembros...
      </div>
    );
  }

  if (error) {
    return (
      <div className="members-section" style={{ padding: '1.5rem 2rem', color: 'red' }}>
        {error}
      </div>
    );
  }

  return (
    <div className="members-section">
      <div className="members-header">
        <h3>Miembros del Proyecto</h3>
      </div>
      
      <ul>
        {members.map(member => (
          <li key={member.user.id}>
            <span>{member.user.first_name} {member.user.last_name} ({member.role})</span>
            <button className="btn btn-danger" onClick={() => handleRemoveMember(member.user.id)}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      <div className="add-member-form">
        <h4>Añadir Nuevo Miembro</h4>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} style={{ flex: 1, padding: '8px' }}>
            <option value="">Selecciona un usuario</option>
            {allUsers
              .filter(user => !members.some(member => member.user.id === user.id))
              .map(user => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} ({user.username})
                </option>
            ))}
          </select>
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} style={{ padding: '8px' }}>
            <option value="employee">Empleado</option>
            <option value="manager">Manager</option>
          </select>
          <button className="btn btn-primary" onClick={handleAddMember}>Añadir</button>
        </div>
      </div>
    </div>
  );
};

export default MembersSection;