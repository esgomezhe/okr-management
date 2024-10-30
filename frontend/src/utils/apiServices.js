import axios from 'axios';

const getCsrfToken = () => {
  const name = 'csrftoken';
  const cookieValue = document.cookie.split('; ').find(row => row.startsWith(name))?.split('=')[1];
  return cookieValue;
};

//const CLIENT_TOKEN = process.env.REACT_APP_CLIENT_TOKEN;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Funciones para el usuario

export const registerUser = async (username, email, first_name, last_name, phone, city, role, password, password2) => {
  const response = await axios.post(`${API_BASE_URL}/users/register/`, {
    user: {
      username,
      email,
      first_name,
      last_name,
    },
    phone,
    city,
    role,
    password,
    password2
  }, {
    headers: {
      'X-CSRFToken': getCsrfToken(),
    },
    withCredentials: true,
  });
  return response.data;
};

export const loginUser = async (username, password) => {
  const response = await axios.post(`${API_BASE_URL}/users/login/`, {
    username,
    password,
  }, {
    headers: {
      'X-CSRFToken': getCsrfToken(),
    },
    withCredentials: true,
  });
  return response.data;
};

export const logoutUser = async (refreshToken, accessToken) => {
  await axios.post(`${API_BASE_URL}/users/logout/`, { refresh: refreshToken }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-CSRFToken': getCsrfToken(),
    },
    withCredentials: true,
  });
};

export const getUserDetails = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/me/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-CSRFToken': getCsrfToken(),
      },
      withCredentials: true,
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los datos del usuario:', error.response)
    throw error;
  }
};

export const sendPasswordResetEmail = async (email) => {
  const response = await axios.post(`${API_BASE_URL}/users/reset-password/`, {
    email,
  }, {
    headers: {
      'X-CSRFToken': getCsrfToken(),
    },
    withCredentials: true,
  });
  return response.data;
};

export const changePassword = async (token, currentPassword, newPassword, newPassword2) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/change-password/`, {
      current_password: currentPassword,
      new_password: newPassword,
      new_password2: newPassword2,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-CSRFToken': getCsrfToken(),
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    // Manejar el error
    throw error;
  }
};

// Funciones para los proyectos
export const getUserProjects = async (token, page = 1) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/okrs/projects/?page=${page}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-CSRFToken': getCsrfToken(),
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    console.log('Respuesta de getUserProjects:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener proyectos del usuario:', error.response?.data || error.message);
    throw error;
  }
};

export const getProjectDetails = async (token, projectId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/okrs/projects/${projectId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-CSRFToken': getCsrfToken(),
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    console.log(`Respuesta de getProjectDetails para proyecto ${projectId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener detalles del proyecto ${projectId}:`, error.response?.data || error.message);
    throw error;
  }
};