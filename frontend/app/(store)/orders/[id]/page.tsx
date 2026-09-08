"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/components/session-provider";
import { ProductImage } from "@/components/product-image";
import { AccountNav } from "@/components/store/layout/account-nav";
import { CheckoutSteps } from "@/components/store/orders/checkout-steps";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatDate, money } from "@/lib/format";
import { enrichOrder, orderItemImage, orderItemKey, orderItemSlug, orderNumber, statusLabel, statusVariant } from "@/lib/orders";
import type { Order, Paginated, Product } from "@/lib/types";

function OrderDetail() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { storeToken, ready } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const placed = searchParams.get("placed") === "1";

  useEffect(() => {
    if (!ready) return;
    if (!storeToken) {
      router.replace(`/login?next=/orders/${params.id}`);
      return;
    }
    Promise.all([
      api<{ order: Order }>(`/store/orders/${params.id}`, { token: storeToken }),
      api<Paginated<Product>>("/store/products", { query: { limit: 50 } }),
    ])
      .then(([data, catalog]) => setOrder(enrichOrder(data.order, catalog.items)))
      .catch(() => setOrder(null));
  }, [ready, storeToken, params.id, router]);

  if (!order) {
    return <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-muted-foreground">Loading order...</div>;
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[200px_minmax(0,1fr)]">
      <AccountNav current="order" />
      <div className="space-y-6">
        {placed ? <CheckoutSteps current={3} /> : null}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/orders" className="hover:text-foreground">
            Orders
          </Link>
          <span>/</span>
          <span className="text-foreground">{orderNumber(order._id)}</span>
        </nav>
        {placed ? (
          <p className="border border-border bg-card px-4 py-3 text-sm">
            Thank you. Your order is confirmed and awaiting fulfillment.
          </p>
        ) : null}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Order {orderNumber(order._id)}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
          </div>
          <Badge variant={statusVariant(order.status)}>{statusLabel(order.status)}</Badge>
        </div>

        <div className="border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-medium">Items</h2>
          </div>
          <ul className="divide-y divide-border">
            {order.items.map((item) => {
              const image = orderItemImage(item);
              const slug = orderItemSlug(item);
              const body = (
                <>
                  <div className="size-16 shrink-0 overflow-hidden bg-muted">
                    <ProductImage src={image} alt={item.name} className="size-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Qty {item.quantity} · {money(item.price)} each
                    </p>
                  </div>
                  <p className="text-sm tabular-nums">{money(item.price * item.quantity)}</p>
                </>
              );

              return (
                <li key={orderItemKey(item)}>
                  {slug ? (
                    <Link href={`/products/${slug}`} className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/40">
                      {body}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-4 px-5 py-4">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="space-y-2 border-t border-border px-5 py-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{money(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{order.shippingFee === 0 ? "Complimentary" : money(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 font-medium">
              <span>Total</span>
              <span className="tabular-nums">{money(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border border-border bg-card">
            <div className="border-b border-border px-5 py-3">
              <h2 className="text-sm font-medium">Ship to</h2>
            </div>
            <div className="px-5 py-4 text-sm leading-6 text-muted-foreground">
              <p className="text-foreground">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 ? <p>{order.shippingAddress.line2}</p> : null}
              <p>
                {order.shippingAddress.city}
                {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""} {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-2">{order.shippingAddress.phone}</p>
            </div>
          </div>
          <div className="border border-border bg-card">
            <div className="border-b border-border px-5 py-3">
              <h2 className="text-sm font-medium">Payment</h2>
            </div>
            <div className="px-5 py-4 text-sm leading-6 text-muted-foreground">
              <p className="capitalize text-foreground">{order.paymentStatus}</p>
              <p className="mt-1">Pay on fulfillment for preview orders.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-12 text-sm text-muted-foreground">Loading order...</div>}>
      <OrderDetail />
    </Suspense>
  );
}
