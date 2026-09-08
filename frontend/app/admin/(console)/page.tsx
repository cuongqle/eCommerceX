"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Package, ShoppingCart, Users, Wallet } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { useSession } from "@/components/session-provider";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatDate, money } from "@/lib/format";
import { orderItemCount, orderNumber, statusBarClass, statusLabel, statusVariant } from "@/lib/orders";
import { customerName, type DashboardStats, type OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_ORDER: OrderStatus[] = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

export default function AdminDashboardPage() {
  const { adminToken, adminUser } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!adminToken) return;
    api<DashboardStats>("/admin/dashboard/stats", { token: adminToken })
      .then(setStats)
      .catch(() => setStats(null));
  }, [adminToken]);

  if (!stats) {
    return <p className="text-sm text-muted-foreground">Loading dashboard...</p>;
  }

  const pipeline = stats.totals.pipeline ?? 0;
  const lowStock = stats.totals.lowStock ?? 0;
  const unpublished = stats.totals.unpublished ?? 0;
  const openOrders = (stats.ordersByStatus.pending ?? 0) + (stats.ordersByStatus.processing ?? 0) + (stats.ordersByStatus.paid ?? 0);
  const maxStatus = Math.max(1, ...STATUS_ORDER.map((status) => stats.ordersByStatus[status] ?? 0));

  const cards = [
    {
      label: "Customers",
      value: stats.totals.customers,
      hint: "Active store accounts",
      href: "/admin/users",
      icon: Users,
      iconClass: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Products",
      value: stats.totals.products,
      hint: unpublished ? `${unpublished} unpublished` : "In the catalog",
      href: "/admin/products",
      icon: Package,
      iconClass: "bg-sky-50 text-sky-700",
    },
    {
      label: "Orders",
      value: stats.totals.orders,
      hint: openOrders ? `${openOrders} still open` : "None waiting",
      href: "/admin/orders",
      icon: ShoppingCart,
      iconClass: "bg-amber-50 text-amber-700",
    },
    {
      label: "Paid revenue",
      value: money(stats.totals.revenue),
      hint: pipeline ? `${money(pipeline)} awaiting payment` : "No unpaid balance",
      href: "/admin/orders",
      icon: Wallet,
      iconClass: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Overview"
        title={adminUser ? `Welcome back, ${adminUser.name.split(" ")[0]}` : "Dashboard"}
        description="What needs attention in the store today."
        action={
          <div className="flex gap-2">
            <Link href="/admin/products/new" className={buttonVariants({ size: "sm" })}>
              Add product
            </Link>
            <Link href="/admin/orders" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Review orders
            </Link>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20 hover:bg-muted/40"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <span className={cn("flex size-8 items-center justify-center rounded-lg", card.iconClass)}>
                <card.icon className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
          </Link>
        ))}
      </div>

      {lowStock > 0 || unpublished > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {unpublished > 0 ? (
            <Link href="/admin/products" className="rounded-xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm hover:bg-sky-100/70">
              <p className="font-medium text-sky-950">{unpublished} unpublished {unpublished === 1 ? "product" : "products"}</p>
              <p className="mt-1 text-sky-800/70">Drafts that are not visible in the store yet.</p>
            </Link>
          ) : null}
          {lowStock > 0 ? (
            <Link href="/admin/products" className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm hover:bg-amber-100/70">
              <p className="font-medium text-amber-950">{lowStock} low-stock {lowStock === 1 ? "item" : "items"}</p>
              <p className="mt-1 text-amber-800/70">At or below 5 units — restock before they sell out.</p>
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <section className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">Recent orders</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Latest activity from the storefront.</p>
            </div>
            <Link href="/admin/orders" className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground">
              View all
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {stats.recentOrders.map((order) => {
                const count = orderItemCount(order.items);
                return (
                  <li key={order._id}>
                    <Link href="/admin/orders" className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-muted/50">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {customerName(order.user)}
                          <span className="ml-2 font-normal text-muted-foreground">#{orderNumber(order._id)}</span>
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatDate(order.createdAt)} · {count} {count === 1 ? "item" : "items"}
                          {order.paymentStatus === "unpaid" ? " · payment unpaid" : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <Badge variant={statusVariant(order.status)}>{statusLabel(order.status)}</Badge>
                        <span className="text-sm font-medium tabular-nums">{money(order.total)}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="h-fit rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Orders by status</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Where the current book sits.</p>
          <ul className="mt-5 space-y-3">
            {STATUS_ORDER.map((status) => {
              const count = stats.ordersByStatus[status] ?? 0;
              return (
                <li key={status}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{statusLabel(status)}</span>
                    <span className="tabular-nums">{count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", count ? statusBarClass(status) : "bg-transparent")}
                      style={{ width: `${(count / maxStatus) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
