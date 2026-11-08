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
    .min(6, 'Password must be at least 6 characters.'),
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

