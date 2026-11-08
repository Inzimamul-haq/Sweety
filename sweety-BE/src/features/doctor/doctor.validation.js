import { z } from 'zod';

export const patientSearchQuerySchema = z.object({
  search: z.string().trim().optional().default(''),
});

export const lookupPatientQuerySchema = z.object({
  email: z
    .email({ error: 'Please enter a valid patient email.' })
    .trim()
    .toLowerCase(),
});

export const linkPatientSchema = z.object({
  email: z
    .email({ error: 'Please enter a valid patient email.' })
    .trim()
    .toLowerCase(),
});

