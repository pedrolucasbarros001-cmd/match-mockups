// Autenticação real (Supabase). O papel (inquilino/senhorio) é escolhido no
// registo, guardado em `user_roles` pelo trigger da base de dados e NUNCA
// pode ser trocado pelo próprio — é o que garante que uma conta de hóspede
// nunca vê (nem consegue escrever) o que é do senhorio.

import { supabase } from "@/integrations/supabase/client";

export type Role = "seeker" | "landlord";

export type AuthUser = { id: string; email: string; role: Role };

const ROLE_CACHE = "hm.role.cache";

export function cachedRole(): Role {
  if (typeof window === "undefined") return "seeker";
  return (window.localStorage.getItem(ROLE_CACHE) as Role | null) ?? "seeker";
}

export function cacheRole(role: Role) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROLE_CACHE, role);
}

export async function fetchRole(userId: string): Promise<Role> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
  const role = (data?.role as Role | undefined) ?? "seeker";
  cacheRole(role);
  return role;
}

export async function signUp(email: string, password: string, role: Role, name = "") {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/splash`,
      data: { role, name },
    },
  });
  if (error) return { error: error.message, needsConfirmation: false };
  cacheRole(role);
  return { error: null, needsConfirmation: !data.session };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message, role: cachedRole() };
  const role = data.user ? await fetchRole(data.user.id) : "seeker";
  return { error: null, role };
}

export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { error: error?.message ?? null };
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  return { error: error?.message ?? null };
}

export async function signOut() {
  await supabase.auth.signOut();
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(ROLE_CACHE);
    window.localStorage.removeItem("hm.store.v1");
  }
}

export async function currentUser(): Promise<AuthUser | null> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return { id: data.user.id, email: data.user.email ?? "", role: await fetchRole(data.user.id) };
}
