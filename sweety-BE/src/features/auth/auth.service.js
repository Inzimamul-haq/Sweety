import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/AppError.js';
import * as authRepository from './auth.repository.js';

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

export async function register({ name, email, password }) {
  const existing = await authRepository.findByEmail(email);
  if (existing) {
    throw new AppError(409, 'An account with this email already exists.', 'email');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await authRepository.createUser({ name, email, passwordHash });
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
  const user = await authRepository.findById(userId);
  if (!user) {
    throw new AppError(401, 'Invalid or expired token.', 'token');
  }
  return publicUser(user);
}
