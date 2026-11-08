import { Router } from 'express';
import { addReadingRateLimiter } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';
import * as readingsController from './readings.controller.js';
import {
  createReadingSchema,
  dateQuerySchema,
  updateReadingSchema,
} from './readings.validation.js';

export const readingsRouter = Router();

// Add reading: rate limit 30 req / 2 min
readingsRouter.post(
  '/',
  addReadingRateLimiter,
  validate(createReadingSchema),
  readingsController.create,
);
readingsRouter.get('/', validate(dateQuerySchema, 'query'), readingsController.list);
readingsRouter.put('/:id', validate(updateReadingSchema), readingsController.update);
readingsRouter.delete('/:id', readingsController.remove);
