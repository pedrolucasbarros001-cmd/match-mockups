import { useSyncExternalStore, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export type Role = "seeker" | "landlord";
export type SessionState = "in" | "out";

const ROLE_KEY = "hm.role";
const SESSION_KEY = "hm.session";
const EVENT = "hm.userstate";

function read<T extends string>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const v = window.localStorage.getItem(key);
  return (v as T | null) ?? fallback;
}

function write(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
  window.dispatchEvent(new Event(EVENT));
}

export function setRole(r: Role) {
  write(ROLE_KEY, r);
}

export function setSession(s: SessionState) {
  write(SESSION_KEY, s);
}

export function getRole(): Role {
  return read<Role>(ROLE_KEY, "seeker");
}

export function getSession(): SessionState {
  return read<SessionState>(SESSION_KEY, "out");
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

export function useRole(): Role {
  return useSyncExternalStore(subscribe, getRole, () => "seeker");
}

export function useSession(): SessionState {
  return useSyncExternalStore(subscribe, getSession, () => "out");
}

/**
 * Guarda de papel: se o utilizador estiver no papel errado para a rota,
 * redireciona para o "home" do papel atual. Usa-se dentro de componentes de rota.
 */
export function useRoleGuard(expected: Role) {
  const role = useRole();
  const nav = useNavigate();
  useEffect(() => {
    if (role !== expected) {
      nav({ to: expected === "seeker" ? "/dashboard" : "/explore", replace: true });
    }
  }, [role, expected, nav]);
  return role === expected;
}

