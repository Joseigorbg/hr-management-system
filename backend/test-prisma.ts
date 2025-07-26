import { SupabaseClient } from '@supabase/supabase-js';

async login(email: string, password: string) {
  const { data, error } = await this.supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new UnauthorizedException('Credenciais inválidas');
  return data;
}