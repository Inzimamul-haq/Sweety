import { Router } from 'express';
import { requireAuth, requireDoctorSignupToken } from '../../middleware/auth.js';
import {
  authRateLimiter,
  doctorCodeRateLimiter,
  profileRateLimiter,
} from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';
import * as authController from './auth.controller.js';
import {
  changePasswordSchema,
  deleteAccountSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
  verifyDoctorCodeSchema,
} from './auth.validation.js';

export const authRouter = Router();

// Patient registration & login (20 req / 10 min)
authRouter.post('/register', authRateLimiter, validate(registerSchema), authController.register);
authRouter.post('/login', authRateLimiter, validate(loginSchema), authController.login);

// Doctor two-step signup (access code -> short-lived signup token -> register)
authRouter.post(
  '/doctor/verify-code',
  doctorCodeRateLimiter,
  validate(verifyDoctorCodeSchema),
  authController.verifyDoctorCode,
);
authRouter.post(
  '/doctor/register',
  authRateLimiter,
  requireDoctorSignupToken,
  validate(registerSchema),
  authController.registerDoctor,
);

// Current logged-in user (patient or doctor)
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
