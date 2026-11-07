import client from '../../api/client.js';

export async function registerUser(payload) {
  const { data } = await client.post('/auth/register', payload);
  return data;
}

export async function loginUser(payload) {
  const { data } = await client.post('/auth/login', payload);
  return data;
}

export async function fetchMe() {
  const { data } = await client.get('/auth/me');
  return data.user;
}
