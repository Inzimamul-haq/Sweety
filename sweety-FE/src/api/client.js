import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('sweety_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getErrorPayload(error) {
  if (error?.response?.data) {
    const data = error.response.data;
    if (data.error && typeof data.error === 'object') {
      return {
        message: data.error.message || 'Request failed.',
        field: data.error.field || null,
      };
    }
    if (typeof data.error === 'string') {
      return { message: data.error, field: null };
    }
    if (typeof data.message === 'string') {
      return { message: data.message, field: data.field || null };
    }
  }

  if (error?.response?.status) {
    const status = error.response.status;
    if (status === 401) {
      return { message: 'Authentication required. Please log in again.', field: 'token' };
    }
    if (status === 403) {
      return { message: 'You do not have permission to perform this action.', field: null };
    }
    if (status === 404) {
      return { message: 'The requested resource was not found.', field: null };
    }
    if (status === 409) {
      return { message: 'A conflicting record already exists.', field: null };
    }
    if (status >= 500) {
      return { message: 'Server is currently unavailable. Please try again shortly.', field: null };
    }
  }

  if (error?.code === 'ERR_NETWORK') {
    return {
      message: 'Server has been down, try again later',
      field: null,
    };
  }

  if (error?.code === 'ECONNABORTED') {
    return { message: 'Request timed out. Please try again.', field: null };
  }

  if (error?.message) {
    return { message: error.message, field: null };
  }

  return {
    message: 'An unexpected error occurred. Please try again.',
    field: null,
  };
}

export default client;
