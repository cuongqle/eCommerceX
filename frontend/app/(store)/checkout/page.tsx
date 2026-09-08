"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useSession } from "@/components/session-provider";
import { CheckoutSteps } from "@/components/store/checkout-steps";
import { EmptyState } from "@/components/store/empty-state";
import { OrderSummary } from "@/components/store/order-summary";
import { PageHeading } from "@/components/store/page-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { money } from "@/lib/format";
import type { Cart, Order } from "@/lib/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { storeToken, ready, syncCart } = useSession();
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!storeToken) {
      router.replace("/login?next=/checkout");
      return;
    }
    api<{ cart: Cart }>("/store/cart", { token: storeToken })
      .then((data) => {
        setCart(data.cart);
        syncCart(data.cart);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load checkout"));
  }, [ready, storeToken, router, syncCart]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!storeToken) return;
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      const data = await api<{ order: Order }>("/store/orders", {
        method: "POST",
        token: storeToken,
        body: {
          shippingAddress: {
            fullName: String(form.get("fullName")),
            phone: String(form.get("phone")),
            line1: String(form.get("line1")),
            line2: String(form.get("line2") || "") || undefined,
            city: String(form.get("city")),
            state: String(form.get("state") || "") || undefined,
            postalCode: String(form.get("postalCode")),
            country: String(form.get("country")),
          },
        },
      });
      syncCart({ _id: "", user: "", items: [] });
      router.push(`/orders/${data.order._id}?placed=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setPending(false);
    }
  }

  if (!cart) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">{error ?? "Loading checkout..."}</div>;
  }

  if (cart.items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Nothing to check out"
        description="Add a piece to your bag before entering shipping details."
      />
    );
  }

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <CheckoutSteps current={2} />
      <PageHeading
        kicker="Checkout"
        title="Shipping details"
        description="Where should we send this order?"
        action={
          <Link href="/cart" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            Back to bag
          </Link>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form className="border border-border bg-card p-5 sm:p-6" onSubmit={onSubmit}>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="line1">Address</Label>
              <Input id="line1" name="line1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="line2">Apartment (optional)</Label>
              <Input id="line2" name="line2" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal code</Label>
                <Input id="postalCode" name="postalCode" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" defaultValue="US" required />
              </div>
            </div>
          </div>
          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="mt-6 w-full" size="lg" disabled={pending}>
            {pending ? "Placing order..." : `Place order · ${money(subtotal)}`}
          </Button>
        </form>

        <div className="space-y-4">
          <div className="border border-border bg-card p-5">
            <h2 className="text-sm font-medium">In your bag</h2>
            <ul className="mt-4 space-y-3">
              {cart.items.map((item) => (
                <li key={item.product._id} className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="tabular-nums">{money(item.product.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
          <OrderSummary itemCount={itemCount} subtotal={subtotal} />
        </div>
      </div>
    </div>
  );
}
