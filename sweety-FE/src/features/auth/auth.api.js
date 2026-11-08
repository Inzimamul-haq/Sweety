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

export async function updateUserProfile(payload) {
  const { data } = await client.put('/auth/profile', payload);
  return data;
}

export async function changeUserPassword(payload) {
  const { data } = await client.put('/auth/change-password', payload);
  return data;
}

export async function deleteUserAccount(payload) {
  const { data } = await client.delete('/auth/profile', { data: payload });
  return data;
}
