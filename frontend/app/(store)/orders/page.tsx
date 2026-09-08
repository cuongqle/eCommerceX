"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Package } from "lucide-react";
import { useSession } from "@/components/session-provider";
import { AccountNav } from "@/components/store/account-nav";
import { EmptyState } from "@/components/store/empty-state";
import { OrderThumbs } from "@/components/store/order-thumbs";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatDate, money } from "@/lib/format";
import { enrichOrder, orderItemCount, orderNumber, statusLabel, statusVariant } from "@/lib/orders";
import type { Order, OrderStatus, Paginated, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS: { id: "all" | OrderStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Open" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
];

export default function OrdersPage() {
  const router = useRouter();
  const { storeToken, ready } = useSession();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  useEffect(() => {
    if (!ready) return;
    if (!storeToken) {
      router.replace("/login?next=/orders");
      return;
    }
    Promise.all([
      api<Paginated<Order>>("/store/orders", { token: storeToken, query: { limit: 50 } }),
      api<Paginated<Product>>("/store/products", { query: { limit: 50 } }),
    ])
      .then(([data, catalog]) => setOrders(data.items.map((order) => enrichOrder(order, catalog.items))))
      .catch(() => setOrders([]));
  }, [ready, storeToken, router]);

  const visible = useMemo(() => {
    if (!orders) return [];
    if (filter === "all") return orders;
    if (filter === "pending") return orders.filter((order) => order.status === "pending" || order.status === "paid" || order.status === "processing");
    return orders.filter((order) => order.status === filter);
  }, [orders, filter]);

  if (!orders) {
    return <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-muted-foreground">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="When you place an order, it will appear here with photos, status, and totals."
      />
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[200px_minmax(0,1fr)]">
      <AccountNav current="orders" />
      <div>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "border px-3 py-1.5 text-xs tracking-wide uppercase",
                filter === item.id ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
            No orders in this view.
          </p>
        ) : (
          <div className="space-y-3">
            {visible.map((order) => {
              const count = orderItemCount(order.items);
              const preview = order.items
                .slice(0, 2)
                .map((item) => item.name)
                .join(", ");
              const more = order.items.length > 2 ? ` +${order.items.length - 2} more` : "";

              return (
                <Link
                  key={order._id}
                  href={`/orders/${order._id}`}
                  className="block border border-border bg-card p-4 transition-colors hover:border-foreground/30 hover:bg-secondary/40 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <OrderThumbs items={order.items} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Order {orderNumber(order._id)}</p>
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {preview}
                          {more}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(order.createdAt)} · {count} {count === 1 ? "item" : "items"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <Badge variant={statusVariant(order.status)}>{statusLabel(order.status)}</Badge>
                      <p className="text-sm font-medium tabular-nums">{money(order.total)}</p>
                      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                        View order
                        <ChevronRight className="size-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
