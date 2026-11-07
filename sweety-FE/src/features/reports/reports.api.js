import client from '../../api/client.js';

export async function fetchDailyReport(date) {
  const { data } = await client.get('/reports/daily', { params: { date } });
  return data.report;
}

export async function fetchMonthToDateReport(date) {
  const { data } = await client.get('/reports/month-to-date', { params: { date } });
  return data.report;
}

export async function fetchMonthlyReport(date) {
  const { data } = await client.get('/reports/monthly', { params: { date } });
  return data.report;
}
