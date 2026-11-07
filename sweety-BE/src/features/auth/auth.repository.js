import { supabase, throwIfError } from '../../config/db.js';

export async function createUser({ name, email, passwordHash }) {
  const { data, error } = await supabase
    .from('users')
    .insert({ name, email, password_hash: passwordHash })
    .select('id, name, email, created_at')
    .single();

  throwIfError(error);
  return data;
}

export async function findByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, password_hash, created_at')
    .eq('email', email)
    .maybeSingle();

  throwIfError(error);
  return data;
}

export async function findById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, created_at')
    .eq('id', id)
    .maybeSingle();

  throwIfError(error);
  return data;
}
