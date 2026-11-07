import { formatRangeLabel, rangeFor } from '../../shared/utils/dateRange.js';
import * as reportsRepository from './reports.repository.js';

async function buildReport(userId, date, kind, includeReadings) {
  const { from, to } = rangeFor(kind, date);
  const stats = await reportsRepository.getStats({ userId, from, to });
  const report = {
    kind,
    range: { from, to, label: formatRangeLabel(from, to) },
    stats,
  };

  if (includeReadings) {
    report.readings = await reportsRepository.listInRange({ userId, from, to });
  }

  return report;
}

export function getDailyReport(userId, date) {
  return buildReport(userId, date, 'daily', true);
}

export function getMonthToDateReport(userId, date) {
  return buildReport(userId, date, 'month-to-date', false);
}

export function getMonthlyReport(userId, date) {
  return buildReport(userId, date, 'monthly', false);
}
