import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

export const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export function throwIfError(error) {
  if (!error) return;
  const err = new Error(error.message);
  err.code = error.code;
  throw err;
}
