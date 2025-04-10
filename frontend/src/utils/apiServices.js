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
          console.error('Error al refrescar el token:', refreshError);
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
  const refreshToken = localStorage.getItem('refresh');
  const accessToken = localStorage.getItem('access');
  await apiClient.post(
    `/users/logout/`,
    { refresh: refreshToken },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
};

export const getUserDetails = async () => {
  try {
    const response = await apiClient.get(`/users/me/`);
    console.log('Datos del usuario:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los datos del usuario:', error.response);
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

export const getUserProjects = async (page = 1) => {
  try {
    const response = await apiClient.get(`/okrs/projects/?page=${page}`);
    console.log('Respuesta de getUserProjects:', response.data);
    return response.data;
  } catch (error) {
    console.error(
      'Error al obtener proyectos del usuario:',
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getProjectDetails = async (projectId) => {
  try {
    const response = await apiClient.get(`/okrs/projects/${projectId}/`);
    console.log(
      `Respuesta de getProjectDetails para proyecto ${projectId}:`,
      response.data
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error al obtener detalles del proyecto ${projectId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};