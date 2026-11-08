import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { getCache, setCache, invalidateUserCache, invalidateReadingsCache } from '../../config/redis.js';
import { AppError } from '../../shared/errors/AppError.js';
import * as authRepository from './auth.repository.js';

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'patient',
    createdAt: user.created_at,
    connectedDoctor: user.doctor_id
      ? {
          id: user.doctor_id,
          name: user.doctor_name,
          email: user.doctor_email,
        }
      : null,
  };
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role || 'patient' },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

function safeCompareCode(input, expected) {
  const a = Buffer.from(String(input || ''), 'utf8');
  const b = Buffer.from(String(expected || ''), 'utf8');
  if (a.length !== b.length) {
    crypto.timingSafeEqual(b, b);
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

export function verifyDoctorCode({ code }) {
  const isValid = safeCompareCode(code, env.doctorAccessCode);
  if (!isValid) {
    throw new AppError(403, 'Invalid access code.', 'code');
  }

  const signupToken = jwt.sign(
    { purpose: 'doctor-signup' },
    env.jwtSecret,
    { expiresIn: '10m' },
  );

  return { signupToken };
}

export async function register({ name, email, password }) {
  const existing = await authRepository.findByEmail(email);
  if (existing) {
    throw new AppError(409, 'An account with this email already exists.', 'email');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    // Always creates a patient; never accepts role from body
    const user = await authRepository.createUser({
      name,
      email,
      passwordHash,
      role: 'patient',
    });
    const token = signToken(user);
    return { user: publicUser(user), token };
  } catch (error) {
    if (error?.code === '23505') {
      throw new AppError(409, 'An account with this email already exists.', 'email');
    }
    throw error;
  }
}

export async function registerDoctor({ name, email, password }) {
  const existing = await authRepository.findByEmail(email);
  if (existing) {
    throw new AppError(409, 'An account with this email already exists.', 'email');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await authRepository.createUser({
      name,
      email,
      passwordHash,
      role: 'doctor',
    });
    const token = signToken(user);
    return { user: publicUser(user), token };
  } catch (error) {
    if (error?.code === '23505') {
      throw new AppError(409, 'An account with this email already exists.', 'email');
    }
    throw error;
  }
}

export async function login({ email, password }) {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    throw new AppError(401, 'Invalid email or password.', 'email');
  }

  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) {
    throw new AppError(401, 'Invalid email or password.', 'password');
  }

  const token = signToken(user);
  return { user: publicUser(user), token };
}

export async function me(userId) {
  const cacheKey = `cache:user:${userId}:me`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const user = await authRepository.findById(userId);
  if (!user) {
    throw new AppError(401, 'Invalid or expired token.', 'token');
  }

  const userData = publicUser(user);
  await setCache(cacheKey, userData);
  return userData;
}

export async function updateProfile({ userId, name, currentPassword }) {
  const user = await authRepository.findByIdWithPassword(userId);
  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  const matches = await bcrypt.compare(currentPassword, user.password_hash);
  if (!matches) {
    throw new AppError(401, 'Current password is incorrect.', 'currentPassword');
  }

  const updated = await authRepository.updateName({ id: userId, name });
  await invalidateUserCache(userId);

  return {
    user: publicUser(updated),
    message: 'Profile updated successfully.',
  };
}

export async function changePassword({ userId, currentPassword, newPassword }) {
  const user = await authRepository.findByIdWithPassword(userId);
  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  const matches = await bcrypt.compare(currentPassword, user.password_hash);
  if (!matches) {
    throw new AppError(401, 'Current password is incorrect.', 'currentPassword');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await authRepository.updatePassword({ id: userId, passwordHash });
  await invalidateUserCache(userId);

  return { message: 'Password changed successfully.' };
}

export async function deleteAccount({ userId, password }) {
  const user = await authRepository.findByIdWithPassword(userId);
  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) {
    throw new AppError(401, 'Incorrect password. Account deletion aborted.', 'password');
  }

  await authRepository.deleteUser(userId);
  await invalidateUserCache(userId);
  await invalidateReadingsCache(userId);

  return { message: 'Account deleted successfully.' };
}
