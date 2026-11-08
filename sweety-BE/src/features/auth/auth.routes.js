import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { authRateLimiter, profileRateLimiter } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';
import * as authController from './auth.controller.js';
import {
  changePasswordSchema,
  deleteAccountSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from './auth.validation.js';

export const authRouter = Router();

// Auth routes (20 req / 10 min)
authRouter.post('/register', authRateLimiter, validate(registerSchema), authController.register);
authRouter.post('/login', authRateLimiter, validate(loginSchema), authController.login);
authRouter.get('/me', requireAuth, authController.me);

// Profile management routes (15 req / 10 min)
authRouter.put(
  '/profile',
  requireAuth,
  profileRateLimiter,
  validate(updateProfileSchema),
  authController.updateProfile,
);

authRouter.put(
  '/change-password',
  requireAuth,
  profileRateLimiter,
  validate(changePasswordSchema),
  authController.changePassword,
);

authRouter.delete(
  '/profile',
  requireAuth,
  profileRateLimiter,
  validate(deleteAccountSchema),
  authController.deleteAccount,
);
