import client from '../../api/client.js';

export async function fetchDailyReport(date) {
  const { data } = await client.get('/reports/daily', { params: { date } });
  return data.report;
}

export async function fetchWeeklyReport(date, page = 1, limit = 20) {
  const { data } = await client.get('/reports/weekly', {
    params: { date, page, limit },
  });
  return data.report;
}

export async function fetchMonthToDateReport(date, page = 1, limit = 20) {
  const { data } = await client.get('/reports/month-to-date', {
    params: { date, page, limit },
  });
  return data.report;
}

export async function fetchMonthlyReport(date, page = 1, limit = 20) {
  const { data } = await client.get('/reports/monthly', {
    params: { date, page, limit },
  });
  return data.report;
}
