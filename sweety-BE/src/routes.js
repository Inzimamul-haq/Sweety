import { Router } from 'express';
import { requireAuth, requireRole } from './middleware/auth.js';
import { authRouter } from './features/auth/auth.routes.js';
import { doctorRouter } from './features/doctor/doctor.routes.js';
import { readingsRouter } from './features/readings/readings.routes.js';
import { reportsRouter } from './features/reports/reports.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/readings', requireAuth, requireRole('patient'), readingsRouter);
apiRouter.use('/reports', requireAuth, requireRole('patient'), reportsRouter);
apiRouter.use('/doctor', requireAuth, requireRole('doctor'), doctorRouter);
