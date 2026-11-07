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
