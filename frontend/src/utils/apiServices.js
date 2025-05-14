import axios from 'axios';

// Función para obtener el token CSRF desde las cookies
const getCsrfToken = () => {
  const name = 'csrftoken';
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(name))
    ?.split('=')[1];
  return cookieValue;
};

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Crea una instancia de Axios con configuración global
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Interceptor de request: se ejecuta antes de cada petición para agregar los headers
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

// Interceptor de response para manejar errores 401 y refrescar el token
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
            `${API_BASE_URL}/users/token/refresh/`,
            { refresh: refreshToken },
            {
              headers: {
                'X-CSRFToken': getCsrfToken(),
              },
              withCredentials: true,
            }
          );
          // Actualiza en localStorage el nuevo access token y, si aplica, el refresh token
          localStorage.setItem('access', data.access);
          if (data.refresh) {
            localStorage.setItem('refresh', data.refresh);
          }
          // Actualiza la cabecera de la petición original con el nuevo token
          originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

// --- Funciones de la API ---

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
  const response = await apiClient.post(`/users/register/`, {
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
  const response = await apiClient.post(`/users/login/`, {
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
    `/users/logout/`,
    { refresh: refreshToken },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
    }
  } catch (error) {
    // Siempre limpiamos el localStorage, incluso si hay error
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  }
};

export const getUserDetails = async () => {
  try {
    const response = await apiClient.get(`/users/me/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendPasswordResetEmail = async (email) => {
  const response = await apiClient.post(`/users/reset-password/`, { email });
  return response.data;
};

export const changePassword = async (
  currentPassword,
  newPassword,
  newPassword2
) => {
  try {
    const response = await apiClient.post(
      `/users/change-password/`,
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
    const response = await apiClient.get(`/okrs/projects/?tipo=mision&page=${page}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserProjects = async (page = 1) => {
  try {
    const response = await apiClient.get(`/okrs/projects/?tipo=proyecto&page=${page}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProjectDetails = async (projectId, type = "project") => {
  try {
    const tipo = type === "mission" ? "mision" : "proyecto";
    const response = await apiClient.get(`/okrs/projects/${projectId}/?tipo=${tipo}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createMission = async (missionData) => {
  try {
    const response = await apiClient.post('/okrs/projects/', { ...missionData, tipo: 'mision' });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createProject = async (projectData) => {
  try {
    const response = await apiClient.post('/okrs/projects/', { ...projectData, tipo: 'proyecto' });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateMission = async (missionId, missionData) => {
  try {
    const response = await apiClient.put(`/okrs/projects/${missionId}/`, missionData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteMission = async (missionId) => {
  try {
    const response = await apiClient.delete(`/okrs/projects/${missionId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProject = async (projectId, projectData) => {
  try {
    const response = await apiClient.put(`/okrs/projects/${projectId}/`, projectData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProject = async (projectId) => {
  try {
    const response = await apiClient.delete(`/okrs/projects/${projectId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getEpics = async (projectId) => {
  try {
    const response = await apiClient.get(`/okrs/epics/?project=${projectId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createEpic = async (epicData) => {
  try {
    const response = await apiClient.post('/okrs/epics/', epicData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateEpic = async (epicId, epicData) => {
  try {
    const response = await apiClient.put(`/okrs/epics/${epicId}/`, epicData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteEpic = async (epicId) => {
  try {
    const response = await apiClient.delete(`/okrs/epics/${epicId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      return Promise.reject(error);
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      return Promise.reject(error);
    } else {
      // Algo sucedió al configurar la solicitud
      return Promise.reject(error);
    }
  }
);

export const objectiveService = {
  // Obtener todos los objetivos
  getObjectives: () => api.get('/objectives'),

  // Obtener un objetivo por ID
  getObjective: (id) => api.get(`/objectives/${id}`),

  // Crear un nuevo objetivo
  createObjective: (data) => api.post('/objectives', data),

  // Actualizar un objetivo existente
  updateObjective: (id, data) => api.put(`/objectives/${id}`, data),

  // Eliminar un objetivo
  deleteObjective: (id) => api.delete(`/objectives/${id}`),

  // Actualizar el progreso de un objetivo
  updateProgress: (id, progress) => api.patch(`/objectives/${id}/progress`, { progress }),

  // Actualizar el estado de un objetivo
  updateStatus: (id, status) => api.patch(`/objectives/${id}/status`, { status }),
};

export const keyResultService = {
  // Obtener todos los resultados clave de un objetivo
  getKeyResults: (objectiveId) => api.get(`/objectives/${objectiveId}/key-results`),

  // Obtener un resultado clave por ID
  getKeyResult: (objectiveId, keyResultId) =>
    api.get(`/objectives/${objectiveId}/key-results/${keyResultId}`),

  // Crear un nuevo resultado clave
  createKeyResult: (objectiveId, data) =>
    api.post(`/objectives/${objectiveId}/key-results`, data),

  // Actualizar un resultado clave existente
  updateKeyResult: (objectiveId, keyResultId, data) =>
    api.put(`/objectives/${objectiveId}/key-results/${keyResultId}`, data),

  // Eliminar un resultado clave
  deleteKeyResult: (objectiveId, keyResultId) =>
    api.delete(`/objectives/${objectiveId}/key-results/${keyResultId}`),

  // Actualizar el progreso de un resultado clave
  updateProgress: (objectiveId, keyResultId, progress) =>
    api.patch(`/objectives/${objectiveId}/key-results/${keyResultId}/progress`, {
      progress,
    }),
};

export const userService = {
  // Obtener el perfil del usuario actual
  getCurrentUser: () => api.get('/users/me'),

  // Actualizar el perfil del usuario
  updateProfile: (data) => api.put('/users/me', data),

  // Cambiar la contraseña
  changePassword: (data) => api.put('/users/me/password', data),
};

export const getObjectives = async (epicId) => {
  try {
    const response = await apiClient.get(`/okrs/objectives/?epic=${epicId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createObjective = async (objectiveData) => {
  try {
    const response = await apiClient.post('/okrs/objectives/', objectiveData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateObjective = async (objectiveId, objectiveData) => {
  try {
    const response = await apiClient.put(`/okrs/objectives/${objectiveId}/`, objectiveData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteObjective = async (objectiveId) => {
  try {
    const response = await apiClient.delete(`/okrs/objectives/${objectiveId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getOKRs = async (objectiveId) => {
    try {
        const response = await apiClient.get(`/okrs/okrs/?objective=${objectiveId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createOKR = async (data) => {
    try {
        const response = await apiClient.post('/okrs/okrs/', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateOKR = async (okrId, data) => {
    try {
        const response = await apiClient.put(`/okrs/okrs/${okrId}/`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteOKR = async (okrId) => {
    try {
        const response = await apiClient.delete(`/okrs/okrs/${okrId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getActivities = async (okrId) => {
    try {
        const response = await apiClient.get(`/okrs/activities/?okr=${okrId}`);
        return response.data;
    } catch (error) {
        // Devolver un objeto con results vacío para mantener consistencia
        return { results: [] };
    }
};

export const createActivity = async (data) => {
    try {
        const response = await apiClient.post('/okrs/activities/', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateActivity = async (activityId, data) => {
    try {
        const response = await apiClient.put(`/okrs/activities/${activityId}/`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteActivity = async (activityId) => {
    try {
        const response = await apiClient.delete(`/okrs/activities/${activityId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getTasks = async (activityId) => {
  try {
    const response = await apiClient.get(`/okrs/tasks/?activity=${activityId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await apiClient.post('/okrs/tasks/', taskData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateTask = async (taskId, taskData) => {
  try {
    const response = await apiClient.put(`/okrs/tasks/${taskId}/`, taskData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    const response = await apiClient.delete(`/okrs/tasks/${taskId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default api;