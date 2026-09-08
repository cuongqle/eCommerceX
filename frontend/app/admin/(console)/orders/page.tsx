"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminEmpty, AdminPanel, adminControlClass } from "@/components/admin/panel";
import { AdminPageHeader } from "@/components/admin/page-header";
import { useSession } from "@/components/session-provider";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatDate, money } from "@/lib/format";
import { orderItemCount, orderNumber, statusLabel } from "@/lib/orders";
import { customerName, type Order, type OrderStatus, type Paginated, type PaymentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUSES: OrderStatus[] = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];
const PAYMENTS: PaymentStatus[] = ["unpaid", "paid", "refunded"];
const FILTERS = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "unpaid", label: "Unpaid" },
  { id: "done", label: "Fulfilled" },
] as const;

export default function AdminOrdersPage() {
  const { adminToken } = useSession();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  async function load() {
    if (!adminToken) return;
    const data = await api<Paginated<Order>>("/admin/orders", { token: adminToken, query: { limit: 50 } });
    setOrders(data.items);
  }

  useEffect(() => {
    load().catch(() => setOrders([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken]);

  async function update(orderId: string, body: { status?: OrderStatus; paymentStatus?: PaymentStatus }) {
    if (!adminToken) return;
    await api<{ order: Order }>(`/admin/orders/${orderId}`, {
      method: "PATCH",
      token: adminToken,
      body,
    });
    await load();
  }

  const visible = useMemo(() => {
    if (!orders) return [];
    if (filter === "open") {
      return orders.filter((order) => order.status === "pending" || order.status === "paid" || order.status === "processing");
    }
    if (filter === "unpaid") return orders.filter((order) => order.paymentStatus === "unpaid");
    if (filter === "done") return orders.filter((order) => order.status === "delivered" || order.status === "shipped");
    return orders;
  }, [orders, filter]);

  if (!orders) {
    return <p className="text-sm text-muted-foreground">Loading orders...</p>;
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Fulfillment"
        title="Orders"
        description={`${orders.length} ${orders.length === 1 ? "order" : "orders"} · change status inline`}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "border px-3 py-1.5 text-xs tracking-wide uppercase",
              filter === item.id ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <AdminPanel>
        {visible.length === 0 ? (
          <AdminEmpty>No orders in this view.</AdminEmpty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((order) => {
                  const count = orderItemCount(order.items);
                  return (
                    <tr key={order._id} className="border-t border-border">
                      <td className="px-4 py-3">
                        <p className="font-medium">#{orderNumber(order._id)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)} · {count} {count === 1 ? "item" : "items"}
                        </p>
                      </td>
                      <td className="px-4 py-3">{customerName(order.user)}</td>
                      <td className="px-4 py-3 tabular-nums">{money(order.total)}</td>
                      <td className="px-4 py-3">
                        <select
                          className={adminControlClass}
                          value={order.status}
                          onChange={(event) => update(order._id, { status: event.target.value as OrderStatus })}
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {statusLabel(status)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={order.paymentStatus === "paid" ? "success" : "warning"}>{order.paymentStatus}</Badge>
                          <select
                            className={adminControlClass}
                            value={order.paymentStatus}
                            onChange={(event) => update(order._id, { paymentStatus: event.target.value as PaymentStatus })}
                          >
                            {PAYMENTS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
