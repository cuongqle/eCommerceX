"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginRequest, useSession } from "@/components/session-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StoreBrand } from "@/components/store/settings/store-brand";
import { DEFAULT_STORE_SETTINGS, fetchStoreSettings } from "@/lib/store-settings";
import type { StoreSettings } from "@/lib/types";

export default function AdminLoginPage() {
  const router = useRouter();
  const { signIn } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [brand, setBrand] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    fetchStoreSettings().then(setBrand);
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      const payload = await loginRequest("admin", String(form.get("email")), String(form.get("password")));
      signIn("admin", payload);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="admin-theme grid min-h-dvh flex-1 lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-indigo-950 p-10 text-white lg:flex">
        <p className="text-[11px] tracking-[0.18em] uppercase text-indigo-200">
          <StoreBrand name={brand.name} logoUrl={brand.logoUrl} iconUrl={brand.iconUrl} iconClassName="size-6" />
        </p>
        <div>
          <p className="text-3xl font-semibold tracking-tight">Console</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">
            Manage catalog, orders, and accounts from one place.
          </p>
        </div>
        <p className="text-xs text-white/40">Admin access only</p>
      </div>
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <p className="text-[11px] font-medium tracking-[0.16em] text-primary uppercase">Admin</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Use an admin account to open the console.</p>
          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue="admin@ecommercex.local" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" defaultValue="Admin123!" required />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" size="lg" disabled={pending}>
              {pending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-sm text-muted-foreground">
            <Link href="/" className="underline underline-offset-4">
              Back to store
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
