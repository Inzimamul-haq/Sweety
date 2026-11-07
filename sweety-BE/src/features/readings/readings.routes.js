import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import * as readingsController from './readings.controller.js';
import {
  createReadingSchema,
  dateQuerySchema,
  updateReadingSchema,
} from './readings.validation.js';

export const readingsRouter = Router();

readingsRouter.post('/', validate(createReadingSchema), readingsController.create);
readingsRouter.get('/', validate(dateQuerySchema, 'query'), readingsController.list);
readingsRouter.put('/:id', validate(updateReadingSchema), readingsController.update);
readingsRouter.delete('/:id', readingsController.remove);
