import { formatRangeLabel, rangeFor } from '../../shared/utils/dateRange.js';
import * as reportsRepository from './reports.repository.js';

export async function getReport(userId, kind, date, pagination = null) {
  const { from, to } = rangeFor(kind, date);
  const stats = await reportsRepository.getStats({ userId, from, to });
  const total = stats.count;

  // Retrieve complete range readings for the dashboard trend chart (not cut off by pagination)
  const allReadings = await reportsRepository.listInRange({ userId, from, to });

  const report = {
    kind,
    range: { from, to, label: formatRangeLabel(from, to) },
    stats,
    allReadings,
  };

  if (kind === 'daily') {
    report.readings = allReadings;
    report.pagination = {
      page: 1,
      limit: 10,
      total: allReadings.length,
      totalPages: 1,
    };
  } else {
    const page = pagination?.page ? Math.max(1, Number(pagination.page)) : 1;
    const limit = pagination?.limit ? Math.max(1, Math.min(200, Number(pagination.limit))) : 20;
    const totalPages = Math.ceil(total / limit) || 1;

    const readings = await reportsRepository.listInRange({
      userId,
      from,
      to,
      page,
      limit,
    });

    report.readings = readings;
    report.pagination = {
      page,
      limit,
      total,
      totalPages,
    };
  }

  return report;
}

export function getDailyReport(userId, date) {
  return getReport(userId, 'daily', date);
}

export function getWeeklyReport(userId, date, pagination) {
  return getReport(userId, 'weekly', date, pagination);
}

export function getMonthToDateReport(userId, date, pagination) {
  return getReport(userId, 'month-to-date', date, pagination);
}

export function getMonthlyReport(userId, date, pagination) {
  return getReport(userId, 'monthly', date, pagination);
}
