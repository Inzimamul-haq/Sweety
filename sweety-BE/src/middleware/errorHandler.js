import { AppError } from '../shared/errors/AppError.js';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    res.status(err.status).json({
      error: { message: err.message, field: err.field },
    });
    return;
  }

  res.status(500).json({
    error: { message: 'Something went wrong.', field: null },
  });
}
