import * as authService from './auth.service.js';

export async function register(req, res, next) {
  try {
    const result = await authService.register(req.validated);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.validated);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await authService.me(req.user.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
}
