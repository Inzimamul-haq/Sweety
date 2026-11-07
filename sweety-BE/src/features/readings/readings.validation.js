import { z } from 'zod';
import { env } from '../../config/env.js';
import { SLOTS } from '../../shared/constants/slots.js';
import { isFutureDate, parseISODate } from '../../shared/utils/dateRange.js';

const VALUE_REQUIRED = 'Please enter a glucose value.';
const VALUE_RANGE = 'Value must be between 40 and 600 mg/dl.';
const DATE_FUTURE = 'Date cannot be in the future.';

const dateSchema = z
  .string({ error: 'Please select a date.' })
  .refine((value) => Boolean(parseISODate(value)), 'Please select a valid date.')
  .refine((value) => !isFutureDate(value, env.timezone), DATE_FUTURE);

const valueSchema = z.preprocess((raw) => {
  if (raw === '' || raw === null || raw === undefined) return undefined;
  if (typeof raw === 'string' && raw.trim() === '') return undefined;
  if (typeof raw === 'string' && /^-?\d+$/.test(raw.trim())) return Number(raw.trim());
  return raw;
}, z
  .number({ error: VALUE_REQUIRED })
  .int(VALUE_RANGE)
  .min(40, VALUE_RANGE)
  .max(600, VALUE_RANGE));

export const createReadingSchema = z.object({
  date: dateSchema,
  slot: z.enum(SLOTS, { error: 'Please select a valid slot.' }),
  value: valueSchema,
});

export const updateReadingSchema = createReadingSchema;

export const dateQuerySchema = z.object({
  date: z
    .string({ error: 'Please select a date.' })
    .refine((value) => Boolean(parseISODate(value)), 'Please select a valid date.'),
});
