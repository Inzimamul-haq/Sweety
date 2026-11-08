import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ error: 'Please enter your email.' })
    .trim()
    .min(1, 'Please enter your email.')
    .email('Please enter a valid email address.'),
  password: z
    .string({ error: 'Please enter your password.' })
    .min(1, 'Please enter your password.')
    .min(6, 'Password must be at least 6 characters.'),
});

export const signupSchema = z.object({
  name: z
    .string({ error: 'Please enter your name.' })
    .trim()
    .min(1, 'Please enter your name.')
    .min(2, 'Name must be at least 2 characters.')
    .max(50, 'Name cannot exceed 50 characters.'),
  email: z
    .string({ error: 'Please enter your email.' })
    .trim()
    .min(1, 'Please enter your email.')
    .email('Please enter a valid email address.'),
  password: z
    .string({ error: 'Please enter a password.' })
    .min(1, 'Please enter a password.')
    .min(8, 'Password must be at least 8 characters.'),
});

export const updateProfileSchema = z.object({
  name: z
    .string({ error: 'Please enter your name.' })
    .trim()
    .min(1, 'Please enter your name.')
    .min(2, 'Name must be at least 2 characters.')
    .max(50, 'Name cannot exceed 50 characters.'),
  currentPassword: z
    .string({ error: 'Please enter your current password.' })
    .min(1, 'Please enter your current password to save changes.'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ error: 'Please enter your current password.' })
      .min(1, 'Please enter your current password.'),
    newPassword: z
      .string({ error: 'Please enter a new password.' })
      .min(1, 'Please enter a new password.')
      .min(8, 'New password must be at least 8 characters.'),
    confirmPassword: z
      .string({ error: 'Please confirm your new password.' })
      .min(1, 'Please confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match.',
    path: ['confirmPassword'],
  });

export const deleteAccountSchema = z.object({
  password: z
    .string({ error: 'Please enter your password to confirm deletion.' })
    .min(1, 'Please enter your password to confirm deletion.'),
});

export function validateAuth(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const field = firstIssue.path.length > 0 ? String(firstIssue.path[0]) : null;
    return {
      success: false,
      error: {
        message: firstIssue.message,
        field,
      },
    };
  }
  return {
    success: true,
    data: result.data,
    error: null,
  };
}
