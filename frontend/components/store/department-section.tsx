"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/store/product-card";
import type { CategoryTree } from "@/lib/categories";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

function categoryId(product: Product): string {
  return typeof product.category === "string" ? product.category : product.category._id;
}

function mosaicClass(count: number) {
  if (count <= 2) return "grid-cols-1 sm:grid-cols-2";
  if (count === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  return "grid-cols-2 lg:grid-cols-3";
}

export function DepartmentSection({
  category,
  products,
  index,
}: {
  category: CategoryTree;
  products: Product[];
  index: number;
}) {
  const [active, setActive] = useState("all");

  useEffect(() => {
    function applyHash() {
      const hash = window.location.hash.replace("#", "");
      const child = category.children.find((item) => item.slug === hash);
      setActive(child?._id ?? "all");
    }

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [category]);

  const visible = useMemo(() => {
    if (active === "all") return products;
    return products.filter((product) => categoryId(product) === active);
  }, [active, products]);

  const cover = products[0]?.images[0];
  const chips = [{ _id: "all", name: "All", slug: category.slug }, ...category.children];

  return (
    <section id={category.slug} className={cn("scroll-mt-36", index % 2 === 1 ? "bg-card" : undefined)}>
      <div className="relative isolate min-h-[18rem] overflow-hidden bg-zinc-950 text-white">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="absolute inset-0 size-full object-cover opacity-40" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-zinc-950/25" />
        <div className="relative mx-auto flex min-h-[18rem] max-w-6xl flex-col justify-end px-4 py-10">
          <p className="text-[11px] tracking-[0.2em] text-white/65 uppercase">Department</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{category.name}</h2>
              {category.description ? <p className="mt-2 max-w-xl text-sm text-white/70">{category.description}</p> : null}
            </div>
            <p className="text-xs tracking-[0.16em] text-white/60 uppercase">
              {products.length} {products.length === 1 ? "piece" : "pieces"}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {chips.length > 1 ? (
          <div className="mb-8 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <a
                key={chip._id}
                id={chip.slug}
                href={`#${chip.slug}`}
                onClick={() => setActive(chip._id)}
                className={cn(
                  "scroll-mt-40 border px-3 py-1.5 text-xs tracking-wide uppercase",
                  active === chip._id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {chip.name}
              </a>
            ))}
          </div>
        ) : null}

        {visible.length === 0 ? (
          <p className="border border-dashed border-border px-6 py-14 text-center text-sm text-muted-foreground">
            Nothing in this edit yet.
          </p>
        ) : visible.length === 1 ? (
          <ProductCard product={visible[0]} layout="lookbook" />
        ) : (
          <div className={cn("grid gap-x-6 gap-y-10", mosaicClass(visible.length))}>
            {visible.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
