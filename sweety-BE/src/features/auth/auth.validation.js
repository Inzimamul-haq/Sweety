import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string({ error: 'Please enter your name.' })
    .trim()
    .min(1, 'Please enter your name.'),
  email: z
    .email({ error: 'Please enter a valid email.' })
    .trim()
    .toLowerCase(),
  password: z
    .string({ error: 'Please enter a password.' })
    .min(8, 'Password must be at least 8 characters.'),
});

export const loginSchema = z.object({
  email: z
    .email({ error: 'Please enter a valid email.' })
    .trim()
    .toLowerCase(),
  password: z.string({ error: 'Please enter a password.' }).min(1, 'Please enter a password.'),
});

export const updateProfileSchema = z.object({
  name: z
    .string({ error: 'Please enter your name.' })
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(50, 'Name cannot exceed 50 characters.'),
  currentPassword: z
    .string({ error: 'Please enter your current password.' })
    .min(1, 'Current password is required to update profile.'),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ error: 'Please enter your current password.' })
    .min(1, 'Current password is required.'),
  newPassword: z
    .string({ error: 'Please enter a new password.' })
    .min(8, 'New password must be at least 8 characters.'),
});

export const deleteAccountSchema = z.object({
  password: z
    .string({ error: 'Please enter your password to confirm deletion.' })
    .min(1, 'Password is required to delete your account.'),
});
