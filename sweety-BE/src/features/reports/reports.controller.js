import * as reportsService from './reports.service.js';

export async function daily(req, res, next) {
  try {
    const report = await reportsService.getDailyReport(req.user.id, req.validated.date);
    res.json({ report });
  } catch (error) {
    next(error);
  }
}

export async function weekly(req, res, next) {
  try {
    const { date, page, limit } = req.validated;
    const report = await reportsService.getWeeklyReport(
      req.user.id,
      date,
      { page, limit },
    );
    res.json({ report });
  } catch (error) {
    next(error);
  }
}

export async function monthToDate(req, res, next) {
  try {
    const { date, page, limit } = req.validated;
    const report = await reportsService.getMonthToDateReport(
      req.user.id,
      date,
      { page, limit },
    );
    res.json({ report });
  } catch (error) {
    next(error);
  }
}

export async function monthly(req, res, next) {
  try {
    const { date, page, limit } = req.validated;
    const report = await reportsService.getMonthlyReport(
      req.user.id,
      date,
      { page, limit },
    );
    res.json({ report });
  } catch (error) {
    next(error);
  }
}
