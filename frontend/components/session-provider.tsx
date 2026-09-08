"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { clearSession, readToken, writeSession, type SessionScope } from "@/lib/session";
import type { AuthPayload, Cart, User } from "@/lib/types";

export function cartItemCount(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

interface SessionValue {
  storeUser: User | null;
  adminUser: User | null;
  storeToken: string | null;
  adminToken: string | null;
  cartCount: number;
  ready: boolean;
  signIn: (scope: SessionScope, payload: AuthPayload) => void;
  signOut: (scope: SessionScope) => void;
  syncCart: (cart: Cart | null) => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [storeUser, setStoreUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [storeToken, setStoreToken] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function restoreScope(scope: SessionScope) {
      const token = readToken(scope);
      if (!token) return;

      try {
        const path = scope === "admin" ? "/admin/auth/me" : "/store/auth/me";
        const data = await api<{ user: User }>(path, { token });
        if (cancelled) return;
        if (scope === "store") {
          setStoreToken(token);
          setStoreUser(data.user);
          try {
            const cartData = await api<{ cart: Cart }>("/store/cart", { token });
            if (!cancelled) setCartCount(cartItemCount(cartData.cart));
          } catch {
            if (!cancelled) setCartCount(0);
          }
        } else {
          setAdminToken(token);
          setAdminUser(data.user);
        }
      } catch {
        clearSession(scope);
      }
    }

    Promise.all([restoreScope("store"), restoreScope("admin")]).finally(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback((scope: SessionScope, payload: AuthPayload) => {
    writeSession(scope, payload.token, payload.user);
    if (scope === "store") {
      setStoreToken(payload.token);
      setStoreUser(payload.user);
      api<{ cart: Cart }>("/store/cart", { token: payload.token })
        .then((data) => setCartCount(cartItemCount(data.cart)))
        .catch(() => setCartCount(0));
    } else {
      setAdminToken(payload.token);
      setAdminUser(payload.user);
    }
  }, []);

  const signOut = useCallback((scope: SessionScope) => {
    clearSession(scope);
    if (scope === "store") {
      setStoreToken(null);
      setStoreUser(null);
      setCartCount(0);
    } else {
      setAdminToken(null);
      setAdminUser(null);
    }
  }, []);

  const syncCart = useCallback((cart: Cart | null) => {
    setCartCount(cart ? cartItemCount(cart) : 0);
  }, []);

  const value = useMemo(
    () => ({ storeUser, adminUser, storeToken, adminToken, cartCount, ready, signIn, signOut, syncCart }),
    [storeUser, adminUser, storeToken, adminToken, cartCount, ready, signIn, signOut, syncCart]
  );

  return (
    <SessionContext.Provider value={value}>
      <div className="flex min-h-dvh flex-col">{children}</div>
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}

export async function loginRequest(scope: SessionScope, email: string, password: string) {
  const path = scope === "admin" ? "/admin/auth/login" : "/store/auth/login";
  return api<AuthPayload>(path, { method: "POST", body: { email, password } });
}
