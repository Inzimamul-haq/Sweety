import * as authService from './auth.service.js';

export async function register(req, res, next) {
  try {
    const result = await authService.register(req.validated);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function verifyDoctorCode(req, res, next) {
  try {
    const result = authService.verifyDoctorCode(req.validated);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function registerDoctor(req, res, next) {
  try {
    const result = await authService.registerDoctor(req.validated);
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

export async function updateProfile(req, res, next) {
  try {
    const result = await authService.updateProfile({
      userId: req.user.id,
      name: req.validated.name,
      currentPassword: req.validated.currentPassword,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const result = await authService.changePassword({
      userId: req.user.id,
      currentPassword: req.validated.currentPassword,
      newPassword: req.validated.newPassword,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    const result = await authService.deleteAccount({
      userId: req.user.id,
      password: req.validated.password,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}
