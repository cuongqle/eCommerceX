"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, Trash2 } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { CheckoutSteps } from "@/components/store/checkout-steps";
import { EmptyState } from "@/components/store/empty-state";
import { OrderSummary } from "@/components/store/order-summary";
import { PageHeading } from "@/components/store/page-heading";
import { QuantityStepper } from "@/components/store/quantity-stepper";
import { useSession } from "@/components/session-provider";
import { buttonVariants } from "@/components/ui/button";
import { api } from "@/lib/api";
import { money } from "@/lib/format";
import type { Cart } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { storeToken, ready, syncCart } = useSession();
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!storeToken) {
      router.replace("/login?next=/cart");
      return;
    }

    api<{ cart: Cart }>("/store/cart", { token: storeToken })
      .then((data) => {
        setCart(data.cart);
        syncCart(data.cart);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load bag"));
  }, [ready, storeToken, router, syncCart]);

  async function applyCart(next: Promise<{ cart: Cart }>) {
    const data = await next;
    setCart(data.cart);
    syncCart(data.cart);
  }

  async function updateQuantity(productId: string, quantity: number) {
    if (!storeToken) return;
    setPendingId(productId);
    try {
      await applyCart(
        api<{ cart: Cart }>(`/store/cart/items/${productId}`, {
          method: "PATCH",
          token: storeToken,
          body: { quantity },
        })
      );
    } finally {
      setPendingId(null);
    }
  }

  async function removeItem(productId: string) {
    if (!storeToken) return;
    setPendingId(productId);
    try {
      await applyCart(
        api<{ cart: Cart }>(`/store/cart/items/${productId}`, {
          method: "DELETE",
          token: storeToken,
        })
      );
    } finally {
      setPendingId(null);
    }
  }

  if (!cart) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">{error ?? "Loading bag..."}</div>;
  }

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.items.reduce((sum, item) => {
    const price = typeof item.product === "object" ? item.product.price : 0;
    return sum + price * item.quantity;
  }, 0);

  if (cart.items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your bag is empty"
        description="Browse the collection and add a piece when you are ready."
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <CheckoutSteps current={1} />
      <PageHeading
        kicker="Bag"
        title="Your bag"
        description={`${itemCount} ${itemCount === 1 ? "item" : "items"}`}
        action={
          <Link href="/#catalog" className={cn(buttonVariants({ variant: "ghost" }), "self-start")}>
            <ArrowLeft />
            Continue shopping
          </Link>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="divide-y divide-border border border-border bg-card">
          {cart.items.map((item) => {
            const product = item.product;
            const image = product.images[0];
            const lineTotal = product.price * item.quantity;

            return (
              <div key={product._id} className="grid gap-4 p-4 sm:grid-cols-[96px_minmax(0,1fr)] sm:p-5">
                <Link href={`/products/${product.slug}`} className="overflow-hidden bg-muted">
                  <ProductImage src={image} alt={product.name} className="aspect-square h-24 w-full sm:h-full" />
                </Link>
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <Link href={`/products/${product.slug}`} className="font-medium hover:underline">
                      {product.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">{money(product.price)} each</p>
                    {product.stock < 8 ? (
                      <p className="mt-1 text-xs text-muted-foreground">{product.stock} left</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                    <p className="text-sm font-medium tabular-nums">{money(lineTotal)}</p>
                    <QuantityStepper
                      value={item.quantity}
                      max={product.stock}
                      disabled={pendingId === product._id}
                      onChange={(quantity) => updateQuantity(product._id, quantity)}
                    />
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      disabled={pendingId === product._id}
                      onClick={() => removeItem(product._id)}
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <OrderSummary itemCount={itemCount} subtotal={subtotal} actionHref="/checkout" actionLabel="Continue to shipping" />
      </div>
    </div>
  );
}
