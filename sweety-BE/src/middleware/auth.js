import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../shared/errors/AppError.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    next(new AppError(401, 'Authentication required.', 'token'));
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (payload.purpose) {
      next(new AppError(401, 'Invalid or expired token.', 'token'));
      return;
    }

    const userId = payload.sub || payload.id;
    req.user = {
      id: userId,
      role: payload.role || 'patient',
    };
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token.', 'token'));
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AppError(403, 'You do not have permission to perform this action.'));
      return;
    }
    next();
  };
}

export function requireDoctorSignupToken(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    next(new AppError(401, 'Doctor signup authorization required.', 'token'));
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (payload.purpose !== 'doctor-signup') {
      next(new AppError(403, 'Invalid signup token purpose.', 'token'));
      return;
    }
    req.doctorSignupVerified = true;
    next();
  } catch {
    next(new AppError(401, 'Signup session expired or invalid. Please re-enter the access code.', 'token'));
  }
}
