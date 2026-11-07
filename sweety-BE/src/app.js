import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRouter } from './routes.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ ok: true });
  });

  app.use(apiRouter);

  app.use((req, res) => {
    res.status(404).json({
      error: { message: 'Route not found.', field: null },
    });
  });

  app.use(errorHandler);
  return app;
}
