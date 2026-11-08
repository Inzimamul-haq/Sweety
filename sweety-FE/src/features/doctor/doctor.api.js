import client from '../../api/client.js';

export async function fetchDoctorStats() {
  const { data } = await client.get('/doctor/stats');
  return data.stats;
}

export async function fetchDoctorPatients(search = '') {
  const { data } = await client.get('/doctor/patients', {
    params: search ? { search } : {},
  });
  return data.patients;
}

export async function lookupPatientByEmail(email) {
  const { data } = await client.get('/doctor/patients/lookup', {
    params: { email },
  });
  return data.patient;
}

export async function linkPatientByEmail(email) {
  const { data } = await client.post('/doctor/patients', { email });
  return data;
}

export async function fetchDoctorPatientReport(patientId, kind, date, page = 1, limit = 20) {
  const params = kind === 'daily' ? { date } : { date, page, limit };
  const { data } = await client.get(`/doctor/patients/${patientId}/reports/${kind}`, {
    params,
  });
  return data;
}

