import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";

export function OrderSummary({
  itemCount,
  subtotal,
  shippingFee = 0,
  actionHref,
  actionLabel,
}: {
  itemCount: number;
  subtotal: number;
  shippingFee?: number;
  actionHref?: string;
  actionLabel?: string;
}) {
  const total = subtotal + shippingFee;

  return (
    <aside className="h-fit border border-border bg-card p-6 lg:sticky lg:top-28">
      <h2 className="text-sm font-medium tracking-tight">Order summary</h2>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </dt>
          <dd>{money(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd>{shippingFee === 0 ? "Complimentary" : money(shippingFee)}</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-3 text-base font-medium">
          <dt>Total</dt>
          <dd>{money(total)}</dd>
        </div>
      </dl>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full")}>
          {actionLabel}
        </Link>
      ) : null}
      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        Taxes calculated at fulfillment. You can review the address on the next step.
      </p>
    </aside>
  );
}
