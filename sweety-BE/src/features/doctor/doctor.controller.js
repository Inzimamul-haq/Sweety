import * as doctorService from './doctor.service.js';

export async function stats(req, res, next) {
  try {
    const data = await doctorService.getStats(req.user.id);
    res.json({ stats: data });
  } catch (error) {
    next(error);
  }
}

export async function listPatients(req, res, next) {
  try {
    const patients = await doctorService.listPatients(req.user.id, req.validated.search);
    res.json({ patients });
  } catch (error) {
    next(error);
  }
}

export async function lookupPatient(req, res, next) {
  try {
    const patient = await doctorService.lookupPatient(req.user.id, req.validated.email);
    res.json({ patient });
  } catch (error) {
    next(error);
  }
}

export async function addPatient(req, res, next) {
  try {
    const patient = await doctorService.addPatient(req.user.id, req.validated.email);
    res.status(201).json({
      patient,
      message: 'Patient linked successfully.',
    });
  } catch (error) {
    next(error);
  }
}

function makeReportHandler(kind) {
  return async function handlePatientReport(req, res, next) {
    try {
      const { date, page, limit } = req.validated;
      const result = await doctorService.getPatientReport(
        req.user.id,
        req.params.patientId,
        kind,
        date,
        { page, limit },
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const patientDailyReport = makeReportHandler('daily');
export const patientWeeklyReport = makeReportHandler('weekly');
export const patientMonthToDateReport = makeReportHandler('month-to-date');
export const patientMonthlyReport = makeReportHandler('monthly');

