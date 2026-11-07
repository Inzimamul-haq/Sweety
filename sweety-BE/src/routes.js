import { Router } from 'express';
import { requireAuth } from './middleware/auth.js';
import { authRouter } from './features/auth/auth.routes.js';
import { readingsRouter } from './features/readings/readings.routes.js';
import { reportsRouter } from './features/reports/reports.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/readings', requireAuth, readingsRouter);
apiRouter.use('/reports', requireAuth, reportsRouter);
