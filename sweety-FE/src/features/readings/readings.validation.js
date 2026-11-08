import { z } from 'zod';
import { SLOTS } from '../../constants/slots.js';
import { todayISO } from '../../utils/date.js';

export const readingSchema = z.object({
  slot: z.enum(SLOTS, {
    error: 'Please select a meal slot.',
  }),
  value: z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return undefined;
    if (typeof val === 'string' && val.trim() === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? val : num;
  }, z
    .number({ error: 'Please enter a glucose value.' })
    .int('Value must be between 40 and 600 mg/dl.')
    .min(40, 'Value must be between 40 and 600 mg/dl.')
    .max(600, 'Value must be between 40 and 600 mg/dl.')),
  date: z
    .string({ error: 'Please select a date.' })
    .min(1, 'Please select a date.')
    .refine((val) => val <= todayISO(), 'Date cannot be in the future.'),
});

export function validateReading(data) {
  const result = readingSchema.safeParse(data);
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

