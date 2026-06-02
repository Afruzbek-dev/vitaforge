import { getSupabase } from "./supabase";

export async function signUp(email: string, password: string, metadata: { full_name: string; role: string }) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = getSupabase();
  await supabase.auth.signOut();
}

export async function getSession() {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
