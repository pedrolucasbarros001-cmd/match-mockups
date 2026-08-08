// Sessão e papel do utilizador — agora vindos do Supabase, não de um seletor
// de teste. O papel é imutável: é o que foi escolhido no registo.

import { useSyncExternalStore, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { cachedRole, cacheRole, type Role } from "./auth";

export type { Role };
export type SessionState = "in" | "out" | "loading";

const EVENT = "hm.userstate";

let session: SessionState = "loading";
let role: Role = "seeker";
let userId: string | null = null;
let started = false;

function emit() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

/** Arranca o listener de sessão uma única vez (chamado no __root). */
export function startAuthSync(onChange?: (s: SessionState, r: Role) => void) {
  if (started || typeof window === "undefined") return;
  started = true;
  role = cachedRole();

  const apply = async (uid: string | null) => {
    userId = uid;
    if (!uid) {
      session = "out";
      emit();
      onChange?.(session, role);
      return;
    }
    session = "in";
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid).maybeSingle();
    role = ((data?.role as Role | undefined) ?? cachedRole()) as Role;
    cacheRole(role);
    emit();
    onChange?.(session, role);
  };

  supabase.auth.getSession().then(({ data }) => apply(data.session?.user.id ?? null));
  supabase.auth.onAuthStateChange((event, s) => {
    if (event === "TOKEN_REFRESHED") return;
    apply(s?.user.id ?? null);
  });
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function getRole(): Role {
  return typeof window === "undefined" ? "seeker" : role;
}
export function getSession(): SessionState {
  return typeof window === "undefined" ? "loading" : session;
}
export function getUserId(): string | null {
  return userId;
}

export function useRole(): Role {
  return useSyncExternalStore(subscribe, getRole, () => "seeker");
}

export function useSession(): SessionState {
  return useSyncExternalStore(subscribe, getSession, () => "loading");
}

/** Home de cada papel — usado por splash, login e guardas. */
export function homeFor(r: Role): "/dashboard" | "/explore" {
  return r === "landlord" ? "/dashboard" : "/explore";
}

/**
 * Guarda de papel: uma conta de hóspede não abre ecrãs de senhorio e
 * vice-versa. Espera pela sessão antes de decidir, para não redirecionar
 * durante o carregamento.
 */
export function useRoleGuard(expected: Role) {
  const r = useRole();
  const s = useSession();
  const nav = useNavigate();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (s === "loading") return;
    if (s === "out") {
      nav({ to: "/login", replace: true });
      return;
    }
    if (r !== expected) {
      nav({ to: homeFor(r), replace: true });
      return;
    }
    setOk(true);
  }, [r, s, expected, nav]);
  return ok;
}

/** Exige apenas sessão iniciada (qualquer papel). */
export function useAuthGuard() {
  const s = useSession();
  const nav = useNavigate();
  useEffect(() => {
    if (s === "out") nav({ to: "/login", replace: true });
  }, [s, nav]);
  return s === "in";
}
