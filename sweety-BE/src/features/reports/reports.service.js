import { formatRangeLabel, rangeFor } from '../../shared/utils/dateRange.js';
import * as reportsRepository from './reports.repository.js';

async function buildReport(userId, date, kind, pagination = null) {
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
    // For daily report, return all readings for that day
    report.readings = allReadings;
    report.pagination = {
      page: 1,
      limit: 10,
      total: allReadings.length,
      totalPages: 1,
    };
  } else {
    // For range reports, apply pagination to table readings
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
  return buildReport(userId, date, 'daily');
}

export function getWeeklyReport(userId, date, pagination) {
  return buildReport(userId, date, 'weekly', pagination);
}

export function getMonthToDateReport(userId, date, pagination) {
  return buildReport(userId, date, 'month-to-date', pagination);
}

export function getMonthlyReport(userId, date, pagination) {
  return buildReport(userId, date, 'monthly', pagination);
}
