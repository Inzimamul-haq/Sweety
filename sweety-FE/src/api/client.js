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
  return (
    error.response?.data?.error || {
      message: 'Something went wrong. Please try again.',
      field: null,
    }
  );
}

export default client;
