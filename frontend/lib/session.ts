"use client";

export type SessionScope = "store" | "admin";

const KEYS: Record<SessionScope, { token: string; user: string }> = {
  store: { token: "ecommercex.store.token", user: "ecommercex.store.user" },
  admin: { token: "ecommercex.admin.token", user: "ecommercex.admin.user" },
};

export function readToken(scope: SessionScope): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEYS[scope].token);
}

export function readUser<T>(scope: SessionScope): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEYS[scope].user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeSession(scope: SessionScope, token: string, user: unknown): void {
  localStorage.setItem(KEYS[scope].token, token);
  localStorage.setItem(KEYS[scope].user, JSON.stringify(user));
}

export function clearSession(scope: SessionScope): void {
  localStorage.removeItem(KEYS[scope].token);
  localStorage.removeItem(KEYS[scope].user);
}
