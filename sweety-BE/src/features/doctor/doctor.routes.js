import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { reportQuerySchema } from '../reports/reports.validation.js';
import * as doctorController from './doctor.controller.js';
import {
  linkPatientSchema,
  lookupPatientQuerySchema,
  patientSearchQuerySchema,
} from './doctor.validation.js';

export const doctorRouter = Router();

doctorRouter.get('/stats', doctorController.stats);
doctorRouter.get(
  '/patients',
  validate(patientSearchQuerySchema, 'query'),
  doctorController.listPatients,
);
doctorRouter.get(
  '/patients/lookup',
  validate(lookupPatientQuerySchema, 'query'),
  doctorController.lookupPatient,
);
doctorRouter.post(
  '/patients',
  validate(linkPatientSchema),
  doctorController.addPatient,
);

doctorRouter.get(
  '/patients/:patientId/reports/daily',
  validate(reportQuerySchema, 'query'),
  doctorController.patientDailyReport,
);
doctorRouter.get(
  '/patients/:patientId/reports/weekly',
  validate(reportQuerySchema, 'query'),
  doctorController.patientWeeklyReport,
);
doctorRouter.get(
  '/patients/:patientId/reports/month-to-date',
  validate(reportQuerySchema, 'query'),
  doctorController.patientMonthToDateReport,
);
doctorRouter.get(
  '/patients/:patientId/reports/monthly',
  validate(reportQuerySchema, 'query'),
  doctorController.patientMonthlyReport,
);

