"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginRequest, useSession } from "@/components/session-provider";
import { AuthPanel } from "@/components/store/auth-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function StoreLoginForm() {
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
      const payload = await loginRequest("store", String(form.get("email")), String(form.get("password")));
      if (payload.user.role === "admin") {
        signIn("admin", payload);
        router.push("/admin");
        return;
      }
      signIn("store", payload);
      router.push(next.startsWith("/") && !next.startsWith("/admin") ? next : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthPanel kicker="Account" title="Sign in" description="Use a customer account to manage your bag and orders.">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue="customer@ecommercex.local" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" defaultValue="Customer123!" required />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="mt-5 text-sm text-muted-foreground">
        No account?{" "}
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="underline underline-offset-4">
          Create one
        </Link>
      </p>
    </AuthPanel>
  );
}

export default function StoreLoginPage() {
  return (
    <Suspense fallback={<div className="px-4 py-16 text-sm text-muted-foreground">Loading...</div>}>
      <StoreLoginForm />
    </Suspense>
  );
}
