import { ProductImage } from "@/components/product-image";
import { orderItemImage, orderItemKey } from "@/lib/orders";
import type { OrderItem } from "@/lib/types";

export function OrderThumbs({ items, max = 4 }: { items: OrderItem[]; max?: number }) {
  const visible = items.slice(0, max);
  const extra = items.length - visible.length;

  return (
    <div className="flex items-center">
      {visible.map((item, index) => {
        const image = orderItemImage(item);
        return (
          <div
            key={orderItemKey(item)}
            className="relative size-14 overflow-hidden border border-background bg-muted"
            style={{ marginLeft: index === 0 ? 0 : -8, zIndex: visible.length - index }}
          >
            <ProductImage src={image} alt={item.name} className="size-full" />
          </div>
        );
      })}
      {extra > 0 ? (
        <span className="relative z-0 ml-2 text-xs text-muted-foreground">+{extra}</span>
      ) : null}
    </div>
  );
}
