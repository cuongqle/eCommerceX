"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductImage } from "@/components/product-image";
import { money } from "@/lib/format";
import { categoryName, type Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  layout = "tile",
}: {
  product: Product;
  layout?: "tile" | "lookbook";
}) {
  const [hoverIndex, setHoverIndex] = useState(0);
  const images = product.images.filter(Boolean);
  const image = images[hoverIndex] ?? images[0];
  const onSale = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);

  if (layout === "lookbook") {
    return (
      <Link
        href={`/products/${product.slug}`}
        className="group grid overflow-hidden border border-border bg-card md:grid-cols-2"
        onMouseLeave={() => setHoverIndex(0)}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <ProductImage src={image} alt={product.name} className="h-full w-full transition duration-500 group-hover:scale-[1.03]" />
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-10">
          <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{categoryName(product.category)}</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight">{product.name}</h3>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{product.description}</p>
          <p className="mt-6 text-base">
            {money(product.price)}
            {onSale ? <span className="ml-2 text-muted-foreground line-through">{money(product.compareAtPrice!)}</span> : null}
          </p>
          <span className="mt-6 inline-flex text-sm underline underline-offset-4">Shop now</span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block" onMouseLeave={() => setHoverIndex(0)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <ProductImage src={image} alt={product.name} className="h-full w-full transition duration-500 group-hover:scale-[1.03]" />
        {onSale ? (
          <span className="absolute left-3 top-3 bg-background/95 px-2 py-1 text-[10px] font-medium tracking-[0.12em] uppercase">
            Sale
          </span>
        ) : null}
        <span className="absolute inset-x-3 bottom-3 translate-y-2 bg-background/95 py-2 text-center text-xs font-medium tracking-wide uppercase opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
          View product
        </span>
        {images.length > 1 ? (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 group-hover:hidden">
            {images.slice(0, 4).map((src, index) => (
              <span
                key={src}
                onMouseEnter={() => setHoverIndex(index)}
                className={cn(
                  "h-1 rounded-full transition-all",
                  hoverIndex === index ? "w-4 bg-background" : "w-1 bg-background/55"
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
      <div className="pt-3">
        <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">{categoryName(product.category)}</p>
        <h3 className="mt-1 text-sm font-medium tracking-tight">{product.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className={onSale ? "text-foreground" : undefined}>{money(product.price)}</span>
          {onSale ? <span className="ml-2 line-through">{money(product.compareAtPrice!)}</span> : null}
        </p>
      </div>
    </Link>
  );
}
