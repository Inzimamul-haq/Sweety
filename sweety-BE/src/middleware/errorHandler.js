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

  console.error('API Error:', err);

  // PostgreSQL specific error mappings
  if (err?.code === '23505') {
    res.status(409).json({
      error: { message: 'A duplicate record already exists.', field: null },
    });
    return;
  }

  if (err?.code === '23503') {
    res.status(400).json({
      error: { message: 'Referenced record does not exist.', field: null },
    });
    return;
  }

  if (err?.code === '23514') {
    res.status(400).json({
      error: { message: 'The submitted value violates database validation rules.', field: null },
    });
    return;
  }

  if (err?.code === 'ECONNREFUSED' || err?.code === 'ENOTFOUND' || err?.code === '28P01') {
    res.status(503).json({
      error: { message: 'Database service is currently unreachable. Please try again.', field: null },
    });
    return;
  }

  const message =
    err?.message && !err.message.includes('\n')
      ? err.message
      : 'Server encountered an unexpected error. Please try again.';

  res.status(500).json({
    error: { message, field: null },
  });
}
