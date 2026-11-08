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
    const userId = payload.sub || payload.id;
    req.user = { id: userId, email: payload.email, name: payload.name };
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token.', 'token'));
  }
}
