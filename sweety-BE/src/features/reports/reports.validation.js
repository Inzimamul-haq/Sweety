import { z } from 'zod';
import { parseISODate } from '../../shared/utils/dateRange.js';

export const reportQuerySchema = z.object({
  date: z
    .string({ error: 'Please select a date.' })
    .refine((value) => Boolean(parseISODate(value)), 'Please select a valid date.'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(20),
});
