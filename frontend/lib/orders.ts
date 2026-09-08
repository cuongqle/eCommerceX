import type { Order, OrderItem, OrderStatus, Product } from "@/lib/types";

type BadgeVariant = "success" | "danger" | "warning" | "outline";

export function orderNumber(id: string): string {
  return id.slice(-6).toUpperCase();
}

export function orderItemCount(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function orderItemKey(item: OrderItem): string {
  return typeof item.product === "string" ? item.product : item.product._id;
}

export function orderItemImage(item: OrderItem): string | undefined {
  if (item.image) return item.image;
  if (item.product && typeof item.product === "object") return item.product.images?.[0];
  return undefined;
}

export function orderItemSlug(item: OrderItem): string | undefined {
  if (item.slug) return item.slug;
  if (item.product && typeof item.product === "object") return item.product.slug;
  return undefined;
}

export function enrichOrderItems(items: OrderItem[], products: Product[]): OrderItem[] {
  const byId = new Map(products.map((product) => [product._id, product]));
  const byName = new Map(products.map((product) => [product.name.toLowerCase(), product]));

  return items.map((item) => {
    if (orderItemImage(item) && orderItemSlug(item)) return item;
    const product = byId.get(orderItemKey(item)) ?? byName.get(item.name.toLowerCase());
    if (!product) return item;
    return {
      ...item,
      image: item.image ?? product.images[0],
      slug: item.slug ?? product.slug,
      product,
    };
  });
}

export function enrichOrder(order: Order, products: Product[]): Order {
  return { ...order, items: enrichOrderItems(order.items, products) };
}

export function statusLabel(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "Awaiting fulfillment";
    case "paid":
      return "Paid";
    case "processing":
      return "In progress";
    case "shipped":
      return "On the way";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
  }
}

export function statusVariant(status: OrderStatus): BadgeVariant {
  if (status === "delivered" || status === "paid") return "success";
  if (status === "cancelled") return "danger";
  if (status === "shipped" || status === "processing" || status === "pending") return "warning";
  return "outline";
}

export function statusBarClass(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "bg-amber-500";
    case "paid":
      return "bg-indigo-500";
    case "processing":
      return "bg-sky-500";
    case "shipped":
      return "bg-violet-500";
    case "delivered":
      return "bg-emerald-500";
    case "cancelled":
      return "bg-rose-500";
  }
}
