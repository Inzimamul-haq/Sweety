import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { dateQuerySchema } from '../readings/readings.validation.js';
import * as reportsController from './reports.controller.js';

export const reportsRouter = Router();

reportsRouter.get('/daily', validate(dateQuerySchema, 'query'), reportsController.daily);
reportsRouter.get(
  '/month-to-date',
  validate(dateQuerySchema, 'query'),
  reportsController.monthToDate,
);
reportsRouter.get('/monthly', validate(dateQuerySchema, 'query'), reportsController.monthly);
