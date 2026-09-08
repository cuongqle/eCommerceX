"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useSession } from "@/components/session-provider";
import { QuantityStepper } from "@/components/store/quantity-stepper";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Cart } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  productId,
  disabled,
  max = 8,
}: {
  productId: string;
  disabled?: boolean;
  max?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { storeToken, syncCart } = useSession();
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!storeToken) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    setPending(true);
    setError(null);
    try {
      const data = await api<{ cart: Cart }>("/store/cart/items", {
        method: "POST",
        token: storeToken,
        body: { productId, quantity },
      });
      syncCart(data.cart);
      setAdded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add to bag");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={quantity} min={1} max={Math.max(1, max)} disabled={disabled || pending} onChange={setQuantity} />
        <Button onClick={handleClick} disabled={disabled || pending} size="lg" className="min-w-40">
          {pending ? "Adding..." : added ? "Added to bag" : "Add to bag"}
        </Button>
      </div>
      {added ? (
        <Link href="/cart" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}>
          View bag
        </Link>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
