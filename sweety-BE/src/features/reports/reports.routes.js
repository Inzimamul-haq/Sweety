import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { reportQuerySchema } from './reports.validation.js';
import * as reportsController from './reports.controller.js';

export const reportsRouter = Router();

reportsRouter.get('/daily', validate(reportQuerySchema, 'query'), reportsController.daily);
reportsRouter.get('/weekly', validate(reportQuerySchema, 'query'), reportsController.weekly);
reportsRouter.get(
  '/month-to-date',
  validate(reportQuerySchema, 'query'),
  reportsController.monthToDate,
);
reportsRouter.get('/monthly', validate(reportQuerySchema, 'query'), reportsController.monthly);
