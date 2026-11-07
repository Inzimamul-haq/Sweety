import client from '../../api/client.js';

export async function fetchReadings(date) {
  const { data } = await client.get('/readings', { params: { date } });
  return data.readings;
}

export async function createReading(payload) {
  const { data } = await client.post('/readings', payload);
  return data.reading;
}

export async function updateReading(id, payload) {
  const { data } = await client.put(`/readings/${id}`, payload);
  return data.reading;
}

export async function deleteReading(id) {
  await client.delete(`/readings/${id}`);
}
