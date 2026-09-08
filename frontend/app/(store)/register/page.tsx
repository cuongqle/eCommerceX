"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/components/session-provider";
import { AuthPanel } from "@/components/store/auth/auth-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import type { AuthPayload } from "@/lib/types";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const next = searchParams.get("next") || "/";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      const payload = await api<AuthPayload>("/store/auth/register", {
        method: "POST",
        body: {
          name: String(form.get("name")),
          email: String(form.get("email")),
          password: String(form.get("password")),
        },
      });
      signIn("store", payload);
      router.push(next.startsWith("/") ? next : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthPanel kicker="Account" title="Create account" description="New customers get a store account for bag and orders.">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" minLength={8} required />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? "Creating..." : "Create account"}
        </Button>
      </form>
      <p className="mt-5 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthPanel>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="px-4 py-16 text-sm text-muted-foreground">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
