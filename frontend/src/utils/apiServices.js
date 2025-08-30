import axios from 'axios';

const getCsrfToken = () => {
  const name = 'csrftoken';
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(name))
    ?.split('=')[1];
  return cookieValue;
};

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    config.headers['X-CSRFToken'] = getCsrfToken();
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh');
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${API_BASE_URL}/api/users/token/refresh/`,
            { refresh: refreshToken },
            {
              headers: {
                'X-CSRFToken': getCsrfToken(),
              },
              withCredentials: true,
            }
          );
          localStorage.setItem('access', data.access);
          if (data.refresh) {
            localStorage.setItem('refresh', data.refresh);
          }
          originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          window.dispatchEvent(new CustomEvent('tokenExpired'));
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.dispatchEvent(new CustomEvent('tokenExpired'));
      }
    }
    return Promise.reject(error);
  }
);

export const ensureCsrfToken = async () => {
  await apiClient.get('/api/users/csrf/');
};

export const registerUser = async (
  username,
  email,
  first_name,
  last_name,
  phone,
  city,
  role,
  password,
  password2
) => {
  await ensureCsrfToken();
  const response = await apiClient.post(`/api/users/register/`, {
    user: { username, email, first_name, last_name },
    phone,
    city,
    role,
    password,
    password2,
  });
  return response.data;
};

export const loginUser = async (username, password) => {
  await ensureCsrfToken();
  const response = await apiClient.post(`/api/users/login/`, {
    username,
    password,
  });
  if (response.data.access) {
    localStorage.setItem('access', response.data.access);
  }
  if (response.data.refresh) {
    localStorage.setItem('refresh', response.data.refresh);
  }
  return response.data;
};

export const logoutUser = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh');
    const accessToken = localStorage.getItem('access');
    if (refreshToken && accessToken) {
      await apiClient.post(
        `/api/users/logout/`,
        { refresh: refreshToken },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
    }
  } catch (error) {
  } finally {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  }
};

export const getUserDetails = async () => {
  try {
    const response = await apiClient.get(`/api/users/me/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await apiClient.get('/api/okrs/projects/available_users/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProjectMembers = async (projectId) => {
  try {
    const response = await apiClient.get(`/api/okrs/projects/${projectId}/members/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching members, returning empty array.", error);
    return []; 
  }
};

export const addMemberToProject = async (projectId, userId, role) => {
  try {
    const response = await apiClient.post(`/api/okrs/projects/${projectId}/members/`, { user_id: userId, role });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeMemberFromProject = async (projectId, userId) => {
  try {
    await apiClient.delete(`/api/okrs/projects/${projectId}/members/${userId}/`);
  } catch (error) {
    throw error;
  }
};

export const sendPasswordResetEmail = async (email) => {
  await ensureCsrfToken();
  const response = await apiClient.post(`/api/users/reset-password/`, { email });
  return response.data;
};

export const changePassword = async (
  currentPassword,
  newPassword,
  newPassword2
) => {
  await ensureCsrfToken();
  try {
    const response = await apiClient.post(
      `/api/users/change-password/`,
      {
        current_password: currentPassword,
        new_password: newPassword,
        new_password2: newPassword2,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserMissions = async (page = 1) => {
  try {
    const response = await apiClient.get(`/api/okrs/projects/?tipo=mision&page=${page}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserProjects = async (page = 1) => {
  try {
    const response = await apiClient.get(`/api/okrs/projects/?tipo=proyecto&page=${page}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProjectDetails = async (projectId, type = "project") => {
  try {
    const tipo = type === "mission" ? "mision" : "proyecto";
    const response = await apiClient.get(`/api/okrs/projects/${projectId}/?tipo=${tipo}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createMission = async (missionData) => {
  try {
    const response = await apiClient.post('/api/okrs/projects/', { ...missionData, tipo: 'mision' });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createProject = async (projectData) => {
  try {
    const response = await apiClient.post('/api/okrs/projects/', { ...projectData, tipo: 'proyecto' });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateMission = async (missionId, missionData) => {
  try {
    const response = await apiClient.put(`/api/okrs/projects/${missionId}/`, missionData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteMission = async (missionId) => {
  try {
    const response = await apiClient.delete(`/api/okrs/projects/${missionId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProject = async (projectId, projectData) => {
  try {
    const response = await apiClient.put(`/api/okrs/projects/${projectId}/`, projectData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProject = async (projectId) => {
  try {
    const response = await apiClient.delete(`/api/okrs/projects/${projectId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getEpics = async (projectId) => {
  try {
    const response = await apiClient.get(`/api/okrs/epics/?project=${projectId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createEpic = async (epicData) => {
  try {
    const response = await apiClient.post('/api/okrs/epics/', epicData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateEpic = async (epicId, epicData) => {
  try {
    const response = await apiClient.put(`/api/okrs/epics/${epicId}/`, epicData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteEpic = async (epicId) => {
  try {
    const response = await apiClient.delete(`/api/okrs/epics/${epicId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getObjectives = async (epicId) => {
  try {
    const response = await apiClient.get(`/api/okrs/objectives/?epic=${epicId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createObjective = async (objectiveData) => {
  try {
    const response = await apiClient.post('/api/okrs/objectives/', objectiveData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateObjective = async (objectiveId, objectiveData) => {
  try {
    const response = await apiClient.put(`/api/okrs/objectives/${objectiveId}/`, objectiveData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteObjective = async (objectiveId) => {
  try {
    const response = await apiClient.delete(`/api/okrs/objectives/${objectiveId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getOKRs = async (objectiveId) => {
    try {
        const response = await apiClient.get(`/api/okrs/okrs/?objective=${objectiveId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createOKR = async (data) => {
    try {
        const response = await apiClient.post('/api/okrs/okrs/', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateOKR = async (okrId, data) => {
    try {
        const response = await apiClient.put(`/api/okrs/okrs/${okrId}/`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteOKR = async (okrId) => {
    try {
        const response = await apiClient.delete(`/api/okrs/okrs/${okrId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getActivities = async (okrId) => {
    try {
        const response = await apiClient.get(`/api/okrs/activities/?okr=${okrId}`);
        return response.data;
    } catch (error) {
        return { results: [] };
    }
};

export const createActivity = async (data) => {
    try {
        const response = await apiClient.post('/api/okrs/activities/', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateActivity = async (activityId, data) => {
    try {
        const response = await apiClient.put(`/api/okrs/activities/${activityId}/`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteActivity = async (activityId) => {
    try {
        const response = await apiClient.delete(`/api/okrs/activities/${activityId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getTasks = async (activityId) => {
  try {
    const response = await apiClient.get(`/api/okrs/tasks/?activity=${activityId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await apiClient.post('/api/okrs/tasks/', taskData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateTask = async (taskId, taskData) => {
  try {
    const response = await apiClient.put(`/api/okrs/tasks/${taskId}/`, taskData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    const response = await apiClient.delete(`/api/okrs/tasks/${taskId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// No exportamos 'api' como default para evitar confusiones.
// Si se necesita 'api' en otro lugar, se puede exportar.
// export default api;

export const getMyTasks = async () => { 
  console.log("Llamando a getMyTasks (aún no implementado)");
  return { results: [] }; 
};

export const getMyProjects = async () => { 
  console.log("Llamando a getMyProjects (aún no implementado)");
  return { results: [] }; 
};

export const getMyOKRs = async () => { 
  console.log("Llamando a getMyOKRs (aún no implementado)");
  return { results: [] }; 
};